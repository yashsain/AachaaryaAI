import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import type { Teacher } from '@/types/database'

// GET - List all teachers for admin's institute
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

    // Get admin's teacher record to verify role and institute_id
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

    // Fetch all teachers for this institute (exclude soft-deleted)
    const { data: teachers, error: teachersError } = await supabaseAdmin
      .from('teachers')
      .select(`
        id,
        name,
        email,
        phone,
        role,
        created_at,
        teacher_subjects (
          subject_id,
          subjects (
            id,
            name
          )
        )
      `)
      .eq('institute_id', adminTeacher.institute_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (teachersError) {
      console.error('Error fetching teachers:', teachersError)
      return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 })
    }

    return NextResponse.json({ teachers }, { status: 200 })
  } catch (error) {
    console.error('GET /api/admin/teachers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new teacher with email invitation
export async function POST(request: NextRequest) {
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

    // Get admin's teacher record to verify role and institute_id
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

    // Parse request body
    const body = await request.json()
    const { name, email, phone, role, subject_ids, class_ids } = body

    // Validation
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      )
    }

    if (role !== 'teacher' && role !== 'admin') {
      return NextResponse.json(
        { error: 'Role must be either "teacher" or "admin"' },
        { status: 400 }
      )
    }

    // Subjects are now optional
    // if (!subject_ids || !Array.isArray(subject_ids) || subject_ids.length === 0) {
    //   return NextResponse.json(
    //     { error: 'At least one subject must be assigned' },
    //     { status: 400 }
    //   )
    // }

    // Check if email already exists in teachers table (excluding soft-deleted)
    const { data: existingTeacher } = await supabaseAdmin
      .from('teachers')
      .select('id, email')
      .eq('email', email)
      .is('deleted_at', null)
      .single()

    if (existingTeacher) {
      return NextResponse.json(
        { error: 'A teacher with this email already exists' },
        { status: 409 }
      )
    }

    // Step 1: Create user in Supabase Auth and send invitation email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const { data: authUser, error: createAuthError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          name,
          institute_id: adminTeacher.institute_id,
        },
        // IMPORTANT: Include ?type=invite so the callback handler knows this is an invitation
        redirectTo: `${appUrl}/auth/callback?type=invite`,
      }
    )

    if (createAuthError || !authUser.user) {
      console.error('Error creating auth user:', createAuthError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Step 2: Create teacher record in teachers table
    const { data: newTeacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .insert({
        id: authUser.user.id, // Use auth user ID
        institute_id: adminTeacher.institute_id,
        name,
        email,
        phone: phone || null,
        role,
        password_hash: '', // Not used with Supabase Auth, but required by schema
      })
      .select()
      .single()

    if (teacherError) {
      console.error('Error creating teacher record:', teacherError)
      // Rollback: Delete auth user if teacher record fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json(
        { error: 'Failed to create teacher profile' },
        { status: 500 }
      )
    }

    // Step 3: Create teacher_subjects records (if subjects provided)
    if (subject_ids && Array.isArray(subject_ids) && subject_ids.length > 0) {
      const subjectRecords = subject_ids.map((subject_id: string) => ({
        teacher_id: newTeacher.id,
        subject_id,
      }))

      const { error: subjectsError } = await supabaseAdmin
        .from('teacher_subjects')
        .insert(subjectRecords)

      if (subjectsError) {
        console.error('Error creating teacher_subjects:', subjectsError)
        // Continue anyway - subjects can be added later
      }
    }

    // Step 4: Create teacher_classes records (optional)
    if (class_ids && Array.isArray(class_ids) && class_ids.length > 0) {
      const classRecords = class_ids.map((class_id: string) => ({
        teacher_id: newTeacher.id,
        class_id,
      }))

      const { error: classesError } = await supabaseAdmin
        .from('teacher_classes')
        .insert(classRecords)

      if (classesError) {
        console.error('Error creating teacher_classes:', classesError)
        // Continue anyway - classes can be added later
      }
    }

    return NextResponse.json(
      {
        message: `Invitation sent to ${email}. Teacher can set their password via the email link.`,
        teacher: newTeacher,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/admin/teachers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
