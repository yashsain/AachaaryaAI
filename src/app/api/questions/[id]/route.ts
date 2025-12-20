/**
 * PATCH /api/questions/[id]
 *
 * Update a question manually (Teacher Review Interface - Phase 5)
 * Allows teachers to edit question_text, options, correct_answer, explanation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface UpdateQuestionParams {
  params: Promise<{
    id: string
  }>
}

interface UpdateQuestionBody {
  question_text?: string
  options?: Record<string, string>
  correct_answer?: string
  explanation?: string
}

export async function PATCH(
  request: NextRequest,
  { params }: UpdateQuestionParams
) {
  try {
    const questionId = (await params).id
    const body: UpdateQuestionBody = await request.json()

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

    console.log('[UPDATE_QUESTION] question_id:', questionId, 'teacher_id:', teacher.id)

    // Fetch existing question to verify ownership
    const { data: existingQuestion, error: fetchError } = await supabase
      .from('questions')
      .select('id, institute_id, question_data')
      .eq('id', questionId)
      .eq('institute_id', teacher.institute_id)
      .single()

    if (fetchError || !existingQuestion) {
      return NextResponse.json({ error: 'Question not found or access denied' }, { status: 404 })
    }

    // Build updated question_data
    const currentData = existingQuestion.question_data || {}
    const updatedQuestionData = {
      ...currentData,
      ...(body.options && { options: body.options }),
      ...(body.correct_answer && { correct_answer: body.correct_answer }),
    }

    // Build update payload
    const updatePayload: any = {
      question_data: updatedQuestionData,
    }

    if (body.question_text !== undefined) {
      updatePayload.question_text = body.question_text
    }

    if (body.explanation !== undefined) {
      updatePayload.explanation = body.explanation
    }

    console.log('[UPDATE_QUESTION] Updating fields:', Object.keys(updatePayload))

    // Update question
    const { data: updatedQuestion, error: updateError } = await supabase
      .from('questions')
      .update(updatePayload)
      .eq('id', questionId)
      .select()
      .single()

    if (updateError) {
      console.error('[UPDATE_QUESTION_ERROR]', updateError)
      return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
    }

    console.log('[UPDATE_QUESTION_SUCCESS] question_id:', questionId)

    return NextResponse.json({
      success: true,
      question: updatedQuestion,
    })
  } catch (error) {
    console.error('[UPDATE_QUESTION_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
