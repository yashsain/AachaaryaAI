import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * GET /api/streams
 *
 * Returns streams for the current user's institute
 * Filters by institute_streams table to show only streams associated with the institute
 *
 * Used for: Stream picker page in test papers and materials flows
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(await cookies())

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Get teacher profile with institute info
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('id, role, institute_id')
      .eq('id', user.id)
      .is('deleted_at', null)
      .single()

    if (teacherError || !teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    console.log(`[STREAMS_API] user_id=${teacher.id} role=${teacher.role} institute_id=${teacher.institute_id}`)

    // Get streams for this institute via institute_streams table
    const { data, error: streamsError } = await supabaseAdmin
      .from('institute_streams')
      .select(`
        stream_id,
        streams!inner (
          id,
          name,
          created_at
        )
      `)
      .eq('institute_id', teacher.institute_id)
      .order('streams(name)', { ascending: true })

    if (streamsError) {
      console.error('[STREAMS_API_ERROR]', streamsError)
      return NextResponse.json({ error: 'Failed to fetch streams' }, { status: 500 })
    }

    // Extract streams from institute_streams join
    const streams = data?.map(is_entry => {
      const stream = Array.isArray(is_entry.streams) ? is_entry.streams[0] : is_entry.streams
      return stream ? {
        id: stream.id,
        name: stream.name,
        created_at: stream.created_at
      } : null
    }).filter(Boolean) || []

    console.log(`[STREAMS_API] institute_id=${teacher.institute_id} streams_count=${streams.length}`)

    return NextResponse.json({ streams }, { status: 200 })
  } catch (error) {
    console.error('[STREAMS_API_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
