import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { generateMaterialPath, STORAGE_BUCKETS } from '@/lib/storage/storageService'

/**
 * POST /api/materials/signed-upload-url
 *
 * Generates a signed upload URL for direct client-to-storage uploads
 * This bypasses Next.js body size limitations (allows 50MB+ files)
 *
 * Flow:
 * 1. Client requests signed URL (only metadata, no file)
 * 2. Server validates permissions and generates signed URL
 * 3. Client uploads file directly to Supabase Storage
 * 4. Client calls /api/materials/finalize-upload to create DB records
 */
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

    // Parse request body (small JSON, not file)
    const body = await request.json()
    const { fileName, subject_id } = body

    if (!fileName || !subject_id) {
      return NextResponse.json({
        error: 'fileName and subject_id are required'
      }, { status: 400 })
    }

    // Validate permissions: if teacher (non-admin), check subject access
    if (teacher.role !== 'admin') {
      const { data: teacherSubject, error: accessError } = await supabaseAdmin
        .from('teacher_subjects')
        .select('id')
        .eq('teacher_id', teacher.id)
        .eq('subject_id', subject_id)
        .single()

      if (accessError || !teacherSubject) {
        return NextResponse.json({
          error: 'You do not have permission to upload materials for this subject'
        }, { status: 403 })
      }
    }

    // Generate material ID and storage path
    const material_id = crypto.randomUUID()
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filename = `${Date.now()}_${sanitizedFileName}`
    const storagePath = generateMaterialPath(teacher.institute_id, material_id, filename)

    console.log(`[SIGNED_URL_REQUEST] material_id=${material_id} teacher_id=${teacher.id} subject_id=${subject_id}`)

    // Create signed upload URL (valid for 2 hours = 7200 seconds)
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.MATERIALS)
      .createSignedUploadUrl(storagePath)

    if (signedUrlError || !signedUrlData) {
      console.error('[SIGNED_URL_ERROR]', signedUrlError)
      return NextResponse.json({
        error: 'Failed to generate upload URL'
      }, { status: 500 })
    }

    console.log(`[SIGNED_URL_CREATED] material_id=${material_id} path=${storagePath}`)

    return NextResponse.json({
      material_id,
      signedUrl: signedUrlData.signedUrl,
      token: signedUrlData.token,
      path: storagePath,
      institute_id: teacher.institute_id
    }, { status: 200 })
  } catch (error) {
    console.error('[SIGNED_URL_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
