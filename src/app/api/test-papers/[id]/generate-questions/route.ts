import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { ai, GEMINI_MODEL, NEET_GENERATION_CONFIG } from '@/lib/ai/geminiClient'
import { fetchMaterialsForChapter } from '@/lib/ai/materialFetcher'
import { uploadPDFToGemini } from '@/lib/ai/pdfUploader'
import { mapDifficultyToProtocol } from '@/lib/ai/difficultyMapper'
import { buildNEETPrompt } from '@/lib/ai/promptBuilder'
import { validateQuestions, Question } from '@/lib/ai/questionValidator'
import { parseGeminiJSON, getDiagnosticInfo } from '@/lib/ai/jsonCleaner'

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
  try {
    const paperId = (await params).id

    console.log(`[GENERATE_QUESTIONS_START] paper_id=${paperId}`)

    // Validate auth token
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

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

    // Fetch paper details with chapters
    const { data: paper, error: paperError } = await supabaseAdmin
      .from('test_papers')
      .select(`
        id,
        title,
        question_count,
        difficulty_level,
        subject_id,
        institute_id,
        status
      `)
      .eq('id', paperId)
      .eq('institute_id', teacher.institute_id)
      .single()

    if (paperError || !paper) {
      console.error('[GENERATE_QUESTIONS_ERROR] Paper not found:', paperError)
      return NextResponse.json({ error: 'Test paper not found' }, { status: 404 })
    }

    // Fetch chapters for this paper
    const { data: paperChapters, error: chaptersError } = await supabaseAdmin
      .from('paper_chapters')
      .select(`
        chapter_id,
        chapters (id, name)
      `)
      .eq('paper_id', paperId)

    if (chaptersError || !paperChapters || paperChapters.length === 0) {
      console.error('[GENERATE_QUESTIONS_ERROR] No chapters found:', chaptersError)
      return NextResponse.json({ error: 'No chapters found for this paper' }, { status: 400 })
    }

    const chapterIds = paperChapters.map(pc => pc.chapter_id)
    console.log(`[GENERATE_QUESTIONS] Processing ${chapterIds.length} chapters for ${paper.question_count} questions`)

    // Calculate questions per chapter (generate 150% for selection)
    const totalQuestionsToGenerate = Math.ceil(paper.question_count * 1.5)
    const questionsPerChapter = Math.ceil(totalQuestionsToGenerate / chapterIds.length)

    console.log(`[GENERATE_QUESTIONS] Generating ${questionsPerChapter} questions per chapter (total: ${totalQuestionsToGenerate})`)

    let totalGenerated = 0
    let chaptersProcessed = 0
    const allValidationWarnings: string[] = []

    // Loop through each chapter (badge-by-badge)
    for (const paperChapter of paperChapters) {
      const chapterId = paperChapter.chapter_id
      const chapter = paperChapter.chapters as any
      const chapterName = chapter.name

      console.log(`[GENERATE_QUESTIONS_CHAPTER_START] chapter_id=${chapterId} name="${chapterName}"`)

      try {
        // Step 1: Fetch materials for this chapter
        const materials = await fetchMaterialsForChapter(chapterId, teacher.institute_id)

        if (!materials || materials.length === 0) {
          console.warn(`[GENERATE_QUESTIONS_WARNING] No materials found for chapter ${chapterName}, skipping`)
          continue
        }

        console.log(`[GENERATE_QUESTIONS] Found ${materials.length} materials for chapter ${chapterName}`)

        // Step 2: Upload PDFs to Gemini File API
        const uploadedFiles = []
        for (const material of materials) {
          try {
            const uploadedFile = await uploadPDFToGemini(material.file_url, material.title)
            uploadedFiles.push(uploadedFile)
            console.log(`[GENERATE_QUESTIONS] Uploaded: ${material.title}`)
          } catch (uploadError) {
            console.error(`[GENERATE_QUESTIONS_ERROR] Failed to upload ${material.title}:`, uploadError)
            // Continue with other files
          }
        }

        if (uploadedFiles.length === 0) {
          console.error(`[GENERATE_QUESTIONS_ERROR] No files uploaded successfully for chapter ${chapterName}`)
          continue
        }

        // Step 3: Map difficulty to protocol config
        const protocolConfig = mapDifficultyToProtocol(
          paper.difficulty_level as 'easy' | 'balanced' | 'hard',
          questionsPerChapter
        )

        // Step 4: Build NEET prompt
        const prompt = buildNEETPrompt(
          protocolConfig,
          chapterName,
          questionsPerChapter,
          totalQuestionsToGenerate
        )

        console.log(`[GENERATE_QUESTIONS] Calling Gemini for ${questionsPerChapter} questions...`)

        // Step 5: Call Gemini with fileUris + prompt
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
          generationConfig: NEET_GENERATION_CONFIG
        })

        const responseText = response.text
        console.log(`[GENERATE_QUESTIONS] Received response from Gemini (${responseText.length} chars)`)

        // Step 6: Parse JSON response with production-grade cleaning
        let parsedResponse: { questions: Question[] }
        try {
          parsedResponse = parseGeminiJSON<{ questions: Question[] }>(responseText)

          if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
            throw new Error('Response missing "questions" array')
          }

          if (parsedResponse.questions.length === 0) {
            throw new Error('Response has empty "questions" array')
          }

          console.log(`[GENERATE_QUESTIONS] Successfully parsed ${parsedResponse.questions.length} questions`)
        } catch (parseError) {
          const diagnostics = getDiagnosticInfo(responseText, parseError as Error)

          console.error('[GENERATE_QUESTIONS_ERROR] JSON parse failed after all cleanup attempts')
          console.error('[GENERATE_QUESTIONS_ERROR] Error:', diagnostics.errorMessage)
          console.error('[GENERATE_QUESTIONS_ERROR] Response length:', diagnostics.responseLength)
          console.error('[GENERATE_QUESTIONS_ERROR] First 1000 chars:', diagnostics.firstChars)
          console.error('[GENERATE_QUESTIONS_ERROR] Last 1000 chars:', diagnostics.lastChars)
          console.error('[GENERATE_QUESTIONS_ERROR] Cleaned preview:', diagnostics.cleanedPreview)
          if (diagnostics.errorContext) {
            console.error('[GENERATE_QUESTIONS_ERROR] Error context:', diagnostics.errorContext)
          }

          return NextResponse.json({
            error: `Failed to parse AI response: ${diagnostics.errorMessage}`,
            details: 'Check server logs for full diagnostic info'
          }, { status: 500 })
        }

        const questions = parsedResponse.questions || []
        console.log(`[GENERATE_QUESTIONS] Parsed ${questions.length} questions`)

        if (questions.length === 0) {
          console.error('[GENERATE_QUESTIONS_ERROR] No questions in response')
          continue
        }

        // Step 7: Validate questions
        const validation = validateQuestions(questions)

        if (validation.errors.length > 0) {
          console.error('[GENERATE_QUESTIONS_VALIDATION_ERRORS]', validation.errors)
          allValidationWarnings.push(`Chapter ${chapterName}: ${validation.errors.join('; ')}`)
        }

        if (validation.warnings.length > 0) {
          console.warn('[GENERATE_QUESTIONS_VALIDATION_WARNINGS]', validation.warnings)
          allValidationWarnings.push(...validation.warnings)
        }

        // Step 8: Insert questions into database
        const questionsToInsert = questions.map((q, index) => ({
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
          marks: 4,
          negative_marks: -1,
          is_selected: false,
          question_order: totalGenerated + index + 1
        }))

        const { error: insertError } = await supabaseAdmin
          .from('questions')
          .insert(questionsToInsert)

        if (insertError) {
          console.error('[GENERATE_QUESTIONS_ERROR] Failed to insert questions:', insertError)
          return NextResponse.json({ error: 'Failed to save questions to database' }, { status: 500 })
        }

        totalGenerated += questions.length
        chaptersProcessed++

        console.log(`[GENERATE_QUESTIONS_CHAPTER_SUCCESS] chapter=${chapterName} generated=${questions.length} total=${totalGenerated}`)

      } catch (chapterError) {
        console.error(`[GENERATE_QUESTIONS_CHAPTER_ERROR] chapter=${chapterName}:`, chapterError)
        // Continue with next chapter
      }
    }

    // Step 9: Update test paper status to 'review'
    const { error: updateError } = await supabaseAdmin
      .from('test_papers')
      .update({ status: 'review' })
      .eq('id', paperId)

    if (updateError) {
      console.error('[GENERATE_QUESTIONS_ERROR] Failed to update paper status:', updateError)
    }

    console.log(`[GENERATE_QUESTIONS_SUCCESS] paper_id=${paperId} total_generated=${totalGenerated} chapters=${chaptersProcessed}`)

    return NextResponse.json({
      success: true,
      paper_id: paperId,
      total_questions_generated: totalGenerated,
      chapters_processed: chaptersProcessed,
      validation_warnings: allValidationWarnings.slice(0, 10) // Limit to first 10 warnings
    }, { status: 200 })

  } catch (error) {
    console.error('[GENERATE_QUESTIONS_EXCEPTION]', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
