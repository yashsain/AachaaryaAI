/**
 * aachaaryAI Database Types
 * Auto-generated TypeScript types matching PostgreSQL schema
 *
 * Usage: Copy to src/types/database.ts after applying migrations
 *
 * Note: These types match the database schema from 001_initial_schema.sql
 * Update this file whenever schema changes
 */

// ===========================================
// NON-PROPRIETARY TABLES (Universal Taxonomy)
// ===========================================

export interface Institute {
  id: string
  name: string
  code: string
  city: string | null
  email: string | null
  phone: string | null
  address: string | null
  logo_url: string | null
  primary_color: string
  tagline: string | null
  subscription_status: 'active' | 'trial' | 'suspended'
  created_at: string
}

export interface Stream {
  id: string
  name: string
  created_at: string
}

export interface InstituteStream {
  id: string
  institute_id: string
  stream_id: string
  created_at: string
}

export interface Teacher {
  id: string
  institute_id: string
  name: string
  email: string
  phone: string | null
  password_hash: string
  role: 'admin' | 'teacher'
  created_at: string
}

export interface ClassLevel {
  id: string
  stream_id: string | null // Nullable for generic levels (9th, 10th)
  name: string
  display_order: number | null
  created_at: string
}

export interface Class {
  id: string
  institute_id: string
  stream_id: string
  class_level_id: string
  batch_name: string | null
  medium: 'Hindi' | 'English' | 'Both' | null
  created_at: string
}

export interface Subject {
  id: string
  stream_id: string
  name: string
  created_at: string
}

export interface Chapter {
  id: string
  subject_id: string
  name: string
  class_level_id: string | null
  created_at: string
}

export interface MaterialType {
  id: string
  name: string
  created_at: string
}

export interface TeacherClass {
  id: string
  teacher_id: string
  class_id: string
  created_at: string
}

export interface TeacherSubject {
  id: string
  teacher_id: string
  subject_id: string
  created_at: string
}

// ===========================================
// PROPRIETARY TABLES (Institute-Locked Content)
// ===========================================

export interface Material {
  id: string
  institute_id: string
  stream_id: string
  class_id: string | null // DEPRECATED: Use MaterialClass junction table instead
  subject_id: string
  uploaded_by: string | null
  material_type_id: string
  title: string
  file_url: string
  content_text: string | null
  created_at: string
}

export interface MaterialChapter {
  id: string
  material_id: string
  chapter_id: string
  created_at: string
}

export interface MaterialClass {
  id: string
  material_id: string
  class_id: string
  created_at: string
}

export interface TestPaper {
  id: string
  institute_id: string
  created_by: string
  stream_id: string
  class_id: string | null // DEPRECATED: Use PaperClass junction table instead
  subject_id: string
  material_type_id: string // References material_types: DPP, JEE Mains Paper, JEE Advanced Paper, NEET Paper
  paper_template_id: string | null // Links to paper template (for multi-section papers like REET)
  title: string
  status: 'draft' | 'review' | 'finalized'
  pdf_url: string | null
  solution_url: string | null
  created_at: string
  finalized_at: string | null
  question_count: number | null
  difficulty_level: 'easy' | 'balanced' | 'hard' | null
}

export interface PaperChapter {
  id: string
  paper_id: string
  chapter_id: string
  created_at: string
}

export interface PaperClass {
  id: string
  paper_id: string
  class_id: string
  created_at: string
}

// ===========================================
// PAPER TEMPLATES (Multi-Section Papers)
// ===========================================

export interface PaperTemplate {
  id: string
  stream_id: string
  name: string // e.g., "English Paper", "NEET Full Paper"
  description: string | null
  display_order: number
  is_default: boolean // Auto-select for streams with one paper type (e.g., NEET)
  created_at: string
}

export interface PaperTemplateSection {
  id: string
  paper_template_id: string
  subject_id: string
  section_type: 'common' | 'primary' | 'teaching_methods' // common: shared across papers, primary: main subject, teaching_methods: pedagogy
  section_name: string // Display name: "Rajasthan GK", "Subject Content", "Teaching Methods"
  section_order: number // Order in final PDF (1, 2, 3, ...)
  default_question_count: number
  marks_per_question: number // Marks each question is worth (e.g., 4)
  negative_marks: number // Negative marks for wrong answers (e.g., -1 or 0)
  created_at: string
}

