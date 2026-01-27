/**
 * POST /api/test-papers/[id]/sections/[section_id]/regenerate
 *
 * Regenerates questions for a completed section
 * - If paper is finalized, automatically reopens it and deletes PDFs (question paper + answer key)
 * - Deletes existing questions for this section
 * - Resets section status to 'generating'
 * - Generates new questions (same flow as generate endpoint)
 * - Used when teacher wants to regenerate questions with same chapters
 *
 * Response:
 * - success: boolean
 * - section_id: string
 * - questions_deleted: number
 * - questions_generated: number
 * - cost_estimate: { tokens_used: number; cost_usd: number }
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ai, GEMINI_MODEL, GENERATION_CONFIG } from '@/lib/ai/geminiClient'
import { fetchMaterialsForChapter } from '@/lib/ai/materialFetcher'
import { uploadPDFToGemini } from '@/lib/ai/pdfUploader'
import { mapDifficultyToConfig } from '@/lib/ai/difficultyMapper'
import { buildPrompt } from '@/lib/ai/promptBuilder'
import { validateQuestionsWithProtocol, Question } from '@/lib/ai/questionValidator'
import { parseGeminiJSON, getDiagnosticInfo } from '@/lib/ai/jsonCleaner'
import { logApiUsage, calculateCost } from '@/lib/ai/tokenTracker'
import { getProtocol } from '@/lib/ai/protocols'
import { deletePaperPDFs } from '@/lib/storage/pdfCleanupService'
import { runProofreader } from '@/lib/ai/proofreader'

export const maxDuration = 300 // 5 minutes timeout

// Batch generation configuration
const BATCH_SIZE = 30 // Questions per batch (safe token limit ~9K tokens/batch) - Used for Mode A only
const MAX_QUESTIONS_PER_CALL = 60 // Maximum questions per API call to prevent token overflow
const MAX_BUFFER_QUESTIONS = 20 // Hard cap on extra questions for large sections

/**
 * Retry wrapper for question generation with automatic retry logic
 * Handles JSON parse failures, network errors, and API errors
 *
 * @param mode Generation mode ('A' | 'B' | 'C')
 * @param params Generation parameters (prompt, fileDataParts, etc.)
 * @param batchNumber Current batch number for logging
 * @param sectionId Section ID to update heartbeat during retries
 * @param retries Number of retries remaining (default: 2)
 * @returns Generated questions and token usage
 */
async function generateQuestionsWithRetry(
  mode: 'A' | 'B' | 'C',
  params: {
    prompt: string
    fileDataParts?: any[]
  },
  batchNumber: number,
  sectionId: string,
  retries: number = 2
): Promise<{ questions: any[], tokenUsage: { promptTokens: number, completionTokens: number, totalTokens: number } }> {
  const attemptNumber = 3 - retries

  try {
    console.log(`[REGENERATE_BATCH_RETRY] Mode ${mode} Batch ${batchNumber}: Attempt ${attemptNumber}/3`)

    // Prepare contents based on mode
    const contents = params.fileDataParts
      ? [...params.fileDataParts, { text: params.prompt }]
      : [{ text: params.prompt }]

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: GENERATION_CONFIG
    })

    const responseText = response.text
    if (!responseText) {
      throw new Error('No response text received from Gemini')
    }

    // Extract token usage
    const tokenUsage = {
      promptTokens: response.usageMetadata?.promptTokenCount || 0,
      completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata?.totalTokenCount || 0
    }

    console.log(`[REGENERATE_BATCH_RETRY] Mode ${mode} Batch ${batchNumber} Attempt ${attemptNumber}: Token usage: ${tokenUsage.totalTokens}`)

    // Parse JSON response (this is where ~7-8% of failures occur)
    const parsedResponse = parseGeminiJSON<any>(responseText)
    const rawQuestions = Array.isArray(parsedResponse) ? parsedResponse : (parsedResponse.questions || [])

    if (!rawQuestions || rawQuestions.length === 0) {
      throw new Error('No questions returned in response')
    }

    console.log(`[REGENERATE_BATCH_RETRY] Mode ${mode} Batch ${batchNumber} Attempt ${attemptNumber}: Successfully parsed ${rawQuestions.length} questions`)

    return { questions: rawQuestions, tokenUsage }

  } catch (error) {
    // Determine error type for better logging
    const errorType = error instanceof SyntaxError
      ? 'JSON_PARSE_ERROR'
      : (error as Error).message?.includes('timeout') || (error as Error).message?.includes('timed out')
      ? 'TIMEOUT_ERROR'
      : 'GEMINI_API_ERROR'

    console.error(`[REGENERATE_BATCH_RETRY] Mode ${mode} Batch ${batchNumber} Attempt ${attemptNumber}/3 FAILED (${errorType}):`, error)

    // Retry logic
    if (retries > 0) {
      // Calculate delay with exponential backoff: 2s, 4s
      // Use longer delay for timeout errors
      const baseDelay = 2000
      const delayMs = errorType === 'TIMEOUT_ERROR'
        ? baseDelay * 2 * (attemptNumber)
        : baseDelay * (attemptNumber)

      console.log(`[REGENERATE_BATCH_RETRY] Mode ${mode} Batch ${batchNumber}: Retrying in ${delayMs}ms... (${retries} retries left)`)

      // Update heartbeat to prevent cleanup during retries
      try {
        await supabaseAdmin
          .from('test_paper_sections')
          .update({
            last_batch_completed_at: new Date().toISOString()
          })
          .eq('id', sectionId)

        console.log(`[REGENERATE_BATCH_RETRY] Updated heartbeat during retry for section ${sectionId}`)
      } catch (heartbeatError) {
        console.error(`[REGENERATE_BATCH_RETRY] Failed to update heartbeat:`, heartbeatError)
        // Continue with retry anyway
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delayMs))

      // Recursive retry
      return generateQuestionsWithRetry(mode, params, batchNumber, sectionId, retries - 1)
    }

    // All retries exhausted
    console.error(`[REGENERATE_BATCH_RETRY] Mode ${mode} Batch ${batchNumber}: FAILED after 3 attempts`)
    throw error
  }
}

