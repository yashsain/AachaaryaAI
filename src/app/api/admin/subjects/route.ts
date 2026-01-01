import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET - List all subjects (for dropdown in teacher form)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(await cookies())
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Verify user has a valid teacher profile
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('id, role')
      .eq('id', user.id)
      .is('deleted_at', null)
      .single()

    if (teacherError || !teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    // Verify admin role
    if (teacher.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Fetch all subjects with their streams
    const { data: subjects, error: subjectsError } = await supabaseAdmin
      .from('subjects')
      .select(`
        id,
        name,
        stream_id,
        streams (
          id,
          name
        )
      `)
      .order('name', { ascending: true })

    if (subjectsError) {
      console.error('Error fetching subjects:', subjectsError)
      return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 })
    }

    return NextResponse.json({ subjects }, { status: 200 })
  } catch (error) {
    console.error('GET /api/admin/subjects error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
