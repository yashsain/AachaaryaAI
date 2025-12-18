import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { uploadFile, generateMaterialPath, STORAGE_BUCKETS } from '@/lib/storage/storageService'

/**
 * POST /api/materials/upload
 *
 * Uploads a material file and creates database records
 * Enforces role-based access control:
 * - Admin: Can upload for any subject
 * - Teacher: Can only upload for their assigned subjects
 *
 * Request Body (multipart/form-data):
 * - title: string (required)
 * - material_type_id: string (required)
 * - subject_id: string (required)
 * - stream_id: string (required)
 * - class_id: string (required)
 * - chapter_ids: string (required, comma-separated UUIDs)
 * - file: File (required, PDF only)
 *
 * Response:
 * - 201: { success: true, material_id: string }
 * - 400: Validation errors
 * - 403: Access denied
 * - 500: Server error
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

    // Parse form data
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (err) {
      console.error('[MATERIALS_UPLOAD_FORMDATA_ERROR]', err)
      return NextResponse.json({
        error: 'Failed to parse upload data. Please ensure the file is a valid PDF and under 50MB.'
      }, { status: 400 })
    }

    const title = formData.get('title') as string
    const material_type_id = formData.get('material_type_id') as string
    const subject_id = formData.get('subject_id') as string
    const stream_id = formData.get('stream_id') as string
    const class_id = formData.get('class_id') as string
    const chapter_ids_str = formData.get('chapter_ids') as string
    const file = formData.get('file') as File

    // Validation
    const errors: Record<string, string> = {}

    if (!title || title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters'
    }
    if (!material_type_id) {
      errors.material_type_id = 'Material type is required'
    }
    if (!subject_id) {
      errors.subject_id = 'Subject is required'
    }
    if (!stream_id) {
      errors.stream_id = 'Stream is required'
    }
    if (!class_id) {
      errors.class_id = 'Class is required'
    }
    if (!chapter_ids_str) {
      errors.chapter_ids = 'At least one chapter must be selected'
    }
    if (!file) {
      errors.file = 'File is required'
    } else if (file.type !== 'application/pdf') {
      errors.file = 'Only PDF files are allowed'
    } else if (file.size > 50 * 1024 * 1024) {
      errors.file = 'File size must not exceed 50MB'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 })
    }

    const chapter_ids = chapter_ids_str.split(',').filter(id => id.trim())
    if (chapter_ids.length === 0) {
      return NextResponse.json({ error: 'At least one chapter must be selected' }, { status: 400 })
    }

    console.log(`[MATERIALS_UPLOAD] user_id=${teacher.id} role=${teacher.role} subject_id=${subject_id} title="${title}" chapters=${chapter_ids.length} file_size=${file.size}`)

    // If teacher, verify they have access to this subject
    if (teacher.role !== 'admin') {
      const { data: teacherSubject, error: accessError } = await supabaseAdmin
        .from('teacher_subjects')
        .select('id')
        .eq('teacher_id', teacher.id)
        .eq('subject_id', subject_id)
        .single()

      if (accessError || !teacherSubject) {
        console.log(`[MATERIALS_UPLOAD_ACCESS_DENIED] teacher_id=${teacher.id} subject_id=${subject_id}`)
        return NextResponse.json({ error: 'You do not have permission to upload materials for this subject' }, { status: 403 })
      }
    }

    // Generate material ID
    const { data: materialIdData } = await supabaseAdmin
      .rpc('uuid_generate_v4')

    const material_id = materialIdData || crypto.randomUUID()

    // Generate storage path
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const storagePath = generateMaterialPath(teacher.institute_id, material_id, filename)

    console.log(`[MATERIALS_UPLOAD] Uploading file to storage: ${storagePath}`)

    // Upload file to Supabase Storage
    const uploadStartTime = Date.now()
    const { url, error: uploadError } = await uploadFile(
      STORAGE_BUCKETS.MATERIALS,
      storagePath,
      file
    )

    if (uploadError || !url) {
      console.error(`[MATERIALS_UPLOAD_STORAGE_ERROR]`, uploadError)
      return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 })
    }

    const uploadDuration = Date.now() - uploadStartTime
    console.log(`[MATERIALS_UPLOAD_STORAGE_SUCCESS] duration=${uploadDuration}ms url=${url}`)

    // Create material record
    const { data: material, error: materialError } = await supabaseAdmin
      .from('materials')
      .insert({
        id: material_id,
        institute_id: teacher.institute_id,
        stream_id,
        class_id,
        subject_id,
        uploaded_by: teacher.id,
        material_type_id,
        title: title.trim(),
        file_url: url,
        content_text: null // Will be extracted later if needed
      })
      .select()
      .single()

    if (materialError) {
      console.error(`[MATERIALS_UPLOAD_DB_ERROR]`, materialError)
      // Try to cleanup uploaded file
      await supabaseAdmin.storage.from(STORAGE_BUCKETS.MATERIALS).remove([storagePath])
      return NextResponse.json({ error: 'Failed to create material record' }, { status: 500 })
    }

    console.log(`[MATERIALS_UPLOAD_DB_SUCCESS] material_id=${material_id}`)

    // Create material_chapters records
    const materialChapters = chapter_ids.map(chapter_id => ({
      material_id,
      chapter_id: chapter_id.trim()
    }))

    const { error: chaptersError } = await supabaseAdmin
      .from('material_chapters')
      .insert(materialChapters)

    if (chaptersError) {
      console.error(`[MATERIALS_UPLOAD_CHAPTERS_ERROR]`, chaptersError)
      // Material is created but chapters not linked - return success but log error
      console.warn(`[MATERIALS_UPLOAD_WARNING] Material created but chapter linking failed`)
    } else {
      console.log(`[MATERIALS_UPLOAD_CHAPTERS_SUCCESS] linked_chapters=${chapter_ids.length}`)
    }

    const totalDuration = Date.now() - uploadStartTime
    console.log(`[MATERIALS_UPLOAD_COMPLETE] material_id=${material_id} total_duration=${totalDuration}ms`)

    return NextResponse.json({
      success: true,
      material_id,
      message: 'Material uploaded successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('[MATERIALS_UPLOAD_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
