/**
 * REET Mains Level 1 - Teaching Methodology Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Mains is the 3rd Grade Teacher Selection Exam (SEPARATE from REET Pre):
 * - REET Pre = Eligibility exam (qualifying)
 * - REET Mains = Final selection exam (merit-based)
 * - Only candidates who cleared REET Pre can appear for REET Mains
 *
 * This protocol is for the Teaching Methodology section:
 * - Part of REET Mains Level 1 integrated paper
 * - 20 questions, 40 marks (2 marks each)
 * - 5 options per question (changed from 4 in 2025)
 * - Negative marking: -1/3 mark per wrong answer
 * - Difficulty level: Graduation level
 * - Tests practical teaching knowledge for primary level (Classes 1-5)
 *
 * SECTION COVERAGE (20 Questions, 40 marks):
 * ===========================================
 *
 * A. TEACHING METHODS & STRATEGIES (~5-6 questions):
 *    - Child-centered vs teacher-centered teaching
 *    - Active learning strategies
 *    - Play-way method
 *    - Storytelling and dramatization
 *    - Discussion method
 *    - Demonstration method
 *    - Project-based learning
 *    - Cooperative learning
 *    - Differentiated instruction
 *
 * B. CLASSROOM MANAGEMENT (~4-5 questions):
 *    - Classroom organization and seating arrangements
 *    - Discipline management (positive discipline)
 *    - Time management in teaching
 *    - Resource management
 *    - Creating inclusive classroom environment
 *    - Handling diverse learners
 *    - Classroom rules and routines
 *
 * C. CONTINUOUS AND COMPREHENSIVE EVALUATION (CCE) (~3-4 questions):
 *    - Formative vs summative assessment
 *    - Tools and techniques of assessment
 *    - Observation and recording
 *    - Portfolio assessment
 *    - Peer assessment and self-assessment
 *    - Grading and reporting
 *    - Feedback mechanisms
 *    - Diagnostic and remedial teaching
 *
 * D. LESSON PLANNING & INSTRUCTIONAL DESIGN (~3-4 questions):
 *    - Components of lesson plan
 *    - Learning objectives (Bloom's taxonomy)
 *    - Teaching-learning materials (TLM)
 *    - Instructional aids and resources
 *    - Introduction, development, conclusion
 *    - Homework and assignments
 *    - Recap and revision strategies
 *
 * E. INCLUSIVE EDUCATION & SPECIAL NEEDS (~2-3 questions):
 *    - Concept of inclusive education
 *    - Identifying children with special needs
 *    - Teaching strategies for diverse learners
 *    - Addressing learning disabilities
 *    - Gifted children education
 *    - Culturally responsive teaching
 *    - Gender-sensitive pedagogy
 *
 * F. EDUCATIONAL TECHNOLOGY & INNOVATIONS (~1-2 questions):
 *    - Use of technology in primary teaching
 *    - Digital tools and resources
 *    - Activity-based learning
 *    - Field trips and experiential learning
 *    - Community participation
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET MAINS LEVEL 1 PAPERS (2019-2024 if available)
 *    - Document teaching methods vs classroom management vs CCE split
 *    - Track scenario-based vs theoretical questions
 *    - Identify primary-specific pedagogy emphasis
 *    - Track inclusive education coverage
 *    - Analyze 5-option MCQ patterns
 *    - Document practical vs theoretical balance
 *
 * 2. DEFINE REET MAINS TEACHING METHODOLOGY ARCHETYPES (examples):
 *    - Teaching Strategy Knowledge
 *    - Classroom Management Application
 *    - Assessment Technique Understanding
 *    - Lesson Planning Knowledge
 *    - Inclusive Education Awareness
 *    - Scenario-based Problem Solving
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET MAINS-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 5-Option MCQ (PRIMARY format - changed in 2025)
 *    - Scenario-based MCQ (classroom situations)
 *    - Theoretical MCQ
 *    - Application-based MCQ
 *    (Verify against actual REET Mains papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - 20 questions, 40 marks requirement
 *    - 5 options per question (CRITICAL - different from Pre)
 *    - Graduation-level difficulty
 *    - Primary level teaching focus (Classes 1-5)
 *    - Practical teaching scenarios
 *    - NCF 2005 alignment
 *    - RTE and NEP 2020 teaching principles
 *    - CCE emphasis (as per RTE)
 *    - Inclusive education principles
 *    - Real classroom situations
 *
 * 5. CREATE REET MAINS TEACHING METHODOLOGY VALIDATORS:
 *    - 5 options per question (MUST validate)
 *    - Pedagogical accuracy (methods, strategies)
 *    - Primary level appropriateness (Classes 1-5)
 *    - Scenario realism (practical classroom situations)
 *    - NCF/RTE/NEP alignment
 *    - Inclusive education principles
 *    - Answer key balance
 *    - No overly theoretical questions
 *
 * IMPORTANT NOTES:
 * - This section tests PRACTICAL teaching knowledge, not just theory
 * - REET Mains is SELECTION exam (merit-based), not eligibility
 * - 5 options per MCQ (changed in 2025, not 4)
 * - Focus on primary level pedagogy (Classes 1-5)
 * - Scenario-based questions common (real classroom situations)
 * - CCE is critical (mandated by RTE Act 2009)
 * - Inclusive education important (NEP 2020 emphasis)
 * - Teaching methods must be age-appropriate for young children
 * - Classroom management for 6-11 year olds (not adolescents)
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../../types'

export const reetMainsLevel1TeachingMethodologyProtocol: Protocol = {
  id: 'reet-mains-level1-teaching-methodology',
  name: 'REET Mains Level 1 - Teaching Methodology',
  streamName: 'REET Mains Level 1',
  subjectName: 'Teaching Methodology',

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
    'TODO: Add REET Mains Teaching Methodology-specific prohibitions after paper analysis',
    'TODO: 5-option MCQ requirements (not 4-option)',
    'TODO: Primary level pedagogy appropriateness',
    'TODO: Scenario realism requirements',
    'TODO: NCF/RTE/NEP alignment requirements'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET Mains papers
    warmupPercentage: 0.10      // TODO: Verify with REET Mains papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Mains Level 1 - Teaching Methodology protocol not implemented yet. ' +
      'Please analyze REET Mains Level 1 papers and implement this protocol. ' +
      'CRITICAL: This section tests PRACTICAL teaching knowledge for Classes 1-5. ' +
      'Coverage: Teaching methods, classroom management, CCE, lesson planning, inclusive education. ' +
      'Scenario-based questions common. ' +
      'MUST use 5 options per MCQ. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Mains Level 1 Teaching Methodology - Practical pedagogy for Classes 1-5 (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Mains Level 1 papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27',
    examType: 'SELECTION (Merit-based)',
    sectionWeightage: '20 questions out of 150 (13%)'
  }
}