export interface TestPaperSection {
  id: string
  paper_id: string
  subject_id: string
  section_type: 'common' | 'primary' | 'teaching_methods'
  section_name: string
  section_order: number
  question_count: number
  marks_per_question: number // Marks each question is worth (e.g., 4)
  negative_marks: number // Negative marks for wrong answers (e.g., -1 or 0)
  status: 'pending' | 'ready' | 'in_review' | 'finalized' // pending = no chapters, ready = chapters assigned, in_review = questions generated and under review, finalized = questions finalized
  chapters_assigned_at: string | null // Timestamp when chapters were assigned
  created_at: string
  updated_at: string
}

export interface SectionChapter {
  id: string
  section_id: string
  chapter_id: string
  created_at: string
}

export interface ComprehensionPassage {
  id: string
  paper_id: string
  passage_text: string
  passage_order: number | null
  media_attachments: MediaAttachment[] | null
  created_at: string
}

export interface Question {
  id: string
  institute_id: string
  paper_id: string
  chapter_id: string
  passage_id: string | null
  section_id: string | null // Links to test_paper_sections (for multi-section papers)
  question_text: string
  question_data: QuestionData
  media_attachments: MediaAttachment[] | null
  explanation: string | null
  explanation_media: MediaAttachment[] | null
  marks: number
  negative_marks: number
  question_order: number | null
  is_selected: boolean
  created_at: string
}

// ===========================================
// JSONB TYPE DEFINITIONS
// ===========================================

// Question Data Types (stored in question_data JSONB)

export type QuestionData =
  | SingleCorrectMCQ
  | MultipleCorrectMCQ
  | IntegerType
  | NumericalRange
  | MatrixMatch
  | AssertionReason
  | Subjective

export interface SingleCorrectMCQ {
  type: 'single_correct_mcq'
  options: Option[]
  correct_answer: string
}

export interface MultipleCorrectMCQ {
  type: 'multiple_correct_mcq'
  options: Option[]
  correct_answers: string[]
}

export interface IntegerType {
  type: 'integer'
  correct_answer: number
  range: { min: number; max: number }
  unit?: string
}

export interface NumericalRange {
  type: 'numerical_range'
  correct_range: { min: number; max: number }
  decimal_places: number
  unit?: string
}

export interface MatrixMatch {
  type: 'matrix_match'
  column_a: MatrixItem[]
  column_b: MatrixItem[]
  correct_mapping: Record<string, string>
}

export interface AssertionReason {
  type: 'assertion_reason'
  assertion: string
  reason: string
  options: Option[]
  correct_answer: string
}

export interface Subjective {
  type: 'subjective'
  answer_type: 'short_answer' | 'long_answer' | 'paragraph'
  max_words?: number
  sample_answer?: string
}

export interface Option {
  label: string // A, B, C, D
  text: string
  media?: MediaAttachment // For options with chemical structures, diagrams
}

export interface MatrixItem {
  id: string // P, Q, R or 1, 2, 3
  text: string
}

// Media Attachments (stored in media_attachments JSONB)

export type MediaAttachment =
  | CircuitDiagram
  | ChemicalStructure
  | ChemicalReaction
  | BiologicalDiagram
  | Graph
  | Pedigree
  | EnergyDiagram
  | LogicCircuit

export interface CircuitDiagram {
  type: 'circuit'
  position: 'above_question' | 'inline' | 'below_question'
  storage: {
    method: 'svg' | 'png'
    content?: string // SVG content
    fallback_url?: string // PNG fallback
  }
  generation_metadata: {
    tool: 'circuitikz' | 'kroki' | 'gemini_image_gen'
    source_code?: string // LaTeX source
    alt_text: string
  }
}

export interface ChemicalStructure {
  type: 'chemical_structure'
  position: 'above_question' | 'inline_option_a' | 'inline_option_b' | 'inline_option_c' | 'inline_option_d'
  storage: {
    method: 'rdkit_svg' | 'chemdraw_json' | 'png'
    smiles?: string // SMILES notation
    svg_url?: string
    png_url?: string
  }
  alt_text: string
}

export interface ChemicalReaction {
  type: 'chemical_reaction'
  position: 'above_question' | 'inline'
  storage: {
    method: 'chemdraw_json' | 'rdkit' | 'png'
    smiles_input?: string
    smiles_output?: string
    image_url: string
  }
  reaction_steps: ReactionStep[]
  alt_text: string
}

export interface ReactionStep {
  step: number
  reagent: string
  condition?: string
}

