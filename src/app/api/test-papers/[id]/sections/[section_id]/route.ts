/**
 * GET /api/test-papers/[id]/sections/[section_id]
 *
 * Get details for a specific section including:
 * - Section metadata (name, status, question count, etc.)
 * - Available chapters (filtered by section's subject_id)
 * - Currently assigned chapters
 *
 * Used by Section Chapter Selection page
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface GetSectionParams {
  params: Promise<{
    id: string
    section_id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: GetSectionParams
) {
  try {
    const { id: paperId, section_id: sectionId } = await params

    // Validate authorization header
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

    console.log(`[GET_SECTION_DETAIL] paper_id=${paperId} section_id=${sectionId} teacher_id=${teacher.id}`)

    // Fetch section with paper and subject details
    const { data: section, error: sectionError } = await supabase
      .from('test_paper_sections')
      .select(`
        id,
        paper_id,
        subject_id,
        section_type,
        section_name,
        section_order,
        question_count,
        status,
        chapters_assigned_at,
        created_at,
        updated_at,
        test_papers!inner (
          id,
          title,
          institute_id,
          difficulty_level,
          stream_id
        ),
        subjects (
          id,
          name,
          stream_id
        )
      `)
      .eq('id', sectionId)
      .eq('paper_id', paperId)
      .single()

    if (sectionError || !section) {
      console.error('[GET_SECTION_DETAIL_ERROR]', sectionError)
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    // Verify paper belongs to teacher's institute
    const paper = section.test_papers as any
    if (paper.institute_id !== teacher.institute_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch available chapters (filtered by section's subject_id)
    // Only show chapters that have materials uploaded (material_count > 0)
    const { data: availableChapters, error: chaptersError } = await supabase
      .from('chapters')
      .select(`
        id,
        name,
        subject_id,
        material_count,
        class_level_id,
        created_at,
        class_levels (
          id,
          name,
          display_order
        )
      `)
      .eq('subject_id', section.subject_id)
      .gt('material_count', 0)  // Only chapters with materials
      .order('name', { ascending: true })

    if (chaptersError) {
      console.error('[GET_SECTION_DETAIL_ERROR] Chapters fetch failed:', chaptersError)
      return NextResponse.json(
        { error: 'Failed to fetch available chapters' },
        { status: 500 }
      )
    }

    // Smart injection: Check if AI Knowledge chapter exists for this subject
    // If NOT found in DB, inject synthetic chapter to avoid duplicate
    const hasAIKnowledge = availableChapters?.some(ch => ch.name === '[AI Knowledge] Full Syllabus')
    let chaptersWithAIOption = availableChapters || []

    if (!hasAIKnowledge) {
      // Inject synthetic AI Knowledge chapter at the top
      const aiKnowledgeChapter = {
        id: 'ai-knowledge-full-syllabus', // Synthetic ID for UI
        name: '[AI Knowledge] Full Syllabus',
        subject_id: section.subject_id,
        class_level_id: null,
        created_at: new Date().toISOString(),
        class_levels: []
      }
      chaptersWithAIOption = [aiKnowledgeChapter as any, ...(availableChapters || [])]
      console.log(`[GET_SECTION_DETAIL] Injected AI Knowledge chapter for subject ${section.subject_id}`)
    }

    // Fetch currently assigned chapters
    const { data: assignedChapterRels, error: assignedError } = await supabase
      .from('section_chapters')
      .select(`
        chapter_id,
        created_at,
        chapters (
          id,
          name,
          subject_id,
          class_level_id,
          class_levels (
            name
          )
        )
      `)
      .eq('section_id', sectionId)

    if (assignedError) {
      console.error('[GET_SECTION_DETAIL_ERROR] Assigned chapters fetch failed:', assignedError)
    }

    const assignedChapters = assignedChapterRels?.map(rel => ({
      ...(rel.chapters as any),
      assigned_at: rel.created_at
    })) || []

    // Count questions for this section
    const { count: questionCount } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('section_id', sectionId)

    console.log(`[GET_SECTION_DETAIL_SUCCESS] section="${section.section_name}" status=${section.status} assigned_chapters=${assignedChapters.length} questions=${questionCount || 0}`)

    return NextResponse.json({
      section: {
        id: section.id,
        paper_id: section.paper_id,
        subject_id: section.subject_id,
        subject_name: (section.subjects as any)?.name,
        section_type: section.section_type,
        section_name: section.section_name,
        section_order: section.section_order,
        question_count: section.question_count,
        status: section.status,
        chapters_assigned_at: section.chapters_assigned_at,
        created_at: section.created_at,
        updated_at: section.updated_at,
        actual_question_count: questionCount || 0,
        paper_title: paper.title,
        paper_difficulty: paper.difficulty_level
      },
      available_chapters: chaptersWithAIOption,
      assigned_chapters: assignedChapters
    })

  } catch (error) {
    console.error('[GET_SECTION_DETAIL_EXCEPTION]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
