import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * GET /api/chapters?subject_id=<uuid>&with_materials=<boolean>
 *
 * Returns chapters for a given subject
 * Used for: Chapter multi-select in material upload form and chapter-centric materials view
 *
 * Query Parameters:
 * - subject_id (required): UUID of the subject
 * - with_materials (optional): If true, includes material count and materials list per chapter
 */
export async function GET(request: NextRequest) {
  try {
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

    // Get query params
    const { searchParams } = new URL(request.url)
    const subject_id = searchParams.get('subject_id')
    const with_materials = searchParams.get('with_materials') === 'true'

    if (!subject_id) {
      return NextResponse.json({ error: 'subject_id query parameter is required' }, { status: 400 })
    }

    console.log(`[CHAPTERS_API] user_id=${teacher.id} role=${teacher.role} subject_id=${subject_id} with_materials=${with_materials}`)

    // If teacher, verify they have access to this subject
    if (teacher.role !== 'admin') {
      const { data: teacherSubject, error: accessError } = await supabaseAdmin
        .from('teacher_subjects')
        .select('id')
        .eq('teacher_id', teacher.id)
        .eq('subject_id', subject_id)
        .single()

      if (accessError || !teacherSubject) {
        console.log(`[CHAPTERS_API_ACCESS_DENIED] teacher_id=${teacher.id} subject_id=${subject_id}`)
        return NextResponse.json({ error: 'You do not have access to this subject' }, { status: 403 })
      }
    }

    // Fetch chapters for the subject
    const { data: chapters, error: chaptersError } = await supabaseAdmin
      .from('chapters')
      .select('id, name, subject_id, class_level_id')
      .eq('subject_id', subject_id)
      .order('name', { ascending: true })

    if (chaptersError) {
      console.error('[CHAPTERS_API_ERROR]', chaptersError)
      return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 })
    }

    // If with_materials is true, fetch materials for each chapter
    if (with_materials) {
      const chaptersWithMaterials = await Promise.all(
        chapters.map(async (chapter) => {
          // Get materials linked to this chapter
          const { data: materialLinks, error: linksError } = await supabaseAdmin
            .from('material_chapters')
            .select('material_id')
            .eq('chapter_id', chapter.id)

          if (linksError) {
            console.error(`[CHAPTERS_API_MATERIALS_ERROR] chapter_id=${chapter.id}`, linksError)
            return { ...chapter, materials: [], material_count: 0 }
          }

          const materialIds = materialLinks?.map(link => link.material_id) || []

          if (materialIds.length === 0) {
            return { ...chapter, materials: [], material_count: 0 }
          }

          // Fetch full material details
          const { data: materials, error: materialsError } = await supabaseAdmin
            .from('materials')
            .select(`
              id,
              title,
              file_url,
              created_at,
              material_type_id,
              material_types (name)
            `)
            .in('id', materialIds)
            .eq('institute_id', teacher.institute_id)
            .order('created_at', { ascending: false })

          if (materialsError) {
            console.error(`[CHAPTERS_API_MATERIALS_FETCH_ERROR] chapter_id=${chapter.id}`, materialsError)
            return { ...chapter, materials: [], material_count: 0 }
          }

          // For each material, get all chapters it belongs to (for multi-chapter badge)
          const materialsWithChapters = await Promise.all(
            (materials || []).map(async (material) => {
              const { data: allChapterLinks } = await supabaseAdmin
                .from('material_chapters')
                .select('chapter_id, chapters(name)')
                .eq('material_id', material.id)

              const chapterNames = (allChapterLinks || [])
                .map((link: any) => link.chapters?.name)
                .filter((name): name is string => Boolean(name))

              return {
                ...material,
                chapter_count: chapterNames.length,
                all_chapters: chapterNames
              }
            })
          )

          return {
            ...chapter,
            materials: materialsWithChapters,
            material_count: materialsWithChapters.length
          }
        })
      )

      console.log(`[CHAPTERS_API_SUCCESS] subject_id=${subject_id} chapters_count=${chaptersWithMaterials.length}`)
      return NextResponse.json({ chapters: chaptersWithMaterials }, { status: 200 })
    }

    console.log(`[CHAPTERS_API_SUCCESS] subject_id=${subject_id} chapters_count=${chapters?.length || 0}`)
    return NextResponse.json({ chapters }, { status: 200 })
  } catch (error) {
    console.error('[CHAPTERS_API_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/chapters
 *
 * Creates a new chapter for a subject
 * Prevents duplicates by checking for existing chapter with same name (case-insensitive)
 *
 * Request Body:
 * - subject_id (required): UUID of the subject
 * - name (required): Name of the chapter
 * - class_level_id (optional): UUID of the class level
 */
export async function POST(request: NextRequest) {
  try {
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

    // Parse request body
    const body = await request.json()
    const { subject_id, name, class_level_id } = body

    // Validation
    if (!subject_id || !name) {
      return NextResponse.json({ error: 'subject_id and name are required' }, { status: 400 })
    }

    // Normalize chapter name: trim and capitalize first letter of each word
    const normalizedName = name.trim()
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')

    if (!normalizedName) {
      return NextResponse.json({ error: 'Chapter name cannot be empty' }, { status: 400 })
    }

    console.log(`[CHAPTERS_CREATE] user_id=${teacher.id} subject_id=${subject_id} name="${normalizedName}"`)

    // If teacher, verify they have access to this subject
    if (teacher.role !== 'admin') {
      const { data: teacherSubject, error: accessError } = await supabaseAdmin
        .from('teacher_subjects')
        .select('id')
        .eq('teacher_id', teacher.id)
        .eq('subject_id', subject_id)
        .single()

      if (accessError || !teacherSubject) {
        console.log(`[CHAPTERS_CREATE_ACCESS_DENIED] teacher_id=${teacher.id} subject_id=${subject_id}`)
        return NextResponse.json({ error: 'You do not have access to this subject' }, { status: 403 })
      }
    }

    // Check for duplicate chapter (case-insensitive)
    const { data: existingChapter, error: checkError } = await supabaseAdmin
      .from('chapters')
      .select('id, name, subject_id, class_level_id')
      .eq('subject_id', subject_id)
      .ilike('name', normalizedName)
      .maybeSingle()

    if (checkError) {
      console.error('[CHAPTERS_CREATE_CHECK_ERROR]', checkError)
      return NextResponse.json({ error: 'Failed to check for duplicate chapter' }, { status: 500 })
    }

    // If chapter already exists, return it
    if (existingChapter) {
      console.log(`[CHAPTERS_CREATE_DUPLICATE] chapter_id=${existingChapter.id} name="${existingChapter.name}"`)
      return NextResponse.json({
        chapter: existingChapter,
        existed: true,
        message: `Chapter "${existingChapter.name}" already exists`
      }, { status: 200 })
    }

    // Create new chapter
    const { data: newChapter, error: createError } = await supabaseAdmin
      .from('chapters')
      .insert({
        subject_id,
        name: normalizedName,
        class_level_id: class_level_id || null
      })
      .select('id, name, subject_id, class_level_id')
      .single()

    if (createError) {
      console.error('[CHAPTERS_CREATE_ERROR]', createError)
      return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 })
    }

    console.log(`[CHAPTERS_CREATE_SUCCESS] chapter_id=${newChapter.id} name="${newChapter.name}"`)

    return NextResponse.json({
      chapter: newChapter,
      existed: false,
      message: `Chapter "${newChapter.name}" created successfully`
    }, { status: 201 })
  } catch (error) {
    console.error('[CHAPTERS_CREATE_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
