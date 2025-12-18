import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/classes
 *
 * Returns classes for teacher's institute
 * Available to all teachers (not just admins)
 * Used for: Upload material form to get stream_id and class_id
 */
export async function GET(request: NextRequest) {
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

    // Get teacher record to get institute_id
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('id, institute_id, role')
      .eq('id', user.id)
      .is('deleted_at', null)
      .single()

    if (teacherError || !teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    // Fetch all classes for this institute
    // Note: Both admins and regular teachers can read this data
    const { data: classes, error: classesError } = await supabaseAdmin
      .from('classes')
      .select(`
        id,
        batch_name,
        medium,
        stream_id,
        class_level_id,
        streams (
          id,
          name
        ),
        class_levels (
          id,
          name
        )
      `)
      .eq('institute_id', teacher.institute_id)
      .order('batch_name', { ascending: true })

    if (classesError) {
      console.error('[CLASSES_API_ERROR]', classesError)
      return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
    }

    return NextResponse.json({ classes }, { status: 200 })
  } catch (error) {
    console.error('[CLASSES_API_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
