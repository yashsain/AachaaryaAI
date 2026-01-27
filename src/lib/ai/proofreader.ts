/**
 * Question Proofreader
 *
 * Automated quality assurance layer that runs after question generation.
 * Detects and fixes structural/logical errors to improve accuracy from 85% → 95%.
 *
 * Features:
 * - Adaptive batching (60-80 questions per batch based on complexity)
 * - Minimal payload (question, options, correctAnswer, explanation only)
 * - Focused scope (8 error types: structural + language quality)
 * - Auto-retry on failure
 * - Metadata tracking for debugging
 * - Completely invisible to UI
 */

import { supabaseAdmin } from '@/lib/supabase/admin'
import { ai, GENERATION_CONFIG } from '@/lib/ai/geminiClient'
import { parseGeminiJSON } from '@/lib/ai/jsonCleaner'
import { logApiUsage, calculateCost } from '@/lib/ai/tokenTracker'

// Proofreader uses gemini-3-pro-preview for better accuracy (generation uses gemini-3-flash-preview)
const GEMINI_MODEL = 'gemini-3-pro-preview'

interface MinimalQuestion {
  id: string
  question: string
  options: Record<string, string>
  correctAnswer: string
  explanation: string
}

interface QuestionCorrection {
  questionId: string
  issue: string
  corrected: MinimalQuestion
}

interface ProofreadingResult {
  corrections: QuestionCorrection[]
}

interface ProofreadingStats {
  status: 'completed' | 'failed'
  started_at: string
  completed_at?: string
  batches_processed: number
  questions_checked: number
  issues_found: number
  corrections_applied: string[]  // Changed from number[] to string[] (question IDs)
  total_tokens_used: number
  total_cost_inr: number
  error?: string
}

/**
 * Calculate intelligent batch distribution
 * Targets ~70 questions per batch (sweet spot) while respecting complexity limits
 * Returns array of batch sizes that minimizes API calls and keeps batches balanced
 */
function calculateIntelligentBatching(questions: any[]): number[] {
  const totalQuestions = questions.length

  // Calculate complexity-based safety ceiling
  const totalLength = questions.reduce((sum, q) => {
    const questionText = q.question_text || ''
    const optionsText = JSON.stringify(q.question_data?.options || {})
    const explanationText = q.explanation || ''
    return sum + questionText.length + optionsText.length + explanationText.length
  }, 0)

  const avgLength = totalLength / totalQuestions
  const maxSafeBatchSize = avgLength < 500 ? 80 : 60

  console.log(`[PROOFREADER] Avg question length: ${Math.round(avgLength)} chars`)
  console.log(`[PROOFREADER] Max safe batch size: ${maxSafeBatchSize} (complexity ceiling)`)

  // Optimal target for all question types
  const optimalBatchSize = 70

  // If total fits in one batch, use one batch
  if (totalQuestions <= optimalBatchSize) {
    console.log(`[PROOFREADER] Intelligent batching: [${totalQuestions}] (1 batch)`)
    return [totalQuestions]
  }

  // Calculate minimum batches needed to stay around optimal size
  let numBatches = Math.ceil(totalQuestions / optimalBatchSize)

  // Distribute evenly
  let batchSizes: number[] = []
  let remaining = totalQuestions

  for (let i = 0; i < numBatches; i++) {
    const batchSize = Math.ceil(remaining / (numBatches - i))
    batchSizes.push(batchSize)
    remaining -= batchSize
  }

  // Check if any batch exceeds safety limit by more than 15%
  const maxAllowed = maxSafeBatchSize * 1.15
  const exceedsSafety = batchSizes.some(size => size > maxAllowed)

  if (exceedsSafety) {
    // Need more batches - recalculate with safety limit
    numBatches = Math.ceil(totalQuestions / maxSafeBatchSize)
    batchSizes = []
    remaining = totalQuestions

    for (let i = 0; i < numBatches; i++) {
      const batchSize = Math.ceil(remaining / (numBatches - i))
      batchSizes.push(batchSize)
      remaining -= batchSize
    }

    console.log(`[PROOFREADER] Adjusted for safety: Using ${numBatches} batches`)
  }

  console.log(`[PROOFREADER] Intelligent batching: [${batchSizes.join(', ')}] (${numBatches} batches)`)

  return batchSizes
}

/**
 * Convert database question to minimal payload format
 */
