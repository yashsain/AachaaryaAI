/**
 * GET /api/test-papers/[id]/questions
 *
 * Fetch all generated questions for a test paper
 * Used by Teacher Review Interface (Phase 5)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface GetQuestionsParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: GetQuestionsParams
) {
  try {
    const paperId = (await params).id

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

    console.log('[GET_QUESTIONS] paper_id:', paperId, 'teacher_id:', teacher.id, 'institute_id:', teacher.institute_id)

    // Verify paper belongs to teacher's institute
    const { data: paper, error: paperError } = await supabase
      .from('test_papers')
      .select('id, institute_id, title, question_count, difficulty_level, status, subject_id')
      .eq('id', paperId)
      .eq('institute_id', teacher.institute_id)
      .single()

    if (paperError || !paper) {
      return NextResponse.json({ error: 'Test paper not found or access denied' }, { status: 404 })
    }

    console.log('[GET_QUESTIONS] Paper found:', paper.title, 'status:', paper.status)

    // Fetch all questions for this paper with chapter details
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        question_data,
        explanation,
        marks,
        negative_marks,
        question_order,
        is_selected,
        created_at,
        chapter_id,
        chapters (
          id,
          name
        )
      `)
      .eq('paper_id', paperId)
      .order('question_order', { ascending: true })

    if (questionsError) {
      console.error('[GET_QUESTIONS_ERROR]', questionsError)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    console.log('[GET_QUESTIONS_SUCCESS] Retrieved', questions?.length || 0, 'questions')

    // Parse question_data JSONB and extract metadata
    const parsedQuestions = questions?.map((q: any) => {
      const questionData = q.question_data

      // Extract archetype, structuralForm, difficulty from question_data if available
      return {
        id: q.id,
        question_text: q.question_text,
        options: questionData.options || {},
        correct_answer: questionData.correct_answer || questionData.correctAnswer,
        explanation: q.explanation,
        marks: q.marks,
        negative_marks: q.negative_marks,
        question_order: q.question_order,
        is_selected: q.is_selected,
        created_at: q.created_at,
        chapter_id: q.chapter_id,
        chapter_name: q.chapters?.name || 'Unknown Chapter',
        // Metadata from question_data
        archetype: questionData.archetype || 'unknown',
        structural_form: questionData.structuralForm || questionData.structural_form || 'unknown',
        cognitive_load: questionData.cognitiveLoad || questionData.cognitive_load || 'medium',
        difficulty: questionData.difficulty || 'medium',
        ncert_fidelity: questionData.ncertFidelity || questionData.ncert_fidelity || 'moderate',
      }
    }) || []

    // Calculate selection statistics
    const selectedCount = parsedQuestions.filter(q => q.is_selected).length
    const totalGenerated = parsedQuestions.length
    const targetCount = paper.question_count || 30

    return NextResponse.json({
      success: true,
      paper: {
        id: paper.id,
        title: paper.title,
        question_count: paper.question_count,
        difficulty_level: paper.difficulty_level,
        status: paper.status,
        subject_id: paper.subject_id,
      },
      questions: parsedQuestions,
      statistics: {
        total_generated: totalGenerated,
        selected_count: selectedCount,
        target_count: targetCount,
        remaining: Math.max(0, targetCount - selectedCount),
      },
    })
  } catch (error) {
    console.error('[GET_QUESTIONS_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
