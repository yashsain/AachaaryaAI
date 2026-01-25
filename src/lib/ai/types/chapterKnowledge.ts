/**
 * Type definitions for Chapter Knowledge Analysis System
 *
 * Part of: PDF Analysis Caching System for "Source of Scope" subjects (Mathematics, Physics, etc.)
 *
 * This module defines the structure of analyzed knowledge extracted from materials:
 * - Scope Analysis: Topics, subtopics, depth indicators from theory materials
 * - Style Examples: Sample questions extracted from practice papers for few-shot prompting
 */

// ============================================================================
// SCOPE ANALYSIS TYPES
// ============================================================================

/**
 * Depth level of a topic/subtopic
 * - basic: Introductory level (NCERT standard)
 * - intermediate: Moderate complexity (Board exam level)
 * - advanced: High complexity (JEE/NEET level)
 */
export type DepthLevel = 'basic' | 'intermediate' | 'advanced';

/**
 * Details about a subtopic extracted from materials
 */
export type SubtopicDetail = {
  /** Subtopic name (e.g., "Power Sets", "Reflexive Relations") */
  name: string;

  /** Depth level at which this subtopic is covered */
  depth: DepthLevel;

  /** Keywords/terms associated with this subtopic for matching */
  keywords: string[];
};

/**
 * Scope analysis extracted from theory materials (notes, books, reference materials)
 *
 * This defines the "boundaries" of what topics are taught by the institute,
 * ensuring generated questions stay within the curriculum scope.
 */
export type ScopeAnalysisJSON = {
  /** List of main topics covered (e.g., ["Sets", "Relations", "Functions"]) */
  topics: string[];

  /**
   * Subtopics grouped by main topic
   * Example: { "Sets": [{ name: "Power Sets", depth: "intermediate", keywords: [...] }] }
   */
  subtopics: Record<string, SubtopicDetail[]>;

  /**
   * Depth level for each main topic
   * Example: { "Sets": "intermediate", "Functions": "advanced" }
   */
  depth_indicators: Record<string, DepthLevel>;

  /**
   * Mapping from client's terminology to official syllabus terminology
   * Example: { "null set": "empty set", "cardinality": "number of elements" }
   */
  terminology_mappings: Record<string, string>;

  /** Titles of materials that contributed to this scope analysis */
  extracted_from_materials: string[];

  /** ISO timestamp of last update */
  last_updated: string;
};

// ============================================================================
// STYLE EXAMPLES TYPES
// ============================================================================

/**
 * Difficulty estimate for a question
 */
export type DifficultyEstimate = 'easy' | 'medium' | 'hard';

/**
 * A single question extracted from a sample paper/practice set
 * RAW format - no analysis, just the question data
 */
export type ExtractedQuestion = {
  /** Full question text */
  text: string;

  /** MCQ options (if applicable) */
  options?: string[];

  /** Correct answer */
  answer: string;

  /** Solution/explanation (if available) */
  explanation?: string;

  /** UUID of the source material this question came from */
  source_material_id: string;

  /** Title of the source material for reference */
  source_material_title: string;
};

/**
 * Top 10-15 best/difficult/unique questions extracted from sample papers
 *
 * RAW questions only - no further analysis.
 * These serve as few-shot examples for the protocol's buildPrompt function.
 */
export type StyleExamplesJSON = {
  /** Top 10-15 raw questions from sample papers */
  questions: ExtractedQuestion[];

  /** Titles of materials that contributed to these questions */
  extracted_from_materials: string[];
};

// ============================================================================
// DATABASE RECORD TYPES
// ============================================================================

/**
 * Analysis status for chapter knowledge
 */
export type ChapterKnowledgeStatus = 'pending' | 'analyzing' | 'completed' | 'failed';

/**
 * Chapter Knowledge database record
 *
 * Stores analyzed knowledge for a specific chapter at a specific institute.
 * One record per (chapter, institute) pair.
 */
export type ChapterKnowledge = {
  /** Primary key */
  id: string;

  /** Chapter this knowledge belongs to */
  chapter_id: string;

  /** Institute this knowledge is specific to */
  institute_id: string;

  /** Scope analysis from theory materials (NULL if no theory materials uploaded) */
  scope_analysis: ScopeAnalysisJSON | null;

  /** Style examples from sample papers (NULL if no sample papers uploaded) */
  style_examples: StyleExamplesJSON | null;

  /** UUIDs of materials that contributed to this knowledge base */
  material_ids: string[];

  /** Attempt ID for rollback on merge failures */
  analysis_attempt_id: string | null;

  /** Current analysis status */
  status: ChapterKnowledgeStatus;

  /** When analysis started (NULL if not started) */
  analysis_started_at: string | null;

  /** When analysis completed (NULL if not completed) */
  analysis_completed_at: string | null;

  /** Error message if analysis failed (NULL if no error) */
  analysis_error: string | null;

  /** UUID of the last material that triggered an update */
  last_updated_by_material_id: string | null;

  /** Version number (incremented on each update for auditing) */
  version: number;

  /** Record creation timestamp */
  created_at: string;

  /** Last update timestamp */
  updated_at: string;
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Material analysis status (for materials table)
 */
export type MaterialAnalysisStatus = 'pending' | 'completed' | 'failed';

/**
 * Subject knowledge mode (for subjects table)
 */
export type SubjectKnowledgeMode = 'universal_knowledge' | 'restricted_truth';

/**
 * Analysis result returned by analyzers
 */
export type AnalysisResult = {
  success: boolean;
  chapter_id: string;
  institute_id: string;
  status: ChapterKnowledgeStatus;
  materials_analyzed: number;
  scope_materials: number;
  style_materials: number;
  skipped?: boolean;
  reason?: string;
  token_usage?: {
    total_tokens: number;
    cost_usd: number;
    cost_inr: number;
  };
  error?: string;
};
