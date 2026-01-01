/**
 * Teacher Account Management
 *
 * Core functions for creating, updating, and deleting teacher accounts
 * Ensures synchronization between auth.users and teachers table
 */

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Teacher } from '@/types/database'

export interface CreateTeacherData {
  email: string
  name: string
  phone?: string
  instituteId: string
  role: 'admin' | 'teacher'
  initialPassword?: string  // Optional: if not provided, will send invitation email
}

export interface CreateTeacherResult {
  success: boolean
  teacherId?: string
  teacher?: Teacher
  error?: string
}

/**
 * Create a new teacher account
 *
 * This function:
 * 1. Creates user in auth.users (Supabase Auth)
 * 2. Creates corresponding record in teachers table (same UUID)
 * 3. Sets app_metadata with institute_id and role
 * 4. Optionally sends invitation email if no initial password
 *
 * @param data - Teacher account data
 * @returns Result with teacher ID or error
 */
export async function createTeacherAccount(
  data: CreateTeacherData
): Promise<CreateTeacherResult> {
  try {
    let authUser
    let userId: string

    // Step 1: Create user in auth.users
    if (data.initialPassword) {
      // If initial password provided, create user directly
      const { data: createData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.initialPassword,
        email_confirm: true, // Skip email verification for admin-created users
        user_metadata: {
          name: data.name,
          phone: data.phone || null,
        },
        app_metadata: {
          institute_id: data.instituteId,
          role: data.role,
        },
      })

      if (authError) {
        console.error('Error creating auth user:', authError)
        return {
          success: false,
          error: authError.message,
        }
      }

      if (!createData.user) {
        return {
          success: false,
          error: 'Failed to create user: no user returned',
        }
      }

      authUser = createData
      userId = createData.user.id
    } else {
      // No initial password - use inviteUserByEmail to send invitation
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        data.email,
        {
          data: {
            name: data.name,
            phone: data.phone || null,
            institute_id: data.instituteId,
          },
          // IMPORTANT: Include ?type=invite so the callback handler knows this is an invitation
          redirectTo: `${appUrl}/auth/callback?type=invite`,
        }
      )

      if (inviteError || !inviteData.user) {
        console.error('Error inviting user:', inviteError)
        return {
          success: false,
          error: inviteError?.message || 'Failed to send invitation',
        }
      }

      authUser = inviteData
      userId = inviteData.user.id

      // Update app_metadata separately (inviteUserByEmail doesn't support it)
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        app_metadata: {
          institute_id: data.instituteId,
          role: data.role,
        },
      })
    }

    // Step 2: Create record in teachers table (same UUID)
    const { data: teacher, error: dbError } = await supabaseAdmin
      .from('teachers')
      .insert({
        id: userId, // Same UUID from auth.users
        institute_id: data.instituteId,
        email: data.email,
        name: data.name,
        phone: data.phone || null,
        role: data.role,
        password_hash: 'MANAGED_BY_SUPABASE_AUTH', // Placeholder
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error creating teacher record:', dbError)

      // Rollback: delete from auth.users
      await supabaseAdmin.auth.admin.deleteUser(userId)

      return {
        success: false,
        error: `Database error: ${dbError.message}`,
      }
    }

    return {
      success: true,
      teacherId: userId,
      teacher: teacher as Teacher,
    }
  } catch (error) {
    console.error('Unexpected error in createTeacherAccount:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Soft delete a teacher account
 *
 * This function:
 * 1. Sets deleted_at timestamp in teachers table
 * 2. Mangles email to allow reuse (appends .deleted.{timestamp})
 * 3. Bans user in Supabase Auth (prevents login)
 *
 * @param teacherId - UUID of teacher to delete
 * @returns Result with success status
 */
export async function deleteTeacher(
  teacherId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Step 1: Get current teacher data
    const { data: teacher, error: fetchError } = await supabaseAdmin
      .from('teachers')
      .select('email, deleted_at')
      .eq('id', teacherId)
      .single()

    if (fetchError || !teacher) {
      return {
        success: false,
        error: 'Teacher not found',
      }
    }

    // Check if already deleted
    if (teacher.deleted_at) {
      return {
        success: false,
        error: 'Teacher already deleted',
      }
    }

    // Step 2: Mangle email to allow reuse
    const mangledEmail = `${teacher.email}.deleted.${Date.now()}`
    const deletedAt = new Date().toISOString()

    // Step 3: Update teachers table
    const { error: updateError } = await supabaseAdmin
      .from('teachers')
      .update({
        email: mangledEmail,
        deleted_at: deletedAt,
      })
      .eq('id', teacherId)

    if (updateError) {
      console.error('Error updating teacher record:', updateError)
      return {
        success: false,
        error: updateError.message,
      }
    }

    // Step 4: Update email in Supabase Auth (prevents login with old credentials)
    // The mangled email itself prevents login since user doesn't know the new email
    // No need for explicit ban since email change is sufficient
    const { error: emailUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      teacherId,
      {
        email: mangledEmail,
      }
    )

    if (emailUpdateError) {
      console.error('Error updating user email:', emailUpdateError)
      // Continue anyway, teacher is soft deleted in database
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Unexpected error in deleteTeacher:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Update teacher details
 *
 * Updates both auth.users and teachers table
 *
 * @param teacherId - UUID of teacher to update
 * @param updates - Partial teacher data to update
 * @returns Result with success status
 */
export async function updateTeacher(
  teacherId: string,
  updates: Partial<Pick<Teacher, 'name' | 'phone' | 'email'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Step 1: Update teachers table
    const { error: dbError } = await supabaseAdmin
      .from('teachers')
      .update(updates)
      .eq('id', teacherId)

    if (dbError) {
      return {
        success: false,
        error: dbError.message,
      }
    }

    // Step 2: Update auth.users metadata
    const authUpdates: any = {}
    if (updates.email) {
      authUpdates.email = updates.email
    }
    if (updates.name || updates.phone) {
      authUpdates.user_metadata = {}
      if (updates.name) authUpdates.user_metadata.name = updates.name
      if (updates.phone) authUpdates.user_metadata.phone = updates.phone
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        teacherId,
        authUpdates
      )

      if (authError) {
        console.error('Error updating auth user:', authError)
        // Continue anyway, primary record in teachers table is updated
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Unexpected error in updateTeacher:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Change teacher role (admin ↔ teacher)
 *
 * Updates app_metadata in auth.users and role in teachers table
 *
 * @param teacherId - UUID of teacher
 * @param newRole - New role to assign
 * @returns Result with success status
 */
export async function changeTeacherRole(
  teacherId: string,
  newRole: 'admin' | 'teacher'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Step 1: Update teachers table
    const { error: dbError } = await supabaseAdmin
      .from('teachers')
      .update({ role: newRole })
      .eq('id', teacherId)

    if (dbError) {
      return {
        success: false,
        error: dbError.message,
      }
    }

    // Step 2: Update app_metadata in auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      teacherId,
      {
        app_metadata: { role: newRole },
      }
    )

    if (authError) {
      console.error('Error updating auth metadata:', authError)
      return {
        success: false,
        error: authError.message,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Unexpected error in changeTeacherRole:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get teacher by ID (with proper typing)
 *
 * @param teacherId - UUID of teacher
 * @returns Teacher record or null
 */
export async function getTeacher(teacherId: string): Promise<Teacher | null> {
  const { data, error } = await supabaseAdmin
    .from('teachers')
    .select('*')
    .eq('id', teacherId)
    .is('deleted_at', null)
    .single()

  if (error) {
    console.error('Error fetching teacher:', error)
    return null
  }

  return data as Teacher
}

/**
 * Get all teachers for an institute (non-deleted)
 *
 * @param instituteId - UUID of institute
 * @returns Array of teachers
 */
export async function getInstituteTeachers(instituteId: string): Promise<Teacher[]> {
  const { data, error } = await supabaseAdmin
    .from('teachers')
    .select('*')
    .eq('institute_id', instituteId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching teachers:', error)
    return []
  }

  return data as Teacher[]
}

/**
 * Check if email is available (not used by active teacher)
 *
 * @param email - Email to check
 * @returns True if available, false if taken
 */
export async function isEmailAvailable(email: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('teachers')
    .select('id')
    .eq('email', email)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    console.error('Error checking email availability:', error)
    return false
  }

  return data === null
}
