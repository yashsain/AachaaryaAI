import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { deleteTeacher } from '@/lib/auth/teacherAccount'

// GET - Fetch single teacher for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teacherId } = await params

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

    // Get admin's teacher record to verify role
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

    // Fetch teacher with subjects and classes
    const { data: teacher, error: fetchError } = await supabaseAdmin
      .from('teachers')
      .select(`
        id,
        name,
        email,
        phone,
        role,
        institute_id,
        teacher_subjects (
          subject_id
        ),
        teacher_classes (
          class_id
        )
      `)
      .eq('id', teacherId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Verify teacher belongs to admin's institute
    if (teacher.institute_id !== adminTeacher.institute_id) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    return NextResponse.json({ teacher }, { status: 200 })
  } catch (error) {
    console.error('GET /api/admin/teachers/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update teacher details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teacherId } = await params

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

    // Get the teacher to be updated and verify they belong to admin's institute
    const { data: teacherToUpdate, error: fetchError } = await supabaseAdmin
      .from('teachers')
      .select('id, institute_id, email')
      .eq('id', teacherId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !teacherToUpdate) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    if (teacherToUpdate.institute_id !== adminTeacher.institute_id) {
      return NextResponse.json(
        { error: 'Cannot update teacher from another institute' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { name, phone, role, subject_ids, class_ids } = body

    // Validation
    if (role && role !== 'teacher' && role !== 'admin') {
      return NextResponse.json(
        { error: 'Role must be either "teacher" or "admin"' },
        { status: 400 }
      )
    }

    // Update teacher record
    const updateData: any = {}
    if (name) updateData.name = name
    if (phone !== undefined) updateData.phone = phone || null
    if (role) updateData.role = role

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('teachers')
        .update(updateData)
        .eq('id', teacherId)

      if (updateError) {
        console.error('Error updating teacher:', updateError)
        return NextResponse.json(
          { error: 'Failed to update teacher' },
          { status: 500 }
        )
      }
    }

    // Update subjects if provided
    if (subject_ids && Array.isArray(subject_ids)) {
      // Delete existing subject assignments
      await supabaseAdmin
        .from('teacher_subjects')
        .delete()
        .eq('teacher_id', teacherId)

      // Create new subject assignments
      if (subject_ids.length > 0) {
        const subjectRecords = subject_ids.map((subject_id: string) => ({
          teacher_id: teacherId,
          subject_id,
        }))

        const { error: subjectsError } = await supabaseAdmin
          .from('teacher_subjects')
          .insert(subjectRecords)

        if (subjectsError) {
          console.error('Error updating teacher_subjects:', subjectsError)
        }
      }
    }

    // Update classes if provided
    if (class_ids && Array.isArray(class_ids)) {
      // Delete existing class assignments
      await supabaseAdmin
        .from('teacher_classes')
        .delete()
        .eq('teacher_id', teacherId)

      // Create new class assignments
      if (class_ids.length > 0) {
        const classRecords = class_ids.map((class_id: string) => ({
          teacher_id: teacherId,
          class_id,
        }))

        const { error: classesError } = await supabaseAdmin
          .from('teacher_classes')
          .insert(classRecords)

        if (classesError) {
          console.error('Error updating teacher_classes:', classesError)
        }
      }
    }

    // Fetch updated teacher with subjects
    const { data: updatedTeacher, error: fetchUpdatedError } = await supabaseAdmin
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
      .eq('id', teacherId)
      .single()

    if (fetchUpdatedError) {
      console.error('Error fetching updated teacher:', fetchUpdatedError)
    }

    return NextResponse.json(
      {
        message: 'Teacher updated successfully',
        teacher: updatedTeacher,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('PATCH /api/admin/teachers/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Soft delete teacher
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teacherId } = await params

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

    // Prevent admin from deleting themselves
    if (teacherId === adminTeacher.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Get the teacher to be deleted and verify they belong to admin's institute
    const { data: teacherToDelete, error: fetchError } = await supabaseAdmin
      .from('teachers')
      .select('id, institute_id, email')
      .eq('id', teacherId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !teacherToDelete) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    if (teacherToDelete.institute_id !== adminTeacher.institute_id) {
      return NextResponse.json(
        { error: 'Cannot delete teacher from another institute' },
        { status: 403 }
      )
    }

    // Step 1: Delete teacher_subjects records
    const { error: subjectsDeleteError } = await supabaseAdmin
      .from('teacher_subjects')
      .delete()
      .eq('teacher_id', teacherId)

    if (subjectsDeleteError) {
      console.error('Error deleting teacher_subjects:', subjectsDeleteError)
      // Continue anyway
    }

    // Step 2: Delete teacher_classes records
    const { error: classesDeleteError } = await supabaseAdmin
      .from('teacher_classes')
      .delete()
      .eq('teacher_id', teacherId)

    if (classesDeleteError) {
      console.error('Error deleting teacher_classes:', classesDeleteError)
      // Continue anyway
    }

    // Step 3: Soft delete teacher and free up email
    // This mangles the email to allow reuse: email@example.com -> email@example.com.deleted.{timestamp}
    // Updates both teachers table and auth.users
    const result = await deleteTeacher(teacherId)

    if (!result.success) {
      console.error('Error deleting teacher:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to delete teacher' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Teacher deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/admin/teachers/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