function toMinimalPayload(questions: any[]): MinimalQuestion[] {
  return questions.map(q => ({
    id: q.id,
    question: q.question_text || '',
    options: q.question_data?.options || {},
    correctAnswer: q.question_data?.correctAnswer || '',
    explanation: q.explanation || ''
  }))
}

/**
 * Build proofreading prompt for Gemini
 */
function buildProofreadingPrompt(questions: MinimalQuestion[]): string {
  return `You are a quality assurance expert reviewing educational test questions in Hindi/English.

🚨 CRITICAL DIRECTIVE: You MUST be STRICT and flag ANY question with issues. When in doubt, FLAG IT. Better to catch too many than miss real errors.

Analyze these ${questions.length} questions and identify ALL questions with errors.

ERROR TYPES TO CHECK (MANDATORY - YOU MUST FLAG THESE):
1. Correct answer not in options (e.g., correctAnswer: "B" but options only have A, C, D)
2. Wrong option marked as correct (calculation/logic shows different answer than marked)
3. Answer key mismatch (e.g., correctAnswer: "a" but options use uppercase A, B, C, D)
4. Malformed question text (truncated sentences, missing critical information, broken encoding)
5. Duplicate options (two or more options with identical values)
6. Explanation contradicts marked answer (explanation solves for different option than correctAnswer)
7. 🔴 VERBOSE AI THINKING (CRITICAL): ANY explanation containing internal reasoning dialogue, self-correction, contradictory steps, or phrases like "Wait", "BUT wait", "Let me re-check", "Let me re-read", "Is it possible I made a mistake", "re-evaluating", showing multiple attempts/contradictions is IMMEDIATELY UNACCEPTABLE - even if it eventually reaches correct answer
8. Poor question language (grammatical errors, unclear phrasing, unnecessary/stale text that should be removed or simplified)

QUESTIONS TO REVIEW:
${JSON.stringify(questions, null, 2)}

REAL EXAMPLES OF ERROR TYPE 7 (VERBOSE AI THINKING - UNACCEPTABLE):

❌ EXAMPLE 1 - REAL BAD EXPLANATION (Type 7):
"Wait, re-evaluating step 2 inequality flip: log₀.₅(A) ≥ 0 ⟹ 0 < A ≤ 1. Correct. So we need x > -5 AND (x < -5 or x > 1). Intersection is x > 1. Let's re-check the calculation of (-6)/(x+5) ≤ 0. For this to be true, x+5 must be positive. So x > -5. BUT wait, let's check values. If x = -6, (-7)/(-1) = 7. log₀.₅(7) is negative. Square root undefined. So x < -5 is out. Wait, if base is <1, log_a x ≥ 0 ⟺ 0 < x ≤ 1. Let me re-read the options. Is it possible I made a mistake in the inequality direction?"

❌ EXAMPLE 2 - REAL BAD EXPLANATION (Type 7):
"For f(x) to be defined, we need two conditions: ... Wait, let me re-check the calculation. BUT wait, let's check values. If x = -6, then -1/7 = -7. Wait, there seems to be a mismatch with the options. Let me re-read the options..."

✅ GOOD EXPLANATION (Clean, direct):
"For f(x) to be defined: (1) Argument of log must be positive: (x-1)/(x+5) > 0 ⟹ x ∈ (-∞, -5) ∪ (1, ∞). (2) Term under square root must be non-negative: log₂((x-1)/(x+5)) ≥ 0 ⟹ (x-1)/(x+5) ≥ 1 ⟹ x < -5. Intersection yields domain = (-∞, -5)."

❌ BAD QUESTION (Error Type 8):
"The what is the value calculate of function when x = 5 given that f(x) = 2x + 3 is?"

✅ GOOD QUESTION:
"If f(x) = 2x + 3, what is the value of f(5)?"

OUTPUT FORMAT (strict JSON only, no markdown):
{
  "corrections": [
    {
      "questionId": "<the UUID id field from the question object>",
      "issue": "<brief description of the error>",
      "corrected": {
        "id": "<same UUID as questionId>",
        "question": "corrected question text",
        "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
        "correctAnswer": "correct option key",
        "explanation": "corrected explanation"
      }
    }
  ]
}

CRITICAL INSTRUCTIONS:
- 🚨 BE AGGRESSIVE: When in doubt about Error Type 7 (verbose thinking), FLAG IT
- If you see "Wait", "Let me", "BUT wait", "re-check", "Is it possible", contradictory logic → MANDATORY FLAG
- Even if final answer is correct, explanations with AI thinking process must be flagged
- Do NOT check protocol compliance, archetypes, or cognitive load (only the 8 error types above)
- For Error Type 7: Replace ALL verbose thinking with clean, direct, student-friendly explanation
- For Error Type 8: Fix grammar, remove stale text, simplify unclear phrasing
- Preserve the original language (Hindi/English) in corrections
- If all questions are perfect (unlikely), return: {"corrections": []}

🎯 YOUR GOAL - MAKE QUESTIONS CORRECT AND CONSISTENT:
- Fix ANYTHING needed (question, options, correctAnswer, explanation) to make it logically consistent
- The corrected answer MUST be in the given options
- The marked correctAnswer MUST be the actually correct option
- The explanation MUST be clean, accurate, and match the question/answer
- Example: If question has base 0.5 but answer doesn't match options → change base to 2 OR change options to match base 0.5 (whichever makes sense)
- Final result must be mathematically/logically sound with NO contradictions

Return ONLY the JSON object (no markdown, no explanations).`
}

