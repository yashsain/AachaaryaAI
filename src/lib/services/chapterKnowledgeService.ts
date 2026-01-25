/**
 * Chapter Knowledge Service
 *
 * Handles all database operations for chapter_knowledge table
 * Provides CRUD operations and intelligent merging of analysis results
 *
 * Part of: PDF Analysis Caching System
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import type {
  ChapterKnowledge,
  ChapterKnowledgeStatus,
  ScopeAnalysisJSON,
  StyleExamplesJSON,
} from '@/lib/ai/types/chapterKnowledge';

// ============================================================================
// FETCH OPERATIONS
// ============================================================================

/**
 * Fetch chapter knowledge by chapter and institute
 *
 * @param chapterId - UUID of the chapter
 * @param instituteId - UUID of the institute
 * @returns Chapter knowledge record or null if not found
 * @throws Error if database query fails
 */
export async function fetchChapterKnowledge(
  chapterId: string,
  instituteId: string
): Promise<ChapterKnowledge | null> {
  const { data, error } = await supabaseAdmin
    .from('chapter_knowledge')
    .select('*')
    .eq('chapter_id', chapterId)
    .eq('institute_id', instituteId)
    .single();

  if (error) {
    // Handle "not found" gracefully
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch chapter knowledge: ${error.message}`);
  }

  return data as ChapterKnowledge;
}

/**
 * Fetch chapter knowledge by ID
 *
 * @param id - UUID of the chapter_knowledge record
 * @returns Chapter knowledge record or null if not found
 */
export async function fetchChapterKnowledgeById(
  id: string
): Promise<ChapterKnowledge | null> {
  const { data, error } = await supabaseAdmin
    .from('chapter_knowledge')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch chapter knowledge by ID: ${error.message}`);
  }

  return data as ChapterKnowledge;
}

// ============================================================================
// CREATE/UPDATE OPERATIONS
// ============================================================================

/**
 * Create new chapter knowledge record
 *
 * @param data - Chapter knowledge data (without id, created_at, updated_at)
 * @returns Created chapter knowledge record
 * @throws Error if insert fails or UNIQUE constraint violated
 */
export async function createChapterKnowledge(data: {
  chapter_id: string;
  institute_id: string;
  scope_analysis?: ScopeAnalysisJSON | null;
  style_examples?: StyleExamplesJSON | null;
  material_ids?: string[];
  analysis_attempt_id?: string | null;
  status?: ChapterKnowledgeStatus;
  last_updated_by_material_id?: string | null;
  version?: number;
}): Promise<ChapterKnowledge> {
  const { data: created, error } = await supabaseAdmin
    .from('chapter_knowledge')
    .insert({
      chapter_id: data.chapter_id,
      institute_id: data.institute_id,
      scope_analysis: data.scope_analysis ?? null,
      style_examples: data.style_examples ?? null,
      material_ids: data.material_ids ?? [],
      analysis_attempt_id: data.analysis_attempt_id ?? null,
      status: data.status ?? 'pending',
      last_updated_by_material_id: data.last_updated_by_material_id ?? null,
      version: data.version ?? 1,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create chapter knowledge: ${error.message}`);
  }

  return created as ChapterKnowledge;
}

/**
 * Update existing chapter knowledge record
 *
 * @param id - UUID of the chapter_knowledge record
 * @param updates - Fields to update
 * @returns Updated chapter knowledge record
 * @throws Error if update fails
 */
export async function updateChapterKnowledge(
  id: string,
  updates: {
    scope_analysis?: ScopeAnalysisJSON | null;
    style_examples?: StyleExamplesJSON | null;
    material_ids?: string[];
    analysis_attempt_id?: string | null;
    status?: ChapterKnowledgeStatus;
    analysis_started_at?: string | null;
    analysis_completed_at?: string | null;
    analysis_error?: string | null;
    last_updated_by_material_id?: string | null;
    version?: number;
  }
): Promise<ChapterKnowledge> {
  const { data, error } = await supabaseAdmin
    .from('chapter_knowledge')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update chapter knowledge: ${error.message}`);
  }

  return data as ChapterKnowledge;
}

/**
 * Upsert chapter knowledge (insert or update based on chapter_id + institute_id)
 *
 * @param data - Chapter knowledge data
 * @returns Upserted chapter knowledge record
 * @throws Error if upsert fails
 */
