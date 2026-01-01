import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET - List all classes for admin's institute (for dropdown in teacher form)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(await cookies())
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Get admin's teacher record to verify role and get institute_id
    const { data: adminTeacher, error: adminError } = await supabaseAdmin
      .from('teachers')
      .select('id, institute_id, role')
      .eq('id', user.id)
      .is('deleted_at', null)
      .single()

    if (adminError || !adminTeacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    // Verify admin role
    if (adminTeacher.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Fetch all classes for this institute
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
      .eq('institute_id', adminTeacher.institute_id)
      .order('batch_name', { ascending: true })

    if (classesError) {
      console.error('Error fetching classes:', classesError)
      return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
    }

    return NextResponse.json({ classes }, { status: 200 })
  } catch (error) {
    console.error('GET /api/admin/classes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
