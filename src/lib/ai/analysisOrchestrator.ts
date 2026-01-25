/**
 * Analysis Orchestrator
 *
 * Coordinates the analysis of materials for a chapter:
 * - Fetches materials and groups by type (scope vs style)
 * - Calls appropriate analyzers (scope/style)
 * - Merges results intelligently
 * - Updates chapter_knowledge in database
 *
 * Part of: PDF Analysis Caching System
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { shouldUseScopeAnalysis } from './subjectClassifier';
import { getMaterialAnalysisMode } from './materialClassifier';
import { analyzeNotes, analyzePaper } from './materialAnalyzer';
import { getProtocol } from './protocols';
import {
  fetchChapterKnowledge,
  createChapterKnowledge,
  updateChapterKnowledge,
  mergeScopeAnalyses,
  mergeStyleExamples,
  addMaterialId,
} from '@/lib/services/chapterKnowledgeService';
import { retryPdfAnalysis } from './utils/retryHelper';
import type { AnalysisResult } from './types/chapterKnowledge';

// ============================================================================
// TYPES
// ============================================================================

interface MaterialWithType {
  id: string;
  title: string;
  file_url: string;
  material_type_name: string;
}

interface AnalysisContext {
  chapterId: string;
  chapterName: string;
  instituteId: string;
  subjectId: string;
  streamName: string;
  subjectName: string;
  officialSyllabus: string;
}

// ============================================================================
// HELPER: FETCH MATERIALS WITH TYPES
// ============================================================================

/**
 * Fetch materials for a chapter with their type information
 */
