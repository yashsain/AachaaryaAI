/**
 * Material Fetcher Utility
 *
 * Fetches study materials (PDFs) for given chapters
 * Groups materials by chapter for badge-by-badge processing
 */

import { supabaseAdmin } from '@/lib/supabase/admin'
import { Material } from '@/types/database'

export interface MaterialWithChapter {
  id: string
  title: string
  file_url: string
  chapter_id: string
}

/**
 * Fetch all materials for given chapter IDs
 * Returns materials grouped by chapter_id
 */
export async function fetchMaterialsForChapters(
  chapterIds: string[],
  instituteId: string
): Promise<Record<string, MaterialWithChapter[]>> {
  try {
    // Query materials via material_chapters junction table
    const { data: materialChapters, error } = await supabaseAdmin
      .from('material_chapters')
      .select(`
        chapter_id,
        material_id,
        materials (
          id,
          title,
          file_url,
          institute_id
        )
      `)
      .in('chapter_id', chapterIds)

    if (error) {
      console.error('[MATERIAL_FETCHER_ERROR]', error)
      throw new Error(`Failed to fetch materials: ${error.message}`)
    }

    if (!materialChapters || materialChapters.length === 0) {
      console.warn('[MATERIAL_FETCHER_WARNING] No materials found for chapters:', chapterIds)
      return {}
    }

    // Group materials by chapter_id
    const groupedMaterials: Record<string, MaterialWithChapter[]> = {}

    for (const mc of materialChapters) {
      const material = mc.materials as any

      // Verify material belongs to the institute
      if (material.institute_id !== instituteId) {
        console.warn('[MATERIAL_FETCHER_SKIP] Material from different institute:', material.id)
        continue
      }

      const materialData: MaterialWithChapter = {
        id: material.id,
        title: material.title,
        file_url: material.file_url,
        chapter_id: mc.chapter_id
      }

      if (!groupedMaterials[mc.chapter_id]) {
        groupedMaterials[mc.chapter_id] = []
      }

      groupedMaterials[mc.chapter_id].push(materialData)
    }

    console.log('[MATERIAL_FETCHER_SUCCESS] Fetched materials for chapters:', {
      chapters: Object.keys(groupedMaterials).length,
      totalMaterials: materialChapters.length
    })

    return groupedMaterials
  } catch (err) {
    console.error('[MATERIAL_FETCHER_EXCEPTION]', err)
    throw err
  }
}

/**
 * Fetch materials for a single chapter
 */
export async function fetchMaterialsForChapter(
  chapterId: string,
  instituteId: string
): Promise<MaterialWithChapter[]> {
  const result = await fetchMaterialsForChapters([chapterId], instituteId)
  return result[chapterId] || []
}
