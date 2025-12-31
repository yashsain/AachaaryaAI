/**
 * GET /api/paper-templates
 *
 * List all paper templates for a stream with their sections
 * Used by Paper Creation Flow to show available templates
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stream_id = searchParams.get('stream_id')

    if (!stream_id) {
      return NextResponse.json(
        { error: 'Missing required parameter: stream_id' },
        { status: 400 }
      )
    }

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

    // Fetch paper templates for the stream with sections
    const { data: templates, error: templatesError } = await supabase
      .from('paper_templates')
      .select(`
        id,
        stream_id,
        name,
        description,
        display_order,
        is_default,
        duration,
        created_at,
        streams:stream_id (
          id,
          name
        )
      `)
      .eq('stream_id', stream_id)
      .order('display_order', { ascending: true })

    if (templatesError) {
      console.error('Error fetching templates:', templatesError)
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      )
    }

    if (!templates || templates.length === 0) {
      return NextResponse.json(
        { error: 'No templates found for this stream' },
        { status: 404 }
      )
    }

    // Fetch sections for each template
    const templatesWithSections = await Promise.all(
      templates.map(async (template) => {
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
          .eq('paper_template_id', template.id)
          .order('section_order', { ascending: true })

        if (sectionsError) {
          console.error('Error fetching sections:', sectionsError)
          return {
            ...template,
            sections: []
          }
        }

        return {
          ...template,
          sections: sections || []
        }
      })
    )

    return NextResponse.json({
      templates: templatesWithSections
    })

  } catch (error) {
    console.error('Unexpected error in /api/paper-templates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