async function fetchMaterialsWithTypes(
  chapterId: string,
  instituteId: string
): Promise<MaterialWithType[]> {
  const { data, error } = await supabaseAdmin
    .from('material_chapters')
    .select(`
      material_id,
      materials!inner (
        id,
        title,
        file_url,
        institute_id,
        material_type
      )
    `)
    .eq('chapter_id', chapterId);

  if (error) {
    throw new Error(`Failed to fetch materials: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  const materials: MaterialWithType[] = [];

  for (const mc of data) {
    const material = mc.materials as any;

    // Verify material belongs to this institute
    if (material.institute_id !== instituteId) {
      continue;
    }

    materials.push({
      id: material.id,
      title: material.title,
      file_url: material.file_url,
      material_type_name: material.material_type,
    });
  }

  return materials;
}

/**
 * Group materials by analysis mode (scope vs style)
 */
function groupMaterialsByMode(materials: MaterialWithType[]): {
  scopeMaterials: MaterialWithType[];
  styleMaterials: MaterialWithType[];
} {
  const scopeMaterials: MaterialWithType[] = [];
  const styleMaterials: MaterialWithType[] = [];

  for (const material of materials) {
    const mode = getMaterialAnalysisMode(material.material_type_name);

    if (mode === 'scope') {
      scopeMaterials.push(material);
    } else if (mode === 'style') {
      styleMaterials.push(material);
    }
    // Unknown types are skipped
  }

  return { scopeMaterials, styleMaterials };
}

// ============================================================================
// HELPER: GET ANALYSIS CONTEXT
// ============================================================================

/**
 * Fetch all necessary context for analysis
 */
async function getAnalysisContext(
  chapterId: string,
  instituteId: string
): Promise<AnalysisContext> {
  // Fetch chapter with subject and stream
  const { data: chapter, error: chapterError } = await supabaseAdmin
    .from('chapters')
    .select(`
      id,
      name,
      subject_id,
      subjects!inner (
        id,
        name,
        stream_id,
        streams!inner (
          name
        )
      )
    `)
    .eq('id', chapterId)
    .single();

  if (chapterError || !chapter) {
    throw new Error(`Failed to fetch chapter: ${chapterError?.message || 'Not found'}`);
  }

  const subject = chapter.subjects as any;
  const stream = subject.streams as any;

  // Get protocol to extract official syllabus
  let officialSyllabus = '';
  try {
    const protocol = getProtocol(stream.name, subject.name);
    officialSyllabus = protocol.metadata?.officialSyllabus || '';
  } catch (error) {
    console.warn('[ORCHESTRATOR] No protocol found, using empty syllabus');
    officialSyllabus = '';
  }

  return {
    chapterId: chapter.id,
    chapterName: chapter.name,
    instituteId,
    subjectId: subject.id,
    streamName: stream.name,
    subjectName: subject.name,
    officialSyllabus,
  };
}

// ============================================================================
// MAIN ORCHESTRATOR FUNCTION
// ============================================================================

/**
 * Analyze materials for a chapter and update chapter_knowledge
 *
 * Handles both first-time analysis and incremental updates (merges).
 * Processes scope and style materials in parallel for efficiency.
 *
 * @param chapterId - UUID of the chapter
 * @param instituteId - UUID of the institute
 * @param newMaterialId - Optional: Only analyze this specific material (for upload trigger)
 * @returns Analysis result with success status and token usage
 *
 * @example
 * const result = await analyzeChapterMaterials(chapterId, instituteId)
 * if (result.success) {
 *   console.log('Analysis complete:', result.materials_analyzed, 'materials')
 * }
 */
export async function analyzeChapterMaterials(
  chapterId: string,
  instituteId: string,
  newMaterialId?: string
): Promise<AnalysisResult> {
  const attemptId = crypto.randomUUID();

  console.log('[ORCHESTRATOR] Starting analysis:', {
    chapterId,
    instituteId,
    newMaterialId,
    attemptId,
  });

  try {
    // Step 1: Get analysis context
    const context = await getAnalysisContext(chapterId, instituteId);

    // Step 2: Check if subject uses scope analysis
    const useScopeAnalysis = await shouldUseScopeAnalysis(context.subjectId);
    if (!useScopeAnalysis) {
      console.log('[ORCHESTRATOR] Skipped - Subject is Source of Truth (no chapter_knowledge needed)');
      return {
        success: true,
        skipped: true,
        reason: 'source_of_truth',
        chapter_id: chapterId,
        institute_id: instituteId,
        status: 'completed',
        materials_analyzed: 0,
        scope_materials: 0,
        style_materials: 0,
      };
    }

    // Step 3: Fetch materials
    let materials = await fetchMaterialsWithTypes(chapterId, instituteId);

    // If newMaterialId specified, only analyze that one
    if (newMaterialId) {
      materials = materials.filter((m) => m.id === newMaterialId);
      if (materials.length === 0) {
        console.warn('[ORCHESTRATOR] New material not found for chapter');
        return {
          success: false,
          chapter_id: chapterId,
          institute_id: instituteId,
          status: 'failed',
          materials_analyzed: 0,
          scope_materials: 0,
          style_materials: 0,
          error: 'Material not found for chapter',
        };
      }
    }

    if (materials.length === 0) {
      console.log('[ORCHESTRATOR] No materials found for chapter');
      return {
        success: true,
        chapter_id: chapterId,
        institute_id: instituteId,
        status: 'completed',
        materials_analyzed: 0,
        scope_materials: 0,
        style_materials: 0,
      };
    }

    // Step 4: Group materials by type
    const { scopeMaterials, styleMaterials } = groupMaterialsByMode(materials);

    console.log('[ORCHESTRATOR] Materials grouped:', {
      scope: scopeMaterials.length,
      style: styleMaterials.length,
    });

    // Step 5: Fetch or create chapter_knowledge record
    let chapterKnowledge = await fetchChapterKnowledge(chapterId, instituteId);
    if (!chapterKnowledge) {
      console.log('[ORCHESTRATOR] Creating new chapter_knowledge record');
      chapterKnowledge = await createChapterKnowledge({
        chapter_id: chapterId,
        institute_id: instituteId,
        status: 'pending',
        analysis_attempt_id: attemptId,
      });
    }

    // Step 6: Update status to 'analyzing'
    await updateChapterKnowledge(chapterKnowledge.id, {
      status: 'analyzing',
      analysis_started_at: new Date().toISOString(),
      analysis_attempt_id: attemptId,
      analysis_error: null,
    });

    // Step 7: Analyze scope materials (theory notes)
    let finalScopeAnalysis = chapterKnowledge.scope_analysis;
    const scopeResults = await Promise.allSettled(
      scopeMaterials.map(async (material) => {
        console.log('[ORCHESTRATOR] Analyzing scope:', material.title);

        // Use retry helper for transient failures
        const analysis = await retryPdfAnalysis(
          () => analyzeNotes(
            material.file_url,
            material.title,
            context.chapterName,
            context.officialSyllabus
          ),
          material.title
        );

        // Merge immediately for next iteration
        finalScopeAnalysis = mergeScopeAnalyses(finalScopeAnalysis, analysis, material.title);
        return { materialId: material.id, analysis };
      })
    );

    // Step 8: Analyze style materials (sample papers)
    let finalStyleExamples = chapterKnowledge.style_examples;
    const styleResults = await Promise.allSettled(
      styleMaterials.map(async (material) => {
        console.log('[ORCHESTRATOR] Analyzing style:', material.title);

        // Use retry helper for transient failures
        const examples = await retryPdfAnalysis(
          () => analyzePaper(
            material.file_url,
            material.id,
            material.title,
            context.chapterName
          ),
          material.title
        );

        // Merge immediately for next iteration
        finalStyleExamples = mergeStyleExamples(finalStyleExamples, examples, material.title);
        return { materialId: material.id, examples };
      })
    );

    // Step 9: Check for failures
    const scopeFailures = scopeResults.filter((r) => r.status === 'rejected');
    const styleFailures = styleResults.filter((r) => r.status === 'rejected');

    if (scopeFailures.length > 0) {
      console.error('[ORCHESTRATOR] Scope analysis failures:', scopeFailures.length);
      scopeFailures.forEach((f) => {
        if (f.status === 'rejected') {
          console.error('[ORCHESTRATOR] Scope failure:', f.reason);
        }
      });
    }

    if (styleFailures.length > 0) {
      console.error('[ORCHESTRATOR] Style analysis failures:', styleFailures.length);
      styleFailures.forEach((f) => {
        if (f.status === 'rejected') {
          console.error('[ORCHESTRATOR] Style failure:', f.reason);
        }
      });
    }

    // Step 10: Update material_ids array
    let updatedMaterialIds = chapterKnowledge.material_ids;
    for (const material of materials) {
      updatedMaterialIds = addMaterialId(updatedMaterialIds, material.id);
    }

    // Step 11: Update chapter_knowledge with results
    const updated = await updateChapterKnowledge(chapterKnowledge.id, {
      scope_analysis: finalScopeAnalysis,
      style_examples: finalStyleExamples,
      material_ids: updatedMaterialIds,
      status: 'completed',
      analysis_completed_at: new Date().toISOString(),
      last_updated_by_material_id: newMaterialId || materials[materials.length - 1]?.id,
      version: chapterKnowledge.version + 1,
    });

    // Step 12: Mark materials as analyzed
    for (const material of materials) {
      await supabaseAdmin
        .from('materials')
        .update({
          analysis_status: 'completed',
          analyzed_at: new Date().toISOString(),
        })
        .eq('id', material.id);
    }

    console.log('[ORCHESTRATOR_SUCCESS] Analysis complete:', {
      scope_topics: finalScopeAnalysis?.topics.length || 0,
      style_questions: finalStyleExamples?.questions.length || 0,
      version: updated.version,
    });

    return {
      success: true,
      chapter_id: chapterId,
      institute_id: instituteId,
      status: 'completed',
      materials_analyzed: materials.length,
      scope_materials: scopeMaterials.length,
      style_materials: styleMaterials.length,
      // TODO: Aggregate token usage from analyzer responses
    };
  } catch (error) {
    console.error('[ORCHESTRATOR_ERROR]', error);

    // Try to mark as failed in database
    try {
      const existing = await fetchChapterKnowledge(chapterId, instituteId);
      if (existing) {
        await updateChapterKnowledge(existing.id, {
          status: 'failed',
          analysis_error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } catch (updateError) {
      console.error('[ORCHESTRATOR] Failed to update error status:', updateError);
    }

    return {
      success: false,
      chapter_id: chapterId,
      institute_id: instituteId,
      status: 'failed',
      materials_analyzed: 0,
      scope_materials: 0,
      style_materials: 0,
      error: error instanceof Error ? error.message : 'Analysis failed',
    };
  }
}
