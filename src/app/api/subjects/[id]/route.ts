import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * GET /api/subjects/[id]
 *
 * Returns a single subject by ID with stream information
 *
 * Authorization:
 * - Admin: Can access any subject
 * - Teacher: Can access subjects they are assigned to teach
 *
 * Response:
 * - 200: { subject: { id, name, stream_id, streams: { id, name } } }
 * - 401: Invalid session
 * - 403: Access denied (teacher not assigned to subject)
 * - 404: Subject not found or teacher profile not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient(await cookies())

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Get teacher profile with role
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('id, role, institute_id')
      .eq('id', user.id)
      .is('deleted_at', null)
      .single()

    if (teacherError || !teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    const resolvedParams = await params
    const subjectId = resolvedParams.id

    // Fetch subject with stream info from public reference table
    const { data: subject, error: subjectError } = await supabaseAdmin
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
      .eq('id', subjectId)
      .single()

    if (subjectError || !subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    // Authorization: Teachers can only access subjects they teach
    // Admins have access to all subjects (no restrictions)
    if (teacher.role !== 'admin') {
      const { data: assignment, error: assignmentError } = await supabaseAdmin
        .from('teacher_subjects')
        .select('subject_id')
        .eq('teacher_id', teacher.id)
        .eq('subject_id', subjectId)
        .maybeSingle()

      if (assignmentError) {
        console.error('[SUBJECTS_ID_ASSIGNMENT_CHECK]', assignmentError)
        return NextResponse.json({ error: 'Failed to verify subject access' }, { status: 500 })
      }

      if (!assignment) {
        return NextResponse.json({
          error: 'Access denied. You are not assigned to teach this subject.'
        }, { status: 403 })
      }
    }

    // Return subject data
    return NextResponse.json({ subject }, { status: 200 })

  } catch (error) {
    console.error('[SUBJECTS_ID_API_EXCEPTION]', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
