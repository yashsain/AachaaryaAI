import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { randomUUID } from 'crypto'

/**
 * POST /api/test-papers/create
 *
 * Creates a new test paper with selected classes and chapters
 * Called from the test paper creation form
 */
export async function POST(request: NextRequest) {
  try {
    // Get session from request header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

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

    // Parse request body
    const body = await request.json()
    const {
      title,
      subject_id,
      material_type_id,
      class_ids,
      chapter_ids,
      question_count,
      difficulty_level
    } = body

    // Validation
    const errors: Record<string, string> = {}

    if (!title || title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters'
    }
    if (!subject_id) errors.subject_id = 'Subject is required'
    if (!material_type_id) errors.material_type_id = 'Material type is required'
    if (!class_ids || !Array.isArray(class_ids) || class_ids.length === 0) {
      errors.class_ids = 'At least one class must be selected'
    }
    if (!chapter_ids || !Array.isArray(chapter_ids) || chapter_ids.length === 0) {
      errors.chapter_ids = 'At least one chapter must be selected'
    }
    if (!question_count || question_count < 10 || question_count > 100) {
      errors.question_count = 'Question count must be between 10 and 100'
    }
    if (!['easy', 'balanced', 'hard'].includes(difficulty_level)) {
      errors.difficulty_level = 'Invalid difficulty level'
    }

    if (Object.keys(errors).length > 0) {
      console.error('[CREATE_PAPER_VALIDATION_ERROR]', errors)
      return NextResponse.json({
        error: 'Validation failed',
        errors
      }, { status: 400 })
    }

    // Fetch stream_id from subject
    const { data: subject, error: subjectError } = await supabaseAdmin
      .from('subjects')
      .select('stream_id')
      .eq('id', subject_id)
      .single()

    if (subjectError || !subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    // Generate paper_id
    const paper_id = randomUUID()

    console.log(`[CREATE_PAPER_START] paper_id=${paper_id} teacher_id=${teacher.id} title="${title.trim()}"`)

    // Insert test paper
    const { data: testPaper, error: paperError } = await supabaseAdmin
      .from('test_papers')
      .insert({
        id: paper_id,
        institute_id: teacher.institute_id,
        created_by: teacher.id,
        stream_id: subject.stream_id,
        subject_id: subject_id,
        material_type_id: material_type_id,
        title: title.trim(),
        question_count: question_count,
        difficulty_level: difficulty_level,
        status: 'draft',
        pdf_url: null,
        solution_url: null,
        finalized_at: null
      })
      .select()
      .single()

    if (paperError) {
      console.error('[CREATE_PAPER_ERROR]', paperError)
      return NextResponse.json({ error: 'Failed to create test paper' }, { status: 500 })
    }

    // Insert paper-class relationships (many-to-many)
    const paperClasses = class_ids.map((class_id: string) => ({
      paper_id: paper_id,
      class_id: class_id.trim()
    }))

    const { error: classesError } = await supabaseAdmin
      .from('paper_classes')
      .insert(paperClasses)

    if (classesError) {
      console.error('[CREATE_PAPER_CLASSES_ERROR]', classesError)
      // Don't fail - can be fixed later
    }

    // Insert paper-chapter relationships
    const paperChapters = chapter_ids.map((chapter_id: string) => ({
      paper_id: paper_id,
      chapter_id: chapter_id.trim()
    }))

    const { error: chaptersError } = await supabaseAdmin
      .from('paper_chapters')
      .insert(paperChapters)

    if (chaptersError) {
      console.error('[CREATE_PAPER_CHAPTERS_ERROR]', chaptersError)
      // Don't fail - can be fixed later
    }

    console.log(`[CREATE_PAPER_SUCCESS] paper_id=${paper_id} classes=${class_ids.length} chapters=${chapter_ids.length}`)

    return NextResponse.json({
      success: true,
      paper_id: paper_id,
      status: 'draft',
      message: 'Test paper created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('[CREATE_PAPER_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
