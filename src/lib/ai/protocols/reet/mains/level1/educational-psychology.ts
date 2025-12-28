/**
 * REET Mains Level 1 - Educational Psychology Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Mains is the 3rd Grade Teacher Selection Exam (SEPARATE from REET Pre):
 * - REET Pre = Eligibility exam (qualifying)
 * - REET Mains = Final selection exam (merit-based)
 * - Only candidates who cleared REET Pre can appear for REET Mains
 *
 * This protocol is for the Educational Psychology section:
 * - Part of REET Mains Level 1 integrated paper
 * - 10 questions, 20 marks (2 marks each)
 * - 5 options per question (changed from 4 in 2025)
 * - Negative marking: -1/3 mark per wrong answer
 * - Difficulty level: Graduation level
 * - Focuses on child psychology (ages 6-11 years - primary level)
 *
 * SECTION COVERAGE (10 Questions, 20 Marks):
 * ===========================================
 *
 * A. CHILD DEVELOPMENT (AGES 6-11) (~3-4 questions):
 *    - Physical development
 *      - Growth patterns
 *      - Motor skills development
 *      - Health and nutrition
 *    - Cognitive development
 *      - Piaget's concrete operational stage
 *      - Memory development
 *      - Attention span
 *      - Language development
 *    - Social-emotional development
 *      - Peer relationships
 *      - Self-concept formation
 *      - Emotional regulation
 *
 * B. LEARNING THEORIES (~2-3 questions):
 *    - Behaviorism (Pavlov, Skinner, Thorndike)
 *    - Cognitive theories (Piaget, Bruner)
 *    - Social learning theory (Bandura)
 *    - Constructivism (Vygotsky)
 *    - Information processing theory
 *    - Multiple intelligences (Gardner)
 *
 * C. INDIVIDUAL DIFFERENCES (~2 questions):
 *    - Intelligence and IQ
 *    - Learning styles (visual, auditory, kinesthetic)
 *    - Aptitude and achievement
 *    - Personality differences
 *    - Gender differences in learning
 *
 * D. MOTIVATION & DISCIPLINE (~2 questions):
 *    - Types of motivation (intrinsic, extrinsic)
 *    - Rewards and punishments
 *    - Positive reinforcement
 *    - Discipline strategies for primary level
 *    - Classroom behavioral management
 *
 * E. LEARNING DISABILITIES (~1 question):
 *    - Dyslexia, Dyscalculia, Dysgraphia
 *    - ADHD (Attention Deficit Hyperactivity Disorder)
 *    - Identification and support
 *    - Inclusive classroom strategies
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET MAINS LEVEL 1 PAPERS (2019-2024 if available)
 *    - Document child development vs learning theories vs motivation split
 *    - Track age-specific focus (6-11 years)
 *    - Identify theorist coverage (Piaget, Vygotsky, Skinner, etc.)
 *    - Track learning disabilities coverage
 *    - Analyze 5-option MCQ patterns
 *    - Document theory vs application balance
 *
 * 2. DEFINE REET MAINS EDUCATIONAL PSYCHOLOGY ARCHETYPES (examples):
 *    - Child Development Knowledge (6-11 years)
 *    - Learning Theory Application
 *    - Individual Differences Understanding
 *    - Motivation Principle Knowledge
 *    - Learning Disability Awareness
 *    - Theorist Identification
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET MAINS-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 5-Option MCQ (PRIMARY format - changed in 2025)
 *    - Theoretical MCQ
 *    - Application-based MCQ
 *    - Theorist attribution MCQ
 *    (Verify against actual REET Mains papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - 10 questions, 20 marks requirement
 *    - 5 options per question (CRITICAL - different from Pre)
 *    - Graduation-level difficulty
 *    - Age-specific focus (6-11 years, NOT adolescents)
 *    - Major learning theorists (Piaget, Vygotsky, Skinner, Bandura)
 *    - Developmental stages accuracy
 *    - Learning theory principles
 *    - Individual differences awareness
 *    - Motivation and discipline strategies
 *
 * 5. CREATE REET MAINS EDUCATIONAL PSYCHOLOGY VALIDATORS:
 *    - 5 options per question (MUST validate)
 *    - Age appropriateness (6-11 years focus)
 *    - Psychological theory accuracy
 *    - Theorist attribution accuracy
 *    - Developmental stage accuracy
 *    - Learning disability knowledge correctness
 *    - Answer key balance
 *
 * IMPORTANT NOTES:
 * - Smallest section in REET Mains Level 1 (10/150 questions = 7%)
 * - REET Mains is SELECTION exam (merit-based), not eligibility
 * - 5 options per MCQ (changed in 2025, not 4)
 * - Age focus: 6-11 years (primary level, NOT adolescents)
 * - Piaget's concrete operational stage is critical for this age
 * - Vygotsky's Zone of Proximal Development (ZPD) important
 * - Must know major theorists and their contributions
 * - Learning disabilities awareness (dyslexia, dyscalculia, ADHD)
 * - Individual differences and inclusive education
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../../types'

export const reetMainsLevel1EducationalPsychologyProtocol: Protocol = {
  id: 'reet-mains-level1-educational-psychology',
  name: 'REET Mains Level 1 - Educational Psychology',
  streamName: 'REET Mains Level 1',
  subjectName: 'Educational Psychology',

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
    'TODO: Add REET Mains Educational Psychology-specific prohibitions after paper analysis',
    'TODO: 5-option MCQ requirements (not 4-option)',
    'TODO: Age appropriateness (6-11 years, not adolescents)',
    'TODO: Psychological theory accuracy',
    'TODO: Theorist attribution accuracy'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET Mains papers
    warmupPercentage: 0.10      // TODO: Verify with REET Mains papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Mains Level 1 - Educational Psychology protocol not implemented yet. ' +
      'Please analyze REET Mains Level 1 papers and implement this protocol. ' +
      'CRITICAL: This section focuses on child psychology for ages 6-11 (primary level). ' +
      'Coverage: Child development, learning theories (Piaget, Vygotsky, Skinner, Bandura), ' +
      'individual differences, motivation, learning disabilities. ' +
      'MUST use 5 options per MCQ. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Mains Level 1 Educational Psychology - Child psychology for ages 6-11 (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Mains Level 1 papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27',
    examType: 'SELECTION (Merit-based)',
    sectionWeightage: '10 questions out of 150 (7%)'
  }
}
