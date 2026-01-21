/**
 * POST /api/test-papers/[id]/sections/[section_id]/assign-chapters
 *
 * Assigns chapters to a section
 * - Deletes existing chapter assignments for this section
 * - Deletes existing questions if section was previously completed (per user requirement)
 * - Inserts new section-chapter relationships
 * - Updates section status to 'ready'
 * - Updates chapters_assigned_at timestamp
 *
 * Request Body:
 * - chapter_ids: string[] - Array of chapter IDs to assign
 *
 * Response:
 * - success: boolean
 * - section_id: string
 * - chapters_assigned: number
 * - questions_deleted: number (if any)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface AssignChaptersParams {
  params: Promise<{
    id: string
    section_id: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: AssignChaptersParams
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
    const { chapter_ids } = body

    // Validation
    if (!chapter_ids || !Array.isArray(chapter_ids) || chapter_ids.length === 0) {
      return NextResponse.json(
        { error: 'chapter_ids array is required and must not be empty' },
        { status: 400 }
      )
    }

    console.log(`[ASSIGN_CHAPTERS_START] paper_id=${paperId} section_id=${sectionId} teacher_id=${teacher.id} chapters=${chapter_ids.length}`)

    // Fetch section with paper details to verify access
    const { data: section, error: sectionError } = await supabase
      .from('test_paper_sections')
      .select(`
        id,
        paper_id,
        subject_id,
        section_name,
        status,
        test_papers!inner (
          id,
          institute_id
        )
      `)
      .eq('id', sectionId)
      .eq('paper_id', paperId)
      .single()

    if (sectionError || !section) {
      console.error('[ASSIGN_CHAPTERS_ERROR]', sectionError)
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    // Verify paper belongs to teacher's institute
    const paper = section.test_papers as any
    if (paper.institute_id !== teacher.institute_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Special reserved UUID for AI Knowledge mode
    const AI_KNOWLEDGE_UUID = '00000000-0000-0000-0000-000000000001'

    // Check if AI Knowledge chapter is selected (using real DB UUID)
    const hasAIKnowledgeChapter = chapter_ids.includes(AI_KNOWLEDGE_UUID)

    // Log if AI Knowledge mode is being used
    if (hasAIKnowledgeChapter) {
      console.log(`[ASSIGN_CHAPTERS_INFO] AI Knowledge mode selected for section "${section.section_name}"`)
    }

    // Verify all chapters exist and belong to the section's subject
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, subject_id')
      .in('id', chapter_ids)

    if (chaptersError || !chapters || chapters.length !== chapter_ids.length) {
      return NextResponse.json(
        { error: 'One or more chapters not found' },
        { status: 400 }
      )
    }

    // Verify all chapters belong to the section's subject
    const invalidChapters = chapters.filter(ch => ch.subject_id !== section.subject_id)
    if (invalidChapters.length > 0) {
      return NextResponse.json(
        { error: `Chapters must belong to section's subject` },
        { status: 400 }
      )
    }

    // Step 1: Delete existing chapter assignments for this section
    const { error: deleteChaptersError } = await supabase
      .from('section_chapters')
      .delete()
      .eq('section_id', sectionId)

    if (deleteChaptersError) {
      console.error('[ASSIGN_CHAPTERS_ERROR] Delete existing chapters failed:', deleteChaptersError)
      return NextResponse.json(
        { error: 'Failed to clear existing chapter assignments' },
        { status: 500 }
      )
    }

    // Step 2: Delete existing questions if section was previously completed
    let questionsDeleted = 0
    if (section.status === 'completed') {
      const { data: deletedQuestions, error: deleteQuestionsError } = await supabase
        .from('questions')
        .delete()
        .eq('section_id', sectionId)
        .select('id')

      if (deleteQuestionsError) {
        console.error('[ASSIGN_CHAPTERS_ERROR] Delete questions failed:', deleteQuestionsError)
        // Don't fail - continue with chapter assignment
      } else {
        questionsDeleted = deletedQuestions?.length || 0
        console.log(`[ASSIGN_CHAPTERS_INFO] Deleted ${questionsDeleted} existing questions from completed section`)
      }
    }

    // Step 3: Insert new section-chapter relationships
    const sectionChapters = chapter_ids.map(chapter_id => ({
      section_id: sectionId,
      chapter_id: chapter_id
    }))

    const { data: assignedChapters, error: insertError } = await supabase
      .from('section_chapters')
      .insert(sectionChapters)
      .select()

    if (insertError) {
      console.error('[ASSIGN_CHAPTERS_ERROR] Insert failed:', insertError)
      return NextResponse.json(
        { error: 'Failed to assign chapters' },
        { status: 500 }
      )
    }

    // Step 4: Update section status to 'ready' and set chapters_assigned_at
    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('test_paper_sections')
      .update({
        status: 'ready',
        chapters_assigned_at: now,
        updated_at: now
      })
      .eq('id', sectionId)

    if (updateError) {
      console.error('[ASSIGN_CHAPTERS_ERROR] Section update failed:', updateError)
      // Don't fail - chapters are assigned successfully
    }

    console.log(`[ASSIGN_CHAPTERS_SUCCESS] section="${section.section_name}" chapters=${assignedChapters.length} questions_deleted=${questionsDeleted}`)

    return NextResponse.json({
      success: true,
      section_id: sectionId,
      chapters_assigned: assignedChapters.length,
      questions_deleted: questionsDeleted,
      status: 'ready',
      message: `Assigned ${assignedChapters.length} chapters to section. ${questionsDeleted > 0 ? `Deleted ${questionsDeleted} existing questions.` : ''}`
    })

  } catch (error) {
    console.error('[ASSIGN_CHAPTERS_EXCEPTION]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