interface RegenerateSectionParams {
  params: Promise<{
    id: string
    section_id: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: RegenerateSectionParams
) {
  try {
    const { id: paperId, section_id: sectionId } = await params

    // Generate unique attempt ID for this regeneration
    const attemptId = crypto.randomUUID()

    console.log(`[REGENERATE_SECTION_START] paper_id=${paperId} section_id=${sectionId} attempt_id=${attemptId}`)

    const supabase = createServerClient(await cookies())
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('id, institute_id, role')
      .eq('id', user.id)
      .is('deleted_at', null)
      .single()

    if (teacherError || !teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Fetch section with paper, stream, and subject details
    const { data: section, error: sectionError} = await supabaseAdmin
      .from('test_paper_sections')
      .select(`
        id,
        paper_id,
        subject_id,
        section_type,
        section_name,
        section_order,
        question_count,
        marks_per_question,
        negative_marks,
        status,
        is_bilingual,
        test_papers!inner (
          id,
          title,
          institute_id,
          difficulty_level,
          status,
          pdf_url,
          answer_key_url,
          streams (
            name
          ),
          institutes (
            name
          )
        ),
        subjects (
          id,
          name,
          is_source_of_scope
        )
      `)
      .eq('id', sectionId)
      .eq('paper_id', paperId)
      .single()

    if (sectionError || !section) {
      console.error('[REGENERATE_SECTION_ERROR]', sectionError)
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    // Verify paper belongs to teacher's institute
    const paper = section.test_papers as any
    if (paper.institute_id !== teacher.institute_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // If paper has PDFs, clear them (regenerating a section invalidates the final paper and answer key)
    // Check for BOTH finalized status AND presence of PDFs (to handle cases where PDFs exist but status is already 'review')
    if (paper.status === 'finalized' || paper.pdf_url || paper.answer_key_url) {
      console.log('[REGENERATE_SECTION] Paper has PDFs (status:', paper.status, '), clearing them...')

      // Delete PDFs from storage
      const cleanupResult = await deletePaperPDFs(paper.pdf_url, paper.answer_key_url)
      if (!cleanupResult.success) {
        console.warn('[REGENERATE_SECTION] PDF cleanup had errors:', cleanupResult.errors)
        // Continue anyway
      }

      // Clear PDFs and ensure paper is in review status
      const { error: reopenError } = await supabaseAdmin
        .from('test_papers')
        .update({
          status: 'review',
          finalized_at: null,
          pdf_url: null,
          answer_key_url: null
        })
        .eq('id', paperId)

      if (reopenError) {
        console.error('[REGENERATE_SECTION] Failed to clear PDFs:', reopenError)
        return NextResponse.json({ error: 'Failed to clear PDFs for regeneration' }, { status: 500 })
      }

      console.log('[REGENERATE_SECTION] PDFs cleared successfully')
    }

    // Verify section status allows regeneration
    // Only 'in_review' and 'finalized' sections have questions to regenerate
    if (section.status !== 'in_review' && section.status !== 'finalized') {
      return NextResponse.json({
        error: `Section must have status 'in_review' or 'finalized' to regenerate questions. Current status: ${section.status}`,
        hint: section.status === 'pending'
          ? 'Assign chapters to this section first'
          : section.status === 'ready'
          ? 'This section has no questions yet. Use Generate instead of Regenerate.'
          : undefined
      }, { status: 400 })
    }

    const streamName = (paper.streams as any)?.name
    const subjectName = (section.subjects as any)?.name

    if (!streamName || !subjectName) {
      console.error('[REGENERATE_SECTION_ERROR] Section missing stream or subject')
      return NextResponse.json({ error: 'Section configuration incomplete' }, { status: 400 })
    }

    console.log(`[REGENERATE_SECTION] section="${section.section_name}" stream="${streamName}" subject="${subjectName}"`)

    // Step 1: Delete existing questions for this section
    const { data: deletedQuestions, error: deleteError } = await supabaseAdmin
      .from('questions')
      .delete()
      .eq('section_id', sectionId)
      .select('id')

    if (deleteError) {
      console.error('[REGENERATE_SECTION_ERROR] Failed to delete existing questions:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete existing questions' },
        { status: 500 }
      )
    }

    const questionsDeleted = deletedQuestions?.length || 0
    console.log(`[REGENERATE_SECTION] Deleted ${questionsDeleted} existing questions`)

    // Get protocol for this section's exam+subject combination
    let protocol
    try {
      protocol = getProtocol(streamName, subjectName)
      console.log(`[REGENERATE_SECTION] Using protocol: ${protocol.id} (${protocol.name})`)
    } catch (protocolError) {
      console.error('[REGENERATE_SECTION_ERROR] Protocol not found:', protocolError)
      return NextResponse.json({
        error: `No question generation protocol available for ${streamName} ${subjectName}`,
        details: protocolError instanceof Error ? protocolError.message : 'Unknown error'
      }, { status: 400 })
    }

    // Fetch chapters assigned to this section from section_chapters table
    const { data: sectionChapterRels, error: chaptersError } = await supabaseAdmin
      .from('section_chapters')
      .select(`
        chapter_id,
        chapters (
          id,
          name,
          subject_id
        )
      `)
      .eq('section_id', sectionId)

    if (chaptersError || !sectionChapterRels || sectionChapterRels.length === 0) {
      console.error('[REGENERATE_SECTION_ERROR] No chapters found:', chaptersError)

      // Mark section as ready (failed generation, but chapters still assigned)
      await supabaseAdmin
        .from('test_paper_sections')
        .update({
          status: 'ready',
          generation_error: 'No chapters assigned to this section',
          generation_started_at: null,
          generation_attempt_id: null
        })
        .eq('id', sectionId)

      return NextResponse.json({ error: 'No chapters assigned to this section' }, { status: 400 })
    }

    const sectionChapters = sectionChapterRels.map(rel => rel.chapters as any)
    console.log(`[REGENERATE_SECTION] Processing ${sectionChapters.length} chapters for section ${section.section_name}`)

    // Check if AI Knowledge mode is enabled (detect by chapter name)
    const aiKnowledgeChapterRel = sectionChapterRels.find(sc => {
      const chapter = sc.chapters as any
      return chapter?.name === '[AI Knowledge] Full Syllabus'
    })

    // ========================================================================
    // BUFFER CALCULATION WITH CAP
    // ========================================================================
    // Step 1: Calculate total questions with capped buffer
    const unbuffered = section.question_count
    const fiftyPercentBuffer = Math.ceil(unbuffered * 1.5)
    const cappedBuffer = unbuffered + MAX_BUFFER_QUESTIONS
    const totalQuestionsToGenerate = Math.min(fiftyPercentBuffer, cappedBuffer)

    console.log(`[REGENERATE_SECTION_BUFFER] Target: ${unbuffered}, 50% buffer: ${fiftyPercentBuffer}, capped: ${cappedBuffer}, final: ${totalQuestionsToGenerate}`)

    // ========================================================================
    // DYNAMIC BATCH SIZE CALCULATION
    // ========================================================================
    // Step 2: Calculate batch size and total batches based on mode
    let batchSize: number
    let totalBatches: number

    if (aiKnowledgeChapterRel) {
      // Mode A: AI Knowledge - Intelligent batching (minimize calls, respect 60-question limit)
      const callsNeeded = Math.ceil(totalQuestionsToGenerate / MAX_QUESTIONS_PER_CALL)
      batchSize = Math.ceil(totalQuestionsToGenerate / callsNeeded)
      totalBatches = callsNeeded
      console.log(`[REGENERATE_SECTION_MODE_A] AI Knowledge mode (intelligent batching): ${totalQuestionsToGenerate} questions → ${totalBatches} batch(es) of ~${batchSize} questions`)
    } else {
      // Mode B/C: Chapter-based - Dynamic batch size based on 60-question-per-call limit
      const questionsPerChapter = Math.ceil(totalQuestionsToGenerate / sectionChapters.length)

      // Calculate minimum calls needed per chapter (based on 60-question limit)
      const callsPerChapter = Math.ceil(questionsPerChapter / MAX_QUESTIONS_PER_CALL)

      // Split questions evenly across calls
      batchSize = Math.ceil(questionsPerChapter / callsPerChapter)
      totalBatches = sectionChapters.length * callsPerChapter

      console.log(`[REGENERATE_SECTION_MODE_BC] Chapter-based mode: ${sectionChapters.length} chapters, ${questionsPerChapter} per chapter → ${callsPerChapter} call(s) per chapter (batch_size=${batchSize}, total_batches=${totalBatches})`)
    }

    // Step 3: Update section status to 'generating' with calculated batch tracking fields
    await supabaseAdmin
      .from('test_paper_sections')
      .update({
        status: 'generating',
        generation_started_at: new Date().toISOString(),
        generation_attempt_id: attemptId,
        generation_error: null,
        batch_number: 0,
        total_batches: totalBatches,
        questions_generated_so_far: 0,
        batch_size: batchSize,
        batch_metadata: {}
      })
      .eq('id', sectionId)

    let questionsGenerated = 0
    let totalTokensUsed = 0
    const allValidationWarnings: string[] = []

    // AI KNOWLEDGE MODE: Generate questions using Gemini's training knowledge
    if (aiKnowledgeChapterRel) {
      const aiKnowledgeChapterId = aiKnowledgeChapterRel.chapter_id
      console.log(`[REGENERATE_SECTION_AI_KNOWLEDGE] Section "${section.section_name}" (${subjectName}) using AI Knowledge Mode (chapter_id: ${aiKnowledgeChapterId}) - BATCH 1 of ${totalBatches}`)

      try {
        // Map difficulty to protocol config for batch 1
        const protocolConfig = mapDifficultyToConfig(
          protocol,
          paper.difficulty_level as 'easy' | 'balanced' | 'hard',
          batchSize
        )

        // Build AI Knowledge Mode prompt for batch 1
        const aiKnowledgePrompt = buildPrompt(
          protocol,
          protocolConfig,
          `${subjectName} (Full Syllabus)`,
          batchSize, // Generate batch 1 using calculated batch size
          totalQuestionsToGenerate, // Total target for context
          section.is_bilingual || false
        )

        // Prepend instruction to use AI's built-in knowledge
        const finalPrompt = `IMPORTANT: You are generating questions using your built-in training knowledge about ${subjectName}. NO study materials have been provided. Use your comprehensive knowledge of this subject to generate high-quality questions following the protocol specifications.

${aiKnowledgePrompt}`

        console.log(`[REGENERATE_SECTION_AI_KNOWLEDGE] Calling Gemini for batch 1: ${batchSize} questions using AI knowledge...`)

        // Use retry wrapper for automatic retry on failures
        const result = await generateQuestionsWithRetry(
          'A',
          { prompt: finalPrompt },
          1, // Batch 1
          sectionId
        )

        const questions = result.questions
        const tokenUsage = result.tokenUsage
        totalTokensUsed = tokenUsage.totalTokens
        console.log(`[REGENERATE_SECTION_AI_KNOWLEDGE] Parsed ${questions.length} questions`)

        if (questions.length === 0) {
          throw new Error('No questions in response')
        }

        // Validate questions using protocol
        const validation = validateQuestionsWithProtocol(questions, protocol)

        if (validation.errors.length > 0) {
          console.error('[REGENERATE_SECTION_AI_KNOWLEDGE_VALIDATION_ERRORS]', validation.errors)
          allValidationWarnings.push(`Section ${section.section_name}: ${validation.errors.join('; ')}`)
        }

        if (validation.warnings.length > 0) {
          console.warn('[REGENERATE_SECTION_AI_KNOWLEDGE_VALIDATION_WARNINGS]', validation.warnings)
          allValidationWarnings.push(...validation.warnings)
        }

        // Insert questions into database for batch 1 WITH section_id and AI Knowledge chapter_id
        const questionsToInsert = questions.map((q, index) => ({
          institute_id: teacher.institute_id,
          paper_id: paperId,
          chapter_id: aiKnowledgeChapterId,
          section_id: sectionId,
          passage_id: null,
          question_text: q.questionText,
          question_data: {
            options: q.options,
            correctAnswer: q.correctAnswer,
            archetype: q.archetype,
            structuralForm: q.structuralForm,
            cognitiveLoad: q.cognitiveLoad,
            difficulty: q.difficulty,
            ncertFidelity: q.ncertFidelity,
            language: q.language || (section.is_bilingual ? 'bilingual' : 'hindi'),
            // Bilingual fields (only when present)
            ...(q.questionText_en && { questionText_en: q.questionText_en }),
            ...(q.options_en && { options_en: q.options_en }),
            ...(q.explanation_en && { explanation_en: q.explanation_en }),
            ...(q.passage_en && { passage_en: q.passage_en })
          },
          explanation: q.explanation,
          marks: section.marks_per_question || 4,
          negative_marks: section.negative_marks || 0,
          is_selected: false,
          generation_attempt_id: attemptId,
          question_order: index + 1,
          batch_number: 1 // Batch 1
        }))

        const { error: insertError } = await supabaseAdmin
          .from('questions')
          .insert(questionsToInsert)

        if (insertError) {
          console.error('[REGENERATE_SECTION_AI_KNOWLEDGE_ERROR] Failed to insert questions:', insertError)

          await supabaseAdmin
            .from('test_paper_sections')
            .update({
              status: 'ready',
              generation_error: 'Failed to insert AI Knowledge questions',
              generation_started_at: null,
              generation_attempt_id: null
            })
            .eq('id', sectionId)

          throw new Error('Failed to save AI-generated questions')
        }

        questionsGenerated = questions.length
        console.log(`[REGENERATE_SECTION_AI_KNOWLEDGE_SUCCESS] Batch 1: Inserted ${questionsGenerated} questions for section "${section.section_name}"`)

        // Log API usage and costs
        const costs = calculateCost(tokenUsage, GEMINI_MODEL, 'standard')
        console.log(`[REGENERATE_SECTION_AI_KNOWLEDGE_COST] Batch 1: Section ${section.section_name}: ${questions.length} questions, ₹${costs.costInINR.toFixed(4)}`)

        // Log usage to file (non-blocking)
        try {
          logApiUsage({
            instituteId: paper.institute_id,
            instituteName: (paper.institutes as any)?.name,
            teacherId: teacher.id,
            paperId: paperId,
            paperTitle: paper.title,
            chapterId: aiKnowledgeChapterId,
            chapterName: `${subjectName} (AI Knowledge - Full Syllabus)`,
            usage: tokenUsage,
            modelUsed: GEMINI_MODEL,
            operationType: 'regenerate',
            questionsGenerated: questions.length,
            mode: 'standard'
          })
        } catch (err) {
          console.error('[TOKEN_TRACKER] Failed to log usage:', err)
        }

        // Update section state after batch 1
        const batch1Metadata = {
          batch_1: {
            generated_at: new Date().toISOString(),
            questions_count: questionsGenerated,
            tokens_used: tokenUsage.totalTokens,
            cost_inr: costs.costInINR
          }
        }

        await supabaseAdmin
          .from('test_paper_sections')
          .update({
            batch_number: 1,
            questions_generated_so_far: questionsGenerated,
            batch_metadata: batch1Metadata,
            last_batch_completed_at: new Date().toISOString(), // Initial heartbeat for batch 1
            updated_at: new Date().toISOString()
          })
          .eq('id', sectionId)

        // 🔥 SELF-TRIGGER: Fire async call to generate next batch if needed
        const hasMore = questionsGenerated < totalQuestionsToGenerate

        if (hasMore) {
          const authHeader = request.headers.get('Authorization')

          // Build URL with fallback for when NEXT_PUBLIC_SITE_URL is not set
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
            `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
          const nextBatchUrl = `${siteUrl}/api/test-papers/${paperId}/sections/${sectionId}/generate-next-batch`

          console.log(`[REGENERATE_SECTION_AI_KNOWLEDGE] Batch 1 complete. Triggering batch 2 at: ${nextBatchUrl}`)

          // Fire and forget (don't await)
          fetch(nextBatchUrl, {
            method: 'POST',
            headers: {
              'Authorization': authHeader || '',
              'Content-Type': 'application/json'
            }
          }).catch(async (err) => {
            console.error('[REGENERATE_SECTION_AI_KNOWLEDGE] Failed to trigger next batch:', err)

            // Mark section as in_review so UI isn't stuck
            await supabaseAdmin
              .from('test_paper_sections')
              .update({
                status: 'in_review',
                generation_error: `Batch 1 completed (${questionsGenerated} questions), but batch 2 trigger failed. Regenerate to complete.`
              })
              .eq('id', sectionId)
          })
        } else {
          // If all questions generated in batch 1, run proofreader before marking as in_review
          await runProofreader(sectionId, paperId, teacher.institute_id)

          // Mark as in_review
          await supabaseAdmin
            .from('test_paper_sections')
            .update({
              status: 'in_review',
              generation_completed_at: new Date().toISOString()
            })
            .eq('id', sectionId)

          console.log(`[SECTION_COMPLETE] ✅ GENERATION + PROOFREADING COMPLETE for section "${section.section_name}". Status: in_review. Total questions: ${questionsGenerated}`)
        }

        console.log(`[REGENERATE_SECTION_AI_KNOWLEDGE_COMPLETE] Batch 1: section="${section.section_name}" questions=${questionsGenerated} tokens=${tokenUsage.totalTokens}`)

        return NextResponse.json({
          success: true,
          section_id: sectionId,
          batch_1_questions: questionsGenerated,
          total_target: totalQuestionsToGenerate,
          batch_number: 1,
          total_batches: totalBatches,
          has_more: hasMore,
          next_batch_triggered: hasMore,
          ai_knowledge_mode: true,
          validation_warnings: allValidationWarnings
        })

      } catch (aiKnowledgeError) {
        console.error('[REGENERATE_SECTION_AI_KNOWLEDGE_ERROR]', aiKnowledgeError)

        // Mark section as failed
        await supabaseAdmin
          .from('test_paper_sections')
          .update({
            status: 'failed',
            generation_error: aiKnowledgeError instanceof Error ? aiKnowledgeError.message : 'Unknown error',
            generation_started_at: null,
            generation_attempt_id: null
          })
          .eq('id', sectionId)

        return NextResponse.json(
          {
            error: 'Failed to regenerate questions in AI Knowledge mode',
            details: aiKnowledgeError instanceof Error ? aiKnowledgeError.message : 'Unknown error'
          },
          { status: 500 }
        )
      }
    }

    // MATERIAL-BASED MODE: Standard question generation from uploaded materials
    // Check if subject is Source of Scope (SoS) or Source of Truth (SoT)
    const subjectData = section.subjects as any
    const isSourceOfScope = subjectData?.is_source_of_scope || false

    console.log(`[REGENERATE_SECTION] Processing ${sectionChapters.length} chapters - BATCH 1 of ${totalBatches}`)
    console.log(`[REGENERATE_SECTION] Subject mode: ${isSourceOfScope ? 'Source of Scope (use chapter_knowledge)' : 'Source of Truth (upload PDFs)'}`)

    // SEQUENTIAL CHAPTER PROCESSING: Build chapter schedule for all batches
    // Each chapter gets processed completely before moving to the next
    const questionsPerChapter = Math.ceil(totalQuestionsToGenerate / sectionChapters.length)

    const chapterSchedule = sectionChapters.map((ch: any, index: number) => ({
      chapter_id: ch.id,
      chapter_name: ch.name,
      chapter_order: index + 1,
      questions_target: questionsPerChapter,
      questions_generated: 0
    }))

    // Batch 1: Process FIRST chapter only
    const firstChapter = chapterSchedule[0]
    // Mode B/C: Use pre-calculated batch size (already accounts for 1 or 2 calls based on chapter size)
    const questionsInBatch1 = Math.min(batchSize, firstChapter.questions_target)

    console.log(`[REGENERATE_SECTION] SEQUENTIAL PROCESSING - ${sectionChapters.length} chapters, ${questionsPerChapter} questions each`)
    console.log(`[REGENERATE_SECTION] Batch 1: Generating ${questionsInBatch1} questions for Chapter 1: "${firstChapter.chapter_name}"`)

    // Process FIRST chapter only (sequential processing)
    const chapter = sectionChapters[0]
    const chapterId = chapter.id
    const chapterName = chapter.name

    console.log(`[REGENERATE_SECTION_CHAPTER_START] chapter="${chapterName}" (1 of ${sectionChapters.length})`)

      try {
        let uploadedFiles: any[] = []
        let chapterKnowledge: any = null

        // SOURCE OF SCOPE: Use chapter_knowledge (NO PDF uploads)
        if (isSourceOfScope) {
          console.log(`[REGENERATE_SECTION_SOS] Fetching chapter_knowledge for chapter ${chapterName}...`)

          // Fetch chapter_knowledge for this chapter
          const { data: knowledgeData, error: knowledgeError } = await supabaseAdmin
            .from('chapter_knowledge')
            .select('scope_analysis, style_examples, status')
            .eq('chapter_id', chapterId)
            .eq('institute_id', teacher.institute_id)
            .eq('status', 'completed')
            .single()

          if (knowledgeError || !knowledgeData) {
            console.error(`[REGENERATE_SECTION_SOS_ERROR] No chapter_knowledge found for chapter ${chapterName}. Error: ${knowledgeError?.message}`)

            await supabaseAdmin
              .from('test_paper_sections')
              .update({
                status: 'ready',
                generation_error: `No chapter knowledge found for "${chapterName}". Please analyze materials first.`
              })
              .eq('id', sectionId)

            return NextResponse.json({
              error: `No chapter knowledge found for "${chapterName}". Please upload and analyze materials first.`
            }, { status: 400 })
          }

          chapterKnowledge = knowledgeData
          console.log(`[REGENERATE_SECTION_SOS] Using chapter_knowledge (scope_analysis + style_examples) for ${chapterName}`)
        }
        // SOURCE OF TRUTH: Upload PDFs to Gemini
        else {
          console.log(`[REGENERATE_SECTION_SOT] Fetching and uploading PDFs for chapter ${chapterName}...`)

          // Step 1: Fetch materials for this chapter
          const materials = await fetchMaterialsForChapter(chapterId, teacher.institute_id)

          if (!materials || materials.length === 0) {
            console.error(`[REGENERATE_SECTION_SOT_ERROR] No materials found for chapter ${chapterName}`)

            await supabaseAdmin
              .from('test_paper_sections')
              .update({
                status: 'ready',
                generation_error: `No materials found for chapter "${chapterName}". Please upload materials first.`
              })
              .eq('id', sectionId)

            return NextResponse.json({
              error: `No materials found for chapter "${chapterName}". Please upload study materials for this chapter first.`
            }, { status: 400 })
          }

          console.log(`[REGENERATE_SECTION_SOT] Found ${materials.length} materials for chapter ${chapterName}`)

          // Step 2: Upload PDFs to Gemini File API
          for (const material of materials) {
            try {
              const uploadedFile = await uploadPDFToGemini(material.file_url, material.title)
              uploadedFiles.push(uploadedFile)
              console.log(`[REGENERATE_SECTION_SOT] Uploaded: ${material.title}`)
            } catch (uploadError) {
              console.error(`[REGENERATE_SECTION_SOT_ERROR] Failed to upload ${material.title}:`, uploadError)
              // Continue with other files
            }
          }

          if (uploadedFiles.length === 0) {
            console.error(`[REGENERATE_SECTION_SOT_ERROR] No files uploaded successfully for chapter ${chapterName}`)

            await supabaseAdmin
              .from('test_paper_sections')
              .update({
                status: 'ready',
                generation_error: `Failed to upload materials for chapter "${chapterName}"`
              })
              .eq('id', sectionId)

            return NextResponse.json({
              error: `Failed to upload materials for chapter "${chapterName}". Please check the PDF files.`
            }, { status: 500 })
          }
        }

        // Step 3: Map difficulty to protocol config for batch 1
        const protocolConfig = mapDifficultyToConfig(
          protocol,
          paper.difficulty_level as 'easy' | 'balanced' | 'hard',
          questionsInBatch1
        )

        // Step 4: Build prompt using protocol for batch 1
        let basePrompt = buildPrompt(
          protocol,
          protocolConfig,
          chapterName,
          questionsInBatch1, // Generate questions for first chapter in batch 1
          totalQuestionsToGenerate  // Total target for context
        )

        // Step 5: Prepare Gemini call based on subject mode
        let finalPrompt: string
        let fileDataParts: any[] | undefined

        if (isSourceOfScope) {
          // SOURCE OF SCOPE: Inject chapter_knowledge into prompt (NO file uploads)
          const scopeInfo = chapterKnowledge.scope_analysis
            ? JSON.stringify(chapterKnowledge.scope_analysis, null, 2)
            : 'No scope analysis available'

          const styleInfo = chapterKnowledge.style_examples
            ? JSON.stringify(chapterKnowledge.style_examples, null, 2)
            : 'No style examples available'

          finalPrompt = `CHAPTER KNOWLEDGE (Source of Scope):

**Scope Analysis:**
${scopeInfo}

**Style Examples:**
${styleInfo}

IMPORTANT: Use the above chapter knowledge as the SCOPE for question generation. Generate questions that align with the topics, difficulty patterns, and question styles shown above. Do NOT go outside this scope.

${basePrompt}`

          console.log(`[REGENERATE_SECTION_SOS] Calling Gemini with chapter_knowledge for ${questionsInBatch1} questions...`)
        } else {
          // SOURCE OF TRUTH: Use uploaded PDFs
          fileDataParts = uploadedFiles.map(file => ({
            fileData: {
              fileUri: file.fileUri,
              mimeType: file.mimeType
            }
          }))

          finalPrompt = `IMPORTANT: The attached PDF files contain the TRUTH - the exact study materials for this chapter. Generate questions that STRICTLY follow the content, examples, and explanations in these materials. Do NOT use external knowledge or go beyond what is covered in the provided PDFs.

${basePrompt}`

          console.log(`[REGENERATE_SECTION_SOT] Calling Gemini with ${uploadedFiles.length} PDF(s) for ${questionsInBatch1} questions...`)
        }

        // Step 6: Use retry wrapper for automatic retry on failures
        const result = await generateQuestionsWithRetry(
          isSourceOfScope ? 'B' : 'C',
          { prompt: finalPrompt, fileDataParts },
          1, // Batch 1
          sectionId
        )

        const questions = result.questions
        const tokenUsage = result.tokenUsage
        totalTokensUsed += tokenUsage.totalTokens
        console.log(`[REGENERATE_SECTION] Parsed ${questions.length} questions`)

        if (questions.length === 0) {
          console.error('[REGENERATE_SECTION_ERROR] No questions in response')

          await supabaseAdmin
            .from('test_paper_sections')
            .update({
              status: 'ready',
              generation_error: `Gemini returned 0 questions for chapter "${chapterName}"`
            })
            .eq('id', sectionId)

          return NextResponse.json({
            error: `Failed to generate questions for chapter "${chapterName}". Please try again.`
          }, { status: 500 })
        }

        // Step 8: Validate questions using protocol
        const validation = validateQuestionsWithProtocol(questions, protocol)

        if (validation.errors.length > 0) {
          console.error('[REGENERATE_SECTION_VALIDATION_ERRORS]', validation.errors)
          allValidationWarnings.push(`Chapter ${chapterName}: ${validation.errors.join('; ')}`)
        }

        if (validation.warnings.length > 0) {
          console.warn('[REGENERATE_SECTION_VALIDATION_WARNINGS]', validation.warnings)
          allValidationWarnings.push(...validation.warnings)
        }

        // Step 9: Insert questions into database for batch 1 WITH section_id
        const questionsToInsert = questions.map((q, index) => ({
          institute_id: teacher.institute_id,
          paper_id: paperId,
          chapter_id: chapterId,
          section_id: sectionId,
          question_text: q.questionText,
          question_data: {
            options: q.options,
            correctAnswer: q.correctAnswer,
            archetype: q.archetype,
            structuralForm: q.structuralForm,
            cognitiveLoad: q.cognitiveLoad,
            difficulty: q.difficulty,
            ncertFidelity: q.ncertFidelity
          },
          explanation: q.explanation,
          marks: section.marks_per_question || 4,
          negative_marks: section.negative_marks || 0,
          is_selected: false,
          generation_attempt_id: attemptId,
          question_order: questionsGenerated + index + 1,
          batch_number: 1 // Batch 1
        }))

        const { error: insertError } = await supabaseAdmin
          .from('questions')
          .insert(questionsToInsert)

        if (insertError) {
          console.error('[REGENERATE_SECTION_ERROR] Failed to insert questions:', insertError)

          // Mark section as ready (failed generation, but chapters still assigned)
          await supabaseAdmin
            .from('test_paper_sections')
            .update({
              status: 'ready',
              generation_error: 'Failed to insert questions for chapter',
              generation_started_at: null,
              generation_attempt_id: null
            })
            .eq('id', sectionId)

          return NextResponse.json({ error: 'Failed to save questions to database' }, { status: 500 })
        }

        questionsGenerated += questions.length

        // Log API usage and costs to file
        const costs = calculateCost(tokenUsage, GEMINI_MODEL, 'standard')
        console.log(`[REGENERATE_SECTION_COST] Section ${section.section_name}, Chapter ${chapterName}: ${questions.length} questions, ₹${costs.costInINR.toFixed(4)}`)

        // Log usage to file (non-blocking)
        try {
          logApiUsage({
            instituteId: paper.institute_id,
            instituteName: (paper.institutes as any)?.name,
            teacherId: teacher.id,
            paperId: paperId,
            paperTitle: paper.title,
            chapterId: chapter.id,
            chapterName: chapterName,
            usage: tokenUsage,
            modelUsed: GEMINI_MODEL,
            operationType: 'regenerate',
            questionsGenerated: questions.length,
            mode: 'standard'
          })
        } catch (err) {
          console.error('[TOKEN_TRACKER] Failed to log usage:', err)
        }

        console.log(`[REGENERATE_SECTION_CHAPTER_SUCCESS] chapter="${chapterName}" generated=${questions.length}`)

      } catch (chapterError) {
        console.error(`[REGENERATE_SECTION_CHAPTER_ERROR] chapter="${chapterName}":`, chapterError)

        await supabaseAdmin
          .from('test_paper_sections')
          .update({ status: 'ready' })
          .eq('id', sectionId)

        return NextResponse.json({
          error: `Failed to generate questions for chapter "${chapterName}". Please try again.`
        }, { status: 500 })
      }

    // Update section state after batch 1 with chapter schedule
    // Track chapter distribution and progress
    chapterSchedule[0].questions_generated = questionsGenerated

    const batch1Metadata = {
      chapterSchedule: chapterSchedule, // Full chapter distribution plan
      current_chapter_index: 0, // Currently processing first chapter
      [`chapter_${firstChapter.chapter_id}_generated`]: questionsGenerated, // Track by chapter ID
      batch_1: {
        generated_at: new Date().toISOString(),
        questions_count: questionsGenerated,
        tokens_used: totalTokensUsed,
        cost_inr: calculateCost({
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: totalTokensUsed
        }, GEMINI_MODEL, 'standard').costInINR,
        chapters_processed: 1 // Sequential: processed 1 chapter in batch 1
      }
    }

    await supabaseAdmin
      .from('test_paper_sections')
      .update({
        batch_number: 1,
        questions_generated_so_far: questionsGenerated,
        batch_metadata: batch1Metadata,
        last_batch_completed_at: new Date().toISOString(), // Initial heartbeat for batch 1
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId)

    // 🔥 SELF-TRIGGER: Fire async call to generate next batch if needed
    const hasMore = questionsGenerated < totalQuestionsToGenerate

    if (hasMore) {
      const authHeader = request.headers.get('Authorization')

      // Build URL with fallback for when NEXT_PUBLIC_SITE_URL is not set
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
        `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
      const nextBatchUrl = `${siteUrl}/api/test-papers/${paperId}/sections/${sectionId}/generate-next-batch`

      console.log(`[REGENERATE_SECTION] Batch 1 complete. Triggering batch 2 at: ${nextBatchUrl}`)

      // Fire and forget (don't await)
      fetch(nextBatchUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader || '',
          'Content-Type': 'application/json'
        }
      }).catch(async (err) => {
        console.error('[REGENERATE_SECTION] Failed to trigger next batch:', err)

        // Mark section as in_review so UI isn't stuck
        await supabaseAdmin
          .from('test_paper_sections')
          .update({
            status: 'in_review',
            generation_error: `Batch 1 completed (${questionsGenerated} questions), but batch 2 trigger failed. Regenerate to complete.`
          })
          .eq('id', sectionId)
      })
    } else {
      // If all questions generated in batch 1, run proofreader before marking as in_review
      await runProofreader(sectionId, paperId, teacher.institute_id)

      // Mark as in_review
      await supabaseAdmin
        .from('test_paper_sections')
        .update({
          status: 'in_review',
          generation_completed_at: new Date().toISOString()
        })
        .eq('id', sectionId)

      console.log(`[SECTION_COMPLETE] ✅ GENERATION + PROOFREADING COMPLETE for section "${section.section_name}". Status: in_review. Total questions: ${questionsGenerated}`)
    }

    // Calculate cost estimate
    const costs = calculateCost(
      {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: totalTokensUsed
      },
      GEMINI_MODEL,
      'standard'
    )

    console.log(`[REGENERATE_SECTION_SUCCESS] Batch 1: section="${section.section_name}" deleted=${questionsDeleted} generated=${questionsGenerated} tokens=${totalTokensUsed}`)

    return NextResponse.json({
      success: true,
      section_id: sectionId,
      section_name: section.section_name,
      questions_deleted: questionsDeleted,
      batch_1_questions: questionsGenerated,
      total_target: totalQuestionsToGenerate,
      batch_number: 1,
      total_batches: totalBatches,
      has_more: hasMore,
      next_batch_triggered: hasMore,
      chapters_processed: sectionChapters.length,
      cost_estimate: {
        tokens_used: totalTokensUsed,
        cost_usd: costs.totalCost
      },
      validation_warnings: allValidationWarnings.slice(0, 10)
    })

  } catch (error) {
    console.error('[REGENERATE_SECTION_EXCEPTION]', error)

    // Get section and paper IDs
    const { id: paperId, section_id: sectionId } = await (params as any)

    // Detect if this is a retry-exhausted error (JSON parse, timeout, or Gemini API error)
    const isRetryExhausted = error instanceof Error && (
      error.message.includes('JSON') ||
      error.message.includes('json') ||
      error.message.includes('parse') ||
      error.message.includes('timeout') ||
      error.message.includes('Gemini') ||
      error.message.includes('429') ||
      error.message.includes('quota')
    )

    if (isRetryExhausted) {
      console.log('[REGENERATE_RETRY_EXHAUSTED] All retry attempts failed, attempting graceful degradation')

      // Get current section state to see if any questions were generated
      const { data: section, error: sectionFetchError } = await supabaseAdmin
        .from('test_paper_sections')
        .select(`
          id,
          section_name,
          paper_id,
          test_papers!inner (
            id,
            institute_id
          )
        `)
        .eq('id', sectionId)
        .single()

      if (!sectionFetchError && section) {
        // Count generated questions (batch 1 in regenerate)
        const { count: questionsGenerated } = await supabaseAdmin
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('section_id', sectionId)
          .eq('generation_attempt_id', null) // Questions from successful generation

        const questionsAvailable = questionsGenerated || 0

        console.log(`[REGENERATE_RETRY_EXHAUSTED] Section ${sectionId} has ${questionsAvailable} questions available`)

        // Run proofreader on successfully generated questions if any exist
        if (questionsAvailable > 0) {
          console.log(`[REGENERATE_RETRY_EXHAUSTED] Running proofreader on ${questionsAvailable} successfully generated questions`)
          try {
            const paper = section.test_papers as any
            await runProofreader(sectionId, section.paper_id, paper.institute_id)
            console.log('[REGENERATE_RETRY_EXHAUSTED] Proofreader completed successfully')
          } catch (proofreaderError) {
            console.error('[REGENERATE_RETRY_EXHAUSTED] Proofreader failed:', proofreaderError)
            // Continue even if proofreader fails - questions are still usable
          }
        }

        // Mark section as 'in_review' if questions were generated, otherwise 'ready'
        const newStatus = questionsAvailable > 0 ? 'in_review' : 'ready'
        const errorMessage = questionsAvailable > 0
          ? `Batch 1 failed after 3 retry attempts. ${questionsAvailable} questions are available for review. You can regenerate to try again.`
          : 'Batch 1 failed after 3 retry attempts. No questions were generated. Please try regenerating again.'

        await supabaseAdmin
          .from('test_paper_sections')
          .update({
            status: newStatus,
            generation_error: errorMessage,
            generation_completed_at: new Date().toISOString(),
            generation_started_at: null,
            generation_attempt_id: null
          })
          .eq('id', sectionId)

        console.log(`[REGENERATE_RETRY_EXHAUSTED] Section ${sectionId} marked as '${newStatus}' with ${questionsAvailable} questions preserved`)

        // Return 207 Multi-Status for partial success
        return NextResponse.json(
          {
            error: `Batch 1 failed after 3 retry attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
            partial_success: questionsAvailable > 0,
            questions_available: questionsAvailable,
            section_status: newStatus,
            message: errorMessage
          },
          { status: questionsAvailable > 0 ? 207 : 500 }
        )
      }
    }

    // Standard error handling for non-retry-exhausted errors
    try {
      await supabaseAdmin
        .from('test_paper_sections')
        .update({
          status: 'ready',
          generation_error: error instanceof Error ? error.message : 'Unknown error during regeneration',
          generation_started_at: null,
          generation_attempt_id: null
        })
        .eq('id', sectionId)
    } catch (updateError) {
      console.error('[REGENERATE_SECTION_ERROR] Failed to update section status:', updateError)
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