export interface BiologicalDiagram {
  type: 'anatomical' | 'cellular' | 'ecological'
  position: 'above_question' | 'inline'
  storage: {
    method: 'labeled_svg' | 'png' | 'biorender'
    svg_url?: string
    png_url?: string
    labels?: Label[]
  }
  annotations?: Annotation[]
  alt_text: string
}

export interface Label {
  id: string // A, B, C, D
  structure: string
}

export interface Annotation {
  position: string
  text: string
  style?: string
}

export interface Graph {
  type: 'graph'
  position: 'above_question' | 'inline'
  storage: {
    method: 'matplotlib_svg' | 'manim' | 'png'
    svg_url?: string
    png_url?: string
    data?: GraphData
  }
  generation_metadata: {
    tool: 'matplotlib' | 'manim' | 'gemini_image_gen'
    python_code?: string
    alt_text: string
  }
}

export interface GraphData {
  x_axis: { label: string; range: [number, number] }
  y_axis: { label: string; range: [number, number] }
  plot_type: 'sine_wave' | 'line' | 'scatter' | 'bar' | 'histogram'
  parameters?: Record<string, any>
}

export interface Pedigree {
  type: 'pedigree'
  position: 'above_question'
  storage: {
    method: 'structured_data' | 'svg' | 'png'
    data?: PedigreeData
    rendered_url?: string
    svg_url?: string
  }
  alt_text: string
}

export interface PedigreeData {
  generations: Generation[]
}

export interface Generation {
  gen: string // F0, F1, F2
  individuals: Individual[]
}

export interface Individual {
  id: string
  sex: 'male' | 'female'
  phenotype: 'affected' | 'unaffected' | 'carrier'
  parents?: string[]
}

export interface EnergyDiagram {
  type: 'energy_diagram'
  position: 'above_question'
  storage: {
    method: 'tikz_compiled' | 'matplotlib' | 'svg'
    svg_url?: string
    latex_source?: string
  }
  data: {
    reactants_energy: number
    activation_energy: number
    products_energy: number
    delta_H: number
    unit: string
  }
  alt_text: string
}

export interface LogicCircuit {
  type: 'logic_circuit'
  position: 'above_question'
  storage: {
    method: 'circuitikz' | 'svg' | 'png'
    svg_url?: string
    latex_source?: string
  }
  components: LogicGate[]
  alt_text: string
}

export interface LogicGate {
  type: 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR'
  inputs: string[]
  output: string
}

// ===========================================
// EXTENDED TYPES WITH JOINS
// ===========================================

export interface TeacherWithDetails extends Teacher {
  institute?: Institute
  classes?: Class[]
  subjects?: Subject[]
}

export interface MaterialWithDetails extends Material {
  institute?: Institute
  stream?: Stream
  class?: Class // DEPRECATED: Use classes array instead
  subject?: Subject
  material_type?: MaterialType
  chapters?: Chapter[]
  classes?: Class[] // Many-to-many relationship via MaterialClass junction table
  uploaded_by_teacher?: Teacher
}

export interface TestPaperWithDetails extends TestPaper {
  institute?: Institute
  stream?: Stream
  class?: Class // DEPRECATED: Use classes array instead
  subject?: Subject
  material_type?: MaterialType // DPP, JEE Mains Paper, JEE Advanced Paper, NEET Paper
  paper_template?: PaperTemplate // Template this paper was created from
  created_by_teacher?: Teacher
  chapters?: Chapter[]
  classes?: Class[] // Many-to-many relationship via PaperClass junction table
  sections?: TestPaperSection[] // Sections in this paper (for multi-section papers)
  questions?: Question[]
}

export interface QuestionWithDetails extends Question {
  chapter?: Chapter
  passage?: ComprehensionPassage
  paper?: TestPaper
}

export interface ClassWithDetails extends Class {
  institute?: Institute
  stream?: Stream
  class_level?: ClassLevel
}

export interface ChapterWithDetails extends Chapter {
  subject?: Subject
  class_level?: ClassLevel
}

export interface PaperTemplateWithDetails extends PaperTemplate {
  stream?: Stream
  sections?: PaperTemplateSectionWithDetails[]
}

export interface PaperTemplateSectionWithDetails extends PaperTemplateSection {
  paper_template?: PaperTemplate
  subject?: Subject
}

export interface SectionChapterWithDetails extends SectionChapter {
  section?: TestPaperSection
  chapter?: Chapter
}

