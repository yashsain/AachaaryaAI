/**
 * REET Mains Level 1 - School Subjects Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Mains is the 3rd Grade Teacher Selection Exam (SEPARATE from REET Pre):
 * - REET Pre = Eligibility exam (qualifying)
 * - REET Mains = Final selection exam (merit-based)
 * - Only candidates who cleared REET Pre can appear for REET Mains
 *
 * This protocol is for the School Subjects section:
 * - Part of REET Mains Level 1 integrated paper
 * - 20 questions, 40 marks (2 marks each)
 * - 5 options per question (changed from 4 in 2025)
 * - Negative marking: -1/3 mark per wrong answer
 * - Difficulty level: Graduation level
 * - Covers ALL primary subjects (Hindi, Mathematics, English, Science, Social Studies, EVS)
 *
 * SECTION COVERAGE (20 Questions, 40 Marks):
 * ===========================================
 * This section tests content knowledge across ALL subjects taught in Classes 1-5:
 *
 * A. HINDI (~3-4 questions):
 *    - Basic grammar (वर्ण, शब्द, वाक्य)
 *    - Parts of speech (संज्ञा, सर्वनाम, विशेषण, क्रिया)
 *    - Gender, number (लिंग, वचन)
 *    - Simple comprehension
 *    - Vocabulary (पर्यायवाची, विलोम)
 *
 * B. MATHEMATICS (~3-4 questions):
 *    - Number system (natural, whole, integers)
 *    - Basic arithmetic (addition, subtraction, multiplication, division)
 *    - Fractions and decimals
 *    - Geometry basics (shapes, angles)
 *    - Measurement (length, weight, capacity, time)
 *    - Simple word problems
 *
 * C. ENGLISH (~3-4 questions):
 *    - Basic grammar (parts of speech, tenses)
 *    - Vocabulary (synonyms, antonyms)
 *    - Simple comprehension
 *    - Sentence formation
 *    - Articles, prepositions
 *
 * D. ENVIRONMENTAL STUDIES (~4-5 questions):
 *    - Family and relationships
 *    - Food, water, shelter
 *    - Plants and animals
 *    - My body (human body basics)
 *    - Environment and nature
 *    - Community helpers
 *
 * E. GENERAL SCIENCE (~2-3 questions):
 *    - Living and non-living things
 *    - Plants (parts, types)
 *    - Animals (types, habitats)
 *    - Human body (basic organs)
 *    - Water, air, soil
 *
 * F. SOCIAL STUDIES (~2-3 questions):
 *    - Family and society
 *    - Our country India (basic facts)
 *    - National symbols
 *    - Festivals and celebrations
 *    - Good habits and values
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET MAINS LEVEL 1 PAPERS (2019-2024 if available)
 *    - Document subject-wise distribution (Hindi/Math/English/EVS/Science/Social)
 *    - Track difficulty level (primary level content, graduation level questions?)
 *    - Identify cross-subject integration
 *    - Analyze 5-option MCQ patterns
 *    - Document NCERT Classes 1-5 alignment
 *
 * 2. DEFINE REET MAINS SCHOOL SUBJECTS ARCHETYPES (examples):
 *    - Hindi Grammar Knowledge
 *    - Mathematics Problem Solving
 *    - English Grammar Knowledge
 *    - EVS Conceptual Understanding
 *    - Science Factual Knowledge
 *    - Social Studies Awareness
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET MAINS-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 5-Option MCQ (PRIMARY format - changed in 2025)
 *    - Calculation-based MCQ (mathematics)
 *    - Grammar application MCQ
 *    - Conceptual MCQ
 *    (Verify against actual REET Mains papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - 20 questions, 40 marks requirement
 *    - 5 options per question (CRITICAL - different from Pre)
 *    - All 6 subjects coverage (Hindi, Math, English, EVS, Science, Social Studies)
 *    - Primary level content (Classes 1-5)
 *    - NCERT alignment (Classes 1-5)
 *    - Age-appropriate difficulty
 *    - Subject balance
 *    - Factual accuracy
 *
 * 5. CREATE REET MAINS SCHOOL SUBJECTS VALIDATORS:
 *    - 5 options per question (MUST validate)
 *    - Subject distribution balance
 *    - NCERT Classes 1-5 alignment
 *    - Age-appropriate content
 *    - Mathematical accuracy
 *    - Grammar accuracy (Hindi and English)
 *    - Scientific accuracy
 *    - Answer key balance
 *
 * IMPORTANT NOTES:
 * - This section covers ALL primary subjects in just 20 questions
 * - REET Mains is SELECTION exam (merit-based), not eligibility
 * - 5 options per MCQ (changed in 2025, not 4)
 * - Content is Classes 1-5 level, but questions are graduation-level difficulty
 * - NCERT Classes 1-5 alignment critical
 * - Subject balance important (can't have 10 Math, 0 Hindi)
 * - Tests teacher's knowledge of what they'll teach
 * - Cross-subject integration possible (EVS + Science + Social Studies)
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../../types'

export const reetMainsLevel1SchoolSubjectsProtocol: Protocol = {
  id: 'reet-mains-level1-school-subjects',
  name: 'REET Mains Level 1 - School Subjects',
  streamName: 'REET Mains Level 1',
  subjectName: 'School Subjects',

  difficultyMappings: {
    easy: {
      archetypes: {} as any,      // MUST analyze REET Mains Level 1 papers first
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
    'TODO: Add REET Mains School Subjects-specific prohibitions after paper analysis',
    'TODO: 5-option MCQ requirements (not 4-option)',
    'TODO: NCERT Classes 1-5 alignment requirements',
    'TODO: Subject balance requirements',
    'TODO: Age-appropriate content standards'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET Mains papers
    warmupPercentage: 0.10      // TODO: Verify with REET Mains papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Mains Level 1 - School Subjects protocol not implemented yet. ' +
      'Please analyze REET Mains Level 1 papers and implement this protocol. ' +
      'CRITICAL: This section covers ALL primary subjects in 20 questions. ' +
      'Subjects: Hindi, Mathematics, English, EVS, Science, Social Studies. ' +
      'NCERT Classes 1-5 alignment. ' +
      'MUST use 5 options per MCQ. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Mains Level 1 School Subjects - All primary subjects (Hindi, Math, English, EVS, Science, Social) (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Mains Level 1 papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27',
    examType: 'SELECTION (Merit-based)',
    sectionWeightage: '20 questions out of 150 (13%)'
  }
}
