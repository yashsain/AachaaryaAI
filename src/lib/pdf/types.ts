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
}

export interface ContactInfo {
  city?: string
  phone?: string
  address?: string
  email?: string
}

export interface TemplateConfig {
  // Institute branding
  instituteLogo?: string          // Base64 data URI
  instituteName: string
  primaryColor: string            // Hex color code
  tagline?: string
  contactInfo: ContactInfo

  // Paper metadata
  testTitle: string               // e.g., "NEET Biology Mock Test"
  testCode: string                // Generated or from metadata
  date: string                    // From finalized_at (formatted)
  duration: string                // e.g., "03:00 Hrs"
  maxMarks: number                // Sum of all selected questions marks
  topics: string[]                // Array of chapter names

  // Questions
  questions: QuestionForPDF[]

  // Optional settings
  showSolutions?: boolean         // Future: Phase 6.2
  bilingual?: boolean             // Future: Phase 6.2
}

export interface PDFGenerationOptions {
  paperId: string
  instituteId: string
  includeAnswerKey?: boolean      // Future: Phase 6.2
  includeSolutions?: boolean      // Future: Phase 6.2
}
