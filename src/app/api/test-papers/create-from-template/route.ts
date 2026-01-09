/**
 * POST /api/test-papers/create-from-template
 *
 * Creates a new test paper with metadata only (NO chapters)
 * Creates empty sections based on template
 * Used by Simplified Paper Creation Form
 *
 * Request Body:
 * - template_id: Paper template ID
 * - title: Paper title
 * - class_ids: Array of class IDs
 * - material_type_id: Paper type (DPP, NEET Paper, etc.)
 * - difficulty_level: easy | balanced | hard
 *
 * Response:
 * - paper_id: Created paper ID
 * - sections: Array of created sections (all status='pending')
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'

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
      template_id,
      title,
      class_ids,
      material_type_id,
      difficulty_level
    } = body

    // Validation
    const errors: Record<string, string> = {}

    if (!title || title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters'
    }
    if (!template_id) errors.template_id = 'Paper template is required'
    if (!material_type_id) errors.material_type_id = 'Material type is required'
    if (!class_ids || !Array.isArray(class_ids) || class_ids.length === 0) {
      errors.class_ids = 'At least one class must be selected'
    }
    if (!['easy', 'balanced', 'hard'].includes(difficulty_level)) {
      errors.difficulty_level = 'Invalid difficulty level'
    }

    if (Object.keys(errors).length > 0) {
      console.error('[CREATE_FROM_TEMPLATE_VALIDATION_ERROR]', errors)
      return NextResponse.json({
        error: 'Validation failed',
        errors
      }, { status: 400 })
    }

    // Fetch paper template with sections
    const { data: template, error: templateError } = await supabaseAdmin
      .from('paper_templates')
      .select(`
        id,
        stream_id,
        name,
        description,
        duration,
        paper_template_sections (
          id,
          subject_id,
          section_type,
          section_name,
          section_order,
          default_question_count,
          marks_per_question,
          negative_marks,
          is_bilingual
        )
      `)
      .eq('id', template_id)
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
      return sum + section.default_question_count
    }, 0)

    console.log(`[CREATE_FROM_TEMPLATE_START] paper_id=${paper_id} teacher_id=${teacher.id} template="${template.name}" sections=${template.paper_template_sections.length}`)

    // Insert test paper (METADATA ONLY - NO CHAPTERS)
    const { data: testPaper, error: paperError } = await supabaseAdmin
      .from('test_papers')
      .insert({
        id: paper_id,
        institute_id: teacher.institute_id,
        created_by: teacher.id,
        stream_id: template.stream_id,
        subject_id: primarySubjectId, // For compatibility
        paper_template_id: template_id,
        material_type_id: material_type_id,
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
      console.error('[CREATE_FROM_TEMPLATE_ERROR]', paperError)
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
      console.error('[CREATE_FROM_TEMPLATE_CLASSES_ERROR]', classesError)
      // Don't fail - can be fixed later
    }

    // Create test_paper_sections from template (EMPTY - NO CHAPTERS ASSIGNED)
    const paperSections = template.paper_template_sections.map((templateSection: any) => ({
      paper_id: paper_id,
      subject_id: templateSection.subject_id,
      section_type: templateSection.section_type,
      section_name: templateSection.section_name,
      section_order: templateSection.section_order,
      question_count: templateSection.default_question_count,
      marks_per_question: templateSection.marks_per_question, // Copy marking scheme from template
      negative_marks: templateSection.negative_marks, // Copy negative marks from template
      is_bilingual: templateSection.is_bilingual || false, // Copy bilingual flag from template
      status: 'pending', // NEW: All sections start as 'pending' (no chapters assigned)
      chapters_assigned_at: null // NEW: No chapters assigned yet
    }))

    const { data: createdSections, error: sectionsError } = await supabaseAdmin
      .from('test_paper_sections')
      .insert(paperSections)
      .select()

    if (sectionsError) {
      console.error('[CREATE_FROM_TEMPLATE_SECTIONS_ERROR]', sectionsError)
      return NextResponse.json({ error: 'Failed to create paper sections' }, { status: 500 })
    }

    console.log(`[CREATE_FROM_TEMPLATE_SUCCESS] paper_id=${paper_id} sections=${createdSections.length} classes=${class_ids.length}`)

    return NextResponse.json({
      success: true,
      paper_id: paper_id,
      status: 'draft',
      sections: createdSections,
      message: `Paper created with ${createdSections.length} sections. Assign chapters to each section to generate questions.`
    }, { status: 201 })

  } catch (error) {
    console.error('[CREATE_FROM_TEMPLATE_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