/**
 * Proofread a batch of questions using Gemini
 * Includes auto-retry logic
 */
async function proofreadBatch(
  batch: MinimalQuestion[],
  batchNumber: number,
  retries: number = 1
): Promise<ProofreadingResult> {
  try {
    console.log(`[PROOFREADER] Batch ${batchNumber}: Checking ${batch.length} questions...`)

    const prompt = buildProofreadingPrompt(batch)

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ text: prompt }],
      config: GENERATION_CONFIG
    })

    const responseText = response.text
    if (!responseText) {
      throw new Error('No response from Gemini')
    }

    const tokenUsage = {
      promptTokens: response.usageMetadata?.promptTokenCount || 0,
      completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata?.totalTokenCount || 0
    }

    console.log(`[PROOFREADER] Batch ${batchNumber}: Token usage: ${tokenUsage.totalTokens}`)

    // Parse response
    const result = parseGeminiJSON<ProofreadingResult>(responseText)

    console.log(`[PROOFREADER] Batch ${batchNumber}: Found ${result.corrections?.length || 0} issues`)

    return {
      corrections: result.corrections || [],
      ...tokenUsage
    } as any

  } catch (error) {
    if (retries > 0) {
      console.log(`[PROOFREADER] Batch ${batchNumber}: Retry ${2 - retries}/1`)
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2s
      return proofreadBatch(batch, batchNumber, retries - 1)
    }

    console.error(`[PROOFREADER] Batch ${batchNumber}: Failed after retries:`, error)
    throw error
  }
}

/**
 * Apply corrections to database
 */
async function applyCorrections(
  sectionId: string,
  questions: any[],
  corrections: QuestionCorrection[]
): Promise<void> {
  if (corrections.length === 0) {
    console.log('[PROOFREADER] No corrections needed')
    return
  }

  console.log(`[PROOFREADER] Applying ${corrections.length} corrections...`)

  for (const correction of corrections) {
    const questionToUpdate = questions.find(q => q.id === correction.questionId)
    if (!questionToUpdate) {
      console.warn(`[PROOFREADER] Question with ID ${correction.questionId} not found, skipping`)
      continue
    }

    console.log(`[PROOFREADER] Correcting question ${questionToUpdate.id}: ${correction.issue}`)

    // Update question in database
    const { error } = await supabaseAdmin
      .from('questions')
      .update({
        question_text: correction.corrected.question,
        question_data: {
          ...questionToUpdate.question_data,
          options: correction.corrected.options,
          correctAnswer: correction.corrected.correctAnswer
        },
        explanation: correction.corrected.explanation
      })
      .eq('id', questionToUpdate.id)

    if (error) {
      console.error(`[PROOFREADER] Failed to update question ${questionToUpdate.id}:`, error)
    } else {
      console.log(`[PROOFREADER] ✓ Corrected question ${questionToUpdate.id}`)
    }
  }
}

/**
 * Update section metadata with proofreading stats
 */
async function updateProofreadingMetadata(
  sectionId: string,
  stats: ProofreadingStats
): Promise<void> {
  // Fetch current metadata
  const { data: section } = await supabaseAdmin
    .from('test_paper_sections')
    .select('batch_metadata')
    .eq('id', sectionId)
    .single()

  if (!section) return

  const updatedMetadata = {
    ...(section.batch_metadata || {}),
    proofreading: stats
  }

  await supabaseAdmin
    .from('test_paper_sections')
    .update({
      batch_metadata: updatedMetadata,
      updated_at: new Date().toISOString()
    })
    .eq('id', sectionId)

  console.log(`[PROOFREADER] Metadata updated`)
}

