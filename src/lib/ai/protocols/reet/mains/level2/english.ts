/**
 * REET Mains Level 2 - English Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Mains is the 3rd Grade Teacher Selection Exam (SEPARATE from REET Pre):
 * - REET Pre = Eligibility exam (qualifying)
 * - REET Mains = Final selection exam (merit-based)
 * - Only candidates who cleared REET Pre can appear for REET Mains
 *
 * REET Mains Level 2 - English is for Classes 6-8 English Teacher Selection:
 * - Integrated paper: Common sections + English subject specialization
 * - 150 questions, 300 marks (2 marks each)
 * - Duration: 2 hours 30 minutes
 * - Negative marking: -1/3 mark per wrong answer
 * - 5 options per question (changed from 4 in 2025)
 * - Difficulty level: Graduation level
 * - Heavy emphasis on Rajasthan-specific content in common sections
 *
 * PAPER STRUCTURE (150 Questions, 300 Marks):
 * ===========================================
 * PART A - COMMON SECTIONS (80 Questions, 160 Marks) - FOR ALL CANDIDATES:
 *
 * 1. Rajasthan Geography, History & Culture (40 questions, 80 marks)
 *    - Rajasthan geography, history, culture (detailed coverage)
 *
 * 2. General Knowledge of Rajasthan (25 questions, 50 marks)
 *    - Current affairs, government schemes, polity
 *
 * 3. Educational Psychology (10 questions, 20 marks)
 *    - Adolescent psychology, learning theories, RTE, NEP 2020
 *
 * 4. Information Technology (5 questions, 10 marks)
 *    - Basics of Computers
 *    - MS Office, Internet, Email
 *    - Digital India, IT tools in Education
 *
 * PART B - SUBJECT SPECIALIZATION (70 Questions, 140 Marks) - SUBJECT TEACHERS ONLY:
 *
 * 5. English Subject Content (60 questions, 120 marks)
 *    - Advanced English grammar
 *      - Tenses (all 12 tenses, perfect continuous)
 *      - Voice (active, passive - complex transformations)
 *      - Narration (direct, indirect - advanced)
 *      - Conditionals (all types)
 *      - Modals and their usage
 *      - Clauses (noun, adjective, adverb)
 *      - Parts of speech (advanced)
 *      - Phrasal verbs and idioms
 *    - English literature
 *      - Poetry (poets, poems, literary devices)
 *      - Prose (authors, novels, short stories)
 *      - Drama (playwrights, plays)
 *      - Literary movements and periods
 *      - Critical analysis
 *    - English comprehension (unseen passages - complex)
 *    - English pedagogy (upper primary level)
 *
 * 6. English Teaching Methods / Pedagogy (10 questions, 20 marks)
 *    - Teaching strategies for English language
 *    - Lesson planning for English classes
 *    - Assessment methods for English
 *    - Teaching-learning materials for English
 *    - Use of teaching aids in English instruction
 *    - Activity-based learning in English
 *    - Error analysis and remediation in English
 *    - Communicative language teaching approach
 *    - Language skills (reading, writing, speaking, listening)
 *    - Vocabulary (synonyms, antonyms, one-word substitutions)
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET MAINS LEVEL 2 ENGLISH PAPERS (2019-2024 if available)
 *    - Document common sections vs English-specific distribution
 *    - Track Rajasthan content emphasis in common sections
 *    - Identify English literature coverage (authors, works, periods)
 *    - Track grammar depth (graduation level)
 *    - Analyze 5-option MCQ patterns
 *    - Document pedagogy integration
 *
 * 2. DEFINE REET MAINS LEVEL 2 ENGLISH ARCHETYPES (examples):
 *    - Rajasthan Factual Knowledge
 *    - Educational Policy & Psychology
 *    - English Grammar Application (advanced level)
 *    - English Literature Knowledge (authors, works, movements)
 *    - English Comprehension & Analysis
 *    - English Pedagogy (teaching methodology)
 *    - Language Skills Assessment
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET MAINS-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 5-Option MCQ (PRIMARY format - changed in 2025)
 *    - Comprehension passage-based MCQ
 *    - Grammar transformation MCQ
 *    - Literature-based MCQ
 *    - Pedagogy scenario MCQ
 *    (Verify against actual REET Mains papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - Integrated paper structure (Common 160 marks + English 140 marks)
 *    - 5 options per question (CRITICAL - different from Pre)
 *    - Rajasthan-specific content in common sections
 *    - Graduation-level English (literature, grammar, comprehension)
 *    - British/American English standard (specify which)
 *    - English literature canon (major authors, works, movements)
 *    - Educational framework (RTE, NEP 2020)
 *    - Adolescent pedagogy focus
 *
 * 5. CREATE REET MAINS LEVEL 2 ENGLISH VALIDATORS:
 *    - Section distribution (40+25+10+5+60+10 = 150 questions)
 *    - 5 options per question (MUST validate)
 *    - English grammar accuracy (advanced level)
 *    - English literature accuracy
 *    - Comprehension passage complexity
 *    - Rajasthan content accuracy
 *    - Educational policy accuracy
 *    - Graduation-level difficulty
 *    - Answer key balance
 *
 * IMPORTANT NOTES:
 * - REET Mains is SELECTION exam (merit-based), not eligibility like Pre
 * - Integrated paper: Common sections (160 marks) + English specialization (140 marks)
 * - 5 options per MCQ (changed in 2025, not 4)
 * - Rajasthan content dominates common sections
 * - Graduation-level difficulty throughout
 * - English literature includes major authors, movements, genres
 * - Advanced grammar (all tenses, clauses, conditionals, transformations)
 * - English pedagogy for upper primary (Classes 6-8)
 * - Focus on language skills development
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../../types'

export const reetMainsLevel2EnglishProtocol: Protocol = {
  id: 'reet-mains-level2-english',
  name: 'REET Mains Level 2 - English',
  streamName: 'REET Mains Level 2',
  subjectName: 'English',

  difficultyMappings: {
    easy: {
      archetypes: {} as any,      // MUST analyze REET Mains Level 2 papers first
      structuralForms: {} as any,
      cognitiveLoad: {} as any
    },
    balanced: {
      archetypes: {} as any,
      structuralForms: {} as any,
      cognitiveLoad: {} as any
    },
    hard: {
      archetypes: {} as any,
      structuralForms: {} as any,
      cognitiveLoad: {} as any
    }
  },

  prohibitions: [
    'TODO: Add REET Mains Level 2 English-specific prohibitions after paper analysis',
    'TODO: 5-option MCQ requirements (not 4-option)',
    'TODO: English grammar accuracy standards',
    'TODO: English literature accuracy standards',
    'TODO: Graduation-level difficulty requirements'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET Mains papers
    warmupPercentage: 0.10      // TODO: Verify with REET Mains papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Mains Level 2 - English protocol not implemented yet. ' +
      'Please analyze REET Mains Level 2 English papers and implement this protocol. ' +
      'CRITICAL: This is 3rd Grade Teacher SELECTION exam for Classes 6-8 English teachers. ' +
      'Paper structure: Common sections (Raj GK-A 80m + Raj GK-B 50m + Psychology 20m + IT 10m = 160m)) + English (Content 120m + Pedagogy 20m = 140m) = 300m. ' +
      'MUST use 5 options per MCQ. Graduation-level English literature and grammar. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Mains Level 2 English protocol - 3rd Grade English Teacher Selection for Classes 6-8 (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Mains Level 2 English papers (2019-2024)',
    version: '0.0.1-structure-fixed',
    lastUpdated: '2025-12-27',
    examType: 'SELECTION (Merit-based)',
    sectionWeightage: 'Subject specialization - 140 marks (English Content: 120m + English Pedagogy: 20m)',
    relatedExam: 'REET Pre Level 2 (Eligibility/Qualifying)'
  }
}
