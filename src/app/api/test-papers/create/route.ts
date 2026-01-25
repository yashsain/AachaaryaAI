import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'

/**
 * POST /api/test-papers/create
 *
 * Creates a new test paper with selected classes and chapters
 * Called from the test paper creation form
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const {
      title,
      paper_template_id,
      class_ids,
      chapter_ids,
      section_configs, // Optional: Array of { subject_id, question_count } to override defaults
      difficulty_level
    } = body

    // Validation
    const errors: Record<string, string> = {}

    if (!title || title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters'
    }
    if (!paper_template_id) errors.paper_template_id = 'Paper template is required'
    if (!class_ids || !Array.isArray(class_ids) || class_ids.length === 0) {
      errors.class_ids = 'At least one class must be selected'
    }
    if (!chapter_ids || !Array.isArray(chapter_ids) || chapter_ids.length === 0) {
      errors.chapter_ids = 'At least one chapter must be selected'
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

    // Fetch paper template with stream and sections
    const { data: template, error: templateError } = await supabaseAdmin
      .from('paper_templates')
      .select(`
        id,
        stream_id,
        name,
        description,
        paper_template_sections (
          id,
          subject_id,
          section_type,
          section_name,
          section_order,
          default_question_count
        )
      `)
      .eq('id', paper_template_id)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Paper template not found' }, { status: 404 })
    }

    if (!template.paper_template_sections || template.paper_template_sections.length === 0) {
      return NextResponse.json({ error: 'Template has no sections defined' }, { status: 400 })
    }

    // Get first section's subject_id for compatibility (test_papers.subject_id still required)
    const primarySubjectId = template.paper_template_sections[0].subject_id

    // Generate paper_id
    const paper_id = randomUUID()

    // Calculate total question count from sections
    const totalQuestionCount = template.paper_template_sections.reduce((sum, section) => {
      // Check if there's a section config override
      const override = section_configs?.find((cfg: any) => cfg.subject_id === section.subject_id)
      const questionCount = override?.question_count || section.default_question_count
      return sum + questionCount
    }, 0)

    console.log(`[CREATE_PAPER_START] paper_id=${paper_id} teacher_id=${teacher.id} template="${template.name}" sections=${template.paper_template_sections.length}`)

    // Insert test paper
    const { data: testPaper, error: paperError } = await supabaseAdmin
      .from('test_papers')
      .insert({
        id: paper_id,
        institute_id: teacher.institute_id,
        created_by: teacher.id,
        stream_id: template.stream_id,
        subject_id: primarySubjectId, // For compatibility
        paper_template_id: paper_template_id,
        title: title.trim(),
        question_count: totalQuestionCount,
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

    // Create test_paper_sections from template
    const paperSections = template.paper_template_sections.map((templateSection: any) => {
      // Check if there's a section config override
      const override = section_configs?.find((cfg: any) => cfg.subject_id === templateSection.subject_id)
      const questionCount = override?.question_count || templateSection.default_question_count

      return {
        paper_id: paper_id,
        subject_id: templateSection.subject_id,
        section_type: templateSection.section_type,
        section_name: templateSection.section_name,
        section_order: templateSection.section_order,
        question_count: questionCount,
        status: 'pending'
      }
    })

    const { data: createdSections, error: sectionsError } = await supabaseAdmin
      .from('test_paper_sections')
      .insert(paperSections)
      .select()

    if (sectionsError) {
      console.error('[CREATE_PAPER_SECTIONS_ERROR]', sectionsError)
      return NextResponse.json({ error: 'Failed to create paper sections' }, { status: 500 })
    }

    // Insert section-chapter relationships (all chapters to all sections - NEET pattern)
    const sectionChapters = createdSections.flatMap((section: any) =>
      chapter_ids.map((chapter_id: string) => ({
        section_id: section.id,
        chapter_id: chapter_id.trim()
      }))
    )

    const { error: chaptersError } = await supabaseAdmin
      .from('section_chapters')
      .insert(sectionChapters)

    if (chaptersError) {
      console.error('[CREATE_SECTION_CHAPTERS_ERROR]', chaptersError)
      // Don't fail - can be fixed later
    }

    // Update sections status to 'ready' (chapters are now assigned)
    const { error: statusError } = await supabaseAdmin
      .from('test_paper_sections')
      .update({
        status: 'ready',
        chapters_assigned_at: new Date().toISOString()
      })
      .in('id', createdSections.map((s: any) => s.id))

    if (statusError) {
      console.error('[UPDATE_SECTION_STATUS_ERROR]', statusError)
      // Don't fail - can be fixed later
    }

    console.log(`[CREATE_PAPER_SUCCESS] paper_id=${paper_id} sections=${createdSections.length} classes=${class_ids.length} chapters=${chapter_ids.length} section_chapters=${sectionChapters.length}`)

    return NextResponse.json({
      success: true,
      paper_id: paper_id,
      status: 'draft',
      sections: createdSections,
      message: 'Test paper created successfully with sections'
    }, { status: 201 })

  } catch (error) {
    console.error('[CREATE_PAPER_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
