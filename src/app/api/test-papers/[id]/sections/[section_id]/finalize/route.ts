/**
 * POST /api/test-papers/[id]/sections/[section_id]/finalize
 *
 * Finalizes a section after teacher has reviewed and selected questions
 * - Validates all required questions are selected (is_selected=true)
 * - Updates section status from 'in_review' to 'finalized'
 * - Section can be reverted to 'in_review' if teacher edits questions later
 *
 * Request Body: None
 *
 * Response:
 * - success: boolean
 * - section_id: string
 * - status: 'finalized'
 * - message: string
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; section_id: string }> }
) {
  try {
    const supabase = createServerClient(await cookies())
    const { data: { user }, error: authError } = await supabase.auth.getUser()

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

    const resolvedParams = await params
    const paperId = resolvedParams.id
    const sectionId = resolvedParams.section_id

    // Fetch section with paper details
    const { data: section, error: sectionError } = await supabaseAdmin
      .from('test_paper_sections')
      .select(`
        id,
        paper_id,
        section_name,
        section_order,
        status,
        question_count,
        marks_per_question,
        test_papers!inner (
          id,
          institute_id,
          created_by,
          status
        )
      `)
      .eq('id', sectionId)
      .eq('paper_id', paperId)
      .single()

    if (sectionError || !section) {
      console.error('[FINALIZE_SECTION_ERROR]', sectionError)
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    // Authorization check
    const paper: any = Array.isArray(section.test_papers) ? section.test_papers[0] : section.test_papers
    if (paper.institute_id !== teacher.institute_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Validate section is in 'in_review' status
    if (section.status !== 'in_review') {
      return NextResponse.json({
        error: `Section must be in 'in_review' status to finalize. Current status: '${section.status}'`
      }, { status: 400 })
    }

    // Calculate expected question count (question_count is the actual count)
    const expectedQuestionCount = section.question_count

    // Count selected questions for this section
    const { count: selectedCount, error: questionsError } = await supabaseAdmin
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('section_id', sectionId)
      .eq('is_selected', true)

    if (questionsError) {
      console.error('[FINALIZE_SECTION_QUESTIONS_ERROR]', questionsError)
      return NextResponse.json({ error: 'Failed to validate questions' }, { status: 500 })
    }

    // Validate all questions are selected
    if ((selectedCount || 0) < expectedQuestionCount) {
      return NextResponse.json({
        error: `Not all questions are selected. Expected: ${expectedQuestionCount}, Selected: ${selectedCount || 0}`,
        expected: expectedQuestionCount,
        selected: selectedCount || 0
      }, { status: 400 })
    }

    // Update section status to 'finalized'
    const { data: updatedSection, error: updateError } = await supabaseAdmin
      .from('test_paper_sections')
      .update({
        status: 'finalized',
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId)
      .select()
      .single()

    if (updateError) {
      console.error('[FINALIZE_SECTION_UPDATE_ERROR]', updateError)
      return NextResponse.json({ error: 'Failed to finalize section' }, { status: 500 })
    }

    console.log(`[FINALIZE_SECTION_SUCCESS] section_id=${sectionId} paper_id=${paperId} section="${section.section_name}" questions=${selectedCount}`)

    return NextResponse.json({
      success: true,
      section_id: sectionId,
      status: 'finalized',
      questions_selected: selectedCount,
      message: `Section "${section.section_name}" finalized successfully`
    }, { status: 200 })

  } catch (error) {
    console.error('[FINALIZE_SECTION_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
