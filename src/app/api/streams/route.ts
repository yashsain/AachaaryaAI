import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

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
