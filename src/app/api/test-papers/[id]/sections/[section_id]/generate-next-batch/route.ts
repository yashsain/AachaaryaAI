/**
 * POST /api/test-papers/[id]/sections/[section_id]/generate-next-batch
 *
 * Self-triggering batch generation endpoint
 *
 * Part of progressive batch generation system:
 * - Called automatically after batch 1 completes
 * - Generates next batch of 30 questions with deduplication
 * - Updates section state and triggers itself for next batch
 * - Returns immediately (doesn't wait for subsequent batches)
 *
 * Handles all 3 generation modes:
 * - Mode A: AI Knowledge (protocol + syllabus only)
 * - Mode B: Source of Scope (chapter_knowledge, no PDFs)
 * - Mode C: Source of Truth (PDFs uploaded to Gemini)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ai, GEMINI_MODEL, GENERATION_CONFIG } from '@/lib/ai/geminiClient'
import { fetchMaterialsForChapter, fetchChapterKnowledge } from '@/lib/ai/materialFetcher'
import { uploadPDFToGemini } from '@/lib/ai/pdfUploader'
import { mapDifficultyToConfig } from '@/lib/ai/difficultyMapper'
import { buildPromptWithDeduplication } from '@/lib/ai/promptBuilder'
import { parseGeminiJSON, getDiagnosticInfo } from '@/lib/ai/jsonCleaner'
import { logApiUsage, calculateCost } from '@/lib/ai/tokenTracker'
import { getProtocol } from '@/lib/ai/protocols'
import { validateQuestionsWithProtocol } from '@/lib/ai/questionValidator'
import { runProofreader } from '@/lib/ai/proofreader'

export const maxDuration = 300 // 5 minutes timeout per batch

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
    console.log(`[GENERATE_BATCH_RETRY] Mode ${mode} Batch ${batchNumber}: Attempt ${attemptNumber}/3`)

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

    console.log(`[GENERATE_BATCH_RETRY] Mode ${mode} Batch ${batchNumber} Attempt ${attemptNumber}: Token usage: ${tokenUsage.totalTokens}`)

    // Parse JSON response (this is where ~7-8% of failures occur)
    const parsedResponse = parseGeminiJSON<any>(responseText)
    const rawQuestions = Array.isArray(parsedResponse) ? parsedResponse : (parsedResponse.questions || [])

    if (!rawQuestions || rawQuestions.length === 0) {
      throw new Error('No questions returned in response')
    }

    console.log(`[GENERATE_BATCH_RETRY] Mode ${mode} Batch ${batchNumber} Attempt ${attemptNumber}: Successfully parsed ${rawQuestions.length} questions`)

    return { questions: rawQuestions, tokenUsage }

  } catch (error) {
    // Determine error type for better logging
    const errorType = error instanceof SyntaxError
      ? 'JSON_PARSE_ERROR'
      : (error as Error).message?.includes('timeout') || (error as Error).message?.includes('timed out')
      ? 'TIMEOUT_ERROR'
      : 'GEMINI_API_ERROR'

    console.error(`[GENERATE_BATCH_RETRY] Mode ${mode} Batch ${batchNumber} Attempt ${attemptNumber}/3 FAILED (${errorType}):`, error)

    // Retry logic
    if (retries > 0) {
      // Calculate delay with exponential backoff: 2s, 4s
      // Use longer delay for timeout errors
      const baseDelay = 2000
      const delayMs = errorType === 'TIMEOUT_ERROR'
        ? baseDelay * 2 * (attemptNumber)
        : baseDelay * (attemptNumber)

      console.log(`[GENERATE_BATCH_RETRY] Mode ${mode} Batch ${batchNumber}: Retrying in ${delayMs}ms... (${retries} retries left)`)

      // Update heartbeat to prevent cleanup during retries
      try {
        await supabaseAdmin
          .from('test_paper_sections')
          .update({
            last_batch_completed_at: new Date().toISOString()
          })
          .eq('id', sectionId)

        console.log(`[GENERATE_BATCH_RETRY] Updated heartbeat during retry for section ${sectionId}`)
      } catch (heartbeatError) {
        console.error(`[GENERATE_BATCH_RETRY] Failed to update heartbeat:`, heartbeatError)
        // Continue with retry anyway
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delayMs))

      // Recursive retry
      return generateQuestionsWithRetry(mode, params, batchNumber, sectionId, retries - 1)
    }

    // All retries exhausted
    console.error(`[GENERATE_BATCH_RETRY] Mode ${mode} Batch ${batchNumber}: FAILED after 3 attempts`)
    throw error
  }
}

interface Question {
  questionNumber: number
  questionText: string
  questionText_en?: string
  archetype: string
  structuralForm: string
  cognitiveLoad: 'low' | 'medium' | 'high'
  correctAnswer: string
  options: Record<string, string>
  options_en?: Record<string, string>
  explanation: string
  explanation_en?: string
  difficulty?: string
  ncertFidelity?: string
  language?: string
  passage?: string
  passage_en?: string
}

interface GenerateNextBatchParams {
  params: Promise<{
    id: string
    section_id: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: GenerateNextBatchParams
) {
  try {
    const { id: paperId, section_id: sectionId } = await params

    console.log(`[GENERATE_NEXT_BATCH_START] paper_id=${paperId} section_id=${sectionId}`)

    // Validate authorization
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Create Supabase client with user token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    // Fetch teacher profile
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('id, institute_id, role')
      .eq('email', user.email)
      .single()

    if (teacherError || !teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Fetch current section state with all related data
    const { data: section, error: sectionError } = await supabaseAdmin
      .from('test_paper_sections')
      .select(`
        id,
        paper_id,
        subject_id,
        section_name,
        question_count,
        marks_per_question,
        negative_marks,
        status,
        is_bilingual,
        batch_number,
        total_batches,
        questions_generated_so_far,
        batch_size,
        batch_metadata,
        generation_attempt_id,
        test_papers!inner (
          id,
          title,
          institute_id,
          difficulty_level,
          streams!inner (
            id,
            name
          ),
          institutes (
            id,
            name
          )
        ),
        subjects!inner (
          id,
          name,
          is_source_of_scope
        )
      `)
      .eq('id', sectionId)
      .eq('paper_id', paperId)
      .single()

    if (sectionError || !section) {
      console.error('[GENERATE_NEXT_BATCH_ERROR]', sectionError)
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    // Verify access
    const paper = section.test_papers as any
    if (paper.institute_id !== teacher.institute_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if we should continue or complete
    const targetQuestions = Math.ceil(section.question_count * 1.5)

    if (section.questions_generated_so_far >= targetQuestions) {
      console.log(`[GENERATE_NEXT_BATCH_COMPLETE] section="${section.section_name}" generated=${section.questions_generated_so_far}/${targetQuestions}`)

      // Run proofreader before marking as in_review
      await runProofreader(sectionId, paperId, paper.institute_id)

      // Mark as in_review
      await supabaseAdmin
        .from('test_paper_sections')
        .update({
          status: 'in_review',
          generation_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sectionId)

      console.log(`[SECTION_COMPLETE] ✅ GENERATION + PROOFREADING COMPLETE for section "${section.section_name}". Status: in_review. Total questions: ${section.questions_generated_so_far}`)

      return NextResponse.json({
        completed: true,
        section_id: sectionId,
        total_generated: section.questions_generated_so_far
      })
    }

    // Fetch previous questions for deduplication
    // SEQUENTIAL PROCESSING: Filter by current chapter to avoid deduplication across chapters
    let previousQuestionsQuery = supabaseAdmin
      .from('questions')
      .select('question_text, question_data, chapter_id')
      .eq('section_id', sectionId)
      .eq('generation_attempt_id', section.generation_attempt_id!)
      .order('question_order', { ascending: true })

    const { data: previousQuestions } = await previousQuestionsQuery

    console.log(`[GENERATE_NEXT_BATCH] Found ${previousQuestions?.length || 0} previous questions for deduplication`)

    // Fetch assigned chapters FIRST (needed for sequential processing)
    const { data: sectionChapterRels, error: chaptersError } = await supabaseAdmin
      .from('section_chapters')
      .select(`
        chapter_id,
        chapters!inner (
          id,
          name
        )
      `)
      .eq('section_id', sectionId)

    if (chaptersError || !sectionChapterRels || sectionChapterRels.length === 0) {
      console.error('[GENERATE_NEXT_BATCH_ERROR] Failed to fetch chapters:', chaptersError)
      throw new Error('No chapters assigned to this section')
    }

    // ========================================================================
    // SEQUENTIAL CHAPTER PROCESSING
    // ========================================================================
    // Retrieve chapter schedule from batch_metadata (set by batch 1)
    const chapterSchedule = section.batch_metadata?.chapterSchedule || []
    let currentChapterIndex = section.batch_metadata?.current_chapter_index ?? 0

    // If no chapter schedule (legacy), skip sequential processing
    let currentChapter: any = null
    let currentChapterId: string | null = null

    if (chapterSchedule.length > 0) {
      currentChapter = chapterSchedule[currentChapterIndex]
      currentChapterId = currentChapter.chapter_id

      // Check if current chapter is complete
      const currentChapterGenerated = section.batch_metadata?.[`chapter_${currentChapterId}_generated`] || 0
      const currentChapterTarget = currentChapter.questions_target

      console.log(`[GENERATE_NEXT_BATCH_SEQUENTIAL] Chapter ${currentChapterIndex + 1}/${chapterSchedule.length}: "${currentChapter.chapter_name}" (${currentChapterGenerated}/${currentChapterTarget})`)

      // If current chapter is complete, move to next chapter
      if (currentChapterGenerated >= currentChapterTarget) {
        currentChapterIndex++

        console.log(`[GENERATE_NEXT_BATCH_SEQUENTIAL] Chapter ${currentChapterIndex} complete! Moving to chapter ${currentChapterIndex + 1}`)

        // Check if all chapters are complete
        if (currentChapterIndex >= chapterSchedule.length) {
          console.log(`[GENERATE_NEXT_BATCH_COMPLETE] All ${chapterSchedule.length} chapters complete!`)

          // Run proofreader before marking as in_review
          await runProofreader(sectionId, paperId, paper.institute_id)

          // Mark as in_review
          await supabaseAdmin
            .from('test_paper_sections')
            .update({
              status: 'in_review',
              generation_completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', sectionId)

          console.log(`[SECTION_COMPLETE] ✅ GENERATION + PROOFREADING COMPLETE for section "${section.section_name}". Status: in_review. Total questions: ${section.questions_generated_so_far}. Chapters completed: ${chapterSchedule.length}`)

          return NextResponse.json({
            completed: true,
            section_id: sectionId,
            total_generated: section.questions_generated_so_far,
            chapters_completed: chapterSchedule.length
          })
        }

        // Move to next chapter
        currentChapter = chapterSchedule[currentChapterIndex]
        currentChapterId = currentChapter.chapter_id
        console.log(`[GENERATE_NEXT_BATCH_SEQUENTIAL] Now processing chapter ${currentChapterIndex + 1}: "${currentChapter.chapter_name}"`)
      }
    }

    // ========================================================================
    // CALCULATE BATCH SIZE AND PROTOCOL
    // ========================================================================

    // Calculate questions to generate in this batch
    const remainingQuestions = targetQuestions - section.questions_generated_so_far
    let questionsInThisBatch = Math.min(section.batch_size, remainingQuestions)

    // SEQUENTIAL PROCESSING: For chapter-based modes, use calculated batch size
    // This handles any number of calls per chapter (1, 2, 3+) while respecting the 60-question limit
    if (currentChapter) {
      const currentChapterGenerated = section.batch_metadata?.[`chapter_${currentChapterId}_generated`] || 0
      const currentChapterRemaining = currentChapter.questions_target - currentChapterGenerated

      // Use batch size, but don't exceed remaining questions (handles last call automatically)
      questionsInThisBatch = Math.min(section.batch_size, currentChapterRemaining)

      console.log(`[GENERATE_NEXT_BATCH_SEQUENTIAL] Chapter remaining: ${currentChapterRemaining}, Batch size: ${questionsInThisBatch}`)
    }

    const nextBatchNumber = section.batch_number + 1

    console.log(`[GENERATE_NEXT_BATCH] Batch ${nextBatchNumber}/${section.total_batches}: Generating ${questionsInThisBatch} questions (${section.questions_generated_so_far}/${targetQuestions} complete)`)

    // Get protocol
    const streamName = (paper.streams as any).name
    const subjectName = (section.subjects as any).name
    const protocol = getProtocol(streamName, subjectName)

    // Map difficulty to protocol config
    const protocolConfig = mapDifficultyToConfig(
      protocol,
      paper.difficulty_level as 'easy' | 'balanced' | 'hard',
      questionsInThisBatch
    )

    // ========================================================================
    // DETERMINE GENERATION MODE
    // ========================================================================

    // Check if AI Knowledge mode
    const aiKnowledgeChapterRel = sectionChapterRels.find(sc => {
      const chapter = sc.chapters as any
      return chapter.name === '[AI Knowledge] Full Syllabus'
    })

    let questions: Question[] = []
    let tokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }

    if (aiKnowledgeChapterRel) {
      // ====================================================================
      // MODE A: AI KNOWLEDGE
      // ====================================================================

      console.log(`[GENERATE_NEXT_BATCH_MODE_A] AI Knowledge mode for batch ${nextBatchNumber}`)

      const aiKnowledgePrompt = `You are generating questions using your built-in training knowledge of the ${subjectName} subject.
Do NOT rely on any uploaded materials - use your comprehensive knowledge of the subject's syllabus, concepts, and standard question patterns.`

      const prompt = buildPromptWithDeduplication(
        protocol,
        protocolConfig,
        'Full Syllabus',
        questionsInThisBatch,
        targetQuestions,
        section.is_bilingual || false,
        previousQuestions || [],
        undefined // No chapter knowledge in AI mode
      )

      const fullPrompt = `${aiKnowledgePrompt}\n\n${prompt}`

      // Use retry wrapper for automatic retry on failures
      const result = await generateQuestionsWithRetry(
        'A',
        { prompt: fullPrompt },
        nextBatchNumber,
        sectionId
      )

      questions = result.questions
      tokenUsage = result.tokenUsage

    } else if ((section.subjects as any).is_source_of_scope) {
      // ====================================================================
      // MODE B: SOURCE OF SCOPE (Knowledge-based, no PDFs)
      // ====================================================================

      console.log(`[GENERATE_NEXT_BATCH_MODE_B] Source of Scope mode for batch ${nextBatchNumber}`)

      // SEQUENTIAL PROCESSING: Use current chapter from schedule, or fallback to first chapter (legacy)
      let chapterId: string
      let chapterName: string

      if (currentChapter) {
        chapterId = currentChapter.chapter_id
        chapterName = currentChapter.chapter_name
        console.log(`[GENERATE_NEXT_BATCH_MODE_B_SEQUENTIAL] Processing chapter ${currentChapterIndex + 1}/${chapterSchedule.length}: "${chapterName}"`)
      } else {
        // Legacy: No chapter schedule (old sections), use first chapter
        const firstChapterRel = sectionChapterRels[0]
        const chapter = firstChapterRel.chapters as any
        chapterId = firstChapterRel.chapter_id
        chapterName = chapter.name
        console.log(`[GENERATE_NEXT_BATCH_MODE_B_LEGACY] Using first chapter: "${chapterName}"`)
      }

      // Fetch chapter_knowledge
      const chapterKnowledge = await fetchChapterKnowledge(chapterId, teacher.institute_id)

      if (!chapterKnowledge || chapterKnowledge.status !== 'completed') {
        throw new Error(`Chapter knowledge not available for "${chapterName}"`)
      }

      const prompt = buildPromptWithDeduplication(
        protocol,
        protocolConfig,
        chapterName,
        questionsInThisBatch,
        targetQuestions,
        section.is_bilingual || false,
        previousQuestions || [],
        chapterKnowledge
      )

      // Use retry wrapper for automatic retry on failures
      const result = await generateQuestionsWithRetry(
        'B',
        { prompt },
        nextBatchNumber,
        sectionId
      )

      questions = result.questions
      tokenUsage = result.tokenUsage

    } else {
      // ====================================================================
      // MODE C: SOURCE OF TRUTH (PDF-based)
      // ====================================================================

      console.log(`[GENERATE_NEXT_BATCH_MODE_C] Source of Truth mode for batch ${nextBatchNumber}`)

      // SEQUENTIAL PROCESSING: Use current chapter from schedule, or fallback to first chapter (legacy)
      let chapterId: string
      let chapterName: string

      if (currentChapter) {
        chapterId = currentChapter.chapter_id
        chapterName = currentChapter.chapter_name
        console.log(`[GENERATE_NEXT_BATCH_MODE_C_SEQUENTIAL] Processing chapter ${currentChapterIndex + 1}/${chapterSchedule.length}: "${chapterName}"`)
      } else {
        // Legacy: No chapter schedule (old sections), use first chapter
        const firstChapterRel = sectionChapterRels[0]
        const chapter = firstChapterRel.chapters as any
        chapterId = firstChapterRel.chapter_id
        chapterName = chapter.name
        console.log(`[GENERATE_NEXT_BATCH_MODE_C_LEGACY] Using first chapter: "${chapterName}"`)
      }

      // Fetch materials and upload PDFs
      const materials = await fetchMaterialsForChapter(chapterId, teacher.institute_id)

      if (!materials || materials.length === 0) {
        throw new Error(`No materials found for chapter "${chapterName}"`)
      }

      // Upload PDFs to Gemini
      const uploadedFiles = await Promise.all(
        materials.map(m => uploadPDFToGemini(m.file_url, m.title))
      )
      const fileDataParts = uploadedFiles.map(f => ({ fileData: f }))

      const prompt = buildPromptWithDeduplication(
        protocol,
        protocolConfig,
        chapterName,
        questionsInThisBatch,
        targetQuestions,
        section.is_bilingual || false,
        previousQuestions || [],
        undefined // No chapter knowledge in SoT mode
      )

      // Use retry wrapper for automatic retry on failures
      const result = await generateQuestionsWithRetry(
        'C',
        { prompt, fileDataParts },
        nextBatchNumber,
        sectionId
      )

      questions = result.questions
      tokenUsage = result.tokenUsage
    }

    // Validate questions
    const validation = validateQuestionsWithProtocol(questions, protocol)
    if (validation.errors.length > 0) {
      console.error(`[GENERATE_NEXT_BATCH_VALIDATION_ERRORS] Batch ${nextBatchNumber}:`, validation.errors)
    }
    if (validation.warnings.length > 0) {
      console.warn(`[GENERATE_NEXT_BATCH_VALIDATION_WARNINGS] Batch ${nextBatchNumber}:`, validation.warnings)
    }

    // Insert questions to database
    const chapterId = aiKnowledgeChapterRel?.chapter_id || sectionChapterRels[0].chapter_id

    const questionsToInsert = questions.map((q, index) => ({
      institute_id: teacher.institute_id,
      paper_id: paperId,
      chapter_id: chapterId,
      section_id: sectionId,
      passage_id: null,
      question_text: q.questionText || '',
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
      explanation: q.explanation || null,
      marks: section.marks_per_question,
      negative_marks: section.negative_marks,
      is_selected: false,
      question_order: section.questions_generated_so_far + index + 1,
      generation_attempt_id: section.generation_attempt_id,
      batch_number: nextBatchNumber
    }))

    const { error: insertError } = await supabaseAdmin
      .from('questions')
      .insert(questionsToInsert)

    if (insertError) {
      console.error('[GENERATE_NEXT_BATCH_ERROR] Insert failed:', insertError)
      throw new Error(`Failed to insert questions: ${insertError.message}`)
    }

    console.log(`[GENERATE_NEXT_BATCH] Batch ${nextBatchNumber}: Inserted ${questions.length} questions`)

    // Update section state
    const newQuestionsGenerated = section.questions_generated_so_far + questions.length

    // SEQUENTIAL PROCESSING: Update chapter tracking in metadata
    const updatedMetadata: any = {
      ...(section.batch_metadata || {}),
      [`batch_${nextBatchNumber}`]: {
        generated_at: new Date().toISOString(),
        questions_count: questions.length,
        tokens_used: tokenUsage.totalTokens,
        cost_inr: calculateCost(tokenUsage, GEMINI_MODEL, 'standard').costInINR
      }
    }

    // Update chapter progress if using sequential processing
    if (currentChapter && chapterSchedule.length > 0) {
      const currentChapterGenerated = (section.batch_metadata?.[`chapter_${currentChapterId}_generated`] || 0) + questions.length

      // Update chapter-specific tracking
      updatedMetadata[`chapter_${currentChapterId}_generated`] = currentChapterGenerated
      updatedMetadata.current_chapter_index = currentChapterIndex

      // Update chapterSchedule array
      const updatedSchedule = [...chapterSchedule]
      updatedSchedule[currentChapterIndex].questions_generated = currentChapterGenerated
      updatedMetadata.chapterSchedule = updatedSchedule

      console.log(`[GENERATE_NEXT_BATCH_SEQUENTIAL] Chapter ${currentChapterIndex + 1} ("${currentChapter.chapter_name}"): ${currentChapterGenerated}/${currentChapter.questions_target} questions`)
    }

    await supabaseAdmin
      .from('test_paper_sections')
      .update({
        batch_number: nextBatchNumber,
        questions_generated_so_far: newQuestionsGenerated,
        batch_metadata: updatedMetadata,
        last_batch_completed_at: new Date().toISOString(), // Heartbeat to prevent cleanup during active generation
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId)

    // Log API usage
    try {
      logApiUsage({
        instituteId: paper.institute_id,
        instituteName: (paper.institutes as any)?.name || 'Unknown',
        teacherId: teacher.id,
        paperId: paperId,
        paperTitle: paper.title,
        chapterId: chapterId,
        chapterName: aiKnowledgeChapterRel ? 'AI Knowledge' : (sectionChapterRels[0].chapters as any).name,
        usage: tokenUsage,
        modelUsed: GEMINI_MODEL,
        operationType: 'generate', // Batch generation is still a generate operation
        questionsGenerated: questions.length
      })
    } catch (err) {
      console.error('[TOKEN_TRACKER] Failed to log usage:', err)
    }

    // 🔥 SELF-TRIGGER: Fire async call to generate next batch if needed
    const hasMore = newQuestionsGenerated < targetQuestions

    if (hasMore) {
      // Build URL with fallback for when NEXT_PUBLIC_SITE_URL is not set
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
        `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
      const nextBatchUrl = `${siteUrl}/api/test-papers/${paperId}/sections/${sectionId}/generate-next-batch`

      console.log(`[GENERATE_NEXT_BATCH] Triggering batch ${nextBatchNumber + 1} at: ${nextBatchUrl}`)

      // Fire and forget (don't await)
      fetch(nextBatchUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).catch(async (err) => {
        console.error('[GENERATE_NEXT_BATCH] Failed to trigger next batch:', err)

        // Log error but keep status as 'generating' - proofreading may still be running
        await supabaseAdmin
          .from('test_paper_sections')
          .update({
            generation_error: `Batch ${nextBatchNumber} completed (${newQuestionsGenerated} total questions), but batch ${nextBatchNumber + 1} trigger failed. Regenerate to complete.`
          })
          .eq('id', sectionId)
      })
    } else {
      // All batches complete, run proofreader before marking as in_review
      await runProofreader(sectionId, paperId, paper.institute_id)

      // Mark as in_review
      await supabaseAdmin
        .from('test_paper_sections')
        .update({
          status: 'in_review',
          generation_completed_at: new Date().toISOString()
        })
        .eq('id', sectionId)

      console.log(`[SECTION_COMPLETE] ✅ GENERATION + PROOFREADING COMPLETE for section "${section.section_name}". Status: in_review. Total questions: ${newQuestionsGenerated}`)
    }

    console.log(`[GENERATE_NEXT_BATCH_SUCCESS] Batch ${nextBatchNumber}/${section.total_batches}: ${questions.length} questions, ${newQuestionsGenerated}/${targetQuestions} total`)

    return NextResponse.json({
      success: true,
      batch_number: nextBatchNumber,
      total_batches: section.total_batches,
      questions_generated: questions.length,
      total_generated: newQuestionsGenerated,
      target_questions: targetQuestions,
      has_more: hasMore,
      next_batch_triggered: hasMore
    })

  } catch (error) {
    console.error('[GENERATE_NEXT_BATCH_EXCEPTION]', error)

    // Check if this is an exhausted retry error (all 3 attempts failed)
    // vs other types of errors (database, auth, etc.)
    const isRetryExhausted = error instanceof Error &&
      (error.message.includes('JSON') ||
       error.message.includes('timeout') ||
       error.message.includes('Gemini'))

    // If retries exhausted, preserve previous batches by marking section as 'in_review'
    if (isRetryExhausted) {
      try {
        const { id: paperId, section_id: sectionId } = await params

        // Fetch current section state
        const { data: section } = await supabaseAdmin
          .from('test_paper_sections')
          .select('questions_generated_so_far, batch_number, section_name, total_batches')
          .eq('id', sectionId)
          .single()

        if (section) {
          const previousBatches = section.batch_number
          const questionsAvailable = section.questions_generated_so_far

          console.log(`[GENERATE_NEXT_BATCH_GRACEFUL_FAIL] Batch ${previousBatches + 1}/${section.total_batches} failed after 3 attempts. Preserving ${questionsAvailable} questions from ${previousBatches} successful batches.`)

          // Run proofreader on successfully generated questions
          if (questionsAvailable > 0) {
            try {
              const { data: paper } = await supabaseAdmin
                .from('test_papers')
                .select('institute_id')
                .eq('id', paperId)
                .single()

              if (paper) {
                await runProofreader(sectionId, paperId, paper.institute_id)
                console.log(`[GENERATE_NEXT_BATCH_GRACEFUL_FAIL] Proofreader completed for ${questionsAvailable} questions`)
              }
            } catch (proofreadError) {
              console.error(`[GENERATE_NEXT_BATCH_GRACEFUL_FAIL] Proofreader failed:`, proofreadError)
              // Continue anyway - partial results are still valuable
            }
          }

          // Mark section as 'in_review' to make previous batches accessible
          await supabaseAdmin
            .from('test_paper_sections')
            .update({
              status: 'in_review',
              generation_error: `Batch ${previousBatches + 1}/${section.total_batches} failed after 3 retry attempts. ${questionsAvailable} questions from ${previousBatches} successful batch(es) are available for review. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              generation_completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', sectionId)

          console.log(`[GENERATE_NEXT_BATCH_GRACEFUL_FAIL] Section "${section.section_name}" marked as 'in_review' with partial results`)

          // Return 207 Multi-Status (partial success)
          return NextResponse.json(
            {
              error: `Batch ${previousBatches + 1} failed after 3 retry attempts`,
              partial_success: true,
              batches_completed: previousBatches,
              questions_available: questionsAvailable,
              message: `${questionsAvailable} questions from ${previousBatches} batch(es) are available for review. You can regenerate to complete the section.`
            },
            { status: 207 }
          )
        }
      } catch (gracefulFailError) {
        console.error('[GENERATE_NEXT_BATCH_GRACEFUL_FAIL_ERROR]', gracefulFailError)
        // Fall through to standard error response
      }
    }

    // Standard error response for non-retry errors or if graceful handling failed
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
