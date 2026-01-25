/**
 * Material Type Classifier
 *
 * Categorizes material types into:
 * - SCOPE materials: Theory notes/books used to extract curriculum scope (topics, subtopics, depth)
 * - STYLE materials: Sample papers/practice sets used to extract question style for calibration
 *
 * Part of: PDF Analysis Caching System for "Source of Scope" subjects
 */

// ============================================================================
// CONSTANTS: MATERIAL TYPE CATEGORIES
// ============================================================================

/**
 * Material types that contain THEORY/SYLLABUS information
 * Used to extract: topics, subtopics, depth indicators, terminology
 *
 * Analysis: Extract curriculum scope, NOT actual questions
 */
export const SCOPE_MATERIAL_TYPES = [
  'scope',
] as const;

/**
 * Material types that contain SAMPLE QUESTIONS/PAPERS
 * Used to extract: actual questions for few-shot prompting, difficulty calibration
 *
 * Analysis: Extract questions, answers, difficulty patterns
 */
export const STYLE_MATERIAL_TYPES = [
  'style',
] as const;

// Type unions for type safety
export type ScopeMaterialType = typeof SCOPE_MATERIAL_TYPES[number];
export type StyleMaterialType = typeof STYLE_MATERIAL_TYPES[number];

// ============================================================================
// CLASSIFICATION FUNCTIONS
// ============================================================================

/**
 * Determine the analysis mode for a material type
 *
 * @param materialTypeName - Name of the material type (e.g., "notes", "coaching_paper")
 * @returns 'scope' for theory materials, 'style' for sample papers, 'unknown' if unrecognized
 *
 * @example
 * getMaterialAnalysisMode('notes') // => 'scope'
 * getMaterialAnalysisMode('coaching_paper') // => 'style'
 * getMaterialAnalysisMode('unknown_type') // => 'unknown'
 */
export function getMaterialAnalysisMode(
  materialTypeName: string
): 'scope' | 'style' | 'unknown' {
  const normalized = materialTypeName.trim();

  if (SCOPE_MATERIAL_TYPES.includes(normalized as ScopeMaterialType)) {
    return 'scope';
  }

  if (STYLE_MATERIAL_TYPES.includes(normalized as StyleMaterialType)) {
    return 'style';
  }

  return 'unknown';
}

/**
 * Check if a material type is a SCOPE material (theory/notes)
 *
 * @param materialTypeName - Name of the material type
 * @returns true if it's a scope material, false otherwise
 *
 * @example
 * isScopeMaterial('notes') // => true
 * isScopeMaterial('coaching_paper') // => false
 */
export function isScopeMaterial(materialTypeName: string): boolean {
  return getMaterialAnalysisMode(materialTypeName) === 'scope';
}

/**
 * Check if a material type is a STYLE material (sample papers)
 *
 * @param materialTypeName - Name of the material type
 * @returns true if it's a style material, false otherwise
 *
 * @example
 * isStyleMaterial('coaching_paper') // => true
 * isStyleMaterial('notes') // => false
 */
export function isStyleMaterial(materialTypeName: string): boolean {
  return getMaterialAnalysisMode(materialTypeName) === 'style';
}

/**
 * Get all scope material type names
 * Useful for filtering queries
 *
 * @returns Array of scope material type names
 */
export function getScopeMaterialTypes(): readonly string[] {
  return SCOPE_MATERIAL_TYPES;
}

/**
 * Get all style material type names
 * Useful for filtering queries
 *
 * @returns Array of style material type names
 */
export function getStyleMaterialTypes(): readonly string[] {
  return STYLE_MATERIAL_TYPES;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for scope material types
 */
export function isScopeMaterialType(type: string): type is ScopeMaterialType {
  return SCOPE_MATERIAL_TYPES.includes(type as ScopeMaterialType);
}

/**
 * Type guard for style material types
 */
export function isStyleMaterialType(type: string): type is StyleMaterialType {
  return STYLE_MATERIAL_TYPES.includes(type as StyleMaterialType);
}
