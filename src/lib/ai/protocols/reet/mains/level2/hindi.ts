/**
 * REET Mains Level 2 - Hindi Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Mains is the 3rd Grade Teacher Selection Exam (SEPARATE from REET Pre):
 * - REET Pre = Eligibility exam (qualifying)
 * - REET Mains = Final selection exam (merit-based)
 * - Only candidates who cleared REET Pre can appear for REET Mains
 *
 * REET Mains Level 2 - Hindi is for Classes 6-8 Hindi Teacher Selection:
 * - Integrated paper: Common sections + Hindi subject specialization
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
 *    - Rajasthan geography (detailed - districts, rivers, climate, minerals)
 *    - Rajasthan history (kingdoms, rulers, freedom movement, monuments)
 *    - Rajasthan culture (festivals, folk arts, traditions, handicrafts)
 *    - Rajasthani Language
 *
 * 2. General Knowledge of Rajasthan (25 questions, 50 marks)
 *    - Current affairs (Rajasthan-specific)
 *    - Rajasthan government schemes
 *    - Educational Scenario of Rajasthan
 *    - RTE Act 2009
 *
 * 3. Educational Psychology (10 questions, 20 marks)
 *    - Child Development & Pedagogy
 *    - Learning theories and principles
 *    - Personality & Individual Differences
 *    - Educational Psychology concepts
 *
 * 4. Information Technology (5 questions, 10 marks)
 *    - Basics of Computers
 *    - MS Office, Internet, Email
 *    - Digital India, IT tools in Education
 *
 * PART B - HINDI SUBJECT SPECIALIZATION (70 Questions, 140 Marks) - HINDI TEACHERS ONLY:
 *
 * 5. Hindi Subject Content (60 questions, 120 marks)
 *    - Advanced Hindi grammar (व्याकरण)
 *      - संज्ञा, सर्वनाम, विशेषण, क्रिया, क्रिया विशेषण
 *      - लिंग, वचन, कारक, काल, वाच्य
 *      - उपसर्ग, प्रत्यय, संधि, समास
 *      - मुहावरे, लोकोक्तियाँ, पर्यायवाची, विलोम
 *    - Hindi literature (साहित्य)
 *      - काव्य (कवि, रचनाएँ, काव्य रूप)
 *      - गद्य (लेखक, रचनाएँ, गद्य रूप)
 *      - रस, छंद, अलंकार
 *      - हिंदी साहित्य का इतिहास
 *    - Hindi comprehension (अपठित गद्यांश/पद्यांश)
 *    - Language skills and communication
 *
 * 6. Hindi Teaching Methods / Pedagogy (10 questions, 20 marks)
 *    - Teaching strategies for Hindi language
 *    - Lesson planning for Hindi classes
 *    - Assessment methods for Hindi
 *    - Teaching-learning materials for Hindi
 *    - Use of teaching aids in Hindi instruction
 *    - Activity-based learning in Hindi
 *    - Error analysis and remediation in Hindi
 *    - Multilingual classroom management
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET MAINS LEVEL 2 HINDI PAPERS (2019-2024 if available)
 *    - Document common sections vs Hindi-specific distribution
 *    - Track Rajasthan content emphasis in common sections
 *    - Identify Hindi literature coverage (authors, works)
 *    - Track grammar depth (graduation level)
 *    - Analyze 5-option MCQ patterns
 *    - Document pedagogy integration
 *
 * 2. DEFINE REET MAINS LEVEL 2 HINDI ARCHETYPES (examples):
 *    - Rajasthan Factual Knowledge (geography, history, culture)
 *    - Educational Policy & Psychology
 *    - Hindi Grammar Application (advanced level)
 *    - Hindi Literature Knowledge (authors, works, movements)
 *    - Hindi Comprehension & Analysis
 *    - Hindi Pedagogy (teaching methodology)
 *    - Language Skills Assessment
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET MAINS-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 5-Option MCQ (PRIMARY format - changed in 2025)
 *    - Comprehension passage-based MCQ
 *    - Grammar application MCQ
 *    - Literature-based MCQ
 *    - Pedagogy scenario MCQ
 *    (Verify against actual REET Mains papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - Integrated paper structure (Common 160 marks + Hindi 140 marks)
 *    - 5 options per question (CRITICAL - different from Pre)
 *    - Rajasthan-specific content in common sections
 *    - Graduation-level Hindi (literature, grammar, comprehension)
 *    - Devanagari script standards
 *    - Hindi literature canon (major authors, works, movements)
 *    - Educational framework (RTE, NEP 2020)
 *    - Hindi pedagogy section (20 marks - teaching methods specific to Hindi)
 *
 * 5. CREATE REET MAINS LEVEL 2 HINDI VALIDATORS:
 *    - Section distribution (40+25+10+5+60+10 = 150 questions)
 *    - Common: 80 questions (Raj GK-A: 40, Raj GK-B: 25, Psychology: 10, IT: 5)
 *    - Subject: 70 questions (Hindi Content: 60, Hindi Pedagogy: 10)
 *    - 5 options per question (MUST validate)
 *    - Devanagari script correctness
 *    - Hindi literature accuracy
 *    - Grammar accuracy (advanced level)
 *    - Rajasthan content accuracy
 *    - Educational policy accuracy
 *    - Graduation-level difficulty
 *    - Answer key balance
 *
 * IMPORTANT NOTES:
 * - REET Mains is SELECTION exam (merit-based), not eligibility like Pre
 * - Integrated paper: Common sections (180 marks) + Hindi specialization (120 marks)
 * - 5 options per MCQ (changed in 2025, not 4)
 * - Rajasthan content dominates common sections
 * - Graduation-level difficulty throughout
 * - Hindi literature includes major authors, movements, काव्य and गद्य forms
 * - Advanced grammar (समास, रस, छंद, अलंकार)
 * - Must use correct Devanagari script
 * - Hindi pedagogy for upper primary (Classes 6-8)
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../../types'

export const reetMainsLevel2HindiProtocol: Protocol = {
  id: 'reet-mains-level2-hindi',
  name: 'REET Mains Level 2 - Hindi',
  streamName: 'REET Mains Level 2',
  subjectName: 'Hindi',

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
    'TODO: Add REET Mains Level 2 Hindi-specific prohibitions after paper analysis',
    'TODO: 5-option MCQ requirements (not 4-option)',
    'TODO: Devanagari script standards',
    'TODO: Hindi literature accuracy standards',
    'TODO: Graduation-level difficulty requirements'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET Mains papers
    warmupPercentage: 0.10      // TODO: Verify with REET Mains papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Mains Level 2 - Hindi protocol not implemented yet. ' +
      'Please analyze REET Mains Level 2 Hindi papers and implement this protocol. ' +
      'CRITICAL: This is 3rd Grade Teacher SELECTION exam for Classes 6-8 Hindi teachers. ' +
      'Paper structure: Common sections (Raj GK-A 80m + Raj GK-B 50m + Psychology 20m + IT 10m = 160m) + ' +
      'Hindi (Content 120m + Pedagogy 20m = 140m) = 300m total. ' +
      'MUST use 5 options per MCQ. Graduation-level Hindi literature and grammar. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Mains Level 2 Hindi protocol - 3rd Grade Hindi Teacher Selection for Classes 6-8 (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Mains Level 2 Hindi papers (2019-2024)',
    version: '0.0.1-structure-fixed',
    lastUpdated: '2025-12-27',
    examType: 'SELECTION (Merit-based)',
    relatedExam: 'REET Pre Level 2 (Eligibility/Qualifying)',
    sectionWeightage: 'Subject specialization - 140 marks (Hindi Content: 120m + Hindi Pedagogy: 20m)'
  }
}
