import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { STORAGE_BUCKETS } from '@/lib/storage/storageService'

/**
 * POST /api/materials/finalize-upload
 *
 * Creates database records after successful direct upload to Supabase Storage
 * Called by client after file upload completes
 *
 * If database operations fail, attempts to cleanup the uploaded file
 */
export async function POST(request: NextRequest) {
  try {
    // Get session from cookies
    const supabase = createServerClient(await cookies())
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const {
      material_id,
      institute_id,
      storage_path,
      title,
      material_type,
      subject_id,
      stream_id,
      class_ids,
      chapter_ids
    } = body

    // Validation
    const errors: Record<string, string> = {}

    if (!material_id) errors.material_id = 'Material ID is required'
    if (!institute_id) errors.institute_id = 'Institute ID is required'
    if (!storage_path) errors.storage_path = 'Storage path is required'
    if (!title || title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters'
    }
    if (!material_type || !['scope', 'style'].includes(material_type)) {
      errors.material_type = 'Material type must be "scope" or "style"'
    }
    if (!subject_id) errors.subject_id = 'Subject is required'
    if (!stream_id) errors.stream_id = 'Stream is required'
    if (!class_ids || !Array.isArray(class_ids) || class_ids.length === 0) {
      errors.class_ids = 'At least one class must be selected'
    }
    if (!chapter_ids || !Array.isArray(chapter_ids) || chapter_ids.length === 0) {
      errors.chapter_ids = 'At least one chapter must be selected'
    }

    if (Object.keys(errors).length > 0) {
      console.error('[FINALIZE_VALIDATION_ERROR]', errors)
      return NextResponse.json({
        error: 'Validation failed',
        errors
      }, { status: 400 })
    }

    // Verify teacher exists and has permission
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('id, role, institute_id')
      .eq('id', user.id)
      .is('deleted_at', null)
      .single()

    if (teacherError || !teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    // Verify institute matches
    if (teacher.institute_id !== institute_id) {
      console.error('[FINALIZE_INSTITUTE_MISMATCH]', {
        teacher_institute: teacher.institute_id,
        provided_institute: institute_id
      })
      return NextResponse.json({
        error: 'Institute ID mismatch'
      }, { status: 403 })
    }

    console.log(`[FINALIZE_START] material_id=${material_id} teacher_id=${teacher.id} material_type=${material_type}`)

    // Get public URL for the uploaded file
    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKETS.MATERIALS)
      .getPublicUrl(storage_path)

    // Create material record (no class_id - using material_classes junction table)
    const { data: material, error: materialError } = await supabaseAdmin
      .from('materials')
      .insert({
        id: material_id,
        institute_id,
        stream_id,
        subject_id,
        uploaded_by: user.id,
        material_type: material_type as 'scope' | 'style', // Use enum directly
        title: title.trim(),
        file_url: urlData.publicUrl,
        content_text: null  // Will be populated later by OCR/extraction
      })
      .select()
      .single()

    if (materialError) {
      console.error('[FINALIZE_MATERIAL_ERROR]', materialError)

      // Try to cleanup uploaded file
      console.log(`[FINALIZE_CLEANUP] Attempting to remove orphaned file: ${storage_path}`)
      await supabaseAdmin.storage
        .from(STORAGE_BUCKETS.MATERIALS)
        .remove([storage_path])

      return NextResponse.json({
        error: 'Failed to create material record'
      }, { status: 500 })
    }

    // Create material_classes records (many-to-many relationship)
    const materialClasses = class_ids.map((class_id: string) => ({
      material_id,
      class_id: class_id.trim()
    }))

    const { error: classesError } = await supabaseAdmin
      .from('material_classes')
      .insert(materialClasses)

    if (classesError) {
      console.error('[FINALIZE_CLASSES_ERROR]', classesError)
      console.warn('[FINALIZE_WARNING] Material created but class linking failed')
      // Don't fail the entire request - material is created, classes can be fixed later
    } else {
      console.log(`[FINALIZE_CLASSES_SUCCESS] Linked material to ${class_ids.length} class(es)`)
    }

    // Create material_chapters records
    const materialChapters = chapter_ids.map((chapter_id: string) => ({
      material_id,
      chapter_id: chapter_id.trim()
    }))

    const { error: chaptersError } = await supabaseAdmin
      .from('material_chapters')
      .insert(materialChapters)

    if (chaptersError) {
      console.error('[FINALIZE_CHAPTERS_ERROR]', chaptersError)
      console.warn('[FINALIZE_WARNING] Material created but chapter linking failed')
      // Don't fail the entire request - material is created, chapters can be fixed later
    }

    // Trigger background analysis for each chapter
    // This analyzes the uploaded material and updates chapter_knowledge
    if (!chaptersError && chapter_ids.length > 0) {
      console.log('[FINALIZE] Triggering analysis for', chapter_ids.length, 'chapters')

      // Import orchestrator dynamically to avoid circular dependencies
      const { analyzeChapterMaterials } = await import('@/lib/ai/analysisOrchestrator')

      // Run analyses in parallel, don't block upload response
      const analysisPromises = chapter_ids.map((chapterId: string) =>
        analyzeChapterMaterials(chapterId, institute_id, material_id)
          .then(result => {
            if (result.success) {
              if ((result as any).skipped) {
                console.log(`[FINALIZE_ANALYSIS_SKIPPED] chapter=${chapterId} reason=${(result as any).reason}`)
              } else {
                console.log(`[FINALIZE_ANALYSIS_SUCCESS] chapter=${chapterId} materials=${result.materials_analyzed}`)
              }
            } else {
              console.error(`[FINALIZE_ANALYSIS_FAILED] chapter=${chapterId} error=${result.error}`)
            }
            return result
          })
          .catch(error => {
            console.error(`[FINALIZE_ANALYSIS_ERROR] chapter=${chapterId}`, error)
            return { success: false, error: error.message }
          })
      )

      // Run in background, don't await
      Promise.allSettled(analysisPromises).then(results => {
        const analyzed = results.filter(r => r.status === 'fulfilled' && r.value.success && !(r.value as any).skipped).length
        const skipped = results.filter(r => r.status === 'fulfilled' && (r.value as any).skipped).length
        console.log(`[FINALIZE_ANALYSIS_COMPLETE] analyzed=${analyzed} skipped=${skipped} total=${chapter_ids.length}`)
      })
    }

    console.log(`[FINALIZE_SUCCESS] material_id=${material_id} title="${title.trim()}" classes=${class_ids.length} chapters=${chapter_ids.length}`)

    return NextResponse.json({
      success: true,
      material_id,
      message: 'Material uploaded successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('[FINALIZE_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
