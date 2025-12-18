import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// Type definitions for Supabase joins
interface MaterialType {
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

interface MaterialWithJoins {
  id: string
  title: string
  file_url: string
  created_at: string
  material_type_id: string
  uploaded_by: string
  material_types: MaterialType | MaterialType[] | null
  teachers: Teacher | Teacher[] | null
}

interface MaterialChapterWithJoins {
  material_id: string
  chapter_id: string
  chapters: Chapter | Chapter[] | null
}

// Helper functions to safely extract join data
function extractMaterialType(data: MaterialType | MaterialType[] | null): MaterialType | null {
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
 * GET /api/materials?subject_id=<uuid>
 *
 * Returns materials grouped by chapters for a given subject
 * Enforces role-based access control:
 * - Admin: Can access any subject
 * - Teacher: Can only access their assigned subjects
 *
 * Query Parameters:
 * - subject_id (required): UUID of the subject
 *
 * Response Structure:
 * {
 *   subject: { id, name },
 *   chapters: [
 *     {
 *       id, name,
 *       materials: [
 *         {
 *           id, title, file_url, created_at,
 *           material_type: { id, name },
 *           chapters: [{ id, name }],  // All chapters this material covers
 *           uploaded_by: { id, name }
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
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

    // Get subject_id from query params
    const { searchParams } = new URL(request.url)
    const subject_id = searchParams.get('subject_id')

    if (!subject_id) {
      return NextResponse.json({ error: 'subject_id query parameter is required' }, { status: 400 })
    }

    console.log(`[MATERIALS_QUERY] user_id=${teacher.id} role=${teacher.role} subject_id=${subject_id}`)

    // If teacher, verify they have access to this subject
    if (teacher.role !== 'admin') {
      const { data: teacherSubject, error: accessError } = await supabaseAdmin
        .from('teacher_subjects')
        .select('id')
        .eq('teacher_id', teacher.id)
        .eq('subject_id', subject_id)
        .single()

      if (accessError || !teacherSubject) {
        console.log(`[MATERIALS_QUERY_ACCESS_DENIED] teacher_id=${teacher.id} subject_id=${subject_id}`)
        return NextResponse.json({ error: 'You do not have access to this subject' }, { status: 403 })
      }
    }

    // Fetch subject info
    const { data: subject, error: subjectError } = await supabaseAdmin
      .from('subjects')
      .select('id, name')
      .eq('id', subject_id)
      .single()

    if (subjectError || !subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    // Fetch all chapters for this subject
    const { data: chapters, error: chaptersError } = await supabaseAdmin
      .from('chapters')
      .select('id, name')
      .eq('subject_id', subject_id)
      .order('name', { ascending: true })

    if (chaptersError) {
      console.error('[MATERIALS_QUERY_CHAPTERS_ERROR]', chaptersError)
      return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 })
    }

    // Fetch all materials for this subject and institute
    const { data: materialsRaw, error: materialsError } = await supabaseAdmin
      .from('materials')
      .select(`
        id,
        title,
        file_url,
        created_at,
        material_type_id,
        uploaded_by,
        material_types (
          id,
          name
        ),
        teachers (
          id,
          name
        )
      `)
      .eq('subject_id', subject_id)
      .eq('institute_id', teacher.institute_id)
      .order('created_at', { ascending: false })

    const materials = materialsRaw as unknown as MaterialWithJoins[] | null

    if (materialsError) {
      console.error('[MATERIALS_QUERY_MATERIALS_ERROR]', materialsError)
      return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 })
    }

    // Fetch material-chapter relationships
    const materialIds = materials?.map(m => m.id) || []
    let materialChaptersMap: Record<string, any[]> = {}
    let materialClassesMap: Record<string, any[]> = {}

    if (materialIds.length > 0) {
      // Fetch chapters
      const { data: materialChaptersRaw, error: mcError } = await supabaseAdmin
        .from('material_chapters')
        .select(`
          material_id,
          chapter_id,
          chapters (
            id,
            name
          )
        `)
        .in('material_id', materialIds)

      const materialChapters = materialChaptersRaw as unknown as MaterialChapterWithJoins[] | null

      if (mcError) {
        console.error('[MATERIALS_QUERY_MC_ERROR]', mcError)
        // Continue without chapter data rather than failing
      } else if (materialChapters) {
        // Group chapters by material_id
        materialChapters.forEach(mc => {
          if (!materialChaptersMap[mc.material_id]) {
            materialChaptersMap[mc.material_id] = []
          }
          const chapter = extractChapter(mc.chapters)
          if (chapter) {
            materialChaptersMap[mc.material_id].push({
              id: chapter.id,
              name: chapter.name
            })
          }
        })
      }

      // Fetch classes (many-to-many via material_classes junction table)
      const { data: materialClassesRaw, error: mclError } = await supabaseAdmin
        .from('material_classes')
        .select(`
          material_id,
          class_id,
          classes (
            id,
            batch_name,
            medium,
            class_levels (
              id,
              name
            ),
            streams (
              id,
              name
            )
          )
        `)
        .in('material_id', materialIds)

      if (mclError) {
        console.error('[MATERIALS_QUERY_CLASSES_ERROR]', mclError)
        // Continue without class data rather than failing
      } else if (materialClassesRaw) {
        // Group classes by material_id
        materialClassesRaw.forEach((mcl: any) => {
          if (!materialClassesMap[mcl.material_id]) {
            materialClassesMap[mcl.material_id] = []
          }
          if (mcl.classes) {
            const classData = mcl.classes
            const classLevel = Array.isArray(classData.class_levels)
              ? classData.class_levels[0]
              : classData.class_levels
            const stream = Array.isArray(classData.streams)
              ? classData.streams[0]
              : classData.streams

            materialClassesMap[mcl.material_id].push({
              id: classData.id,
              batch_name: classData.batch_name,
              medium: classData.medium,
              class_level: classLevel?.name || 'Unknown',
              stream: stream?.name || 'Unknown'
            })
          }
        })
      }
    }

    // Group materials by chapter
    const chaptersWithMaterials = chapters?.map(chapter => {
      // Find all materials that belong to this chapter
      const chapterMaterials = materials?.filter(material => {
        const materialChapters = materialChaptersMap[material.id] || []
        return materialChapters.some(mc => mc.id === chapter.id)
      }).map(material => {
        const materialType = extractMaterialType(material.material_types)
        const teacher = extractTeacher(material.teachers)

        return {
          id: material.id,
          title: material.title,
          file_url: material.file_url,
          created_at: material.created_at,
          material_type: {
            id: materialType?.id || material.material_type_id,
            name: materialType?.name || 'Unknown'
          },
          chapters: materialChaptersMap[material.id] || [],
          classes: materialClassesMap[material.id] || [],
          uploaded_by: {
            id: teacher?.id || material.uploaded_by,
            name: teacher?.name || 'Unknown'
          }
        }
      }) || []

      return {
        id: chapter.id,
        name: chapter.name,
        materials: chapterMaterials
      }
    }) || []

    const totalMaterials = materials?.length || 0
    console.log(`[MATERIALS_QUERY_SUCCESS] subject_id=${subject_id} chapters_count=${chapters?.length || 0} materials_count=${totalMaterials}`)

    return NextResponse.json({
      subject,
      chapters: chaptersWithMaterials
    }, { status: 200 })
  } catch (error) {
    console.error('[MATERIALS_QUERY_EXCEPTION]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
