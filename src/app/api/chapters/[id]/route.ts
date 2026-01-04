import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { deleteFile, extractPathFromUrl, STORAGE_BUCKETS } from '@/lib/storage/storageService'

/**
 * DELETE /api/chapters/[id]
 *
 * Deletes a chapter and all associated data:
 * - Materials exclusive to this chapter (and their S3 files)
 * - Material-chapter links for shared materials
 * - Questions linked to this chapter
 * - Section-chapter links
 * - The chapter itself
 *
 * Only admin or teachers with access to the subject can delete
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chapter_id } = await params

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

    console.log(`[CHAPTERS_DELETE] user_id=${teacher.id} chapter_id=${chapter_id}`)

    // Fetch the chapter with subject info
    const { data: chapter, error: chapterError } = await supabaseAdmin
      .from('chapters')
      .select(`
        id,
        name,
        subject_id,
        subjects (
          id,
          name,
          stream_id
        )
      `)
      .eq('id', chapter_id)
      .single()

    if (chapterError || !chapter) {
      console.log(`[CHAPTERS_DELETE_NOT_FOUND] chapter_id=${chapter_id}`)
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    // Extract subject data
    const subject = Array.isArray(chapter.subjects) ? chapter.subjects[0] : chapter.subjects

    if (!subject) {
      return NextResponse.json({ error: 'Chapter subject not found' }, { status: 404 })
    }

    // Check permissions: admin or teacher with access to this subject
    if (teacher.role !== 'admin') {
      const { data: teacherSubject, error: accessError } = await supabaseAdmin
        .from('teacher_subjects')
        .select('id')
        .eq('teacher_id', teacher.id)
        .eq('subject_id', chapter.subject_id)
        .single()

      if (accessError || !teacherSubject) {
        console.log(`[CHAPTERS_DELETE_ACCESS_DENIED] teacher_id=${teacher.id} subject_id=${chapter.subject_id}`)
        return NextResponse.json({ error: 'You do not have access to delete this chapter' }, { status: 403 })
      }
    }

    console.log(`[CHAPTERS_DELETE_AUTHORIZED] chapter="${chapter.name}" subject="${subject.name}"`)

    // STEP 1: Find all materials linked to this chapter
    const { data: materialLinks, error: linksError } = await supabaseAdmin
      .from('material_chapters')
      .select('material_id')
      .eq('chapter_id', chapter_id)

    if (linksError) {
      console.error(`[CHAPTERS_DELETE_MATERIALS_LINKS_ERROR]`, linksError)
      return NextResponse.json({ error: 'Failed to fetch chapter materials' }, { status: 500 })
    }

    const materialIds = materialLinks?.map(link => link.material_id) || []
    console.log(`[CHAPTERS_DELETE_MATERIALS_FOUND] count=${materialIds.length}`)

    let materialsDeleted = 0
    let filesDeleted = 0
    let linksRemoved = 0

    // STEP 2: Process each material
    for (const material_id of materialIds) {
      // Check how many chapters this material is linked to
      const { data: allChapterLinks, error: countError } = await supabaseAdmin
        .from('material_chapters')
        .select('chapter_id')
        .eq('material_id', material_id)

      if (countError) {
        console.error(`[CHAPTERS_DELETE_MATERIAL_COUNT_ERROR] material_id=${material_id}`, countError)
        continue
      }

      const chapterCount = allChapterLinks?.length || 0

      if (chapterCount === 1) {
        // Material is ONLY linked to this chapter - delete it completely
        const { data: material, error: materialError } = await supabaseAdmin
          .from('materials')
          .select('id, file_url, title, institute_id')
          .eq('id', material_id)
          .single()

        if (materialError || !material) {
          console.error(`[CHAPTERS_DELETE_MATERIAL_FETCH_ERROR] material_id=${material_id}`, materialError)
          continue
        }

        // Verify material belongs to same institute
        if (material.institute_id !== teacher.institute_id) {
          console.warn(`[CHAPTERS_DELETE_MATERIAL_INSTITUTE_MISMATCH] material_id=${material_id}`)
          continue
        }

        // Delete material_chapters link first
        await supabaseAdmin
          .from('material_chapters')
          .delete()
          .eq('material_id', material_id)

        // Delete the material record
        const { error: deleteError } = await supabaseAdmin
          .from('materials')
          .delete()
          .eq('id', material_id)

        if (deleteError) {
          console.error(`[CHAPTERS_DELETE_MATERIAL_DB_ERROR] material_id=${material_id}`, deleteError)
          continue
        }

        console.log(`[CHAPTERS_DELETE_MATERIAL_SUCCESS] material_id=${material_id} title="${material.title}"`)
        materialsDeleted++

        // Delete file from S3
        const storagePath = extractPathFromUrl(material.file_url)
        if (storagePath) {
          const { success, error: storageError } = await deleteFile(
            STORAGE_BUCKETS.MATERIALS,
            storagePath
          )

          if (!success) {
            console.error(`[CHAPTERS_DELETE_STORAGE_ERROR] path=${storagePath}`, storageError)
            // Don't fail the request, file might already be deleted
          } else {
            console.log(`[CHAPTERS_DELETE_STORAGE_SUCCESS] path=${storagePath}`)
            filesDeleted++
          }
        }
      } else {
        // Material is linked to multiple chapters - just remove this chapter link
        const { error: unlinkError } = await supabaseAdmin
          .from('material_chapters')
          .delete()
          .eq('material_id', material_id)
          .eq('chapter_id', chapter_id)

        if (unlinkError) {
          console.error(`[CHAPTERS_DELETE_UNLINK_ERROR] material_id=${material_id}`, unlinkError)
          continue
        }

        console.log(`[CHAPTERS_DELETE_UNLINK_SUCCESS] material_id=${material_id} (${chapterCount} chapters)`)
        linksRemoved++
      }
    }

    // STEP 3: Delete questions linked to this chapter
    const { error: questionsDeleteError, count: questionsCount } = await supabaseAdmin
      .from('questions')
      .delete({ count: 'exact' })
      .eq('chapter_id', chapter_id)

    if (questionsDeleteError) {
      console.error(`[CHAPTERS_DELETE_QUESTIONS_ERROR]`, questionsDeleteError)
      // Continue anyway - questions might not exist
    } else {
      console.log(`[CHAPTERS_DELETE_QUESTIONS_SUCCESS] count=${questionsCount || 0}`)
    }

    // STEP 4: Delete section_chapters links
    const { error: sectionChaptersError, count: sectionLinksCount } = await supabaseAdmin
      .from('section_chapters')
      .delete({ count: 'exact' })
      .eq('chapter_id', chapter_id)

    if (sectionChaptersError) {
      console.error(`[CHAPTERS_DELETE_SECTION_LINKS_ERROR]`, sectionChaptersError)
      // Continue anyway
    } else {
      console.log(`[CHAPTERS_DELETE_SECTION_LINKS_SUCCESS] count=${sectionLinksCount || 0}`)
    }

    // STEP 5: Delete the chapter itself
    const { error: chapterDeleteError } = await supabaseAdmin
      .from('chapters')
      .delete()
      .eq('id', chapter_id)

    if (chapterDeleteError) {
      console.error(`[CHAPTERS_DELETE_CHAPTER_ERROR]`, chapterDeleteError)
      return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 })
    }

    console.log(`[CHAPTERS_DELETE_COMPLETE] chapter_id=${chapter_id} materials_deleted=${materialsDeleted} files_deleted=${filesDeleted} links_removed=${linksRemoved} questions_deleted=${questionsCount || 0} section_links_deleted=${sectionLinksCount || 0}`)

    return NextResponse.json({
      success: true,
      message: `Chapter "${chapter.name}" deleted successfully`,
      details: {
        materials_deleted: materialsDeleted,
        files_deleted: filesDeleted,
        links_removed: linksRemoved,
        questions_deleted: questionsCount || 0,
        section_links_deleted: sectionLinksCount || 0
      }
    }, { status: 200 })
  } catch (error) {
    console.error('[CHAPTERS_DELETE_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
