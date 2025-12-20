/**
 * POST /api/questions/[id]/regenerate
 *
 * Regenerate a question using AI with teacher instructions
 * (Teacher Review Interface - Phase 5)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase'
import { ai } from '@/lib/ai/geminiClient'
import { uploadPDFToGemini } from '@/lib/ai/pdfUploader'
import { buildNEETPrompt } from '@/lib/ai/promptBuilder'
import { mapDifficultyToProtocol } from '@/lib/ai/difficultyMapper'
import { parseGeminiJSON } from '@/lib/ai/jsonCleaner'

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

    // Validate authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
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

    // Fetch existing question with paper and chapter details
    const { data: existingQuestion, error: fetchError } = await supabase
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
          difficulty_level
        ),
        chapters:chapter_id (
          id,
          name
        )
      `)
      .eq('id', questionId)
      .eq('institute_id', teacher.institute_id)
      .single()

    if (fetchError || !existingQuestion) {
      return NextResponse.json({ error: 'Question not found or access denied' }, { status: 404 })
    }

    console.log('[REGENERATE_QUESTION] Found question for chapter:', (existingQuestion as any).chapters?.name)

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

    // Get difficulty config
    const difficulty = (existingQuestion as any).papers?.difficulty_level || 'balanced'
    const protocolConfig = mapDifficultyToProtocol(difficulty, 1)

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

    const regenerationPrompt = `You are an expert NEET Biology question regenerator. You will be given an existing question and teacher instructions to improve it.

## ORIGINAL QUESTION:
\`\`\`json
${originalQuestionJSON}
\`\`\`

## TEACHER INSTRUCTIONS:
${body.instruction}

## TASK:
Regenerate this question following the teacher's instructions while maintaining NEET protocol compliance.

IMPORTANT RULES:
1. Follow the teacher's instructions EXACTLY
2. Maintain the same structural form (${existingQuestion.question_data.structuralForm || existingQuestion.question_data.structural_form || 'standardMCQ'}) unless teacher requests a change
3. Use content ONLY from the provided study materials
4. Follow all NEET protocol rules (no "Always/Never", no "None/All of the above", no meta-references)
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
        fileUri: f.uri,
      }
    }))

    const model = ai.models.get({ model: 'gemini-2.0-flash-exp' })
    const result = await model.generateContent({
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
    console.log('[REGENERATE_QUESTION] Received response:', responseText.length, 'characters')

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

    const { data: updatedQuestion, error: updateError } = await supabase
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

    console.log('[REGENERATE_QUESTION_SUCCESS] question_id:', questionId)

    return NextResponse.json({
      success: true,
      question: updatedQuestion,
    })
  } catch (error) {
    console.error('[REGENERATE_QUESTION_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