export interface TestPaperSectionWithDetails extends TestPaperSection {
  paper?: TestPaper
  subject?: Subject
  questions?: Question[]
  chapters?: Chapter[] // NEW: Chapters assigned to this section via section_chapters
  chapter_count?: number // NEW: Count of assigned chapters
}

// ===========================================
// API REQUEST/RESPONSE TYPES
// ===========================================

export interface CreateTestPaperRequest {
  stream_id: string
  class_ids: string[] // Multiple classes via paper_classes junction table
  subject_id: string
  material_type_id: string // Paper type: DPP, NEET Paper, etc.
  paper_template_id?: string // Optional: For multi-section papers (REET), auto-creates sections
  title: string
  chapter_ids: string[]
  question_count: number
  difficulty_level: 'easy' | 'balanced' | 'hard'
  marks_per_question: number
  negative_marks: number
}

export interface GenerateQuestionsRequest {
  paper_id: string
  chapter_ids: string[]
  question_count: number // Generate 45, teacher selects 30
  difficulty_level?: 'easy' | 'medium' | 'hard'
}

export interface GenerateQuestionsResponse {
  questions: Question[]
  generation_time_ms: number
  cost_estimate: {
    tokens_used: number
    cost_usd: number
  }
}

export interface SelectQuestionsRequest {
  paper_id: string
  selected_question_ids: string[]
}

export interface GeneratePDFRequest {
  paper_id: string
  include_solution_sheet: boolean
  institute_template?: 'default' | 'custom'
}

export interface GeneratePDFResponse {
  pdf_url: string
  solution_url?: string
  generation_time_ms: number
}

// Paper Template APIs
export interface GetPaperTemplatesRequest {
  stream_id: string
}

export interface GetPaperTemplatesResponse {
  templates: PaperTemplateWithDetails[]
}

// Section-based generation (for multi-section papers)
export interface GenerateSectionQuestionsRequest {
  paper_id: string
  section_id: string
  chapter_ids?: string[] // Optional: specific chapters to generate from
}

export interface GenerateSectionQuestionsResponse {
  section: TestPaperSectionWithDetails
  questions: Question[]
  generation_time_ms: number
  cost_estimate: {
    tokens_used: number
    cost_usd: number
  }
}

export interface UpdateSectionStatusRequest {
  section_id: string
  status: 'pending' | 'ready' | 'in_review' | 'finalized'
}

export interface UploadMaterialRequest {
  stream_id: string
  class_id: string
  subject_id: string
  material_type_id: string
  title: string
  file: File
  chapter_ids: string[]
}

export interface UploadMaterialResponse {
  material_id: string
  file_url: string
  extracted_text_length: number
}

// ===========================================
// NEW: SECTION-BASED PAPER CREATION FLOW
// ===========================================

// GET /api/paper-templates/[id]/papers - List papers for a template
export interface GetTemplatePapersRequest {
  template_id: string
  status?: 'draft' | 'review' | 'finalized' // Optional filter
  class_id?: string // Optional filter
  search?: string // Optional search query
}

export interface GetTemplatePapersResponse {
  papers: Array<{
    id: string
    title: string
    created_at: string
    status: 'draft' | 'review' | 'finalized'
    difficulty_level: 'easy' | 'balanced' | 'hard'
    classes: Class[]
    sections: Array<{
      id: string
      section_name: string
      section_order: number
      status: 'pending' | 'ready' | 'in_review' | 'finalized'
      chapter_count: number
      question_count: number
    }>
  }>
}

// POST /api/test-papers/create-from-template - Simplified paper creation
export interface CreatePaperFromTemplateRequest {
  template_id: string
  title: string
  class_ids: string[]
  material_type_id: string
  difficulty_level: 'easy' | 'balanced' | 'hard'
}

export interface CreatePaperFromTemplateResponse {
  success: boolean
  paper_id: string
  status: 'draft'
  sections: TestPaperSection[]
  message: string
}

// GET /api/test-papers/[id]/sections/[section_id] - Get section details
export interface GetSectionDetailRequest {
  paper_id: string
  section_id: string
}

export interface GetSectionDetailResponse {
  section: TestPaperSectionWithDetails
  available_chapters: Chapter[] // Filtered by section's subject_id
  assigned_chapters: Chapter[] // Currently assigned to this section
}

