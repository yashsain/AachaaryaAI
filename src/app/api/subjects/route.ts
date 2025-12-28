import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// Type definitions for Supabase joins
interface Subject {
  id: string
  name: string
  stream_id: string
  streams: { id: string; name: string } | { id: string; name: string }[]
}

// Helper function to safely extract subject data
function extractSubject(data: Subject | Subject[] | null): Subject | null {
  if (!data) return null
  return Array.isArray(data) ? data[0] : data
}

/**
 * GET /api/subjects
 *
 * Returns subjects based on user role:
 * - Admin: All subjects for the institute's streams
 * - Teacher: Only subjects they are assigned to teach
 *
 * Query parameters:
 * - stream_id (optional): Filter subjects by stream
 *
 * Used for: Subject picker page in material management and test papers
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

    // Get optional stream_id filter from query params
    const { searchParams } = new URL(request.url)
    const streamId = searchParams.get('stream_id')

    console.log(`[SUBJECTS_API] user_id=${teacher.id} role=${teacher.role} institute_id=${teacher.institute_id} stream_id=${streamId || 'all'}`)

    let subjects

    if (teacher.role === 'admin') {
      // Admin: Get all subjects for the institute's streams
      let query = supabaseAdmin
        .from('subjects')
        .select(`
          id,
          name,
          stream_id,
          streams!inner (
            id,
            name
          )
        `)

      // Apply stream filter if provided
      if (streamId) {
        query = query.eq('stream_id', streamId)
      }

      const { data, error: subjectsError } = await query.order('name', { ascending: true })

      if (subjectsError) {
        console.error('[SUBJECTS_API_ERROR]', subjectsError)
        return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 })
      }

      subjects = data

      console.log(`[SUBJECTS_API_ADMIN] subjects_count=${subjects?.length || 0}`)
    } else {
      // Teacher: Get only their assigned subjects
      let query = supabaseAdmin
        .from('teacher_subjects')
        .select(`
          subject_id,
          subjects!inner (
            id,
            name,
            stream_id,
            streams!inner (
              id,
              name
            )
          )
        `)
        .eq('teacher_id', teacher.id)

      // Apply stream filter if provided
      if (streamId) {
        query = query.eq('subjects.stream_id', streamId)
      }

      const { data, error: subjectsError } = await query

      if (subjectsError) {
        console.error('[SUBJECTS_API_ERROR]', subjectsError)
        return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 })
      }

      // Extract subjects from teacher_subjects join
      subjects = data?.map(ts => {
        const subject = extractSubject(ts.subjects as any)
        return subject ? {
          id: subject.id,
          name: subject.name,
          stream_id: subject.stream_id,
          streams: subject.streams
        } : null
      }).filter(Boolean) || []

      console.log(`[SUBJECTS_API_TEACHER] teacher_id=${teacher.id} subjects_count=${subjects.length}`)
    }

    return NextResponse.json({ subjects }, { status: 200 })
  } catch (error) {
    console.error('[SUBJECTS_API_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
