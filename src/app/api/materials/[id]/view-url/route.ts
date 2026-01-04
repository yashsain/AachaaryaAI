import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { extractPathFromUrl, STORAGE_BUCKETS } from '@/lib/storage/storageService'

/**
 * GET /api/materials/[id]/view-url
 *
 * Generates a signed URL for viewing material PDFs
 * Similar to test papers approach - secure time-limited access
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

    console.log(`[MATERIALS_VIEW_URL] user_id=${teacher.id} material_id=${material_id}`)

    // Fetch material
    const { data: material, error: materialError } = await supabaseAdmin
      .from('materials')
      .select('id, file_url, institute_id, subject_id')
      .eq('id', material_id)
      .eq('institute_id', teacher.institute_id)
      .single()

    if (materialError || !material) {
      console.log(`[MATERIALS_VIEW_URL_NOT_FOUND] material_id=${material_id}`)
      return NextResponse.json({ error: 'Material not found' }, { status: 404 })
    }

    // Check permissions for non-admin users
    if (teacher.role !== 'admin') {
      const { data: teacherSubject, error: accessError } = await supabaseAdmin
        .from('teacher_subjects')
        .select('id')
        .eq('teacher_id', teacher.id)
        .eq('subject_id', material.subject_id)
        .single()

      if (accessError || !teacherSubject) {
        console.log(`[MATERIALS_VIEW_URL_ACCESS_DENIED] teacher_id=${teacher.id} subject_id=${material.subject_id}`)
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Extract storage path from file_url
    let storagePath: string
    if (material.file_url.startsWith('http')) {
      // Parse URL to extract path
      const path = extractPathFromUrl(material.file_url)
      if (!path) {
        console.error(`[MATERIALS_VIEW_URL_INVALID] Invalid URL format: ${material.file_url}`)
        return NextResponse.json({ error: 'Invalid file URL format' }, { status: 500 })
      }
      storagePath = path
    } else {
      // Already a storage path
      storagePath = material.file_url
    }

    console.log(`[MATERIALS_VIEW_URL] Generating signed URL for bucket: ${STORAGE_BUCKETS.MATERIALS}, path: ${storagePath}`)

    // First, check if the file exists in storage
    const { data: fileData, error: fileCheckError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.MATERIALS)
      .list(storagePath.split('/').slice(0, -1).join('/'), {
        limit: 100,
        search: storagePath.split('/').pop()
      })

    if (fileCheckError) {
      console.error(`[MATERIALS_VIEW_URL_FILE_CHECK_ERROR]`, fileCheckError)
    } else {
      console.log(`[MATERIALS_VIEW_URL_FILE_EXISTS]`, fileData?.length > 0 ? 'YES' : 'NO', fileData)
    }

    // Generate signed URL (1 hour expiry)
    const { data: signedUrlData, error: signedError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.MATERIALS)
      .createSignedUrl(storagePath, 3600)

    if (signedError || !signedUrlData) {
      console.error(`[MATERIALS_VIEW_URL_SIGN_ERROR]`, signedError)
      return NextResponse.json({
        error: `Failed to generate view URL: ${signedError?.message || 'Unknown error'}. Bucket: ${STORAGE_BUCKETS.MATERIALS}, Path: ${storagePath}`
      }, { status: 500 })
    }

    console.log(`[MATERIALS_VIEW_URL_SUCCESS] material_id=${material_id}, signed_url=${signedUrlData.signedUrl.substring(0, 100)}...`)

    return NextResponse.json({
      success: true,
      view_url: signedUrlData.signedUrl,
      expires_in: 3600
    }, { status: 200 })
  } catch (error) {
    console.error('[MATERIALS_VIEW_URL_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
