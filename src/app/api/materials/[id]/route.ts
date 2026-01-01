import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { deleteFile, extractPathFromUrl, STORAGE_BUCKETS } from '@/lib/storage/storageService'

// Type definitions for Supabase joins
interface MaterialType {
  id: string
  name: string
}

interface Subject {
  id: string
  name: string
}

interface Teacher {
  id: string
  name: string
}

interface Chapter {
  id: string
  name: string
}

// Helper functions to safely extract join data
function extractMaterialType(data: MaterialType | MaterialType[] | null): MaterialType | null {
  if (!data) return null
  return Array.isArray(data) ? data[0] : data
}

function extractSubject(data: Subject | Subject[] | null): Subject | null {
  if (!data) return null
  return Array.isArray(data) ? data[0] : data
}

function extractTeacher(data: Teacher | Teacher[] | null): Teacher | null {
  if (!data) return null
  return Array.isArray(data) ? data[0] : data
}

function extractChapter(data: Chapter | Chapter[] | null): Chapter | null {
  if (!data) return null
  return Array.isArray(data) ? data[0] : data
}

/**
 * GET /api/materials/[id]
 *
 * Returns full material details with all relations
 * Enforces role-based access control
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: material_id } = await params
    // Get session from cookies
    const supabase = createServerClient(await cookies())
    const { data: { user }, error: authError } = await supabase.auth.getUser()

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

    console.log(`[MATERIALS_GET] user_id=${teacher.id} material_id=${material_id}`)

    // Fetch material with all relations
    const { data: material, error: materialError } = await supabaseAdmin
      .from('materials')
      .select(`
        id,
        title,
        file_url,
        created_at,
        subject_id,
        stream_id,
        class_id,
        material_type_id,
        uploaded_by,
        institute_id,
        material_types (
          id,
          name
        ),
        subjects (
          id,
          name
        ),
        teachers (
          id,
          name
        )
      `)
      .eq('id', material_id)
      .eq('institute_id', teacher.institute_id)
      .single()

    if (materialError || !material) {
      console.log(`[MATERIALS_GET_NOT_FOUND] material_id=${material_id}`)
      return NextResponse.json({ error: 'Material not found' }, { status: 404 })
    }

    // Check permissions
    if (teacher.role !== 'admin') {
      const { data: teacherSubject, error: accessError } = await supabaseAdmin
        .from('teacher_subjects')
        .select('id')
        .eq('teacher_id', teacher.id)
        .eq('subject_id', material.subject_id)
        .single()

      if (accessError || !teacherSubject) {
        console.log(`[MATERIALS_GET_ACCESS_DENIED] teacher_id=${teacher.id} subject_id=${material.subject_id}`)
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Fetch chapters for this material
    const { data: materialChapters, error: chaptersError } = await supabaseAdmin
      .from('material_chapters')
      .select(`
        chapter_id,
        chapters (
          id,
          name
        )
      `)
      .eq('material_id', material_id)

    if (chaptersError) {
      console.error(`[MATERIALS_GET_CHAPTERS_ERROR]`, chaptersError)
    }

    const chapters = materialChapters?.map(mc => {
      const chapter = extractChapter(mc.chapters as any)
      return chapter ? { id: chapter.id, name: chapter.name } : null
    }).filter(Boolean) || []

    // Extract joined data
    const materialType = extractMaterialType(material.material_types as any)
    const subject = extractSubject(material.subjects as any)
    const uploader = extractTeacher(material.teachers as any)

    // Build response
    const response = {
      id: material.id,
      title: material.title,
      file_url: material.file_url,
      created_at: material.created_at,
      subject_id: material.subject_id,
      stream_id: material.stream_id,
      class_id: material.class_id,
      material_type: {
        id: materialType?.id || material.material_type_id,
        name: materialType?.name || 'Unknown'
      },
      subject: {
        id: subject?.id || material.subject_id,
        name: subject?.name || 'Unknown'
      },
      uploaded_by: {
        id: uploader?.id || material.uploaded_by,
        name: uploader?.name || 'Unknown'
      },
      chapters
    }

    console.log(`[MATERIALS_GET_SUCCESS] material_id=${material_id} chapters_count=${chapters.length}`)

    return NextResponse.json({ material: response }, { status: 200 })
  } catch (error) {
    console.error('[MATERIALS_GET_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/materials/[id]
 *
 * Updates material metadata (title, material_type_id, chapters)
 * File cannot be changed after upload
 * Only admin or uploader can edit
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: material_id } = await params

    // Get session from cookies
    const supabase = createServerClient(await cookies())
    const { data: { user }, error: authError } = await supabase.auth.getUser()

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

    // Fetch existing material
    const { data: material, error: materialError } = await supabaseAdmin
      .from('materials')
      .select('id, uploaded_by, subject_id, institute_id')
      .eq('id', material_id)
      .eq('institute_id', teacher.institute_id)
      .single()

    if (materialError || !material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 })
    }

    // Check permissions: admin or uploader only
    if (teacher.role !== 'admin' && material.uploaded_by !== teacher.id) {
      console.log(`[MATERIALS_PATCH_ACCESS_DENIED] user_id=${teacher.id} uploader=${material.uploaded_by}`)
      return NextResponse.json({ error: 'You can only edit materials you uploaded' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { title, material_type_id, chapter_ids } = body

    console.log(`[MATERIALS_PATCH] user_id=${teacher.id} material_id=${material_id}`)

    // Update material record
    const updates: any = {}
    if (title !== undefined) {
      if (title.trim().length < 3) {
        return NextResponse.json({ error: 'Title must be at least 3 characters' }, { status: 400 })
      }
      updates.title = title.trim()
    }
    if (material_type_id !== undefined) {
      updates.material_type_id = material_type_id
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('materials')
        .update(updates)
        .eq('id', material_id)

      if (updateError) {
        console.error(`[MATERIALS_PATCH_UPDATE_ERROR]`, updateError)
        return NextResponse.json({ error: 'Failed to update material' }, { status: 500 })
      }

      console.log(`[MATERIALS_PATCH_UPDATE_SUCCESS] material_id=${material_id} fields=${Object.keys(updates).join(',')}`)
    }

    // Update chapters if provided
    if (chapter_ids && Array.isArray(chapter_ids) && chapter_ids.length > 0) {
      // Delete existing chapter links
      const { error: deleteError } = await supabaseAdmin
        .from('material_chapters')
        .delete()
        .eq('material_id', material_id)

      if (deleteError) {
        console.error(`[MATERIALS_PATCH_CHAPTERS_DELETE_ERROR]`, deleteError)
      }

      // Insert new chapter links
      const materialChapters = chapter_ids.map(chapter_id => ({
        material_id,
        chapter_id
      }))

      const { error: insertError } = await supabaseAdmin
        .from('material_chapters')
        .insert(materialChapters)

      if (insertError) {
        console.error(`[MATERIALS_PATCH_CHAPTERS_INSERT_ERROR]`, insertError)
        return NextResponse.json({ error: 'Failed to update chapters' }, { status: 500 })
      }

      console.log(`[MATERIALS_PATCH_CHAPTERS_SUCCESS] material_id=${material_id} chapters_count=${chapter_ids.length}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Material updated successfully'
    }, { status: 200 })
  } catch (error) {
    console.error('[MATERIALS_PATCH_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/materials/[id]
 *
 * Deletes material and associated file from storage
 * Only admin or uploader can delete
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: material_id } = await params

    // Get session from cookies
    const supabase = createServerClient(await cookies())
    const { data: { user }, error: authError } = await supabase.auth.getUser()

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

    // Fetch existing material
    const { data: material, error: materialError } = await supabaseAdmin
      .from('materials')
      .select('id, file_url, uploaded_by, institute_id')
      .eq('id', material_id)
      .eq('institute_id', teacher.institute_id)
      .single()

    if (materialError || !material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 })
    }

    // Check permissions: admin or uploader only
    if (teacher.role !== 'admin' && material.uploaded_by !== teacher.id) {
      console.log(`[MATERIALS_DELETE_ACCESS_DENIED] user_id=${teacher.id} uploader=${material.uploaded_by}`)
      return NextResponse.json({ error: 'You can only delete materials you uploaded' }, { status: 403 })
    }

    console.log(`[MATERIALS_DELETE] user_id=${teacher.id} material_id=${material_id}`)

    // Delete material_chapters records (cascade should handle this, but explicit is safer)
    await supabaseAdmin
      .from('material_chapters')
      .delete()
      .eq('material_id', material_id)

    // Delete material record
    const { error: deleteError } = await supabaseAdmin
      .from('materials')
      .delete()
      .eq('id', material_id)

    if (deleteError) {
      console.error(`[MATERIALS_DELETE_DB_ERROR]`, deleteError)
      return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 })
    }

    console.log(`[MATERIALS_DELETE_DB_SUCCESS] material_id=${material_id}`)

    // Delete file from storage
    const storagePath = extractPathFromUrl(material.file_url)
    if (storagePath) {
      const { success, error: storageError } = await deleteFile(
        STORAGE_BUCKETS.MATERIALS,
        storagePath
      )

      if (!success) {
        console.error(`[MATERIALS_DELETE_STORAGE_ERROR]`, storageError)
        // Don't fail the request, file might already be deleted
      } else {
        console.log(`[MATERIALS_DELETE_STORAGE_SUCCESS] path=${storagePath}`)
      }
    }

    console.log(`[MATERIALS_DELETE_COMPLETE] material_id=${material_id}`)

    return NextResponse.json({
      success: true,
      message: 'Material deleted successfully'
    }, { status: 200 })
  } catch (error) {
    console.error('[MATERIALS_DELETE_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
