import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/classes
 *
 * Returns classes for teacher's institute
 * Available to all teachers (not just admins)
 *
 * Query parameters:
 * - stream_id (optional): Filter classes by stream
 *
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

    // Get optional stream_id filter from query params
    const { searchParams } = new URL(request.url)
    const streamId = searchParams.get('stream_id')

    console.log(`[CLASSES_API] user_id=${teacher.id} institute_id=${teacher.institute_id} stream_id=${streamId || 'all'}`)

    // Fetch classes for this institute
    // Note: Both admins and regular teachers can read this data
    let query = supabaseAdmin
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

    // Apply stream filter if provided
    if (streamId) {
      query = query.eq('stream_id', streamId)
    }

    const { data: classes, error: classesError } = await query.order('batch_name', { ascending: true })

    if (classesError) {
      console.error('[CLASSES_API_ERROR]', classesError)
      return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
    }

    console.log(`[CLASSES_API] classes_count=${classes?.length || 0}`)

    return NextResponse.json({ classes }, { status: 200 })
  } catch (error) {
    console.error('[CLASSES_API_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
