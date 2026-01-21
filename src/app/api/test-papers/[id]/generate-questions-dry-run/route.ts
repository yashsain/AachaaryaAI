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
import { logGeminiRequest, logGeminiResponse, logDBPreview, logGenerationSummary } from '@/lib/ai/debugLogger'
import { parseGeminiJSON, getDiagnosticInfo } from '@/lib/ai/jsonCleaner'
import { getProtocol } from '@/lib/ai/protocols'

export const maxDuration = 300 // 5 minutes timeout

interface GenerateQuestionsParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: GenerateQuestionsParams
) {
  const startTime = Date.now()
  const timing: Record<string, number> = {}

  try {
    const paperId = (await params).id

    console.log('='.repeat(80))
    console.log('[DRY_RUN] STARTING QUESTION GENERATION - DRY RUN MODE')
    console.log('[DRY_RUN] No database writes will occur')
    console.log('[DRY_RUN] All requests and responses will be logged to debug_logs/')

    // Warn about Vercel environment limitations
    if (process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview') {
      console.log('[DRY_RUN_WARNING] Running on Vercel - file logging is DISABLED')
      console.log('[DRY_RUN_WARNING] Only console output will be available')
    }

    console.log('='.repeat(80))

    const supabase = createServerClient(await cookies())
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Get teacher profile
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('id, role, institute_id')
      .eq('id', user.id)
      .is('deleted_at', null)
      .single()

    if (teacherError || !teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    console.log(`[DRY_RUN] Teacher: ${teacher.id}, Institute: ${teacher.institute_id}`)

    // Fetch paper details with stream and subject for protocol routing
    const { data: paper, error: paperError } = await supabaseAdmin
      .from('test_papers')
      .select(`
        id,
        title,
        question_count,
        difficulty_level,
        subject_id,
        institute_id,
        status,
        streams (
          name
        ),
        subjects (
          name
        )
      `)
      .eq('id', paperId)
      .eq('institute_id', teacher.institute_id)
      .single()

    if (paperError || !paper) {
      console.error('[DRY_RUN_ERROR] Paper not found:', paperError)
      return NextResponse.json({ error: 'Test paper not found' }, { status: 404 })
    }

    console.log(`[DRY_RUN] Paper: "${paper.title}", Questions: ${paper.question_count}, Difficulty: ${paper.difficulty_level}`)

    // Get protocol for this exam+subject combination
    const streamName = (paper.streams as any)?.name
    const subjectName = (paper.subjects as any)?.name

    if (!streamName || !subjectName) {
      console.error('[DRY_RUN_ERROR] Paper missing stream or subject')
      return NextResponse.json({ error: 'This paper is not ready for question generation. Please check the paper configuration.' }, { status: 400 })
    }

    let protocol
    try {
      protocol = getProtocol(streamName, subjectName)
      console.log(`[DRY_RUN] Using protocol: ${protocol.id} (${protocol.name}) for ${streamName} - ${subjectName}`)
    } catch (protocolError) {
      console.error('[DRY_RUN_ERROR] Protocol not found:', protocolError)
      return NextResponse.json({ error: 'We encountered an issue generating questions. Please try again.' }, { status: 400 })
    }

    // Fetch chapters for this paper from section_chapters
    const { data: sectionChapterRels, error: chaptersError } = await supabaseAdmin
      .from('section_chapters')
      .select(`
        chapter_id,
        section_id,
        chapters (id, name)
      `)
      .in('section_id', await supabaseAdmin
        .from('test_paper_sections')
        .select('id')
        .eq('paper_id', paperId)
        .then(res => res.data?.map((s: any) => s.id) || [])
      )

    if (chaptersError || !sectionChapterRels || sectionChapterRels.length === 0) {
      console.error('[DRY_RUN_ERROR] No chapters found:', chaptersError)
      return NextResponse.json({ error: 'This paper is not ready for question generation. Please check the paper configuration.' }, { status: 400 })
    }

    // Get unique chapters (deduplicate since sections may share chapters)
    const uniqueChapterIds = [...new Set(sectionChapterRels.map(sc => sc.chapter_id))]
    const paperChapters = uniqueChapterIds.map(chapterId => {
      return sectionChapterRels.find(sc => sc.chapter_id === chapterId)
    }).filter((pc): pc is NonNullable<typeof pc> => Boolean(pc))

    const chapterIds = paperChapters.map(pc => pc.chapter_id)
    console.log(`[DRY_RUN] Chapters: ${chapterIds.length}`)
    paperChapters.forEach((pc, i) => {
      const chapter = pc.chapters as any
      console.log(`  ${i + 1}. ${chapter.name} (${pc.chapter_id})`)
    })

    // Calculate questions per chapter
    const totalQuestionsToGenerate = Math.ceil(paper.question_count * 1.5)
    const questionsPerChapter = Math.ceil(totalQuestionsToGenerate / chapterIds.length)

    console.log(`[DRY_RUN] Will generate ${questionsPerChapter} questions per chapter (total target: ${totalQuestionsToGenerate})`)
    console.log('='.repeat(80))

    const chapterResults = []
    const allValidationErrors: string[] = []
    const allValidationWarnings: string[] = []

    // Loop through each chapter
    for (let chapterIndex = 0; chapterIndex < paperChapters.length; chapterIndex++) {
      const paperChapter = paperChapters[chapterIndex]
      const chapterId = paperChapter.chapter_id
      const chapter = paperChapter.chapters as any
      const chapterName = chapter.name

      console.log(`\n${'='.repeat(80)}`)
      console.log(`[DRY_RUN] CHAPTER ${chapterIndex + 1}/${paperChapters.length}: ${chapterName}`)
      console.log('='.repeat(80))

      const chapterStartTime = Date.now()

      try {
        // Step 1: Fetch materials
        console.log(`[DRY_RUN] Step 1: Fetching materials...`)
        const materialsStartTime = Date.now()
        const materials = await fetchMaterialsForChapter(chapterId, teacher.institute_id)
        timing[`chapter${chapterIndex + 1}_materials`] = Date.now() - materialsStartTime

        if (!materials || materials.length === 0) {
          console.warn(`[DRY_RUN_WARNING] No materials found for chapter ${chapterName}, skipping`)
          chapterResults.push({
            chapterName,
            status: 'skipped',
            reason: 'No materials found'
          })
          continue
        }

        console.log(`[DRY_RUN] Found ${materials.length} materials:`)
        materials.forEach((m, i) => {
          console.log(`  ${i + 1}. ${m.title} (${m.file_url})`)
        })

        // Step 2: Upload PDFs to Gemini
        console.log(`[DRY_RUN] Step 2: Uploading PDFs to Gemini...`)
        const uploadStartTime = Date.now()
        const uploadedFiles = []

        for (const material of materials) {
          try {
            console.log(`  Uploading: ${material.title}...`)
            const uploadedFile = await uploadPDFToGemini(material.file_url, material.title)
            uploadedFiles.push(uploadedFile)
            console.log(`  ✓ Uploaded: ${uploadedFile.fileName} -> ${uploadedFile.fileUri}`)
          } catch (uploadError) {
            console.error(`  ✗ Failed to upload ${material.title}:`, uploadError)
          }
        }

        timing[`chapter${chapterIndex + 1}_upload`] = Date.now() - uploadStartTime

        if (uploadedFiles.length === 0) {
          console.error(`[DRY_RUN_ERROR] No files uploaded successfully for chapter ${chapterName}`)
          chapterResults.push({
            chapterName,
            status: 'failed',
            reason: 'PDF upload failed'
          })
          continue
        }

        console.log(`[DRY_RUN] Successfully uploaded ${uploadedFiles.length}/${materials.length} files`)

        // Step 3: Map difficulty to protocol config
        console.log(`[DRY_RUN] Step 3: Mapping difficulty to protocol config...`)
        const protocolConfig = mapDifficultyToConfig(
          protocol,
          paper.difficulty_level as 'easy' | 'balanced' | 'hard',
          questionsPerChapter
        )

        console.log(`[DRY_RUN] Protocol config:`)
        console.log(`  Archetypes:`, protocolConfig.archetypeDistribution)
        console.log(`  Structural forms:`, protocolConfig.structuralForms)
        console.log(`  Cognitive load:`, protocolConfig.cognitiveLoad)

        // Step 4: Build prompt using protocol
        console.log(`[DRY_RUN] Step 4: Building prompt using ${protocol.name}...`)
        const prompt = buildPrompt(
          protocol,
          protocolConfig,
          chapterName,
          questionsPerChapter,
          totalQuestionsToGenerate
        )

        console.log(`[DRY_RUN] Prompt length: ${prompt.length} characters`)

        // Log request to file
        const fileUris = uploadedFiles.map(f => f.fileUri)
        logGeminiRequest(paperId, chapterName, chapterIndex + 1, {
          prompt,
          fileUris,
          questionCount: questionsPerChapter,
          difficulty: paper.difficulty_level,
          protocolConfig
        })

        // Step 5: Call Gemini
        console.log(`[DRY_RUN] Step 5: Calling Gemini API...`)
        const geminiStartTime = Date.now()

        const fileDataParts = uploadedFiles.map(file => ({
          fileData: {
            fileUri: file.fileUri,
            mimeType: file.mimeType
          }
        }))

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: [
            ...fileDataParts,
            { text: prompt }
          ],
          config: GENERATION_CONFIG
        })

        timing[`chapter${chapterIndex + 1}_gemini`] = Date.now() - geminiStartTime

        const responseText = response.text
        if (!responseText) {
          throw new Error('No response text received from Gemini')
        }
        console.log(`[DRY_RUN] ✓ Received response (${responseText.length} characters)`)

        // Step 6: Parse JSON response with production-grade cleaning
        console.log(`[DRY_RUN] Step 6: Parsing JSON response...`)
        let parsedResponse: { questions: Question[] }
        try {
          parsedResponse = parseGeminiJSON<{ questions: Question[] }>(responseText)

          if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
            throw new Error('Response missing "questions" array')
          }

          if (parsedResponse.questions.length === 0) {
            throw new Error('Response has empty "questions" array')
          }

          console.log(`[DRY_RUN] ✓ Successfully parsed ${parsedResponse.questions.length} questions`)
        } catch (parseError) {
          const diagnostics = getDiagnosticInfo(responseText, parseError as Error)

          console.error('[DRY_RUN_ERROR] JSON parse failed after all cleanup attempts')
          console.error('[DRY_RUN_ERROR] Error:', diagnostics.errorMessage)
          console.error('[DRY_RUN_ERROR] Response length:', diagnostics.responseLength)
          console.error('[DRY_RUN_ERROR] First 1000 chars:', diagnostics.firstChars)
          console.error('[DRY_RUN_ERROR] Last 1000 chars:', diagnostics.lastChars)
          console.error('[DRY_RUN_ERROR] Cleaned preview:', diagnostics.cleanedPreview)
          if (diagnostics.errorContext) {
            console.error('[DRY_RUN_ERROR] Error context:', diagnostics.errorContext)
          }

          logGeminiResponse(paperId, chapterName, chapterIndex + 1, {
            rawResponse: responseText,
            parsedQuestions: [],
            validationResult: {
              valid: false,
              errors: [`JSON parse failed: ${diagnostics.errorMessage}`],
              warnings: []
            }
          })

          chapterResults.push({
            chapterName,
            status: 'failed',
            reason: `JSON parse error: ${diagnostics.errorMessage}`,
            responsePreview: responseText.substring(0, 500)
          })
          continue
        }

        const questions = parsedResponse.questions || []
        console.log(`[DRY_RUN] ✓ Parsed ${questions.length} questions`)

        // Step 7: Validate questions using protocol
        console.log(`[DRY_RUN] Step 7: Validating questions using protocol...`)
        const validation = validateQuestionsWithProtocol(questions, protocol)

        console.log(`[DRY_RUN] Validation result:`)
        console.log(`  Valid: ${validation.valid}`)
        console.log(`  Errors: ${validation.errors.length}`)
        console.log(`  Warnings: ${validation.warnings.length}`)

        if (validation.errors.length > 0) {
          console.error(`[DRY_RUN] VALIDATION ERRORS:`)
          validation.errors.forEach(err => console.error(`    - ${err}`))
          allValidationErrors.push(...validation.errors)
        }

        if (validation.warnings.length > 0) {
          console.warn(`[DRY_RUN] VALIDATION WARNINGS:`)
          validation.warnings.forEach(warn => console.warn(`    - ${warn}`))
          allValidationWarnings.push(...validation.warnings)
        }

        // Log response to file
        logGeminiResponse(paperId, chapterName, chapterIndex + 1, {
          rawResponse: responseText,
          parsedQuestions: questions,
          validationResult: validation
        })

        // Step 8: Preview DB records (what would be inserted)
        console.log(`[DRY_RUN] Step 8: Generating DB preview...`)
        const dbRecords = questions.map((q, index) => ({
          institute_id: teacher.institute_id,
          paper_id: paperId,
          chapter_id: chapterId,
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
          marks: 4, // Dry-run uses default marks (for preview only)
          negative_marks: 0, // Dry-run uses default negative marks (for preview only)
          is_selected: false,
          question_order: index + 1
        }))

        // Log DB preview to file
        logDBPreview(paperId, chapterName, chapterIndex + 1, dbRecords)

        console.log(`[DRY_RUN] ✓ DB preview generated (${dbRecords.length} records)`)
        console.log(`[DRY_RUN] Chapter ${chapterName} completed in ${Date.now() - chapterStartTime}ms`)

        chapterResults.push({
          chapterName,
          status: 'success',
          questionsGenerated: questions.length,
          validationErrors: validation.errors.length,
          validationWarnings: validation.warnings.length,
          timing: Date.now() - chapterStartTime
        })

      } catch (chapterError) {
        console.error(`[DRY_RUN_ERROR] Chapter ${chapterName} failed:`, chapterError)
        chapterResults.push({
          chapterName,
          status: 'failed',
          reason: chapterError instanceof Error ? chapterError.message : 'Unknown error'
        })
      }
    }

    // Generate summary
    const totalTime = Date.now() - startTime
    const summary = {
      totalChapters: paperChapters.length,
      totalQuestionsGenerated: chapterResults.reduce((sum, ch) => sum + (ch.questionsGenerated || 0), 0),
      chaptersProcessed: chapterResults.filter(ch => ch.status === 'success').length,
      validationErrors: allValidationErrors,
      validationWarnings: allValidationWarnings,
      timing: {
        total: totalTime,
        ...timing
      }
    }

    logGenerationSummary(paperId, summary)

    console.log(`\n${'='.repeat(80)}`)
    console.log('[DRY_RUN] GENERATION COMPLETE')
    console.log('='.repeat(80))
    console.log(`Total time: ${totalTime}ms`)
    console.log(`Chapters processed: ${summary.chaptersProcessed}/${summary.totalChapters}`)
    console.log(`Questions generated: ${summary.totalQuestionsGenerated}`)
    console.log(`Validation errors: ${allValidationErrors.length}`)
    console.log(`Validation warnings: ${allValidationWarnings.length}`)

    // Conditional log directory message based on environment
    const isVercel = process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview'
    if (isVercel) {
      console.log(`\nFile logging disabled on Vercel - check console logs above`)
    } else {
      console.log(`\nAll logs saved to: debug_logs/`)
    }

    console.log('='.repeat(80))

    return NextResponse.json({
      success: true,
      dryRun: true,
      message: isVercel
        ? 'Dry run completed - file logging disabled on Vercel (check console logs)'
        : 'Dry run completed - no database writes occurred',
      paper_id: paperId,
      chapterResults,
      summary,
      logsDirectory: isVercel ? undefined : 'debug_logs/'
    }, { status: 200 })

  } catch (error) {
    console.error('[DRY_RUN_EXCEPTION]', error)
    return NextResponse.json({ error: 'We encountered an issue generating questions. Please try again.' }, { status: 500 })
  }
}
