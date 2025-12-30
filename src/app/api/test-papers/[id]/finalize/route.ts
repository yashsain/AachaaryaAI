/**
 * POST /api/test-papers/[id]/finalize
 *
 * Finalize question selection for a test paper
 *
 * For Multi-Section Papers (template-based):
 * - Validates that ALL sections are finalized
 * - Updates paper status to 'finalized'
 * - Enables PDF generation
 *
 * For Legacy Papers (non-template):
 * - Validates that exactly target question_count questions are selected
 * - Updates paper status to 'finalized'
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface FinalizeSelectionParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: FinalizeSelectionParams
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

    console.log('[FINALIZE_SELECTION] paper_id:', paperId, 'teacher_id:', teacher.id)

    // Verify paper belongs to teacher's institute
    const { data: paper, error: paperError } = await supabase
      .from('test_papers')
      .select('id, institute_id, title, question_count, status, paper_template_id')
      .eq('id', paperId)
      .eq('institute_id', teacher.institute_id)
      .single()

    if (paperError || !paper) {
      return NextResponse.json({ error: 'Test paper not found or access denied' }, { status: 404 })
    }

    // Validate current status
    if (paper.status === 'finalized') {
      return NextResponse.json({ error: 'Paper is already finalized' }, { status: 400 })
    }

    console.log('[FINALIZE_SELECTION] Paper found:', paper.title, 'has_template:', !!paper.paper_template_id)

    // Check if this is a multi-section paper (template-based)
    const isMultiSection = !!paper.paper_template_id

    if (isMultiSection) {
      // NEW FLOW: Validate all sections are finalized
      console.log('[FINALIZE_SELECTION] Multi-section paper detected, validating sections...')

      const { data: sections, error: sectionsError } = await supabase
        .from('test_paper_sections')
        .select('id, section_name, section_order, status')
        .eq('paper_id', paperId)
        .order('section_order', { ascending: true })

      if (sectionsError) {
        console.error('[FINALIZE_SELECTION_SECTIONS_ERROR]', sectionsError)
        return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 })
      }

      if (!sections || sections.length === 0) {
        return NextResponse.json({ error: 'Paper has no sections' }, { status: 400 })
      }

      // Check if all sections are finalized
      const unfinalizedSections = sections.filter(s => s.status !== 'finalized')

      if (unfinalizedSections.length > 0) {
        const unfinalizedNames = unfinalizedSections.map(s => s.section_name).join(', ')
        console.log('[FINALIZE_SELECTION_VALIDATION_FAILED] Unfinalized sections:', unfinalizedNames)
        return NextResponse.json({
          error: `Cannot finalize paper. Please finalize all sections first.`,
          unfinalized_sections: unfinalizedSections.map(s => ({
            id: s.id,
            name: s.section_name,
            status: s.status
          })),
          message: `Unfinalized sections: ${unfinalizedNames}`
        }, { status: 400 })
      }

      console.log('[FINALIZE_SELECTION] All sections finalized, proceeding with paper finalization')

    } else {
      // LEGACY FLOW: Validate question count for non-template papers
      console.log('[FINALIZE_SELECTION] Legacy paper detected, validating question count...')

      const { data: selectedQuestions, error: countError } = await supabase
        .from('questions')
        .select('id')
        .eq('paper_id', paperId)
        .eq('is_selected', true)

      if (countError) {
        console.error('[FINALIZE_SELECTION_COUNT_ERROR]', countError)
        return NextResponse.json({ error: 'Failed to count selected questions' }, { status: 500 })
      }

      const selectedCount = selectedQuestions?.length || 0
      const targetCount = paper.question_count || 30

      console.log('[FINALIZE_SELECTION] Selected:', selectedCount, 'Target:', targetCount)

      // Validate selection count
      if (selectedCount !== targetCount) {
        return NextResponse.json({
          error: `Selection incomplete. You have selected ${selectedCount} questions but need exactly ${targetCount} questions.`,
          selected_count: selectedCount,
          target_count: targetCount,
        }, { status: 400 })
      }
    }

    // Update paper status to finalized
    const { data: updatedPaper, error: updateError } = await supabase
      .from('test_papers')
      .update({
        status: 'finalized',
        finalized_at: new Date().toISOString(),
      })
      .eq('id', paperId)
      .select()
      .single()

    if (updateError) {
      console.error('[FINALIZE_SELECTION_UPDATE_ERROR]', updateError)
      return NextResponse.json({ error: 'Failed to finalize paper' }, { status: 500 })
    }

    console.log('[FINALIZE_SELECTION_SUCCESS] paper_id:', paperId, 'status: finalized', 'multi_section:', isMultiSection)

    return NextResponse.json({
      success: true,
      paper: updatedPaper,
      message: isMultiSection
        ? 'Paper finalized successfully. You can now generate the final PDF.'
        : `Successfully finalized ${paper.question_count} questions.`,
    })
  } catch (error) {
    console.error('[FINALIZE_SELECTION_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
