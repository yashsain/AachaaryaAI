/**
 * REET Mains Level 1 - General Knowledge & Educational Framework Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Mains is the 3rd Grade Teacher Selection Exam (SEPARATE from REET Pre):
 * - REET Pre = Eligibility exam (qualifying)
 * - REET Mains = Final selection exam (merit-based)
 * - Only candidates who cleared REET Pre can appear for REET Mains
 *
 * This protocol is for the General Knowledge & Educational Framework section:
 * - Part of REET Mains Level 1 integrated paper
 * - 40 questions, 80 marks (2 marks each)
 * - 5 options per question (changed from 4 in 2025)
 * - Negative marking: -1/3 mark per wrong answer
 * - Difficulty level: Graduation level
 * - Second highest weightage section (27% of paper)
 *
 * SECTION COVERAGE (40 Questions, 80 Marks):
 * ===========================================
 *
 * A. RIGHT TO EDUCATION ACT 2009 (~8-10 questions):
 *    - Key provisions and objectives
 *    - Age group coverage (6-14 years)
 *    - Free and compulsory education
 *    - No detention policy
 *    - Pupil-teacher ratio (PTR) norms
 *    - Infrastructure requirements
 *    - Teacher qualifications (REET requirement itself)
 *    - Role of School Management Committee (SMC)
 *    - 25% EWS (Economically Weaker Section) reservation
 *    - Continuous and Comprehensive Evaluation (CCE)
 *
 * B. NATIONAL EDUCATION POLICY 2020 (~8-10 questions):
 *    - Key features and vision
 *    - 5+3+3+4 curricular structure (replacing 10+2)
 *    - Foundational Literacy and Numeracy (FLN) mission
 *    - Multidisciplinary education
 *    - Mother tongue/local language emphasis
 *    - Vocational education integration
 *    - Teacher education reforms
 *    - Assessment reforms
 *    - Digital education and technology
 *
 * C. CURRENT AFFAIRS (~10-12 questions):
 *    - National level (last 6-12 months)
 *      - Government policies and schemes
 *      - Major national events
 *      - Awards and honors (national)
 *      - Sports achievements
 *      - Science and technology developments
 *    - Rajasthan state level (last 6-12 months)
 *      - State government schemes (education-focused)
 *      - CM announcements and initiatives
 *      - State-level awards
 *      - Development projects
 *
 * D. INDIAN CONSTITUTION BASICS (~5-6 questions):
 *    - Preamble
 *    - Fundamental Rights (especially related to education)
 *    - Fundamental Duties
 *    - Directive Principles (education-related)
 *    - Constitutional amendments (education-related)
 *
 * E. RAJASTHAN GOVERNMENT SCHEMES (~5-6 questions):
 *    - Education-focused schemes
 *    - Mid-day meal programs
 *    - Scholarship schemes
 *    - Digital education initiatives
 *    - Teacher welfare schemes
 *    - Infrastructure development programs
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET MAINS LEVEL 1 PAPERS (2019-2024 if available)
 *    - Document RTE vs NEP vs Current Affairs split
 *    - Track current affairs temporal range (6 months? 12 months?)
 *    - Identify Rajasthan schemes coverage
 *    - Track constitution basics coverage
 *    - Analyze 5-option MCQ patterns
 *    - Document difficulty level
 *
 * 2. DEFINE REET MAINS GK & FRAMEWORK ARCHETYPES (examples):
 *    - RTE Provisions Knowledge
 *    - NEP 2020 Features Knowledge
 *    - Current Affairs Factual Recall
 *    - Constitutional Knowledge (education-focused)
 *    - Rajasthan Schemes Awareness
 *    - Educational Policy Application
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET MAINS-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 5-Option MCQ (PRIMARY format - changed in 2025)
 *    - Fact-based MCQ
 *    - Policy provision MCQ
 *    - Current affairs MCQ
 *    (Verify against actual REET Mains papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - 40 questions, 80 marks requirement
 *    - 5 options per question (CRITICAL - different from Pre)
 *    - Graduation-level difficulty
 *    - RTE Act 2009 provisions (accurate and complete)
 *    - NEP 2020 features (accurate and up-to-date)
 *    - Current affairs recency (last 6-12 months)
 *    - Rajasthan schemes (education-focused)
 *    - Constitution basics (education-related articles)
 *    - Factual accuracy standards
 *
 * 5. CREATE REET MAINS GK & FRAMEWORK VALIDATORS:
 *    - 5 options per question (MUST validate)
 *    - RTE Act accuracy (provisions, norms)
 *    - NEP 2020 accuracy (features, structure)
 *    - Current affairs recency (not outdated)
 *    - Rajasthan schemes accuracy
 *    - Constitutional accuracy
 *    - Graduation-level difficulty
 *    - Answer key balance
 *    - No ambiguous questions
 *
 * IMPORTANT NOTES:
 * - Second highest weightage section (40/150 questions = 27%)
 * - REET Mains is SELECTION exam (merit-based), not eligibility
 * - 5 options per MCQ (changed in 2025, not 4)
 * - RTE and NEP knowledge is CRITICAL (50% of this section)
 * - Current affairs must be recent (6-12 months, not older)
 * - Rajasthan government schemes important (education-focused)
 * - Constitution knowledge must be education-related
 * - Graduation-level difficulty
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../../types'

export const reetMainsLevel1GKFrameworkProtocol: Protocol = {
  id: 'reet-mains-level1-general-knowledge-educational-framework',
  name: 'REET Mains Level 1 - General Knowledge & Educational Framework',
  streamName: 'REET Mains Level 1',
  subjectName: 'General Knowledge & Educational Framework',

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
    'TODO: Add REET Mains GK & Framework-specific prohibitions after paper analysis',
    'TODO: 5-option MCQ requirements (not 4-option)',
    'TODO: RTE Act 2009 accuracy standards',
    'TODO: NEP 2020 accuracy standards',
    'TODO: Current affairs recency requirements',
    'TODO: Graduation-level difficulty requirements'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET Mains papers
    warmupPercentage: 0.10      // TODO: Verify with REET Mains papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Mains Level 1 - General Knowledge & Educational Framework protocol not implemented yet. ' +
      'Please analyze REET Mains Level 1 papers and implement this protocol. ' +
      'CRITICAL: This section tests RTE Act 2009 + NEP 2020 + Current Affairs + Constitution + Rajasthan schemes. ' +
      '40 questions, 80 marks. RTE and NEP are critical (50% of section). ' +
      'MUST use 5 options per MCQ. Graduation-level difficulty. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Mains Level 1 General Knowledge & Educational Framework - RTE, NEP 2020, Current Affairs (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Mains Level 1 papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27',
    examType: 'SELECTION (Merit-based)',
    sectionWeightage: '40 questions out of 150 (27%)'
  }
}