/**
 * Main proofreader orchestrator
 * Runs after question generation completes, before marking section as 'in_review'
 */
export async function runProofreader(
  sectionId: string,
  paperId: string,
  instituteId: string
): Promise<void> {
  const startTime = new Date().toISOString()

  console.log(`[PROOFREADER_START] section_id=${sectionId}`)

  try {
    // Fetch all questions for this section
    const { data: questions, error: fetchError } = await supabaseAdmin
      .from('questions')
      .select('*')
      .eq('section_id', sectionId)
      .order('question_order', { ascending: true })

    if (fetchError || !questions || questions.length === 0) {
      console.error('[PROOFREADER] Failed to fetch questions:', fetchError)
      throw new Error('No questions found for proofreading')
    }

    console.log(`[PROOFREADER] Loaded ${questions.length} questions`)

    // Calculate intelligent batch distribution
    const batchSizes = calculateIntelligentBatching(questions)

    // Convert to minimal payload
    const minimalQuestions = toMinimalPayload(questions)

    // Split into batches using calculated sizes
    const batches: MinimalQuestion[][] = []
    let startIndex = 0
    for (const size of batchSizes) {
      batches.push(minimalQuestions.slice(startIndex, startIndex + size))
      startIndex += size
    }

    console.log(`[PROOFREADER] Split into ${batches.length} batches: [${batches.map(b => b.length).join(', ')}]`)

    // Process each batch
    let totalPromptTokens = 0
    let totalCompletionTokens = 0
    let totalTokens = 0
    let totalCorrections = 0
    const allCorrectionIds: string[] = []

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      const batchNumber = i + 1

      const result: any = await proofreadBatch(batch, batchNumber)

      totalPromptTokens += result.promptTokens || 0
      totalCompletionTokens += result.completionTokens || 0
      totalTokens += result.totalTokens || 0

      // Apply corrections for this batch (no index adjustment needed - using IDs)
      if (result.corrections.length > 0) {
        await applyCorrections(sectionId, questions, result.corrections)
        totalCorrections += result.corrections.length
        allCorrectionIds.push(...result.corrections.map((c: QuestionCorrection) => c.questionId))
      }
    }

    const cost = calculateCost(
      { promptTokens: totalPromptTokens, completionTokens: totalCompletionTokens, totalTokens },
      GEMINI_MODEL,
      'standard'
    )

    console.log(`[PROOFREADER_SUCCESS] Checked ${questions.length} questions, found ${totalCorrections} issues, used ${totalTokens} tokens (₹${cost.costInINR.toFixed(2)})`)

    // Track in metadata
    const stats: ProofreadingStats = {
      status: 'completed',
      started_at: startTime,
      completed_at: new Date().toISOString(),
      batches_processed: batches.length,
      questions_checked: questions.length,
      issues_found: totalCorrections,
      corrections_applied: allCorrectionIds,
      total_tokens_used: totalTokens,
      total_cost_inr: parseFloat(cost.costInINR.toFixed(2))
    }

    await updateProofreadingMetadata(sectionId, stats)

    // Log API usage
    try {
      logApiUsage({
        instituteId: instituteId,
        instituteName: 'Unknown', // Will be filled by token tracker
        teacherId: 'system',
        paperId: paperId,
        paperTitle: 'Proofreading',
        chapterId: sectionId,
        chapterName: 'Section Proofreading',
        usage: { promptTokens: 0, completionTokens: 0, totalTokens },
        modelUsed: GEMINI_MODEL,
        operationType: 'proofread',
        questionsGenerated: 0
      })
    } catch (err) {
      console.error('[PROOFREADER] Failed to log usage:', err)
    }

  } catch (error) {
    console.error('[PROOFREADER_ERROR]', error)

    // Track failure in metadata but don't block generation
    const stats: ProofreadingStats = {
      status: 'failed',
      started_at: startTime,
      completed_at: new Date().toISOString(),
      batches_processed: 0,
      questions_checked: 0,
      issues_found: 0,
      corrections_applied: [],
      total_tokens_used: 0,
      total_cost_inr: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }

    await updateProofreadingMetadata(sectionId, stats)

    // Don't throw - allow generation to complete even if proofreading fails
    console.log('[PROOFREADER] Proofreading failed, but allowing section to proceed')
  }
}
