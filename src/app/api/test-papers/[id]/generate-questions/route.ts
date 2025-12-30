import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { ai, GEMINI_MODEL, GENERATION_CONFIG } from '@/lib/ai/geminiClient'
import { fetchMaterialsForChapter } from '@/lib/ai/materialFetcher'
import { uploadPDFToGemini } from '@/lib/ai/pdfUploader'
import { mapDifficultyToConfig } from '@/lib/ai/difficultyMapper'
import { buildPrompt } from '@/lib/ai/promptBuilder'
import { validateQuestionsWithProtocol, Question } from '@/lib/ai/questionValidator'
import { parseGeminiJSON, getDiagnosticInfo } from '@/lib/ai/jsonCleaner'
import { logApiUsage, calculateCost } from '@/lib/ai/tokenTracker'
import { getProtocol } from '@/lib/ai/protocols'

export const maxDuration = 300 // 5 minutes timeout

interface GenerateQuestionsParams {
  params: Promise<{
    id: string
  }>
}

/**
 * Generate questions for multi-section papers (REET, etc.)
 * Loops through sections, generates questions for each section separately
 */
async function generateQuestionsForSections(
  paperId: string,
  paper: any,
  teacher: any
) {
  try {
    const streamName = (paper.streams as any)?.name

    if (!streamName) {
      console.error('[GENERATE_QUESTIONS_ERROR] Paper missing stream')
      return NextResponse.json({ error: 'Paper configuration incomplete' }, { status: 400 })
    }

    // Fetch all sections for this paper
    const { data: sections, error: sectionsError } = await supabaseAdmin
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
        subjects (
          id,
          name
        )
      `)
      .eq('paper_id', paperId)
      .order('section_order', { ascending: true })

    if (sectionsError || !sections || sections.length === 0) {
      console.error('[GENERATE_QUESTIONS_ERROR] No sections found:', sectionsError)
      return NextResponse.json({ error: 'No sections found for this paper' }, { status: 400 })
    }

    console.log(`[GENERATE_QUESTIONS] Processing ${sections.length} sections`)

    let totalGenerated = 0
    let sectionsProcessed = 0
    const allValidationWarnings: string[] = []

    // Loop through each section
    for (const section of sections) {
      const sectionSubjectName = (section.subjects as any)?.name

      if (!sectionSubjectName) {
        console.error(`[GENERATE_QUESTIONS_ERROR] Section ${section.section_name} missing subject`)
        continue
      }

      console.log(`[GENERATE_QUESTIONS_SECTION_START] section="${section.section_name}" subject="${sectionSubjectName}" questions=${section.question_count}`)

      // Update section status to 'generating'
      await supabaseAdmin
        .from('test_paper_sections')
        .update({ status: 'generating' })
        .eq('id', section.id)

      try {
        // Get protocol for this section's subject
        let protocol
        try {
          protocol = getProtocol(streamName, sectionSubjectName)
          console.log(`[GENERATE_QUESTIONS] Using protocol: ${protocol.id} (${protocol.name})`)
        } catch (protocolError) {
          console.error('[GENERATE_QUESTIONS_ERROR] Protocol not found:', protocolError)

          // Mark section as failed
          await supabaseAdmin
            .from('test_paper_sections')
            .update({ status: 'failed' })
            .eq('id', section.id)

          continue
        }

        // Fetch chapters for this specific section
        const { data: sectionChapterRels, error: chaptersError } = await supabaseAdmin
          .from('section_chapters')
          .select(`
            chapter_id,
            chapters (id, name, subject_id)
          `)
          .eq('section_id', section.id)

        if (chaptersError || !sectionChapterRels || sectionChapterRels.length === 0) {
          console.warn(`[GENERATE_QUESTIONS_WARNING] No chapters found for section ${section.section_name}, skipping section`)

          // Mark section as failed
          await supabaseAdmin
            .from('test_paper_sections')
            .update({ status: 'failed' })
            .eq('id', section.id)

          continue
        }

        console.log(`[GENERATE_QUESTIONS] Processing ${sectionChapterRels.length} chapters for section ${section.section_name}`)

        // Use sectionChapterRels instead of sectionChapters for the rest of the logic
        const sectionChapters = sectionChapterRels

        // Calculate questions per chapter for this section (generate 150% for selection)
        const totalQuestionsToGenerate = Math.ceil(section.question_count * 1.5)
        const questionsPerChapter = Math.ceil(totalQuestionsToGenerate / sectionChapters.length)

        console.log(`[GENERATE_QUESTIONS] Generating ${questionsPerChapter} questions per chapter (total: ${totalQuestionsToGenerate})`)

        let sectionQuestionsGenerated = 0

        // Loop through chapters for this section
        for (const paperChapter of sectionChapters) {
          const chapterId = paperChapter.chapter_id
          const chapter = paperChapter.chapters as any
          const chapterName = chapter.name

          console.log(`[GENERATE_QUESTIONS_CHAPTER_START] section="${section.section_name}" chapter="${chapterName}"`)

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
            const protocolConfig = mapDifficultyToConfig(
              protocol,
              paper.difficulty_level as 'easy' | 'balanced' | 'hard',
              questionsPerChapter
            )

            // Step 4: Build prompt using protocol
            const prompt = buildPrompt(
              protocol,
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
              config: GENERATION_CONFIG
            })

            const responseText = response.text
            if (!responseText) {
              throw new Error('No response text received from Gemini')
            }
            console.log(`[GENERATE_QUESTIONS] Received response from Gemini (${responseText.length} chars)`)

            // Capture token usage from response
            const tokenUsage = {
              promptTokens: response.usageMetadata?.promptTokenCount || 0,
              completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
              totalTokens: response.usageMetadata?.totalTokenCount || 0,
            }
            console.log(`[GENERATE_QUESTIONS] Token usage: ${tokenUsage.totalTokens} total (${tokenUsage.promptTokens} input, ${tokenUsage.completionTokens} output)`)

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

              // Mark section as failed and return error
              await supabaseAdmin
                .from('test_paper_sections')
                .update({ status: 'failed' })
                .eq('id', section.id)

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

            // Step 7: Validate questions using protocol
            const validation = validateQuestionsWithProtocol(questions, protocol)

            if (validation.errors.length > 0) {
              console.error('[GENERATE_QUESTIONS_VALIDATION_ERRORS]', validation.errors)
              allValidationWarnings.push(`Section ${section.section_name}, Chapter ${chapterName}: ${validation.errors.join('; ')}`)
            }

            if (validation.warnings.length > 0) {
              console.warn('[GENERATE_QUESTIONS_VALIDATION_WARNINGS]', validation.warnings)
              allValidationWarnings.push(...validation.warnings)
            }

            // Step 8: Insert questions into database WITH section_id
            const questionsToInsert = questions.map((q, index) => ({
              institute_id: teacher.institute_id,
              paper_id: paperId,
              chapter_id: chapterId,
              section_id: section.id, // NEW: Tag with section ID
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
              question_order: totalGenerated + index + 1
            }))

            const { error: insertError } = await supabaseAdmin
              .from('questions')
              .insert(questionsToInsert)

            if (insertError) {
              console.error('[GENERATE_QUESTIONS_ERROR] Failed to insert questions:', insertError)

              // Mark section as failed
              await supabaseAdmin
                .from('test_paper_sections')
                .update({ status: 'failed' })
                .eq('id', section.id)

              return NextResponse.json({ error: 'Failed to save questions to database' }, { status: 500 })
            }

            sectionQuestionsGenerated += questions.length
            totalGenerated += questions.length

            // Log API usage and costs to file
            const costs = calculateCost(tokenUsage, GEMINI_MODEL, 'standard')
            console.log(`[GENERATE_QUESTIONS_COST] Section ${section.section_name}, Chapter ${chapterName}: ${questions.length} questions, ₹${costs.costInINR.toFixed(4)}`)

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
                operationType: 'generate',
                questionsGenerated: questions.length,
                mode: 'standard'
              })
            } catch (err) {
              console.error('[TOKEN_TRACKER] Failed to log usage:', err)
            }

            console.log(`[GENERATE_QUESTIONS_CHAPTER_SUCCESS] section="${section.section_name}" chapter=${chapterName} generated=${questions.length}`)

          } catch (chapterError) {
            console.error(`[GENERATE_QUESTIONS_CHAPTER_ERROR] section="${section.section_name}" chapter=${chapterName}:`, chapterError)
            // Continue with next chapter
          }
        }

        // Mark section as completed
        await supabaseAdmin
          .from('test_paper_sections')
          .update({ status: 'completed' })
          .eq('id', section.id)

        sectionsProcessed++
        console.log(`[GENERATE_QUESTIONS_SECTION_SUCCESS] section="${section.section_name}" generated=${sectionQuestionsGenerated}`)

      } catch (sectionError) {
        console.error(`[GENERATE_QUESTIONS_SECTION_ERROR] section="${section.section_name}":`, sectionError)

        // Mark section as failed
        await supabaseAdmin
          .from('test_paper_sections')
          .update({ status: 'failed' })
          .eq('id', section.id)

        // Continue with next section
      }
    }

    // Update test paper status to 'review'
    const { error: updateError } = await supabaseAdmin
      .from('test_papers')
      .update({ status: 'review' })
      .eq('id', paperId)

    if (updateError) {
      console.error('[GENERATE_QUESTIONS_ERROR] Failed to update paper status:', updateError)
    }

    console.log(`[GENERATE_QUESTIONS_SUCCESS] paper_id=${paperId} total_generated=${totalGenerated} sections=${sectionsProcessed}`)

    return NextResponse.json({
      success: true,
      paper_id: paperId,
      total_questions_generated: totalGenerated,
      sections_processed: sectionsProcessed,
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

    // Fetch paper details with stream, subject, and template info
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
        paper_template_id,
        streams (
          name
        ),
        subjects (
          name
        ),
        institutes (
          name
        )
      `)
      .eq('id', paperId)
      .eq('institute_id', teacher.institute_id)
      .single()

    if (paperError || !paper) {
      console.error('[GENERATE_QUESTIONS_ERROR] Paper not found:', paperError)
      return NextResponse.json({ error: 'Test paper not found' }, { status: 404 })
    }

    // Check if this is a multi-section paper (has template)
    const isMultiSectionPaper = !!paper.paper_template_id

    if (isMultiSectionPaper) {
      console.log('[GENERATE_QUESTIONS] Multi-section paper detected, using section-based generation')
      return await generateQuestionsForSections(paperId, paper, teacher)
    }

    // Otherwise, use legacy chapter-based generation
    console.log('[GENERATE_QUESTIONS] Legacy paper detected, using chapter-based generation')

    // Get protocol for this exam+subject combination
    const streamName = (paper.streams as any)?.name
    const subjectName = (paper.subjects as any)?.name

    if (!streamName || !subjectName) {
      console.error('[GENERATE_QUESTIONS_ERROR] Paper missing stream or subject')
      return NextResponse.json({ error: 'Paper configuration incomplete' }, { status: 400 })
    }

    let protocol
    try {
      protocol = getProtocol(streamName, subjectName)
      console.log(`[GENERATE_QUESTIONS] Using protocol: ${protocol.id} (${protocol.name})`)
    } catch (protocolError) {
      console.error('[GENERATE_QUESTIONS_ERROR] Protocol not found:', protocolError)
      return NextResponse.json({
        error: `No question generation protocol available for ${streamName} ${subjectName}. Please contact support.`,
        details: protocolError instanceof Error ? protocolError.message : 'Unknown error'
      }, { status: 400 })
    }

    // Fetch chapters for this paper from section_chapters
    // For legacy single-subject papers, all sections share the same chapters
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
      console.error('[GENERATE_QUESTIONS_ERROR] No chapters found:', chaptersError)
      return NextResponse.json({ error: 'No chapters found for this paper' }, { status: 400 })
    }

    // Get unique chapters (deduplicate since all sections have same chapters for NEET-style)
    const uniqueChapterIds = [...new Set(sectionChapterRels.map(sc => sc.chapter_id))]
    const paperChapters = uniqueChapterIds.map(chapterId => {
      return sectionChapterRels.find(sc => sc.chapter_id === chapterId)
    }).filter((pc): pc is NonNullable<typeof pc> => Boolean(pc))

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
        const protocolConfig = mapDifficultyToConfig(
          protocol,
          paper.difficulty_level as 'easy' | 'balanced' | 'hard',
          questionsPerChapter
        )

        // Step 4: Build prompt using protocol
        const prompt = buildPrompt(
          protocol,
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
          config: GENERATION_CONFIG
        })

        const responseText = response.text
        if (!responseText) {
          throw new Error('No response text received from Gemini')
        }
        console.log(`[GENERATE_QUESTIONS] Received response from Gemini (${responseText.length} chars)`)

        // Capture token usage from response
        const tokenUsage = {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        }
        console.log(`[GENERATE_QUESTIONS] Token usage: ${tokenUsage.totalTokens} total (${tokenUsage.promptTokens} input, ${tokenUsage.completionTokens} output)`)

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

        // Step 7: Validate questions using protocol
        const validation = validateQuestionsWithProtocol(questions, protocol)

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
          marks: 4, // Legacy papers use default marks (no section-level config)
          negative_marks: 0, // Legacy papers use default negative marks
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

        // Log API usage and costs to file
        const costs = calculateCost(tokenUsage, GEMINI_MODEL, 'standard')
        console.log(`[GENERATE_QUESTIONS_COST] Chapter ${chapterName}: ${questions.length} questions, ₹${costs.costInINR.toFixed(4)}`)

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
            operationType: 'generate',
            questionsGenerated: questions.length,
            mode: 'standard'
          })
        } catch (err) {
          console.error('[TOKEN_TRACKER] Failed to log usage:', err)
        }

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
