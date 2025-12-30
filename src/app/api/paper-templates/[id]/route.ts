/**
 * GET /api/paper-templates/[id]
 *
 * Get a single paper template with full details including sections
 * Used by Paper Creation Flow when template is selected
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const templateId = (await params).id

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

    // Fetch teacher profile to verify authentication
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

    // Fetch paper template with stream details
    const { data: template, error: templateError } = await supabase
      .from('paper_templates')
      .select(`
        id,
        stream_id,
        name,
        description,
        display_order,
        is_default,
        created_at,
        streams:stream_id (
          id,
          name
        )
      `)
      .eq('id', templateId)
      .single()

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Fetch sections for this template
    const { data: sections, error: sectionsError } = await supabase
      .from('paper_template_sections')
      .select(`
        id,
        paper_template_id,
        subject_id,
        section_type,
        section_name,
        section_order,
        default_question_count,
        created_at,
        subjects:subject_id (
          id,
          name,
          stream_id
        )
      `)
      .eq('paper_template_id', templateId)
      .order('section_order', { ascending: true })

    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError)
      return NextResponse.json(
        { error: 'Failed to fetch template sections' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      template: {
        ...template,
        sections: sections || []
      }
    })

  } catch (error) {
    console.error('Unexpected error in /api/paper-templates/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