export async function upsertChapterKnowledge(data: {
  chapter_id: string;
  institute_id: string;
  scope_analysis?: ScopeAnalysisJSON | null;
  style_examples?: StyleExamplesJSON | null;
  material_ids?: string[];
  analysis_attempt_id?: string | null;
  status?: ChapterKnowledgeStatus;
  analysis_started_at?: string | null;
  analysis_completed_at?: string | null;
  analysis_error?: string | null;
  last_updated_by_material_id?: string | null;
  version?: number;
}): Promise<ChapterKnowledge> {
  const { data: upserted, error } = await supabaseAdmin
    .from('chapter_knowledge')
    .upsert(
      {
        chapter_id: data.chapter_id,
        institute_id: data.institute_id,
        scope_analysis: data.scope_analysis ?? null,
        style_examples: data.style_examples ?? null,
        material_ids: data.material_ids ?? [],
        analysis_attempt_id: data.analysis_attempt_id ?? null,
        status: data.status ?? 'pending',
        analysis_started_at: data.analysis_started_at ?? null,
        analysis_completed_at: data.analysis_completed_at ?? null,
        analysis_error: data.analysis_error ?? null,
        last_updated_by_material_id: data.last_updated_by_material_id ?? null,
        version: data.version ?? 1,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'chapter_id,institute_id',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert chapter knowledge: ${error.message}`);
  }

  return upserted as ChapterKnowledge;
}

// ============================================================================
// STATUS UPDATES
// ============================================================================

/**
 * Mark chapter knowledge as analyzing
 *
 * @param id - UUID of chapter_knowledge record
 * @param attemptId - Analysis attempt ID for rollback
 */
export async function markAsAnalyzing(
  id: string,
  attemptId: string
): Promise<ChapterKnowledge> {
  return updateChapterKnowledge(id, {
    status: 'analyzing',
    analysis_started_at: new Date().toISOString(),
    analysis_attempt_id: attemptId,
    analysis_error: null,
  });
}

/**
 * Mark chapter knowledge as completed
 *
 * @param id - UUID of chapter_knowledge record
 */
export async function markAsCompleted(id: string): Promise<ChapterKnowledge> {
  return updateChapterKnowledge(id, {
    status: 'completed',
    analysis_completed_at: new Date().toISOString(),
    analysis_error: null,
  });
}

/**
 * Mark chapter knowledge as failed
 *
 * @param id - UUID of chapter_knowledge record
 * @param errorMessage - Error message to store
 */
export async function markAsFailed(
  id: string,
  errorMessage: string
): Promise<ChapterKnowledge> {
  return updateChapterKnowledge(id, {
    status: 'failed',
    analysis_error: errorMessage,
  });
}

// ============================================================================
// MERGE LOGIC
// ============================================================================

/**
 * Merge scope analyses (additive-only, no removal)
 *
 * @param existing - Existing scope analysis
 * @param newAnalysis - New scope analysis to merge
 * @param materialTitle - Title of material being merged
 * @returns Merged scope analysis
 */
export function mergeScopeAnalyses(
  existing: ScopeAnalysisJSON | null,
  newAnalysis: ScopeAnalysisJSON,
  materialTitle: string
): ScopeAnalysisJSON {
  if (!existing) {
    return newAnalysis;
  }

  // Merge topics (union)
  const mergedTopics = Array.from(new Set([...existing.topics, ...newAnalysis.topics]));

  // Merge subtopics (combine arrays, keep unique by name)
  const mergedSubtopics: Record<string, any[]> = { ...existing.subtopics };
  for (const [topic, subtopics] of Object.entries(newAnalysis.subtopics)) {
    if (!mergedSubtopics[topic]) {
      mergedSubtopics[topic] = subtopics;
    } else {
      // Merge subtopics for this topic, dedupe by name
      const existingNames = new Set(mergedSubtopics[topic].map((s) => s.name));
      const newSubtopics = subtopics.filter((s) => !existingNames.has(s.name));
      mergedSubtopics[topic] = [...mergedSubtopics[topic], ...newSubtopics];
    }
  }

  // Merge depth indicators (take maximum depth)
  const depthLevels: Record<string, number> = { basic: 1, intermediate: 2, advanced: 3 };
  const mergedDepthIndicators: Record<string, 'basic' | 'intermediate' | 'advanced'> = {
    ...existing.depth_indicators,
  };
  for (const [topic, depth] of Object.entries(newAnalysis.depth_indicators)) {
    const existingDepth = mergedDepthIndicators[topic] || 'basic';
    const existingLevel = depthLevels[existingDepth];
    const newLevel = depthLevels[depth];
    if (newLevel > existingLevel) {
      mergedDepthIndicators[topic] = depth;
    }
  }

  // Merge terminology mappings (combine, new overwrites existing)
  const mergedTerminologyMappings = {
    ...existing.terminology_mappings,
    ...newAnalysis.terminology_mappings,
  };

  // Merge material titles
  const mergedMaterials = Array.from(
    new Set([...existing.extracted_from_materials, materialTitle])
  );

  return {
    topics: mergedTopics,
    subtopics: mergedSubtopics,
    depth_indicators: mergedDepthIndicators,
    terminology_mappings: mergedTerminologyMappings,
    extracted_from_materials: mergedMaterials,
    last_updated: new Date().toISOString(),
  };
}

/**
 * Merge style examples (append questions, dedupe, recalculate stats)
 *
 * @param existing - Existing style examples
 * @param newExamples - New style examples to merge
 * @param materialTitle - Title of material being merged
 * @returns Merged style examples
 */
export function mergeStyleExamples(
  existing: StyleExamplesJSON | null,
  newExamples: StyleExamplesJSON,
  materialTitle: string
): StyleExamplesJSON {
  if (!existing) {
    return newExamples;
  }

  // Merge questions (append new questions to existing)
  const mergedQuestions = [...existing.questions, ...newExamples.questions];

  // Merge material titles
  const mergedMaterials = Array.from(
    new Set([...existing.extracted_from_materials, materialTitle])
  );

  return {
    questions: mergedQuestions,
    extracted_from_materials: mergedMaterials,
  };
}

/**
 * Add material ID to tracking array (dedupe)
 *
 * @param existingIds - Existing material IDs
 * @param newId - New material ID to add
 * @returns Updated array
 */
export function addMaterialId(existingIds: string[], newId: string): string[] {
  if (existingIds.includes(newId)) {
    return existingIds;
  }
  return [...existingIds, newId];
}

/**
 * Remove material ID from tracking array
 *
 * @param existingIds - Existing material IDs
 * @param idToRemove - Material ID to remove
 * @returns Updated array
 */
export function removeMaterialId(existingIds: string[], idToRemove: string): string[] {
  return existingIds.filter((id) => id !== idToRemove);
}
