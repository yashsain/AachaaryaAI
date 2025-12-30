/**
 * DELETE /api/test-papers/[id]
 *
 * Delete a test paper and all associated data
 * (Papers Management Interface)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface DeletePaperParams {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(
  request: NextRequest,
  { params }: DeletePaperParams
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

    console.log('[DELETE_PAPER] paper_id:', paperId, 'teacher_id:', teacher.id)

    // Verify paper belongs to teacher's institute
    const { data: paper, error: paperError } = await supabase
      .from('test_papers')
      .select('id, institute_id, title')
      .eq('id', paperId)
      .eq('institute_id', teacher.institute_id)
      .single()

    if (paperError || !paper) {
      return NextResponse.json({ error: 'Test paper not found or access denied' }, { status: 404 })
    }

    console.log('[DELETE_PAPER] Deleting paper:', paper.title)

    /**
     * Delete cascade (in order to avoid foreign key constraints):
     * 1. Delete questions
     * 2. Delete paper_classes
     * 3. Delete test_paper_sections (CASCADE → deletes section_chapters automatically)
     * 4. Delete test_papers
     */

    // 1. Delete questions
    const { error: questionsError } = await supabase
      .from('questions')
      .delete()
      .eq('paper_id', paperId)

    if (questionsError) {
      console.error('[DELETE_PAPER_QUESTIONS_ERROR]', questionsError)
      return NextResponse.json({ error: 'Failed to delete questions' }, { status: 500 })
    }

    // 2. Delete paper_classes
    const { error: classesError } = await supabase
      .from('paper_classes')
      .delete()
      .eq('paper_id', paperId)

    if (classesError) {
      console.error('[DELETE_PAPER_CLASSES_ERROR]', classesError)
      return NextResponse.json({ error: 'Failed to delete paper classes' }, { status: 500 })
    }

    // 3. Delete test_paper_sections (CASCADE will delete section_chapters)
    const { error: sectionsError } = await supabase
      .from('test_paper_sections')
      .delete()
      .eq('paper_id', paperId)

    if (sectionsError) {
      console.error('[DELETE_PAPER_SECTIONS_ERROR]', sectionsError)
      return NextResponse.json({ error: 'Failed to delete paper sections' }, { status: 500 })
    }

    // 4. Delete test_papers record
    const { error: deleteError } = await supabase
      .from('test_papers')
      .delete()
      .eq('id', paperId)

    if (deleteError) {
      console.error('[DELETE_PAPER_ERROR]', deleteError)
      return NextResponse.json({ error: 'Failed to delete paper' }, { status: 500 })
    }

    console.log('[DELETE_PAPER_SUCCESS] paper_id:', paperId)

    return NextResponse.json({
      success: true,
      message: 'Paper deleted successfully',
    })
  } catch (error) {
    console.error('[DELETE_PAPER_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
