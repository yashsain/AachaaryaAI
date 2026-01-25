/**
 * Subject Classifier
 *
 * Determines which subjects use "Source of Scope" vs "Source of Truth" approach
 *
 * - Source of Scope (SoS) subjects (Math, Physics): Materials define WHAT to cover → Use chapter_knowledge
 * - Source of Truth (SoT) subjects (Rajasthan GK): Materials ARE the facts → Use PDF uploads
 *
 * Part of: PDF Analysis Caching System
 */

import { supabaseAdmin } from '@/lib/supabase/admin';

// ============================================================================
// IN-MEMORY CACHE
// ============================================================================

/**
 * Cache for subject classification results
 * Subjects rarely change, so we can cache aggressively
 */
const subjectCache = new Map<string, {
  is_source_of_scope: boolean;
  cached_at: number;
}>();

/**
 * Cache TTL: 1 hour (3600000 ms)
 * Subjects rarely change, but we want to refresh eventually
 */
const CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * Clear cache entry if expired
 */
function isCacheValid(cachedAt: number): boolean {
  return Date.now() - cachedAt < CACHE_TTL_MS;
}

/**
 * Clear all cached subject data
 * Useful after migrations or manual subject classification updates
 */
export function clearSubjectCache(): void {
  subjectCache.clear();
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Check if a subject is "Source of Scope" type
 *
 * @param subjectId - UUID of the subject
 * @returns true if subject is Source of Scope (use chapter_knowledge), false if Source of Truth (use PDFs)
 * @throws Error if database query fails
 *
 * @example
 * if (await isSourceOfScope(mathSubjectId)) {
 *   // Fetch chapter_knowledge and use structured data
 * } else {
 *   // Upload PDFs to Gemini as strict truth
 * }
 */
export async function isSourceOfScope(
  subjectId: string
): Promise<boolean> {
  // Check cache first
  const cached = subjectCache.get(subjectId);
  if (cached && isCacheValid(cached.cached_at)) {
    return cached.is_source_of_scope;
  }

  // Query database
  const { data, error } = await supabaseAdmin
    .from('subjects')
    .select('is_source_of_scope')
    .eq('id', subjectId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch subject type: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Subject not found: ${subjectId}`);
  }

  // Cache result
  subjectCache.set(subjectId, {
    is_source_of_scope: data.is_source_of_scope ?? false,
    cached_at: Date.now(),
  });

  return data.is_source_of_scope ?? false;
}

/**
 * Legacy alias for isSourceOfScope (for backward compatibility)
 * @deprecated Use isSourceOfScope() instead
 */
export async function shouldUseScopeAnalysis(
  subjectId: string
): Promise<boolean> {
  return isSourceOfScope(subjectId);
}
