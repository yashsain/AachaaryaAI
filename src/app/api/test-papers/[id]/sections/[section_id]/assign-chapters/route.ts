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

    // Check if synthetic AI Knowledge chapter is selected
    const SYNTHETIC_AI_KNOWLEDGE_ID = 'ai-knowledge-full-syllabus'
    const hasSyntheticAIKnowledge = chapter_ids.includes(SYNTHETIC_AI_KNOWLEDGE_ID)

    let finalChapterIds = [...chapter_ids]
    let aiKnowledgeUUID: string | null = null

    // If synthetic AI Knowledge is selected, upsert real DB record
    if (hasSyntheticAIKnowledge) {
      console.log(`[ASSIGN_CHAPTERS_INFO] AI Knowledge mode selected for section "${section.section_name}"`)

      // Check if AI Knowledge chapter already exists for this subject
      const { data: existingAIChapter } = await supabase
        .from('chapters')
        .select('id')
        .eq('name', '[AI Knowledge] Full Syllabus')
        .eq('subject_id', section.subject_id)
        .single()

      if (existingAIChapter) {
        // Use existing AI Knowledge chapter UUID
        aiKnowledgeUUID = existingAIChapter.id
        console.log(`[ASSIGN_CHAPTERS_INFO] Using existing AI Knowledge chapter ${aiKnowledgeUUID}`)
      } else {
        // Create new AI Knowledge chapter for this subject
        const { data: newAIChapter, error: insertError } = await supabase
          .from('chapters')
          .insert({
            name: '[AI Knowledge] Full Syllabus',
            subject_id: section.subject_id,
            class_level_id: null
          })
          .select('id')
          .single()

        if (insertError || !newAIChapter) {
          console.error('[ASSIGN_CHAPTERS_ERROR] Failed to create AI Knowledge chapter:', insertError)
          return NextResponse.json(
            { error: 'Failed to create AI Knowledge chapter' },
            { status: 500 }
          )
        }

        aiKnowledgeUUID = newAIChapter.id
        console.log(`[ASSIGN_CHAPTERS_INFO] Created new AI Knowledge chapter ${aiKnowledgeUUID} for subject ${section.subject_id}`)
      }

      // Replace synthetic ID with real UUID
      finalChapterIds = chapter_ids.map(id =>
        id === SYNTHETIC_AI_KNOWLEDGE_ID ? aiKnowledgeUUID! : id
      )
    }

    // Separate AI Knowledge and regular chapters for validation
    const regularChapterIds = finalChapterIds.filter(id => id !== aiKnowledgeUUID)

    // Verify regular chapters exist and belong to the section's subject
    if (regularChapterIds.length > 0) {
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('id, subject_id')
        .in('id', regularChapterIds)

      if (chaptersError || !chapters || chapters.length !== regularChapterIds.length) {
        return NextResponse.json(
          { error: 'One or more chapters not found' },
          { status: 400 }
        )
      }

      // Verify all regular chapters belong to the section's subject
      const invalidChapters = chapters.filter(ch => ch.subject_id !== section.subject_id)
      if (invalidChapters.length > 0) {
        return NextResponse.json(
          { error: `Chapters must belong to section's subject` },
          { status: 400 }
        )
      }
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
    const sectionChapters = finalChapterIds.map(chapter_id => ({
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
