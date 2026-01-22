/**
 * POST /api/questions/[id]/regenerate
 *
 * Regenerate a question using AI with teacher instructions
 * (Teacher Review Interface - Phase 5)
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ai, GEMINI_MODEL } from '@/lib/ai/geminiClient'
import { uploadPDFToGemini } from '@/lib/ai/pdfUploader'
import { parseGeminiJSON } from '@/lib/ai/jsonCleaner'
import { logApiUsage, calculateCost } from '@/lib/ai/tokenTracker'
import { getProtocol } from '@/lib/ai/protocols'
import { mapDifficultyToConfig } from '@/lib/ai/difficultyMapper'
import { deletePaperPDFs } from '@/lib/storage/pdfCleanupService'

interface RegenerateQuestionParams {
  params: Promise<{
    id: string
  }>
}

interface RegenerateQuestionBody {
  instruction: string
}

export async function POST(
  request: NextRequest,
  { params }: RegenerateQuestionParams
) {
  try {
    const questionId = (await params).id
    const body: RegenerateQuestionBody = await request.json()

    if (!body.instruction || !body.instruction.trim()) {
      return NextResponse.json({ error: 'Instruction is required' }, { status: 400 })
    }

    // Create Supabase client with SSR
    const supabase = createServerClient(await cookies())

    // Fetch teacher profile to get institute_id
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

    console.log('[REGENERATE_QUESTION] question_id:', questionId, 'teacher_id:', teacher.id, 'instruction:', body.instruction)

    // Fetch existing question with paper, stream, subject, and chapter details using admin client
    const { data: existingQuestion, error: fetchError } = await supabaseAdmin
      .from('questions')
      .select(`
        id,
        institute_id,
        paper_id,
        chapter_id,
        question_text,
        question_data,
        explanation,
        papers:paper_id (
          id,
          title,
          difficulty_level,
          status,
          pdf_url,
          answer_key_url,
          institute_id,
          streams (
            name
          ),
          subjects (
            name
          ),
          institutes (
            name
          )
        ),
        chapters:chapter_id (
          id,
          name
        )
      `)
      .eq('id', questionId)
      .single()

    if (fetchError || !existingQuestion) {
      return NextResponse.json({ error: 'Question not found or access denied' }, { status: 404 })
    }

    // Verify question belongs to teacher's institute
    if (existingQuestion.institute_id !== teacher.institute_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const paper = (existingQuestion as any).papers
    const paperId = existingQuestion.paper_id

    // If paper has PDFs, clear them (regenerating question content invalidates PDFs)
    let paperWasReopened = false
    if (paper.status === 'finalized' || paper.pdf_url || paper.answer_key_url) {
      console.log('[REGENERATE_QUESTION] Paper has PDFs (status:', paper.status, '), clearing them...')

      // Delete PDFs from storage
      const cleanupResult = await deletePaperPDFs(paper.pdf_url, paper.answer_key_url)
      if (!cleanupResult.success) {
        console.warn('[REGENERATE_QUESTION] PDF cleanup had errors:', cleanupResult.errors)
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
        console.error('[REGENERATE_QUESTION] Failed to clear PDFs:', reopenError)
        return NextResponse.json({ error: 'Failed to clear PDFs' }, { status: 500 })
      }

      paperWasReopened = true
      console.log('[REGENERATE_QUESTION] Paper reopened and PDFs cleared')
    }

    console.log('[REGENERATE_QUESTION] Found question for chapter:', (existingQuestion as any).chapters?.name)

    // Get protocol for this exam+subject combination
    const streamName = paper?.streams?.name
    const subjectName = paper?.subjects?.name

    if (!streamName || !subjectName) {
      console.error('[REGENERATE_QUESTION_ERROR] Question missing stream or subject')
      return NextResponse.json({ error: 'Question configuration incomplete' }, { status: 400 })
    }

    let protocol
    try {
      protocol = getProtocol(streamName, subjectName)
      console.log(`[REGENERATE_QUESTION] Using protocol: ${protocol.id} (${protocol.name})`)
    } catch (protocolError) {
      console.error('[REGENERATE_QUESTION_ERROR] Protocol not found:', protocolError)
      return NextResponse.json({
        error: `No question generation protocol available for ${streamName} ${subjectName}. Please contact support.`,
        details: protocolError instanceof Error ? protocolError.message : 'Unknown error'
      }, { status: 400 })
    }

    // Fetch materials for this chapter
    const { data: materialChapters, error: mcError } = await supabaseAdmin
      .from('material_chapters')
      .select(`
        material_id,
        materials (
          id,
          title,
          file_url
        )
      `)
      .eq('chapter_id', existingQuestion.chapter_id)

    if (mcError) {
      console.error('[REGENERATE_QUESTION_MATERIALS_ERROR]', mcError)
      return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 })
    }

    const materials = materialChapters?.map((mc: any) => mc.materials).filter(Boolean) || []

    if (materials.length === 0) {
      return NextResponse.json({ error: 'No materials found for this chapter' }, { status: 404 })
    }

    console.log('[REGENERATE_QUESTION] Found', materials.length, 'materials')

    // Upload PDFs to Gemini
    const uploadedFiles = []
    for (const material of materials) {
      try {
        const fileData = await uploadPDFToGemini(material.file_url, material.title)
        uploadedFiles.push(fileData)
      } catch (err) {
        console.error('[REGENERATE_QUESTION_PDF_UPLOAD_ERROR]', material.title, err)
        // Continue with other files
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json({ error: 'Failed to upload any materials to Gemini' }, { status: 500 })
    }

    console.log('[REGENERATE_QUESTION] Uploaded', uploadedFiles.length, 'files to Gemini')

    // Get difficulty config using protocol
    const difficulty = paper?.difficulty_level || 'balanced'
    const protocolConfig = mapDifficultyToConfig(protocol, difficulty, 1)

    // Build regeneration prompt
    const originalQuestionJSON = JSON.stringify({
      questionText: existingQuestion.question_text,
      options: existingQuestion.question_data.options || {},
      correctAnswer: existingQuestion.question_data.correct_answer,
      explanation: existingQuestion.explanation,
      archetype: existingQuestion.question_data.archetype,
      structuralForm: existingQuestion.question_data.structuralForm || existingQuestion.question_data.structural_form,
      difficulty: existingQuestion.question_data.difficulty,
    }, null, 2)

    const regenerationPrompt = `You are an expert ${protocol.name} question regenerator. You will be given an existing question and teacher instructions to improve it.

## ORIGINAL QUESTION:
\`\`\`json
${originalQuestionJSON}
\`\`\`

## TEACHER INSTRUCTIONS:
${body.instruction}

## TASK:
Regenerate this question following the teacher's instructions while maintaining ${protocol.name} protocol compliance.

IMPORTANT RULES:
1. Follow the teacher's instructions EXACTLY
2. Maintain the same structural form (${existingQuestion.question_data.structuralForm || existingQuestion.question_data.structural_form || 'standardMCQ'}) unless teacher requests a change
3. Use content ONLY from the provided study materials
4. Follow all ${protocol.name} protocol rules and prohibitions
5. Return ONLY valid JSON in this exact format:

\`\`\`json
{
  "questionText": "Full question text with all options",
  "archetype": "directRecall" | "directApplication" | "integrative" | "discriminator" | "exceptionOutlier",
  "structuralForm": "${existingQuestion.question_data.structuralForm || existingQuestion.question_data.structural_form || 'standardMCQ'}",
  "cognitiveLoad": "low" | "medium" | "high",
  "correctAnswer": "(1)" | "(2)" | "(3)" | "(4)",
  "options": {
    "(1)": "Option 1 text",
    "(2)": "Option 2 text",
    "(3)": "Option 3 text",
    "(4)": "Option 4 text"
  },
  "explanation": "Clear explanation of the correct answer",
  "difficulty": "easy" | "medium" | "hard"
}
\`\`\`

Generate the improved question now:`

    // Call Gemini API
    console.log('[REGENERATE_QUESTION] Calling Gemini API...')

    const fileDataArray = uploadedFiles.map(f => ({
      fileData: {
        mimeType: 'application/pdf',
        fileUri: f.fileUri,
      }
    }))

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            ...fileDataArray,
            { text: regenerationPrompt }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    })

    const responseText = result.text
    if (!responseText) {
      throw new Error('No response text received from Gemini')
    }
    console.log('[REGENERATE_QUESTION] Received response:', responseText.length, 'characters')

    // Capture token usage
    const tokenUsage = {
      promptTokens: result.usageMetadata?.promptTokenCount || 0,
      completionTokens: result.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: result.usageMetadata?.totalTokenCount || 0,
    }
    const costs = calculateCost(tokenUsage, GEMINI_MODEL, 'standard')
    console.log(`[REGENERATE_QUESTION_COST] ${tokenUsage.totalTokens} tokens, ₹${costs.costInINR.toFixed(4)}`)

    // Parse JSON
    let parsedResponse: any
    try {
      parsedResponse = parseGeminiJSON(responseText)
    } catch (parseError) {
      console.error('[REGENERATE_QUESTION_PARSE_ERROR]', parseError)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    // Update question in database
    const updatedQuestionData = {
      type: 'single_correct_mcq',
      options: parsedResponse.options,
      correct_answer: parsedResponse.correctAnswer,
      archetype: parsedResponse.archetype,
      structuralForm: parsedResponse.structuralForm,
      cognitiveLoad: parsedResponse.cognitiveLoad,
      difficulty: parsedResponse.difficulty,
    }

    // Update question using admin client
    const { data: updatedQuestion, error: updateError } = await supabaseAdmin
      .from('questions')
      .update({
        question_text: parsedResponse.questionText,
        question_data: updatedQuestionData,
        explanation: parsedResponse.explanation,
      })
      .eq('id', questionId)
      .select()
      .single()

    if (updateError) {
      console.error('[REGENERATE_QUESTION_UPDATE_ERROR]', updateError)
      return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
    }

    // Log API usage to file (non-blocking)
    try {
      const paper = (existingQuestion as any).papers
      logApiUsage({
        instituteId: paper.institute_id,
        instituteName: paper.institutes?.name,
        teacherId: teacher.id,
        paperId: existingQuestion.paper_id,
        paperTitle: paper.title,
        chapterId: existingQuestion.chapter_id,
        chapterName: (existingQuestion as any).chapters?.name,
        questionId: questionId,
        usage: tokenUsage,
        modelUsed: GEMINI_MODEL,
        operationType: 'regenerate',
        questionsGenerated: 1,
        mode: 'standard'
      })
    } catch (err) {
      console.error('[TOKEN_TRACKER] Failed to log usage:', err)
    }

    console.log('[REGENERATE_QUESTION_SUCCESS] question_id:', questionId)

    return NextResponse.json({
      success: true,
      question: updatedQuestion,
      paper_reopened: paperWasReopened,
      message: paperWasReopened
        ? 'Question regenerated. Paper reopened and PDFs cleared because content changed.'
        : 'Question regenerated successfully'
    })
  } catch (error) {
    console.error('[REGENERATE_QUESTION_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
