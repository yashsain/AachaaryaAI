/**
 * POST /api/test-papers/[id]/sections/[section_id]/generate
 *
 * Generates questions for a single section
 * - Fetches chapters assigned to this section from section_chapters table
 * - Loops through chapters, generates questions per chapter
 * - Uses exam+subject-specific protocol for question generation
 * - Updates section status: ready → generating → completed/failed
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
import { fetchMaterialsForChapter } from '@/lib/ai/materialFetcher'
import { uploadPDFToGemini } from '@/lib/ai/pdfUploader'
import { mapDifficultyToConfig } from '@/lib/ai/difficultyMapper'
import { buildPrompt } from '@/lib/ai/promptBuilder'
import { validateQuestionsWithProtocol, Question } from '@/lib/ai/questionValidator'
import { parseGeminiJSON, getDiagnosticInfo } from '@/lib/ai/jsonCleaner'
import { logApiUsage, calculateCost } from '@/lib/ai/tokenTracker'
import { getProtocol } from '@/lib/ai/protocols'

export const maxDuration = 300 // 5 minutes timeout

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
  try {
    const { id: paperId, section_id: sectionId } = await params

    console.log(`[GENERATE_SECTION_START] paper_id=${paperId} section_id=${sectionId}`)

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
          streams (
            name
          ),
          institutes (
            name
          )
        ),
        subjects (
          id,
          name
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

    // Update section status to 'generating'
    await supabaseAdmin
      .from('test_paper_sections')
      .update({ status: 'generating' })
      .eq('id', sectionId)

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
      console.error('[GENERATE_SECTION_ERROR] No chapters found:', chaptersError)

      // Mark section as failed
      await supabaseAdmin
        .from('test_paper_sections')
        .update({ status: 'failed' })
        .eq('id', sectionId)

      return NextResponse.json({ error: 'This section is not ready for question generation. Please check the section configuration.' }, { status: 400 })
    }

    // Check if AI Knowledge mode is enabled (detect by chapter name)
    const aiKnowledgeChapterRel = sectionChapterRels.find(sc => {
      const chapter = sc.chapters as any
      return chapter?.name === '[AI Knowledge] Full Syllabus'
    })

    if (aiKnowledgeChapterRel) {
      const aiKnowledgeChapterId = aiKnowledgeChapterRel.chapter_id
      console.log(`[GENERATE_SECTION_AI_KNOWLEDGE] Section "${section.section_name}" (${subjectName}) using AI Knowledge Mode (chapter_id: ${aiKnowledgeChapterId}) - generating without uploaded materials`)

      // AI KNOWLEDGE MODE: Generate questions using Gemini's training knowledge
      // No material upload required - Gemini uses its built-in knowledge

      // Calculate total questions to generate (150% for selection)
      const totalQuestionsToGenerate = Math.ceil(section.question_count * 1.5)

      try {
        // Map difficulty to protocol config
        const protocolConfig = mapDifficultyToConfig(
          protocol,
          paper.difficulty_level as 'easy' | 'balanced' | 'hard',
          totalQuestionsToGenerate
        )

        // Build AI Knowledge Mode prompt
        const aiKnowledgePrompt = buildPrompt(
          protocol,
          protocolConfig,
          `${subjectName} (Full Syllabus)`,
          totalQuestionsToGenerate,
          totalQuestionsToGenerate,
          section.is_bilingual || false
        )

        // Prepend instruction to use AI's built-in knowledge
        const finalPrompt = `IMPORTANT: You are generating questions using your built-in training knowledge about ${subjectName}. NO study materials have been provided. Use your comprehensive knowledge of this subject to generate high-quality questions following the protocol specifications.

${aiKnowledgePrompt}`

        console.log(`[GENERATE_SECTION_AI_KNOWLEDGE] Calling Gemini for ${totalQuestionsToGenerate} questions using AI knowledge...`)

        // Call Gemini WITHOUT file uploads (only text prompt)
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: [{ text: finalPrompt }],
          config: GENERATION_CONFIG
        })

        const responseText = response.text
        if (!responseText) {
          throw new Error('No response text received from Gemini')
        }
        console.log(`[GENERATE_SECTION_AI_KNOWLEDGE] Received response from Gemini (${responseText.length} chars)`)

        // Capture token usage
        const tokenUsage = {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        }
        console.log(`[GENERATE_SECTION_AI_KNOWLEDGE] Token usage: ${tokenUsage.totalTokens} total (${tokenUsage.promptTokens} input, ${tokenUsage.completionTokens} output)`)

        // Parse JSON response
        let parsedResponse: { questions: Question[] }
        try {
          const rawParsed = parseGeminiJSON<any>(responseText)

          // Handle both formats: { questions: [...] } or just [...]
          if (Array.isArray(rawParsed)) {
            // Gemini returned bare array - wrap it
            console.log(`[GENERATE_SECTION_AI_KNOWLEDGE] Gemini returned bare array, wrapping in questions object`)
            parsedResponse = { questions: rawParsed }
          } else if (rawParsed.questions && Array.isArray(rawParsed.questions)) {
            // Expected format
            parsedResponse = rawParsed
          } else {
            throw new Error('Response missing "questions" array or is not a valid array')
          }

          if (parsedResponse.questions.length === 0) {
            throw new Error('Response has empty "questions" array')
          }

          console.log(`[GENERATE_SECTION_AI_KNOWLEDGE] Successfully parsed ${parsedResponse.questions.length} questions`)
        } catch (parseError) {
          const diagnostics = getDiagnosticInfo(responseText, parseError as Error)

          console.error('[GENERATE_SECTION_AI_KNOWLEDGE_ERROR] JSON parse failed')
          console.error('[GENERATE_SECTION_AI_KNOWLEDGE_ERROR] Error:', diagnostics.errorMessage)
          console.error('[GENERATE_SECTION_AI_KNOWLEDGE_ERROR] Response length:', diagnostics.responseLength)
          console.error('[GENERATE_SECTION_AI_KNOWLEDGE_ERROR] First 1000 chars:', diagnostics.firstChars)
          console.error('[GENERATE_SECTION_AI_KNOWLEDGE_ERROR] Last 1000 chars:', diagnostics.lastChars)

          // Mark section as ready (failed)
          await supabaseAdmin
            .from('test_paper_sections')
            .update({ status: 'ready' })
            .eq('id', sectionId)

          return NextResponse.json({
            error: 'We encountered an issue generating questions. Please try again.'
          }, { status: 500 })
        }

        const questions = parsedResponse.questions || []
        console.log(`[GENERATE_SECTION_AI_KNOWLEDGE] Parsed ${questions.length} questions`)

        if (questions.length === 0) {
          console.error('[GENERATE_SECTION_AI_KNOWLEDGE_ERROR] No questions in response')

          await supabaseAdmin
            .from('test_paper_sections')
            .update({ status: 'ready' })
            .eq('id', sectionId)

          return NextResponse.json({ error: 'We encountered an issue generating questions. Please try again.' }, { status: 500 })
        }

        // Validate questions using protocol
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

        // Insert questions into database WITH section_id and AI Knowledge chapter_id
        const questionsToInsert = questions.map((q, index) => ({
          institute_id: teacher.institute_id,
          paper_id: paperId,
          chapter_id: aiKnowledgeChapterId, // AI Knowledge chapter UUID from section_chapters
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
          question_order: index + 1
        }))

        const { error: insertError } = await supabaseAdmin
          .from('questions')
          .insert(questionsToInsert)

        if (insertError) {
          console.error('[GENERATE_SECTION_AI_KNOWLEDGE_ERROR] Failed to insert questions:', insertError)

          await supabaseAdmin
            .from('test_paper_sections')
            .update({ status: 'ready' })
            .eq('id', sectionId)

          return NextResponse.json({ error: 'We encountered an issue generating questions. Please try again.' }, { status: 500 })
        }

        // Log API usage and costs
        const costs = calculateCost(tokenUsage, GEMINI_MODEL, 'standard')
        console.log(`[GENERATE_SECTION_AI_KNOWLEDGE_COST] Section ${section.section_name}: ${questions.length} questions, ₹${costs.costInINR.toFixed(4)}`)

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
            operationType: 'generate',
            questionsGenerated: questions.length,
            mode: 'standard'
          })
        } catch (err) {
          console.error('[TOKEN_TRACKER] Failed to log usage:', err)
        }

        // Mark section as in_review
        await supabaseAdmin
          .from('test_paper_sections')
          .update({
            status: 'in_review',
            updated_at: new Date().toISOString()
          })
          .eq('id', sectionId)

        console.log(`[GENERATE_SECTION_AI_KNOWLEDGE_SUCCESS] section="${section.section_name}" generated=${questions.length}`)

        return NextResponse.json({
          success: true,
          section_id: sectionId,
          section_name: section.section_name,
          questions_generated: questions.length,
          chapters_processed: 1,
          cost_estimate: {
            tokens_used: tokenUsage.totalTokens,
            cost_usd: costs.totalCost
          },
          validation_warnings: allValidationWarnings.slice(0, 10),
          ai_knowledge_mode: true
        })

      } catch (aiKnowledgeError) {
        console.error(`[GENERATE_SECTION_AI_KNOWLEDGE_ERROR] section="${section.section_name}":`, aiKnowledgeError)

        // Mark section as ready (failed)
        await supabaseAdmin
          .from('test_paper_sections')
          .update({ status: 'ready' })
          .eq('id', sectionId)

        return NextResponse.json({
          error: 'We encountered an issue generating questions. Please try again.'
        }, { status: 500 })
      }
    }

    // REGULAR MODE: Material-based generation
    const sectionChapters = sectionChapterRels.map(rel => rel.chapters as any)
    console.log(`[GENERATE_SECTION] Processing ${sectionChapters.length} chapters for section ${section.section_name}`)

    // Calculate questions per chapter (generate 150% for selection)
    const totalQuestionsToGenerate = Math.ceil(section.question_count * 1.5)
    const questionsPerChapter = Math.ceil(totalQuestionsToGenerate / sectionChapters.length)

    console.log(`[GENERATE_SECTION] Generating ${questionsPerChapter} questions per chapter (total: ${totalQuestionsToGenerate})`)

    let questionsGenerated = 0
    let totalTokensUsed = 0
    const allValidationWarnings: string[] = []

    // Loop through each chapter
    for (const chapter of sectionChapters) {
      const chapterId = chapter.id
      const chapterName = chapter.name

      console.log(`[GENERATE_SECTION_CHAPTER_START] section="${section.section_name}" chapter="${chapterName}"`)

      try {
        // Step 1: Fetch materials for this chapter
        const materials = await fetchMaterialsForChapter(chapterId, teacher.institute_id)

        if (!materials || materials.length === 0) {
          console.warn(`[GENERATE_SECTION_WARNING] No materials found for chapter ${chapterName}, skipping`)
          continue
        }

        console.log(`[GENERATE_SECTION] Found ${materials.length} materials for chapter ${chapterName}`)

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
          console.error(`[GENERATE_SECTION_ERROR] No files uploaded successfully for chapter ${chapterName}`)
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
          totalQuestionsToGenerate,
          section.is_bilingual || false
        )

        console.log(`[GENERATE_SECTION] Calling Gemini for ${questionsPerChapter} questions...`)

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
        console.log(`[GENERATE_SECTION] Received response from Gemini (${responseText.length} chars)`)

        // Capture token usage from response
        const tokenUsage = {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        }
        totalTokensUsed += tokenUsage.totalTokens
        console.log(`[GENERATE_SECTION] Token usage: ${tokenUsage.totalTokens} total (${tokenUsage.promptTokens} input, ${tokenUsage.completionTokens} output)`)

        // Step 6: Parse JSON response with production-grade cleaning
        let parsedResponse: { questions: Question[] }
        try {
          const rawParsed = parseGeminiJSON<any>(responseText)

          // Handle both formats: { questions: [...] } or just [...]
          if (Array.isArray(rawParsed)) {
            // Gemini returned bare array - wrap it
            console.log(`[GENERATE_SECTION] Gemini returned bare array, wrapping in questions object`)
            parsedResponse = { questions: rawParsed }
          } else if (rawParsed.questions && Array.isArray(rawParsed.questions)) {
            // Expected format
            parsedResponse = rawParsed
          } else {
            throw new Error('Response missing "questions" array or is not a valid array')
          }

          if (parsedResponse.questions.length === 0) {
            throw new Error('Response has empty "questions" array')
          }

          console.log(`[GENERATE_SECTION] Successfully parsed ${parsedResponse.questions.length} questions`)
        } catch (parseError) {
          const diagnostics = getDiagnosticInfo(responseText, parseError as Error)

          console.error('[GENERATE_SECTION_ERROR] JSON parse failed after all cleanup attempts')
          console.error('[GENERATE_SECTION_ERROR] Error:', diagnostics.errorMessage)
          console.error('[GENERATE_SECTION_ERROR] Response length:', diagnostics.responseLength)
          console.error('[GENERATE_SECTION_ERROR] First 1000 chars:', diagnostics.firstChars)
          console.error('[GENERATE_SECTION_ERROR] Last 1000 chars:', diagnostics.lastChars)
          console.error('[GENERATE_SECTION_ERROR] Cleaned preview:', diagnostics.cleanedPreview)

          // Mark section as ready (failed generation, but chapters still assigned)
          await supabaseAdmin
            .from('test_paper_sections')
            .update({ status: 'ready' })
            .eq('id', sectionId)

          return NextResponse.json({
            error: 'We encountered an issue generating questions. Please try again.'
          }, { status: 500 })
        }

        const questions = parsedResponse.questions || []
        console.log(`[GENERATE_SECTION] Parsed ${questions.length} questions`)

        if (questions.length === 0) {
          console.error('[GENERATE_SECTION_ERROR] No questions in response')
          continue
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

        // Step 8B: Insert questions into database WITH section_id AND passage_id
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
            question_order: questionsGenerated + index + 1
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

        console.log(`[GENERATE_SECTION_CHAPTER_SUCCESS] section="${section.section_name}" chapter=${chapterName} generated=${questions.length}`)

      } catch (chapterError) {
        console.error(`[GENERATE_SECTION_CHAPTER_ERROR] section="${section.section_name}" chapter=${chapterName}:`, chapterError)
        // Continue with next chapter
      }
    }

    // Mark section as in_review (ready for teacher to review and finalize)
    await supabaseAdmin
      .from('test_paper_sections')
      .update({
        status: 'in_review',
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId)

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

    console.log(`[GENERATE_SECTION_SUCCESS] section="${section.section_name}" generated=${questionsGenerated} tokens=${totalTokensUsed}`)

    return NextResponse.json({
      success: true,
      section_id: sectionId,
      section_name: section.section_name,
      questions_generated: questionsGenerated,
      chapters_processed: sectionChapters.length,
      cost_estimate: {
        tokens_used: totalTokensUsed,
        cost_usd: costs.totalCost
      },
      validation_warnings: allValidationWarnings.slice(0, 10)
    })

  } catch (error) {
    console.error('[GENERATE_SECTION_EXCEPTION]', error)

    // Try to mark section as failed
    try {
      const { section_id: sectionId } = await (params as any)
      await supabaseAdmin
        .from('test_paper_sections')
        .update({ status: 'failed' })
        .eq('id', sectionId)
    } catch (updateError) {
      console.error('[GENERATE_SECTION_ERROR] Failed to update section status:', updateError)
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
