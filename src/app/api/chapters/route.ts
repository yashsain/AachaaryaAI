import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/chapters?subject_id=<uuid>
 *
 * Returns chapters for a given subject
 * Used for: Chapter multi-select in material upload form
 *
 * Query Parameters:
 * - subject_id (required): UUID of the subject
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

    // Get subject_id from query params
    const { searchParams } = new URL(request.url)
    const subject_id = searchParams.get('subject_id')

    if (!subject_id) {
      return NextResponse.json({ error: 'subject_id query parameter is required' }, { status: 400 })
    }

    console.log(`[CHAPTERS_API] user_id=${teacher.id} role=${teacher.role} subject_id=${subject_id}`)

    // If teacher, verify they have access to this subject
    if (teacher.role !== 'admin') {
      const { data: teacherSubject, error: accessError } = await supabaseAdmin
        .from('teacher_subjects')
        .select('id')
        .eq('teacher_id', teacher.id)
        .eq('subject_id', subject_id)
        .single()

      if (accessError || !teacherSubject) {
        console.log(`[CHAPTERS_API_ACCESS_DENIED] teacher_id=${teacher.id} subject_id=${subject_id}`)
        return NextResponse.json({ error: 'You do not have access to this subject' }, { status: 403 })
      }
    }

    // Fetch chapters for the subject
    const { data: chapters, error: chaptersError } = await supabaseAdmin
      .from('chapters')
      .select('id, name, subject_id, class_level_id')
      .eq('subject_id', subject_id)
      .order('name', { ascending: true })

    if (chaptersError) {
      console.error('[CHAPTERS_API_ERROR]', chaptersError)
      return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 })
    }

    console.log(`[CHAPTERS_API_SUCCESS] subject_id=${subject_id} chapters_count=${chapters?.length || 0}`)

    return NextResponse.json({ chapters }, { status: 200 })
  } catch (error) {
    console.error('[CHAPTERS_API_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
