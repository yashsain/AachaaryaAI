/**
 * Section Management API
 *
 * GET: Get section details with available/assigned chapters
 * PATCH: Update section properties (question_count)
 * DELETE: Remove section from paper
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  isSectionEditable,
  validateSectionQuestionCount,
  validateSectionDeletion,
  calculateTotalAfterDeletion
} from '@/lib/validators/sectionValidators'

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
        batch_number,
        total_batches,
        questions_generated_so_far,
        batch_size,
        batch_metadata,
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
        paper_difficulty: paper.difficulty_level,
        // Batch tracking fields
        batch_number: section.batch_number || 0,
        total_batches: section.total_batches || 1,
        questions_generated_so_far: section.questions_generated_so_far || 0,
        batch_size: section.batch_size || 30,
        batch_metadata: section.batch_metadata || {}
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

export async function PATCH(
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

    // Parse request body
    const body = await request.json()
    const { question_count: newQuestionCount } = body

    if (typeof newQuestionCount !== 'number') {
      return NextResponse.json(
        { error: 'Invalid question_count: must be a number' },
        { status: 400 }
      )
    }

    console.log(`[PATCH_SECTION] paper_id=${paperId} section_id=${sectionId} new_count=${newQuestionCount} teacher_id=${teacher.id}`)

    // Fetch section with paper details
    const { data: section, error: sectionError } = await supabase
      .from('test_paper_sections')
      .select(`
        id,
        paper_id,
        section_name,
        question_count,
        status,
        test_papers!inner (
          id,
          institute_id,
          status
        )
      `)
      .eq('id', sectionId)
      .eq('paper_id', paperId)
      .single()

    if (sectionError || !section) {
      console.error('[PATCH_SECTION_ERROR]', sectionError)
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    // Verify paper belongs to teacher's institute
    const paper = section.test_papers as any
    if (paper.institute_id !== teacher.institute_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if section is editable (pending or ready status only)
    if (!isSectionEditable(section.status)) {
      return NextResponse.json(
        {
          error: `Cannot edit section with status "${section.status}". Only pending or ready sections can be edited.`
        },
        { status: 400 }
      )
    }

    // Fetch all sections for the paper to validate total
    const { data: allSections, error: allSectionsError } = await supabase
      .from('test_paper_sections')
      .select('id, question_count, status')
      .eq('paper_id', paperId)

    if (allSectionsError || !allSections) {
      console.error('[PATCH_SECTION_ERROR] Failed to fetch sections:', allSectionsError)
      return NextResponse.json(
        { error: 'Failed to validate question count' },
        { status: 500 }
      )
    }

    // Validate the new question count
    const validation = validateSectionQuestionCount(
      sectionId,
      newQuestionCount,
      allSections
    )

    if (!validation.valid) {
      console.log(`[PATCH_SECTION_VALIDATION_FAILED] ${validation.error}`)
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Update section question count
    const { error: updateSectionError } = await supabase
      .from('test_paper_sections')
      .update({
        question_count: newQuestionCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId)

    if (updateSectionError) {
      console.error('[PATCH_SECTION_ERROR] Failed to update section:', updateSectionError)
      return NextResponse.json(
        { error: 'Failed to update section' },
        { status: 500 }
      )
    }

    // Recalculate paper total from all sections
    const newPaperTotal = validation.newTotal!

    // Update paper question count
    const { error: updatePaperError } = await supabase
      .from('test_papers')
      .update({
        question_count: newPaperTotal
      })
      .eq('id', paperId)

    if (updatePaperError) {
      console.error('[PATCH_SECTION_ERROR] Failed to update paper total:', updatePaperError)
      return NextResponse.json(
        { error: 'Failed to update paper total' },
        { status: 500 }
      )
    }

    console.log(`[PATCH_SECTION_SUCCESS] section="${section.section_name}" old_count=${section.question_count} new_count=${newQuestionCount} paper_total=${newPaperTotal}`)

    return NextResponse.json({
      success: true,
      section: {
        id: sectionId,
        question_count: newQuestionCount
      },
      paper_total: newPaperTotal
    })

  } catch (error) {
    console.error('[PATCH_SECTION_EXCEPTION]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    console.log(`[DELETE_SECTION] paper_id=${paperId} section_id=${sectionId} teacher_id=${teacher.id}`)

    // Fetch section with paper details
    const { data: section, error: sectionError } = await supabase
      .from('test_paper_sections')
      .select(`
        id,
        paper_id,
        section_name,
        question_count,
        status,
        test_papers!inner (
          id,
          institute_id,
          status
        )
      `)
      .eq('id', sectionId)
      .eq('paper_id', paperId)
      .single()

    if (sectionError || !section) {
      console.error('[DELETE_SECTION_ERROR]', sectionError)
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    // Verify paper belongs to teacher's institute
    const paper = section.test_papers as any
    if (paper.institute_id !== teacher.institute_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch all sections for the paper to validate deletion
    const { data: allSections, error: allSectionsError } = await supabase
      .from('test_paper_sections')
      .select('id, question_count, status')
      .eq('paper_id', paperId)

    if (allSectionsError || !allSections) {
      console.error('[DELETE_SECTION_ERROR] Failed to fetch sections:', allSectionsError)
      return NextResponse.json(
        { error: 'Failed to validate section deletion' },
        { status: 500 }
      )
    }

    // Validate section deletion (must keep at least 1 section)
    const validation = validateSectionDeletion(allSections.length)

    if (!validation.valid) {
      console.log(`[DELETE_SECTION_VALIDATION_FAILED] ${validation.error}`)
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Calculate new paper total after deletion
    const newPaperTotal = calculateTotalAfterDeletion(allSections, sectionId)

    // Delete the section (will cascade to questions and section_chapters via FK constraints)
    const { error: deleteSectionError } = await supabase
      .from('test_paper_sections')
      .delete()
      .eq('id', sectionId)

    if (deleteSectionError) {
      console.error('[DELETE_SECTION_ERROR] Failed to delete section:', deleteSectionError)
      return NextResponse.json(
        { error: 'Failed to delete section' },
        { status: 500 }
      )
    }

    // Update paper question count
    const { error: updatePaperError } = await supabase
      .from('test_papers')
      .update({
        question_count: newPaperTotal
      })
      .eq('id', paperId)

    if (updatePaperError) {
      console.error('[DELETE_SECTION_ERROR] Failed to update paper total:', updatePaperError)
      return NextResponse.json(
        { error: 'Failed to update paper total' },
        { status: 500 }
      )
    }

    console.log(`[DELETE_SECTION_SUCCESS] section="${section.section_name}" deleted_questions=${section.question_count} new_paper_total=${newPaperTotal}`)

    return NextResponse.json({
      success: true,
      deleted_section_id: sectionId,
      paper_total: newPaperTotal,
      remaining_sections: allSections.length - 1
    })

  } catch (error) {
    console.error('[DELETE_SECTION_EXCEPTION]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
