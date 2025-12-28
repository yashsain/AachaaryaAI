/**
 * REET Mains Level 1 - Information Technology Protocol (STUB - NOT READY FOR USE)
 *
 * ⚠️  WARNING: This is a NON-FUNCTIONAL stub. Do NOT use until fully implemented.
 *
 * REET Mains is the 3rd Grade Teacher Selection Exam (SEPARATE from REET Pre):
 * - REET Pre = Eligibility exam (qualifying)
 * - REET Mains = Final selection exam (merit-based)
 * - Only candidates who cleared REET Pre can appear for REET Mains
 *
 * This protocol is for the Information Technology section:
 * - Part of REET Mains Level 1 integrated paper
 * - 10 questions, 20 marks (2 marks each)
 * - 5 options per question (changed from 4 in 2025)
 * - Negative marking: -1/3 mark per wrong answer
 * - Difficulty level: Graduation level
 * - Modern addition to teacher exams (digital literacy focus)
 *
 * SECTION COVERAGE (10 Questions, 20 Marks):
 * ===========================================
 *
 * A. COMPUTER BASICS (~3-4 questions):
 *    - Computer components (hardware, software)
 *    - Input/output devices
 *    - Storage devices (HDD, SSD, USB, Cloud)
 *    - Operating systems (Windows, basic concepts)
 *    - File management
 *    - Computer memory (RAM, ROM)
 *
 * B. INTERNET & COMMUNICATION (~2-3 questions):
 *    - Internet basics (WWW, browser, URL)
 *    - Email and communication tools
 *    - Social media awareness
 *    - Online safety and cyber security basics
 *    - Search engines
 *    - Video conferencing tools (Zoom, Google Meet)
 *
 * C. EDUCATIONAL TECHNOLOGY (~2-3 questions):
 *    - Digital learning platforms (DIKSHA, e-Pathshala)
 *    - Online resources for teachers
 *    - Educational apps and tools
 *    - Digital content creation basics
 *    - E-learning and blended learning
 *    - Smart classrooms
 *    - Interactive whiteboards
 *
 * D. OFFICE APPLICATIONS (~1-2 questions):
 *    - Microsoft Word basics
 *    - Microsoft PowerPoint basics
 *    - Microsoft Excel basics
 *    - Google Workspace (Docs, Sheets, Slides)
 *
 * E. DIGITAL LITERACY & TRENDS (~1 question):
 *    - Artificial Intelligence basics
 *    - Digital India initiatives
 *    - E-governance
 *    - Digital payment systems
 *    - Computer terminology
 *
 * TO IMPLEMENT THIS PROTOCOL:
 * ================================
 * 1. ANALYZE REET MAINS LEVEL 1 PAPERS (2019-2024 if available)
 *    - Document computer basics vs educational tech vs internet split
 *    - Track educational technology emphasis
 *    - Identify specific tools/platforms mentioned
 *    - Track difficulty level (basic vs advanced)
 *    - Analyze 5-option MCQ patterns
 *    - Document recency (latest tech trends)
 *
 * 2. DEFINE REET MAINS IT ARCHETYPES (examples):
 *    - Computer Hardware/Software Knowledge
 *    - Internet & Communication Understanding
 *    - Educational Technology Awareness
 *    - Office Application Knowledge
 *    - Digital Literacy Concepts
 *    - Cyber Safety Awareness
 *    (Analyze papers to find ACTUAL archetypes - these are examples)
 *
 * 3. DEFINE REET MAINS-SPECIFIC STRUCTURAL FORMS:
 *    - Standard 5-Option MCQ (PRIMARY format - changed in 2025)
 *    - Fact-based MCQ
 *    - Application knowledge MCQ
 *    - Tool/platform identification MCQ
 *    (Verify against actual REET Mains papers)
 *
 * 4. BUILD COMPREHENSIVE PROMPT
 *    Include:
 *    - 10 questions, 20 marks requirement
 *    - 5 options per question (CRITICAL - different from Pre)
 *    - Graduation-level difficulty
 *    - Computer basics (hardware, software, OS)
 *    - Internet and communication tools
 *    - Educational technology platforms (DIKSHA, e-Pathshala)
 *    - Office applications (MS Office, Google Workspace)
 *    - Digital literacy and safety
 *    - Up-to-date terminology (not outdated tech)
 *    - Teacher-relevant technology
 *
 * 5. CREATE REET MAINS IT VALIDATORS:
 *    - 5 options per question (MUST validate)
 *    - Technical accuracy (computer concepts)
 *    - Educational technology relevance
 *    - Up-to-date information (not obsolete tech)
 *    - Teacher context appropriateness
 *    - Answer key balance
 *    - No overly technical questions
 *
 * IMPORTANT NOTES:
 * - Smallest section in REET Mains Level 1 (10/150 questions = 7%)
 * - REET Mains is SELECTION exam (merit-based), not eligibility
 * - 5 options per MCQ (changed in 2025, not 4)
 * - Modern addition (reflects digital education push)
 * - Educational technology is key (DIKSHA, e-Pathshala, etc.)
 * - Basic digital literacy, not advanced programming
 * - Teacher-relevant technology (not general IT)
 * - Online teaching tools important (post-COVID relevance)
 * - Cyber safety awareness
 * - Digital India initiatives
 *
 * REFERENCE: src/lib/ai/protocols/neet/biology.ts
 * GUIDE: docs/protocol_creation_guide.md
 */

import { Protocol } from '../../../types'

export const reetMainsLevel1InformationTechnologyProtocol: Protocol = {
  id: 'reet-mains-level1-information-technology',
  name: 'REET Mains Level 1 - Information Technology',
  streamName: 'REET Mains Level 1',
  subjectName: 'Information Technology',

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
    'TODO: Add REET Mains IT-specific prohibitions after paper analysis',
    'TODO: 5-option MCQ requirements (not 4-option)',
    'TODO: Technical accuracy standards',
    'TODO: Educational technology relevance',
    'TODO: Up-to-date information (no obsolete tech)'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,      // TODO: Verify with REET Mains papers
    warmupPercentage: 0.10      // TODO: Verify with REET Mains papers
  },

  buildPrompt: () => {
    throw new Error(
      'REET Mains Level 1 - Information Technology protocol not implemented yet. ' +
      'Please analyze REET Mains Level 1 papers and implement this protocol. ' +
      'CRITICAL: This section tests basic digital literacy for teachers. ' +
      'Coverage: Computer basics, internet & communication, educational technology (DIKSHA, e-Pathshala), ' +
      'office applications, digital literacy. ' +
      'MUST use 5 options per MCQ. ' +
      'See docs/protocol_creation_guide.md for instructions.'
    )
  },

  validators: [],

  metadata: {
    description: 'REET Mains Level 1 Information Technology - Digital literacy for teachers (STUB - NOT FUNCTIONAL)',
    analysisSource: 'REQUIRED: Analyze REET Mains Level 1 papers (2019-2024)',
    version: '0.0.0-stub',
    lastUpdated: '2025-12-27',
    examType: 'SELECTION (Merit-based)',
    sectionWeightage: '10 questions out of 150 (7%)'
  }
}
