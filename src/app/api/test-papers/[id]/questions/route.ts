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

    // Extract section_id from query parameters (for section-isolated review)
    const url = new URL(request.url)
    const sectionId = url.searchParams.get('section_id')

    console.log('[GET_QUESTIONS] Request params:', { paperId, sectionId })

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

    // Verify paper belongs to teacher's institute and check if it has sections
    const { data: paper, error: paperError } = await supabase
      .from('test_papers')
      .select('id, institute_id, title, question_count, difficulty_level, status, subject_id, paper_template_id')
      .eq('id', paperId)
      .eq('institute_id', teacher.institute_id)
      .single()

    if (paperError || !paper) {
      return NextResponse.json({ error: 'Test paper not found or access denied' }, { status: 404 })
    }

    const hasSections = !!paper.paper_template_id
    console.log('[GET_QUESTIONS] Paper found:', paper.title, 'status:', paper.status, 'has_sections:', hasSections)

    // Fetch all questions for this paper with chapter and section details
    let questionsQuery = supabase
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
        section_id,
        passage_id,
        chapters (
          id,
          name
        ),
        test_paper_sections (
          id,
          section_name,
          section_order
        ),
        comprehension_passages (
          id,
          passage_text,
          passage_order
        )
      `)
      .eq('paper_id', paperId)

    // Filter by section_id if provided (section-isolated review)
    if (sectionId) {
      questionsQuery = questionsQuery.eq('section_id', sectionId)
      console.log('[GET_QUESTIONS] Filtering questions by section_id:', sectionId)
    }

    const { data: questions, error: questionsError } = await questionsQuery
      .order('question_order', { ascending: true })

    if (questionsError) {
      console.error('[GET_QUESTIONS_ERROR]', questionsError)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    console.log('[GET_QUESTIONS_SUCCESS] Retrieved', questions?.length || 0, 'questions')

    // Parse question_data JSONB and extract metadata
    const parsedQuestions = questions?.map((q: any) => {
      const questionData = q.question_data
      const sectionData = q.test_paper_sections // From the JOIN
      const passageData = q.comprehension_passages // From the JOIN

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
        // Section information (null for legacy papers)
        section_id: q.section_id,
        section_name: sectionData?.section_name || null,
        section_order: sectionData?.section_order || null,
        // Passage information (for comprehension questions)
        passage_id: q.passage_id || null,
        passage_text: passageData?.passage_text || null,
        passage_order: passageData?.passage_order || null,
        // Metadata from question_data
        archetype: questionData.archetype || 'unknown',
        structural_form: questionData.structuralForm || questionData.structural_form || 'unknown',
        cognitive_load: questionData.cognitiveLoad || questionData.cognitive_load || 'medium',
        difficulty: questionData.difficulty || 'medium',
        ncert_fidelity: questionData.ncertFidelity || questionData.ncert_fidelity || 'moderate',
        // Language metadata
        language: questionData.language || 'hindi',
        // Bilingual fields (optional - only present if question is bilingual)
        question_text_en: questionData.questionText_en || null,
        options_en: questionData.options_en || null,
        explanation_en: questionData.explanation_en || null,
        passage_en: questionData.passage_en || null,
      }
    }) || []

    // Fetch section data for multi-section papers (needed for validation and statistics)
    let sectionsData = null
    let currentSection = null
    if (hasSections) {
      const { data: sections, error: sectionsError } = await supabase
        .from('test_paper_sections')
        .select('id, section_name, section_order, status, question_count, marks_per_question')
        .eq('paper_id', paperId)
        .order('section_order', { ascending: true })

      if (!sectionsError && sections) {
        sectionsData = sections

        // If section_id provided, validate and get current section
        if (sectionId) {
          currentSection = sections.find(s => s.id === sectionId)
          if (!currentSection) {
            return NextResponse.json(
              { error: 'Section not found or does not belong to this paper' },
              { status: 404 }
            )
          }
          console.log('[GET_QUESTIONS] Current section:', currentSection.section_name)
        }
      }
    }

    // Calculate selection statistics
    const selectedCount = parsedQuestions.filter(q => q.is_selected).length
    const totalGenerated = parsedQuestions.length

    // Calculate target count based on paper type and scope
    let targetCount = paper.question_count || 30

    // For section-specific view, use that section's target count
    if (sectionId && currentSection) {
      targetCount = currentSection.question_count
      console.log('[GET_QUESTIONS] Section-specific target count:', targetCount)
    }
    // For multi-section papers (all sections view), sum up all section targets
    else if (hasSections && sectionsData) {
      targetCount = sectionsData.reduce((total, section) => {
        return total + section.question_count
      }, 0)
      console.log('[GET_QUESTIONS] Template-based paper: calculated target from sections:', targetCount)
    }

    return NextResponse.json({
      success: true,
      paper: {
        id: paper.id,
        title: paper.title,
        question_count: paper.question_count,
        difficulty_level: paper.difficulty_level,
        status: paper.status,
        subject_id: paper.subject_id,
        paper_template_id: paper.paper_template_id,
        has_sections: hasSections,
      },
      questions: parsedQuestions,
      sections: sectionsData, // Section data with statuses
      current_section: currentSection, // Current section being viewed (if section_id provided)
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