// POST /api/test-papers/[id]/sections/[section_id]/assign-chapters
export interface AssignSectionChaptersRequest {
  chapter_ids: string[]
}

export interface AssignSectionChaptersResponse {
  success: boolean
  section_id: string
  chapters_assigned: number
  message: string
}

// POST /api/test-papers/[id]/sections/[section_id]/generate
export interface GenerateSectionQuestionsRequest {
  // No body needed - uses chapters from section_chapters table
}

export interface GenerateSectionQuestionsResponse {
  success: boolean
  section_id: string
  questions_generated: number
  generation_time_ms: number
  cost_estimate: {
    tokens_used: number
    cost_usd: number
  }
}

// POST /api/test-papers/[id]/sections/[section_id]/regenerate
export interface RegenerateSectionRequest {
  clear_existing?: boolean // Default true - delete old questions
}

export interface RegenerateSectionResponse {
  success: boolean
  section_id: string
  old_questions_deleted: number
  new_questions_generated: number
  message: string
}

// ===========================================
// VALIDATION SCHEMAS (Use with Zod)
// ===========================================

/*
// Example Zod schema (copy to src/lib/validation.ts)

import { z } from 'zod'

export const SingleCorrectMCQSchema = z.object({
  type: z.literal('single_correct_mcq'),
  options: z.array(z.object({
    label: z.string(),
    text: z.string(),
    media: z.any().optional()
  })).min(2).max(6),
  correct_answer: z.string()
})

export const MultipleCorrectMCQSchema = z.object({
  type: z.literal('multiple_correct_mcq'),
  options: z.array(z.object({
    label: z.string(),
    text: z.string()
  })).min(2).max(6),
  correct_answers: z.array(z.string()).min(1)
})

export const QuestionDataSchema = z.discriminatedUnion('type', [
  SingleCorrectMCQSchema,
  MultipleCorrectMCQSchema,
  // Add more as needed
])

// Validate before inserting
export function validateQuestionData(data: unknown): QuestionData {
  return QuestionDataSchema.parse(data) as QuestionData
}
*/

// ===========================================
// STORAGE TYPES
// ===========================================

export const STORAGE_BUCKETS = {
  MATERIALS: 'materials_bucket',
  PAPERS: 'papers_bucket',
  DIAGRAMS: 'diagrams_bucket',
  TEMP: 'temp_bucket'
} as const

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]

export interface StorageFile {
  bucket: StorageBucket
  path: string
  url: string
  size_bytes: number
  mime_type: string
  uploaded_at: string
}

// ===========================================
// HELPER TYPE GUARDS
// ===========================================

export function isSingleCorrectMCQ(data: QuestionData): data is SingleCorrectMCQ {
  return data.type === 'single_correct_mcq'
}

export function isMultipleCorrectMCQ(data: QuestionData): data is MultipleCorrectMCQ {
  return data.type === 'multiple_correct_mcq'
}

export function isIntegerType(data: QuestionData): data is IntegerType {
  return data.type === 'integer'
}

export function isNumericalRange(data: QuestionData): data is NumericalRange {
  return data.type === 'numerical_range'
}

export function isMatrixMatch(data: QuestionData): data is MatrixMatch {
  return data.type === 'matrix_match'
}

export function isAssertionReason(data: QuestionData): data is AssertionReason {
  return data.type === 'assertion_reason'
}

export function isSubjective(data: QuestionData): data is Subjective {
  return data.type === 'subjective'
}

// Media type guards
export function isCircuitDiagram(media: MediaAttachment): media is CircuitDiagram {
  return media.type === 'circuit'
}

export function isChemicalStructure(media: MediaAttachment): media is ChemicalStructure {
  return media.type === 'chemical_structure'
}

export function isChemicalReaction(media: MediaAttachment): media is ChemicalReaction {
  return media.type === 'chemical_reaction'
}

export function isBiologicalDiagram(media: MediaAttachment): media is BiologicalDiagram {
  return ['anatomical', 'cellular', 'ecological'].includes(media.type)
}

export function isGraph(media: MediaAttachment): media is Graph {
  return media.type === 'graph'
}

export function isPedigree(media: MediaAttachment): media is Pedigree {
  return media.type === 'pedigree'
}

export function isEnergyDiagram(media: MediaAttachment): media is EnergyDiagram {
  return media.type === 'energy_diagram'
}

export function isLogicCircuit(media: MediaAttachment): media is LogicCircuit {
  return media.type === 'logic_circuit'
}
