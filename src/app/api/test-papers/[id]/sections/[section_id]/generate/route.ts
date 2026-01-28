/**
 * POST /api/test-papers/[id]/sections/[section_id]/generate
 *
 * Generates questions for a single section
 * - Fetches chapters assigned to this section from section_chapters table
 * - Loops through chapters, generates questions per chapter
 * - Uses exam+subject-specific protocol for question generation
 * - Updates section status: ready → generating → in_review/failed
 *
 * Response:
 * - success: boolean
 * - section_id: string
 * - questions_generated: number
 * - cost_estimate: { tokens_used: number; cost_usd: number }
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ai, GEMINI_MODEL, GENERATION_CONFIG } from '@/lib/ai/geminiClient'
import { fetchMaterialsForChapter, fetchChapterKnowledge } from '@/lib/ai/materialFetcher'
import { uploadPDFToGemini } from '@/lib/ai/pdfUploader'
import { mapDifficultyToConfig } from '@/lib/ai/difficultyMapper'
import { buildPrompt } from '@/lib/ai/promptBuilder'
import { validateQuestionsWithProtocol, Question } from '@/lib/ai/questionValidator'
import { parseGeminiJSON, getDiagnosticInfo } from '@/lib/ai/jsonCleaner'
import { logApiUsage, calculateCost } from '@/lib/ai/tokenTracker'
import { getProtocol } from '@/lib/ai/protocols'
import { deletePaperPDFs } from '@/lib/storage/pdfCleanupService'
import { shouldUseScopeAnalysis } from '@/lib/ai/subjectClassifier'
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
): Promise<{
  questions: any[]
  tokenUsage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}> {
  const attemptNumber = 3 - retries
  const modeLabel = mode === 'A' ? 'AI_KNOWLEDGE' : mode === 'B' ? 'SOURCE_OF_SCOPE' : 'SOURCE_OF_TRUTH'

  console.log(`[GENERATE_BATCH_${modeLabel}_RETRY] Batch ${batchNumber}, Attempt ${attemptNumber}/3`)

  try {
    // Prepare contents based on mode
    const contents = params.fileDataParts
      ? [...params.fileDataParts, { text: params.prompt }]
      : [{ text: params.prompt }]

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contents,
      config: GENERATION_CONFIG
    })

    const responseText = response.text
    if (!responseText) {
      throw new Error('No response text received from Gemini')
    }

    console.log(`[GENERATE_BATCH_${modeLabel}_RETRY] Received response (${responseText.length} chars)`)

    // Extract token usage
    const tokenUsage = {
      promptTokens: response.usageMetadata?.promptTokenCount || 0,
      completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata?.totalTokenCount || 0,
    }

    console.log(`[GENERATE_BATCH_${modeLabel}_RETRY] Token usage: ${tokenUsage.totalTokens} total`)

    // Parse JSON response (this is where 7-8% of failures occur)
    const rawParsed = parseGeminiJSON<any>(responseText)

    // Handle both formats: { questions: [...] } or just [...]
    let rawQuestions: any[]
    if (Array.isArray(rawParsed)) {
      rawQuestions = rawParsed
    } else if (rawParsed.questions && Array.isArray(rawParsed.questions)) {
      rawQuestions = rawParsed.questions
    } else {
      throw new Error('Response missing "questions" array or is not a valid array')
    }

    if (rawQuestions.length === 0) {
      throw new Error('Response has empty "questions" array')
    }

    console.log(`[GENERATE_BATCH_${modeLabel}_RETRY] Successfully parsed ${rawQuestions.length} questions on attempt ${attemptNumber}`)

    return {
      questions: rawQuestions,
      tokenUsage
    }

  } catch (error) {
    // Classify error type
    const errorType = error instanceof SyntaxError || (error instanceof Error && error.message.toLowerCase().includes('json'))
      ? 'JSON_PARSE_ERROR'
      : error instanceof Error && (error.message.includes('timeout') || error.message.includes('ECONNRESET'))
      ? 'TIMEOUT_ERROR'
      : 'GEMINI_API_ERROR'

    console.error(`[GENERATE_BATCH_${modeLabel}_RETRY] Attempt ${attemptNumber}/3 failed with ${errorType}:`, error instanceof Error ? error.message : error)

    // If retries remain, retry with exponential backoff
    if (retries > 0) {
      const baseDelay = 2000 // 2 seconds
      const delayMs = errorType === 'TIMEOUT_ERROR'
        ? baseDelay * 2 * attemptNumber // Longer delay for timeouts
        : baseDelay * attemptNumber // Standard exponential backoff

      console.log(`[GENERATE_BATCH_${modeLabel}_RETRY] Retrying in ${delayMs}ms... (${retries} retries remaining)`)

      // Update heartbeat to prevent 7-minute cleanup during retry
      await supabaseAdmin
        .from('test_paper_sections')
        .update({ last_batch_completed_at: new Date().toISOString() })
        .eq('id', sectionId)

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs))

      // Recursive retry
      return generateQuestionsWithRetry(mode, params, batchNumber, sectionId, retries - 1)
    }

    // All retries exhausted, throw error
    console.error(`[GENERATE_BATCH_${modeLabel}_RETRY] All 3 attempts failed for batch ${batchNumber}`)
    throw error
  }
}

interface GenerateSectionParams {
  params: Promise<{
    id: string
    section_id: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: GenerateSectionParams
) {
  // Generate unique attempt ID for this generation (for cleanup/rollback)
  const attemptId = crypto.randomUUID()
  let sectionId: string | null = null

  try {
    const { id: paperId, section_id: sectionIdParam } = await params
    sectionId = sectionIdParam

    console.log(`[GENERATE_SECTION_START] paper_id=${paperId} section_id=${sectionId} attempt_id=${attemptId}`)

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
    const { data: section, error: sectionError } = await supabaseAdmin
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
      console.error('[GENERATE_SECTION_ERROR]', sectionError)
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    // Verify paper belongs to teacher's institute
    const paper = section.test_papers as any
    if (paper.institute_id !== teacher.institute_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // If paper has PDFs, clear them (generating questions invalidates existing PDFs)
    if (paper.status === 'finalized' || paper.pdf_url || paper.answer_key_url) {
      console.log('[GENERATE_SECTION] Paper has PDFs (status:', paper.status, '), clearing them...')

      // Delete PDFs from storage
      const cleanupResult = await deletePaperPDFs(paper.pdf_url, paper.answer_key_url)
      if (!cleanupResult.success) {
        console.warn('[GENERATE_SECTION] PDF cleanup had errors:', cleanupResult.errors)
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
        console.error('[GENERATE_SECTION] Failed to clear PDFs:', reopenError)
        return NextResponse.json({ error: 'Failed to clear PDFs' }, { status: 500 })
      }

      console.log('[GENERATE_SECTION] Paper reopened and PDFs cleared')
    }

    // Verify section status is 'ready' or 'in_review' (has chapters assigned)
    // Allow 'in_review' to support regeneration when fixing protocol issues
    if (section.status !== 'ready' && section.status !== 'in_review') {
      return NextResponse.json({
        error: 'This section is not ready for question generation. Please check the section configuration.'
      }, { status: 400 })
    }

    const streamName = (paper.streams as any)?.name
    const subjectName = (section.subjects as any)?.name

    if (!streamName || !subjectName) {
      console.error('[GENERATE_SECTION_ERROR] Section missing stream or subject')
      return NextResponse.json({ error: 'This section is not ready for question generation. Please check the section configuration.' }, { status: 400 })
    }

    console.log(`[GENERATE_SECTION] section="${section.section_name}" stream="${streamName}" subject="${subjectName}"`)

    // Get protocol for this section's exam+subject combination
    let protocol
    try {
      protocol = getProtocol(streamName, subjectName)
      console.log(`[GENERATE_SECTION] Using protocol: ${protocol.id} (${protocol.name})`)
    } catch (protocolError) {
      console.error('[GENERATE_SECTION_ERROR] Protocol not found:', protocolError)
      return NextResponse.json({
        error: 'This section is not ready for question generation. Please check the section configuration.'
      }, { status: 400 })
    }

    // If regenerating (status was 'in_review'), delete existing questions first
    if (section.status === 'in_review') {
      console.log('[GENERATE_SECTION] Regenerating - deleting existing questions for section:', sectionId)

      const { data: deletedQuestions, error: deleteError } = await supabaseAdmin
        .from('questions')
        .delete()
        .eq('section_id', sectionId)
        .select('id')

      if (deleteError) {
        console.error('[GENERATE_SECTION_ERROR] Failed to delete existing questions:', deleteError)
        return NextResponse.json(
          { error: 'We encountered an issue generating questions. Please try again.' },
          { status: 500 }
        )
      }

      const questionsDeleted = deletedQuestions?.length || 0
      console.log(`[GENERATE_SECTION] Deleted ${questionsDeleted} existing questions for regeneration`)
    }

    // Fetch chapters assigned to this section from section_chapters table (need this before calculating batches)
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
      console.error('[GENERATE_SECTION_ERROR] No chapters found:', chaptersError)

      // Mark section as failed
      await supabaseAdmin
        .from('test_paper_sections')
        .update({ status: 'failed' })
        .eq('id', sectionId)

      return NextResponse.json({ error: 'This section is not ready for question generation. Please check the section configuration.' }, { status: 400 })
    }

    // ========================================================================
    // GENERATION DECISION TREE: Determine mode based on chapter selection
    // ========================================================================
    // Step 1: Check if AI Knowledge mode selected (highest priority)
    // Step 2: Check subject type (Source of Scope vs Source of Truth)

    // Check if AI Knowledge mode is enabled (detect by chapter name)
    const aiKnowledgeChapterRel = sectionChapterRels.find(sc => {
      const chapter = sc.chapters as any
      return chapter?.name === '[AI Knowledge] Full Syllabus'
    })

    // ========================================================================
    // CALCULATE BUFFER & BATCH SIZE (Mode-dependent)
    // ========================================================================

    // Step 1: Calculate total questions with capped buffer
    const unbuffered = section.question_count
    const fiftyPercentBuffer = Math.ceil(unbuffered * 1.5)
    const cappedBuffer = unbuffered + MAX_BUFFER_QUESTIONS
    const totalQuestionsToGenerate = Math.min(fiftyPercentBuffer, cappedBuffer)

    console.log(`[GENERATE_SECTION_BUFFER] Target: ${unbuffered}, 50% buffer: ${fiftyPercentBuffer}, capped: ${cappedBuffer}, final: ${totalQuestionsToGenerate}`)

    // Step 2: Calculate batch size and total batches based on mode
    let batchSize: number
    let totalBatches: number

    if (aiKnowledgeChapterRel) {
      // Mode A: AI Knowledge - Intelligent batching (minimize calls, respect 60-question limit)
      const callsNeeded = Math.ceil(totalQuestionsToGenerate / MAX_QUESTIONS_PER_CALL)
      batchSize = Math.ceil(totalQuestionsToGenerate / callsNeeded)
      totalBatches = callsNeeded
      console.log(`[GENERATE_SECTION_MODE_A] AI Knowledge mode (intelligent batching): ${totalQuestionsToGenerate} questions → ${totalBatches} batch(es) of ~${batchSize} questions`)
    } else {
      // Mode B/C: Chapter-based - Dynamic batch size based on 60-question-per-call limit
      const sectionChapters = sectionChapterRels.map(sc => sc.chapters).filter(Boolean)
      const questionsPerChapter = Math.ceil(totalQuestionsToGenerate / sectionChapters.length)

      // Calculate minimum calls needed per chapter (based on 60-question limit)
      const callsPerChapter = Math.ceil(questionsPerChapter / MAX_QUESTIONS_PER_CALL)

      // Split questions evenly across calls
      batchSize = Math.ceil(questionsPerChapter / callsPerChapter)
      totalBatches = sectionChapters.length * callsPerChapter

      console.log(`[GENERATE_SECTION_MODE_BC] Chapter-based mode: ${sectionChapters.length} chapters, ${questionsPerChapter} per chapter → ${callsPerChapter} call(s) per chapter (batch_size=${batchSize}, total_batches=${totalBatches})`)
    }

    // Step 3: Update section status to 'generating' with calculated batch tracking fields
    await supabaseAdmin
      .from('test_paper_sections')
      .update({
        status: 'generating',
        generation_started_at: new Date().toISOString(),
        generation_attempt_id: attemptId,
        generation_error: null,
        batch_number: 0, // Will be set to 1 after first batch completes
        total_batches: totalBatches,
        questions_generated_so_far: 0,
        batch_size: batchSize,
        batch_metadata: {}
      })
      .eq('id', sectionId)

    console.log(`[GENERATE_SECTION_INIT] Section marked as 'generating' with batch_size=${batchSize}, total_batches=${totalBatches}`)

    if (aiKnowledgeChapterRel) {
      // ========================================================================
      // MODE A: AI KNOWLEDGE (Both SoS and SoT subjects)
      // ========================================================================
      // Generate using protocol + syllabus only (no materials, no chapter_knowledge)

      const aiKnowledgeChapterId = aiKnowledgeChapterRel.chapter_id
      console.log(`[GENERATE_SECTION_AI_KNOWLEDGE] Section "${section.section_name}" (${subjectName}) using AI Knowledge Mode (chapter_id: ${aiKnowledgeChapterId}) - BATCH 1 of ${totalBatches}`)

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

        console.log(`[GENERATE_SECTION_AI_KNOWLEDGE] Calling Gemini for batch 1: ${batchSize} questions using AI knowledge...`)

        // Call Gemini with retry logic (Mode A: AI Knowledge)
        const result = await generateQuestionsWithRetry(
          'A',
          { prompt: finalPrompt },
          1, // Batch 1
          sectionId
        )

        const questions = result.questions
        const tokenUsage = result.tokenUsage

        console.log(`[GENERATE_SECTION_AI_KNOWLEDGE] Successfully generated ${questions.length} questions with ${tokenUsage.totalTokens} tokens`)

        if (questions.length === 0) {
          console.error('[GENERATE_SECTION_AI_KNOWLEDGE_ERROR] No questions in response')

          await supabaseAdmin
            .from('test_paper_sections')
            .update({ status: 'ready' })
            .eq('id', sectionId)

          return NextResponse.json({
            error: 'We encountered an issue generating questions. Please try again.'
          }, { status: 500 })
        }

        // Validate questions
        const validation = validateQuestionsWithProtocol(questions, protocol)
        const allValidationWarnings: string[] = []

        if (validation.errors.length > 0) {
          console.error('[GENERATE_SECTION_AI_KNOWLEDGE_VALIDATION_ERRORS]', validation.errors)
          allValidationWarnings.push(`Section ${section.section_name}: ${validation.errors.join('; ')}`)
        }

        if (validation.warnings.length > 0) {
          console.warn('[GENERATE_SECTION_AI_KNOWLEDGE_VALIDATION_WARNINGS]', validation.warnings)
          allValidationWarnings.push(...validation.warnings)
        }

        // Store batch 1 questions in database
        const questionsToStore = questions.map((q, index) => ({
          institute_id: teacher.institute_id,
          paper_id: section.paper_id,
          section_id: sectionId,
          chapter_id: aiKnowledgeChapterId,
          question_text: q.questionText || '',
          question_data: q,
          explanation: q.explanation || null,
          marks: section.marks_per_question || 4,
          negative_marks: section.negative_marks || 0,
          question_order: index + 1,
          is_selected: false,
          generation_attempt_id: attemptId,
          batch_number: 1 // Batch 1
        }))

        const { error: insertError } = await supabaseAdmin
          .from('questions')
          .insert(questionsToStore)

        if (insertError) {
          console.error('[GENERATE_SECTION_AI_KNOWLEDGE_ERROR] Failed to store questions:', insertError)
          throw new Error(`Database error: ${insertError.message}`)
        }

        console.log(`[GENERATE_SECTION_AI_KNOWLEDGE_SUCCESS] Batch 1: Stored ${questionsToStore.length} questions`)

        // Update section state after batch 1
        const batch1Metadata = {
          total_target: totalQuestionsToGenerate, // Store capped target for consistent progress tracking
          batch_1: {
            generated_at: new Date().toISOString(),
            questions_count: questionsToStore.length,
            tokens_used: tokenUsage.totalTokens,
            cost_inr: calculateCost(tokenUsage, GEMINI_MODEL, 'standard').costInINR
          }
        }

        await supabaseAdmin
          .from('test_paper_sections')
          .update({
            batch_number: 1,
            questions_generated_so_far: questionsToStore.length,
            batch_metadata: batch1Metadata,
            last_batch_completed_at: new Date().toISOString(), // Initial heartbeat for batch 1
            updated_at: new Date().toISOString()
          })
          .eq('id', sectionId)

        // 🔥 SELF-TRIGGER: Fire async call to generate next batch if needed
        const hasMore = questionsToStore.length < totalQuestionsToGenerate

        if (hasMore) {
          const authHeader = request.headers.get('Authorization')

          // Build URL with fallback for when NEXT_PUBLIC_SITE_URL is not set
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
            `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
          const nextBatchUrl = `${siteUrl}/api/test-papers/${section.paper_id}/sections/${sectionId}/generate-next-batch`

          console.log(`[GENERATE_SECTION_AI_KNOWLEDGE] Batch 1 complete. Triggering batch 2 at: ${nextBatchUrl}`)

          // Fire and forget (don't await)
          fetch(nextBatchUrl, {
            method: 'POST',
            headers: {
              'Authorization': authHeader || '',
              'Content-Type': 'application/json'
            }
          }).catch(async (err) => {
            console.error('[GENERATE_SECTION_AI_KNOWLEDGE] Failed to trigger next batch:', err)

            // Mark section as in_review so UI isn't stuck
            await supabaseAdmin
              .from('test_paper_sections')
              .update({
                status: 'in_review',
                generation_error: `Batch 1 completed (${questionsToStore.length} questions), but batch 2 trigger failed. Regenerate to complete.`
              })
              .eq('id', sectionId)
          })
        } else {
          // All questions generated in batch 1, run proofreader before marking as in_review
          await runProofreader(sectionId, paperId, teacher.institute_id)

          // Mark as in_review
          await supabaseAdmin
            .from('test_paper_sections')
            .update({
              status: 'in_review',
              generation_completed_at: new Date().toISOString()
            })
            .eq('id', sectionId)

          console.log(`[SECTION_COMPLETE] ✅ GENERATION + PROOFREADING COMPLETE for section "${section.section_name}". Status: in_review. Total questions: ${questionsToStore.length}`)
        }

        const costs = calculateCost(tokenUsage, GEMINI_MODEL, 'standard')
        console.log(`[GENERATE_SECTION_AI_KNOWLEDGE_COST] Batch 1: ${questionsToStore.length} questions, ₹${costs.costInINR.toFixed(4)}`)

        return NextResponse.json({
          success: true,
          section_id: sectionId,
          section_name: section.section_name,
          batch_1_questions: questionsToStore.length,
          total_target: totalQuestionsToGenerate,
          batch_number: 1,
          total_batches: totalBatches,
          has_more: hasMore,
          next_batch_triggered: hasMore,
          ai_knowledge_mode: true,
          cost_estimate: {
            tokens_used: tokenUsage.totalTokens,
            cost_usd: costs.totalCost
          },
          validation_warnings: allValidationWarnings.slice(0, 10)
        })

      } catch (error: any) {
        console.error('[GENERATE_SECTION_AI_KNOWLEDGE_ERROR]', error)

        // Mark section as failed
        await supabaseAdmin
          .from('test_paper_sections')
          .update({
            status: 'failed',
            generation_error: error.message || 'Unknown error during AI Knowledge generation'
          })
          .eq('id', sectionId)

        return NextResponse.json({
          error: 'We encountered an issue generating questions. Please try again.'
        }, { status: 500 })
      }
    }

    // ========================================================================
    // MODE B/C: MATERIAL-BASED GENERATION (Specific chapters selected)
    // ========================================================================
    // Check subject type to determine approach
    const subjectData = section.subjects as any
    const isSourceOfScope = subjectData?.is_source_of_scope || false

    if (isSourceOfScope) {
      // ========================================================================
      // MODE B: SOURCE OF SCOPE (SoS) - Use chapter_knowledge
      // ========================================================================
      console.log(`[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE] Subject "${subjectName}" uses scope analysis - knowledge-based generation`)

      // UNIVERSAL KNOWLEDGE MODE: Use cached chapter_knowledge instead of uploading PDFs
      // This reduces token costs by 60-80% for subjects like Mathematics

      const sectionChapters = sectionChapterRels.map(rel => rel.chapters as any)
      console.log(`[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE] Processing ${sectionChapters.length} chapters - BATCH 1 of ${totalBatches}`)

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
      // Mode B: Use pre-calculated batch size (already accounts for 1 or 2 calls based on chapter size)
      const questionsInBatch1 = Math.min(batchSize, firstChapter.questions_target)

      console.log(`[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE] SEQUENTIAL PROCESSING - ${sectionChapters.length} chapters, ${questionsPerChapter} questions each`)
      console.log(`[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE] Batch 1: Generating ${questionsInBatch1} questions for Chapter 1: "${firstChapter.chapter_name}"`)

      let questionsGenerated = 0
      let totalTokensUsed = 0
      const allValidationWarnings: string[] = []

      // Process FIRST chapter only (sequential processing)
      const chapter = sectionChapters[0]
      const chapterId = chapter.id
      const chapterName = chapter.name

      console.log(`[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE_CHAPTER_START] chapter="${chapterName}" (1 of ${sectionChapters.length})`)

        try {
          // Fetch cached chapter_knowledge
          const chapterKnowledge = await fetchChapterKnowledge(chapterId, teacher.institute_id)

          if (!chapterKnowledge) {
            console.error(`[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE_ERROR] No chapter_knowledge found for "${chapterName}"`)
            console.error(`[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE_ERROR] This chapter needs materials to be uploaded and analyzed first`)

            // Mark section as failed with helpful error
            await supabaseAdmin
              .from('test_paper_sections')
              .update({
                status: 'failed',
                generation_error: `Chapter "${chapterName}" has no analyzed materials. Please upload and analyze materials first.`
              })
              .eq('id', sectionId)

            return NextResponse.json({
              error: `Chapter "${chapterName}" has no analyzed materials. Please upload study materials or sample papers for this chapter first.`
            }, { status: 400 })
          }

          if (chapterKnowledge.status !== 'completed') {
            console.error(`[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE_ERROR] Chapter knowledge analysis not complete for "${chapterName}"`)

            await supabaseAdmin
              .from('test_paper_sections')
              .update({
                status: 'failed',
                generation_error: `Chapter "${chapterName}" analysis is ${chapterKnowledge.status}. Please wait for analysis to complete.`
              })
              .eq('id', sectionId)

            return NextResponse.json({
              error: `Chapter "${chapterName}" is still being analyzed (status: ${chapterKnowledge.status}). Please wait a moment and try again.`
            }, { status: 400 })
          }

          console.log(`[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE] Using cached knowledge:`, {
            topics: chapterKnowledge.scope_analysis?.topics.length || 0,
            questions: chapterKnowledge.style_examples?.questions.length || 0,
            version: chapterKnowledge.version
          })

          // Warn about partial analysis
          if (!chapterKnowledge.scope_analysis || chapterKnowledge.scope_analysis.topics.length === 0) {
            console.warn(`[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE_WARNING] No scope analysis for "${chapterName}" - missing theory notes. Gemini will use broader knowledge within syllabus boundaries.`)
            allValidationWarnings.push(`Chapter ${chapterName}: No scope analysis available (missing theory notes). Questions may be less targeted to specific materials.`)
          }
          if (!chapterKnowledge.style_examples || chapterKnowledge.style_examples.questions.length === 0) {
            console.warn(`[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE_WARNING] No style examples for "${chapterName}" - missing sample papers. Difficulty calibration will use protocol defaults.`)
            allValidationWarnings.push(`Chapter ${chapterName}: No style examples available (missing sample papers). Difficulty calibration may be less precise.`)
          }

          // Map difficulty to protocol config for batch 1
          const protocolConfig = mapDifficultyToConfig(
            protocol,
            paper.difficulty_level as 'easy' | 'balanced' | 'hard',
            questionsInBatch1
          )

          // Build knowledge-based prompt (NO PDF uploads) for batch 1
          // Protocol receives chapter_knowledge and decides how to use it
          const prompt = protocol.buildPrompt(
            protocolConfig,
            chapterName,
            questionsInBatch1, // Generate questions for first chapter in batch 1
            totalQuestionsToGenerate,  // Total target for context
            section.is_bilingual || false,
            chapterKnowledge  // Pass full chapter_knowledge object to protocol
          )

          console.log(`[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE] Calling Gemini for ${questionsInBatch1} questions (text-only, no files)...`)

          // Call Gemini with retry logic (Mode B: Source of Scope)
          const result = await generateQuestionsWithRetry(
            'B',
            { prompt },
            1, // Batch 1
            sectionId
          )

          const questions = result.questions
          const tokenUsage = result.tokenUsage
          totalTokensUsed += tokenUsage.totalTokens

          console.log(`[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE] Successfully generated ${questions.length} questions with ${tokenUsage.totalTokens} tokens`)

          if (questions.length === 0) {
            console.error('[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE_ERROR] No questions in response')

            await supabaseAdmin
              .from('test_paper_sections')
              .update({ status: 'ready' })
              .eq('id', sectionId)

            return NextResponse.json({
              error: 'We encountered an issue generating questions. Please try again.'
            }, { status: 500 })
          }

          // Validate questions
          const validation = validateQuestionsWithProtocol(questions, protocol)

          if (validation.errors.length > 0) {
            console.error('[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE_VALIDATION_ERRORS]', validation.errors)
            allValidationWarnings.push(`Chapter ${chapterName}: ${validation.errors.join('; ')}`)
          }

          if (validation.warnings.length > 0) {
            console.warn('[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE_VALIDATION_WARNINGS]', validation.warnings)
            allValidationWarnings.push(...validation.warnings)
          }

          // Insert questions into database for batch 1
          const questionsToInsert = questions.map((q, index) => ({
            institute_id: teacher.institute_id,
            paper_id: paperId,
            chapter_id: chapterId,
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
              ...(q.questionText_en && { questionText_en: q.questionText_en }),
              ...(q.options_en && { options_en: q.options_en }),
              ...(q.explanation_en && { explanation_en: q.explanation_en }),
            },
            explanation: q.explanation,
            marks: section.marks_per_question || 4,
            negative_marks: section.negative_marks || 0,
            is_selected: false,
            question_order: questionsGenerated + index + 1,
            generation_attempt_id: attemptId,
            batch_number: 1 // Batch 1
          }))

          const { error: insertError } = await supabaseAdmin
            .from('questions')
            .insert(questionsToInsert)

          if (insertError) {
            console.error('[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE_ERROR] Insert failed:', insertError)
            throw new Error(`Failed to insert questions: ${insertError.message}`)
          }

          questionsGenerated += questions.length

          // Log API usage
          const costs = calculateCost(tokenUsage, GEMINI_MODEL, 'standard')
          console.log(`[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE_COST] Chapter ${chapterName}: ${questions.length} questions, ₹${costs.costInINR.toFixed(4)}`)

          try {
            logApiUsage({
              instituteId: paper.institute_id,
              instituteName: (paper.institutes as any)?.name,
              teacherId: teacher.id,
              paperId: paperId,
              paperTitle: paper.title,
              chapterId: chapterId,
              chapterName: chapterName,
              usage: tokenUsage,
              modelUsed: GEMINI_MODEL,
              operationType: 'generate',
              questionsGenerated: questions.length,
              mode: 'knowledge_based' // New mode identifier
            })
          } catch (err) {
            console.error('[TOKEN_TRACKER] Failed to log usage:', err)
          }

          console.log(`[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE_CHAPTER_SUCCESS] chapter="${chapterName}" generated=${questions.length}`)

        } catch (chapterError) {
          console.error(`[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE_CHAPTER_ERROR] chapter="${chapterName}":`, chapterError)

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
        total_target: totalQuestionsToGenerate, // Store capped target for consistent progress tracking
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
        const nextBatchUrl = `${siteUrl}/api/test-papers/${section.paper_id}/sections/${sectionId}/generate-next-batch`

        console.log(`[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE] Batch 1 complete. Triggering batch 2 at: ${nextBatchUrl}`)

        // Fire and forget (don't await)
        fetch(nextBatchUrl, {
          method: 'POST',
          headers: {
            'Authorization': authHeader || '',
            'Content-Type': 'application/json'
          }
        }).catch(async (err) => {
          console.error('[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE] Failed to trigger next batch:', err)

          // Mark section as in_review so UI isn't stuck (user can manually regenerate if needed)
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

      const costs = calculateCost({
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: totalTokensUsed
      }, GEMINI_MODEL, 'standard')

      console.log(`[GENERATE_SECTION_UNIVERSAL_KNOWLEDGE_SUCCESS] Batch 1: section="${section.section_name}" chapters=${sectionChapters.length} generated=${questionsGenerated} tokens=${totalTokensUsed} cost=₹${costs.costInINR.toFixed(4)}`)

      return NextResponse.json({
        success: true,
        section_id: sectionId,
        section_name: section.section_name,
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
        validation_warnings: allValidationWarnings.slice(0, 10),
        knowledge_based_mode: true // Flag to indicate this used cached knowledge
      })
    }

    // ========================================================================
    // MODE C: SOURCE OF TRUTH (SoT) - Upload PDFs with strict adherence
    // ========================================================================
    // Materials ARE the factual truth - upload PDFs to Gemini
    console.log(`[GENERATE_SECTION_SOT] Subject "${subjectName}" is Source of Truth - uploading materials as strict reference`)

    // Material-based generation with PDF uploads
    const sectionChapters = sectionChapterRels.map(rel => rel.chapters as any)
    console.log(`[GENERATE_SECTION_SOT] Processing ${sectionChapters.length} chapters for section ${section.section_name} - BATCH 1 of ${totalBatches}`)

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
    // Mode C: Use pre-calculated batch size (already accounts for 1 or 2 calls based on chapter size)
    const questionsInBatch1 = Math.min(batchSize, firstChapter.questions_target)

    console.log(`[GENERATE_SECTION_SOT] SEQUENTIAL PROCESSING - ${sectionChapters.length} chapters, ${questionsPerChapter} questions each`)
    console.log(`[GENERATE_SECTION_SOT] Batch 1: Generating ${questionsInBatch1} questions for Chapter 1: "${firstChapter.chapter_name}"`)

    let questionsGenerated = 0
    let totalTokensUsed = 0
    const allValidationWarnings: string[] = []

    // Process FIRST chapter only (sequential processing)
    const chapter = sectionChapters[0]
    const chapterId = chapter.id
    const chapterName = chapter.name

    console.log(`[GENERATE_SECTION_SOT_CHAPTER_START] chapter="${chapterName}" (1 of ${sectionChapters.length})`)

      try {
        // Step 1: Fetch materials for this chapter
        const materials = await fetchMaterialsForChapter(chapterId, teacher.institute_id)

        if (!materials || materials.length === 0) {
          console.error(`[GENERATE_SECTION_SOT_ERROR] No materials found for chapter ${chapterName}`)

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

        console.log(`[GENERATE_SECTION_SOT] Found ${materials.length} materials for chapter ${chapterName}`)

        // Step 2: Upload PDFs to Gemini File API
        const uploadedFiles = []
        for (const material of materials) {
          try {
            const uploadedFile = await uploadPDFToGemini(material.file_url, material.title)
            uploadedFiles.push(uploadedFile)
            console.log(`[GENERATE_SECTION] Uploaded: ${material.title}`)
          } catch (uploadError) {
            console.error(`[GENERATE_SECTION_ERROR] Failed to upload ${material.title}:`, uploadError)
            // Continue with other files
          }
        }

        if (uploadedFiles.length === 0) {
          console.error(`[GENERATE_SECTION_SOT_ERROR] No files uploaded successfully for chapter ${chapterName}`)

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

        // Step 3: Map difficulty to protocol config for batch 1
        const protocolConfig = mapDifficultyToConfig(
          protocol,
          paper.difficulty_level as 'easy' | 'balanced' | 'hard',
          questionsInBatch1
        )

        // Step 4: Build prompt using protocol for batch 1
        const prompt = buildPrompt(
          protocol,
          protocolConfig,
          chapterName,
          questionsInBatch1, // Generate questions for first chapter in batch 1
          totalQuestionsToGenerate,  // Total target for context
          section.is_bilingual || false
        )

        console.log(`[GENERATE_SECTION_SOT] Calling Gemini for ${questionsInBatch1} questions...`)

        // Step 5: Call Gemini with fileUris + prompt (with retry logic - Mode C: Source of Truth)
        const fileDataParts = uploadedFiles.map(file => ({
          fileData: {
            fileUri: file.fileUri,
            mimeType: file.mimeType
          }
        }))

        const result = await generateQuestionsWithRetry(
          'C',
          { prompt, fileDataParts },
          1, // Batch 1
          sectionId
        )

        const questions = result.questions
        const tokenUsage = result.tokenUsage
        totalTokensUsed += tokenUsage.totalTokens

        console.log(`[GENERATE_SECTION_SOT] Successfully generated ${questions.length} questions with ${tokenUsage.totalTokens} tokens`)
        console.log(`[GENERATE_SECTION_SOT] Parsed ${questions.length} questions`)

        if (questions.length === 0) {
          console.error('[GENERATE_SECTION_SOT_ERROR] No questions in response')

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

        // Step 7: Validate questions using protocol
        const validation = validateQuestionsWithProtocol(questions, protocol)

        if (validation.errors.length > 0) {
          console.error('[GENERATE_SECTION_VALIDATION_ERRORS]', validation.errors)
          allValidationWarnings.push(`Chapter ${chapterName}: ${validation.errors.join('; ')}`)
        }

        if (validation.warnings.length > 0) {
          console.warn('[GENERATE_SECTION_VALIDATION_WARNINGS]', validation.warnings)
          allValidationWarnings.push(...validation.warnings)
        }

        // Step 8A: Extract and store passages for passage-based questions
        // Group questions by passage text and insert unique passages
        const passageMap = new Map<string, string>() // passage_text -> passage_id
        const passagesToInsert: Array<{ paper_id: string; passage_text: string; passage_order: number }> = []

        // Extract unique passages
        questions.forEach((q) => {
          if (q.archetype === 'passageComprehension' && q.passage && q.passage.trim().length > 0) {
            const passageText = q.passage.trim()
            if (!passageMap.has(passageText)) {
              passageMap.set(passageText, '') // placeholder, will be filled with ID after insert
              passagesToInsert.push({
                paper_id: paperId,
                passage_text: passageText,
                passage_order: passagesToInsert.length + 1
              })
            }
          }
        })

        // Insert passages and get IDs
        if (passagesToInsert.length > 0) {
          console.log(`[GENERATE_SECTION_PASSAGES] Inserting ${passagesToInsert.length} unique passages`)

          const { data: insertedPassages, error: passageInsertError } = await supabaseAdmin
            .from('comprehension_passages')
            .insert(passagesToInsert)
            .select('id, passage_text')

          if (passageInsertError) {
            console.error('[GENERATE_SECTION_ERROR] Failed to insert passages:', passageInsertError)
            return NextResponse.json({ error: 'We encountered an issue generating questions. Please try again.' }, { status: 500 })
          }

          // Map passage text to passage ID
          insertedPassages?.forEach((passage: any) => {
            passageMap.set(passage.passage_text.trim(), passage.id)
          })

          console.log(`[GENERATE_SECTION_PASSAGES_SUCCESS] Inserted ${insertedPassages?.length} passages`)
        }

        // Step 8B: Insert questions into database for batch 1 WITH section_id AND passage_id
        const questionsToInsert = questions.map((q, index) => {
          // Find passage_id for this question if it has a passage
          let passageId: string | null = null
          if (q.archetype === 'passageComprehension' && q.passage && q.passage.trim().length > 0) {
            passageId = passageMap.get(q.passage.trim()) || null
          }

          return {
            institute_id: teacher.institute_id,
            paper_id: paperId,
            chapter_id: chapterId,
            section_id: sectionId,
            passage_id: passageId, // Link to passage
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
            question_order: questionsGenerated + index + 1,
            generation_attempt_id: attemptId,
            batch_number: 1 // Batch 1
          }
        })

        const { error: insertError } = await supabaseAdmin
          .from('questions')
          .insert(questionsToInsert)

        if (insertError) {
          console.error('[GENERATE_SECTION_ERROR] Failed to insert questions:', insertError)

          // Mark section as ready (failed generation, but chapters still assigned)
          await supabaseAdmin
            .from('test_paper_sections')
            .update({ status: 'ready' })
            .eq('id', sectionId)

          return NextResponse.json({ error: 'We encountered an issue generating questions. Please try again.' }, { status: 500 })
        }

        questionsGenerated += questions.length

        // Log API usage and costs to file
        const costs = calculateCost(tokenUsage, GEMINI_MODEL, 'standard')
        console.log(`[GENERATE_SECTION_COST] Section ${section.section_name}, Chapter ${chapterName}: ${questions.length} questions, ₹${costs.costInINR.toFixed(4)}`)

        // Log usage to file (non-blocking)
        console.log('[TOKEN_TRACKER] Attempting to log usage to file...')
        console.log('[TOKEN_TRACKER] VERCEL_ENV:', process.env.VERCEL_ENV)
        console.log('[TOKEN_TRACKER] NODE_ENV:', process.env.NODE_ENV)
        try {
          const logParams = {
            instituteId: paper.institute_id,
            instituteName: (paper.institutes as any)?.name,
            teacherId: teacher.id,
            paperId: paperId,
            paperTitle: paper.title,
            chapterId: chapter.id,
            chapterName: chapterName,
            usage: tokenUsage,
            modelUsed: GEMINI_MODEL,
            operationType: 'generate' as const,
            questionsGenerated: questions.length,
            mode: 'standard' as const
          }
          console.log('[TOKEN_TRACKER] Calling logApiUsage with params:', JSON.stringify(logParams, null, 2))
          logApiUsage(logParams)
          console.log('[TOKEN_TRACKER] logApiUsage completed successfully')
        } catch (err) {
          console.error('[TOKEN_TRACKER] Failed to log usage:', err)
          console.error('[TOKEN_TRACKER] Error stack:', (err as Error).stack)
        }

        console.log(`[GENERATE_SECTION_SOT_CHAPTER_SUCCESS] chapter="${chapterName}" generated=${questions.length}`)

      } catch (chapterError) {
        console.error(`[GENERATE_SECTION_SOT_CHAPTER_ERROR] chapter="${chapterName}":`, chapterError)

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
      total_target: totalQuestionsToGenerate, // Store capped target for consistent progress tracking
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

      console.log(`[GENERATE_SECTION_SOT] Batch 1 complete. Triggering batch 2 at: ${nextBatchUrl}`)

      // Fire and forget (don't await)
      fetch(nextBatchUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader || '',
          'Content-Type': 'application/json'
        }
      }).catch(async (err) => {
        console.error('[GENERATE_SECTION_SOT] Failed to trigger next batch:', err)

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
      await runProofreader(sectionId, paperId, paper.institute_id)

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

    console.log(`[GENERATE_SECTION_SUCCESS] Batch 1: section="${section.section_name}" generated=${questionsGenerated} tokens=${totalTokensUsed}`)

    return NextResponse.json({
      success: true,
      section_id: sectionId,
      section_name: section.section_name,
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
    console.error('[GENERATE_SECTION_EXCEPTION]', error)

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

    if (isRetryExhausted && sectionId) {
      console.log('[GENERATE_RETRY_EXHAUSTED] All retry attempts failed, attempting graceful degradation')

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
        // Count generated questions (from this attempt)
        const { count: questionsGenerated } = await supabaseAdmin
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('section_id', sectionId)
          .eq('generation_attempt_id', attemptId)

        const questionsAvailable = questionsGenerated || 0

        console.log(`[GENERATE_RETRY_EXHAUSTED] Section ${sectionId} has ${questionsAvailable} questions from partial generation`)

        // If questions were generated, preserve them
        if (questionsAvailable > 0) {
          console.log(`[GENERATE_RETRY_EXHAUSTED] Committing ${questionsAvailable} questions from partial generation`)

          // Clear generation_attempt_id to commit the questions
          await supabaseAdmin
            .from('questions')
            .update({ generation_attempt_id: null })
            .eq('section_id', sectionId)
            .eq('generation_attempt_id', attemptId)

          // Run proofreader on successfully generated questions
          console.log(`[GENERATE_RETRY_EXHAUSTED] Running proofreader on ${questionsAvailable} successfully generated questions`)
          try {
            const paper = section.test_papers as any
            await runProofreader(sectionId, section.paper_id, paper.institute_id)
            console.log('[GENERATE_RETRY_EXHAUSTED] Proofreader completed successfully')
          } catch (proofreaderError) {
            console.error('[GENERATE_RETRY_EXHAUSTED] Proofreader failed:', proofreaderError)
            // Continue even if proofreader fails - questions are still usable
          }

          // Mark section as 'in_review' to make partial results accessible
          const errorMessage = `Batch 1 failed after 3 retry attempts. ${questionsAvailable} questions are available for review. You can regenerate to try again.`

          await supabaseAdmin
            .from('test_paper_sections')
            .update({
              status: 'in_review',
              generation_error: errorMessage,
              generation_completed_at: new Date().toISOString(),
              generation_attempt_id: null
            })
            .eq('id', sectionId)

          console.log(`[GENERATE_RETRY_EXHAUSTED] Section ${sectionId} marked as 'in_review' with ${questionsAvailable} questions preserved`)

          // Return 207 Multi-Status for partial success
          return NextResponse.json(
            {
              error: `Batch 1 failed after 3 retry attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
              partial_success: true,
              questions_available: questionsAvailable,
              section_status: 'in_review',
              message: errorMessage
            },
            { status: 207 }
          )
        } else {
          // No questions generated, fall through to standard rollback
          console.log('[GENERATE_RETRY_EXHAUSTED] No questions were generated, proceeding with standard rollback')
        }
      }
    }

    // Standard rollback: Delete any questions from this attempt and reset section
    if (sectionId && attemptId) {
      try {
        console.log(`[GENERATE_SECTION_ROLLBACK] Cleaning up attempt ${attemptId}`)

        // Delete all questions from this generation attempt
        const { error: deleteError } = await supabaseAdmin
          .from('questions')
          .delete()
          .eq('generation_attempt_id', attemptId)

        if (deleteError) {
          console.error('[GENERATE_SECTION_ROLLBACK_ERROR] Failed to delete questions:', deleteError)
        } else {
          console.log('[GENERATE_SECTION_ROLLBACK] Questions deleted successfully')
        }

        // Reset section to 'ready' state
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        await supabaseAdmin
          .from('test_paper_sections')
          .update({
            status: 'ready',
            generation_attempt_id: null,
            generation_error: errorMessage,
            updated_at: new Date().toISOString()
          })
          .eq('id', sectionId)

        console.log('[GENERATE_SECTION_ROLLBACK] Section reset to ready state')
      } catch (rollbackError) {
        console.error('[GENERATE_SECTION_ROLLBACK_ERROR] Rollback failed:', rollbackError)
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'We encountered an issue generating questions. Please try again.' },
      { status: 500 }
    )
  }
}
