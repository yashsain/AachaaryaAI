/**
 * TypeScript interfaces for PDF generation
 * Phase 6: PDF Generation
 */

export interface QuestionForPDF {
  id: string
  question_text: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correct_answer: 'A' | 'B' | 'C' | 'D'
  explanation?: string
  marks: number
  negative_marks: number
  question_order: number
  chapter_name: string
  chapter_id: string
  // Section info (for multi-section papers)
  section_id?: string | null
  section_name?: string | null
  section_order?: number | null
  // Passage info (for passage-based comprehension questions)
  passage_id?: string | null
  passage_text?: string | null
  passage_order?: number | null
  // Bilingual support (English translations)
  language?: 'hindi' | 'english' | 'bilingual'
  question_text_en?: string | null
  options_en?: {
    A?: string
    B?: string
    C?: string
    D?: string
  } | null
  explanation_en?: string | null
  passage_en?: string | null
  // Question metadata (from question_data JSONB)
  structural_form?: string | null  // e.g., "matchFollowing", "standard4OptionMCQ"
}

export interface ContactInfo {
  city?: string
  phone?: string
  address?: string
  email?: string
}

export interface PDFSection {
  section_id: string
  section_name: string
  section_order: number
  questions: QuestionForPDF[]
  subject_name?: string
  marks_per_question?: number
}

export interface TemplateConfig {
  // Institute branding
  instituteLogo?: string          // Base64 data URI
  instituteName: string
  primaryColor: string            // Hex color code
  tagline?: string
  contactInfo: ContactInfo
  watermarkText?: string          // Text to display as diagonal watermark (e.g., first word of institute name)

  // Paper metadata
  testTitle: string               // e.g., "NEET Biology Mock Test"
  testCode: string                // Generated or from metadata
  date: string                    // From finalized_at (formatted)
  duration: string                // e.g., "03:00 Hrs"
  maxMarks: number                // Sum of all selected questions marks
  topics: string[]                // Array of chapter names
  examType?: string               // e.g., "REET Mains Level 2", "NEET"
  streamName?: string             // e.g., "REET", "NEET", "JEE"

  // Questions
  questions: QuestionForPDF[]

  // Multi-section support (for REET-style papers)
  hasSections?: boolean
  sections?: PDFSection[]

  // Optional settings
  showSolutions?: boolean         // Future: Phase 6.2
  bilingual?: boolean             // Future: Phase 6.2

  // Option E (Fifth Option) support for Rajasthan exams
  enableOptionE?: boolean         // true for REET exams, false for NEET/JEE
                                  // Label auto-detected per question (Hindi vs English)
}

export interface PDFGenerationOptions {
  paperId: string
  instituteId: string
  includeAnswerKey?: boolean      // Future: Phase 6.2
  includeSolutions?: boolean      // Future: Phase 6.2
}
