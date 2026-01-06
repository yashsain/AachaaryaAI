/**
 * REET Mains Level 2 - Information Technology Protocol (Common Section)
 *
 * This is part of the COMMON SECTION for ALL REET Mains Level 2 candidates.
 * Every candidate must take this section regardless of subject specialization.
 *
 * EXAM STRUCTURE (Based on Official RSMSSB Pattern):
 * =====================================================
 *
 * INFORMATION TECHNOLOGY (10 Marks, 5 Questions @ 2 marks each)
 * - Basics of Computers (hardware, software, input/output devices)
 * - Operating Systems (Windows, file management)
 * - MS Office (Word, Excel, PowerPoint basics)
 * - Internet & Email (browsing, email, online safety)
 * - Digital India Initiatives
 * - IT Tools in Education
 * - Cyber Security Basics
 * - ICT in Teaching-Learning
 *
 * PART OF: 160-mark Common Section
 * - Rajasthan GK Part A: 80 marks
 * - Rajasthan GK Part B: 50 marks
 * - Educational Psychology: 20 marks
 * - Information Technology: 10 marks ← THIS PROTOCOL
 *
 * Question Format:
 * - Multiple Choice Questions (4 options)
 * - Graduation level difficulty
 * - Negative marking applicable
 * - Focus on practical IT knowledge for teachers
 */

import { Protocol } from '../../../../types'
import { getArchetypeCounts, getStructuralFormCounts } from '../../../../../difficultyMapper'

export const reetMainsLevel2InformationTechnologyProtocol: Protocol = {
  id: 'reet-mains-level2-information-technology',
  name: 'REET Mains Level 2 - Information Technology',
  streamName: 'REET Mains Level 2',
  subjectName: 'Information Technology',

  difficultyMappings: {
    easy: {
      archetypes: {
        directRecall: 0.70,
        directApplication: 0.15,
        integrative: 0.06,
        discriminator: 0.05,
        exceptionOutlier: 0.04
      },
      structuralForms: {
        standardMCQ: 0.80,
        matchFollowing: 0.10,
        assertionReason: 0.04,
        negativePhrasing: 0.03,
        multiStatement: 0.03
      },
      cognitiveLoad: {
        lowDensity: 0.55,
        mediumDensity: 0.35,
        highDensity: 0.10
      }
    },
    balanced: {
      archetypes: {
        directRecall: 0.65,
        directApplication: 0.17,
        integrative: 0.08,
        discriminator: 0.06,
        exceptionOutlier: 0.04
      },
      structuralForms: {
        standardMCQ: 0.75,
        matchFollowing: 0.12,
        assertionReason: 0.06,
        negativePhrasing: 0.04,
        multiStatement: 0.03
      },
      cognitiveLoad: {
        lowDensity: 0.50,
        mediumDensity: 0.38,
        highDensity: 0.12
      }
    },
    hard: {
      archetypes: {
        directRecall: 0.60,
        directApplication: 0.15,
        integrative: 0.12,
        discriminator: 0.09,
        exceptionOutlier: 0.04
      },
      structuralForms: {
        standardMCQ: 0.70,
        matchFollowing: 0.14,
        assertionReason: 0.08,
        negativePhrasing: 0.05,
        multiStatement: 0.03
      },
      cognitiveLoad: {
        lowDensity: 0.45,
        mediumDensity: 0.40,
        highDensity: 0.15
      }
    }
  },

  prohibitions: [
    'NEVER use "Always" or "Never" in question stems',
    'NEVER use double negatives',
    'NEVER include "None of the above" or "All of the above"',
    'NEVER create subset inclusion (Option A contained in Option B)',
    'NEVER place more than 2 consecutive high-density questions',
    'NEVER create lopsided visual weight (1 long + 3 short options)',
    'NEVER use ambiguous pronouns without clear referents',
    'NEVER create non-mutually exclusive options',
    'NEVER create Match questions without 4×4 matrix and coded options',
    'NEVER violate max-3-consecutive same answer key',
    'MUST use current and updated IT terminology',
    'MUST focus on practical IT knowledge for teachers',
    'MUST align with Digital India initiatives'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,
    warmupPercentage: 0.10
  },

  buildPrompt: (config, chapterName, questionCount, totalQuestions) => {
    const archetypeCounts = getArchetypeCounts(config, questionCount)
    const structuralCounts = getStructuralFormCounts(config, questionCount)

    return `You are an expert REET Mains Level 2 Information Technology question paper generator. Generate ${questionCount} high-quality REET Mains-style Information Technology questions from the provided study materials for the chapter: "${chapterName}".

This is part of a ${totalQuestions}-question paper. Generate questions following the REET Mains Level 2 Information Technology protocol strictly.

---

## QUESTION ARCHETYPE DISTRIBUTION (Target Counts)

Generate exactly:
- **${archetypeCounts.directRecall} Direct Recall questions**: Single-concept factual knowledge about IT basics, definitions, terminology. Use exact wording from the study materials.
- **${archetypeCounts.directApplication} Direct Application questions**: Single-step application of IT concepts to straightforward scenarios.
- **${archetypeCounts.integrative} Integrative/Multi-concept questions**: Combine two or more IT concepts requiring connections across topics.
- **${archetypeCounts.discriminator} Conceptual Discriminator questions**: Deep conceptual understanding to separate subtle IT distinctions.
- **${archetypeCounts.exceptionOutlier} Exception/Outlier Logic questions**: Identify exceptions to general IT rules, special cases, outliers.

Every question must fall into exactly ONE archetype category.

---

## STRUCTURAL FORMS DISTRIBUTION (Target Counts)

Generate exactly:
- **${structuralCounts.standardMCQ} Standard 4-Option MCQ**: Traditional single stem with 4 options A, B, C, D.
- **${structuralCounts.matchFollowing} Match-the-Following**: Always use 4×4 matrix with coded options (see template below).
- **${structuralCounts.assertionReason} Assertion-Reason**: Two statements with 4 options about truth and linkage (see template below).
- **${structuralCounts.negativePhrasing} Negative Phrasing**: Use "Which is NOT correct", "incorrect statement", "exception" format.
- **${structuralCounts.multiStatement} Multi-Statement Combination**: Provide 4-5 statements, ask to select correct group from coded combinations.

Every question must use exactly ONE structural form.

---

## REET MAINS IT CONTENT FOCUS

Focus on these key areas for Information Technology (10 marks, Common Section):

1. **Computer Basics** (30%):
   - Hardware components (CPU, RAM, ROM, Storage devices)
   - Input/Output devices (keyboard, mouse, monitor, printer)
   - Software types (System software, Application software)
   - Computer generations and evolution

2. **Operating Systems & File Management** (15%):
   - Windows operating system basics
   - File and folder management
   - Desktop, taskbar, icons
   - File extensions and types

3. **MS Office Suite** (25%):
   - MS Word: Basic formatting, page setup, tables
   - MS Excel: Basic formulas, cell operations, charts
   - MS PowerPoint: Creating slides, presentations, animations

4. **Internet & Communication** (20%):
   - Internet basics (WWW, browsers, URLs)
   - Email usage and etiquette
   - Search engines
   - Online safety and cyber security basics

5. **Digital India & IT in Education** (10%):
   - Digital India initiatives
   - E-governance
   - ICT tools for teaching-learning
   - Educational technology platforms

---

## STRUCTURAL FORM TEMPLATES (Use Exact Formats)

### Match-the-Following Template:
**FROZEN RULE**: The questionText field MUST contain the COMPLETE matrix showing Column I and Column II items, followed by the exact ending phrase.

Display Format (what students see):
\`\`\`
Match Column I with Column II:

Column I                          Column II
A. [IT Concept 1]                 I. [Description/Technology 1]
B. [IT Concept 2]                 II. [Description/Technology 2]
C. [IT Concept 3]                 III. [Description/Technology 3]
D. [IT Concept 4]                 IV. [Description/Technology 4]

Choose the correct answer from the options given below:
(A) A-III, B-I, C-IV, D-II
(B) A-I, B-II, C-III, D-IV
(C) A-II, B-IV, C-I, D-III
(D) A-IV, B-III, C-II, D-I
\`\`\`

**CRITICAL**: Put the ENTIRE matrix (Column I, Column II, all A-D and I-IV items) INSIDE questionText. Options field ONLY contains coded combinations like "A-III, B-I, C-IV, D-II".

Example Match Question for IT:
\`\`\`
Match Column I with Column II:

Column I (Computer Generation)    Column II (Underlying Technology)
A. First Generation               I. Integrated Circuits
B. Second Generation              II. Vacuum Tubes
C. Third Generation               III. VLSI
D. Fourth Generation              IV. Transistors

Choose the correct answer from the options given below:
(A) A-II, B-IV, C-I, D-III
(B) A-I, B-II, C-III, D-IV
(C) A-IV, B-I, C-II, D-III
(D) A-III, B-IV, C-I, D-II
\`\`\`

**JSON Structure for Match Questions**:
- **questionText**: Contains the COMPLETE matrix with Column I items (A-D), Column II items (I-IV), and ending phrase
- **options**: Contains ONLY coded answer combinations like "A": "A-II, B-IV, C-I, D-III"
- **correctAnswer**: One of the coded options, e.g., "A"
- **structuralForm**: "matchFollowing"

---

## COGNITIVE LOAD SEQUENCING

- **First ${config.cognitiveLoad.warmupCount} questions**: WARM-UP ZONE - Use low-density, Direct Recall only (short stems, simple IT concepts)
- **Middle questions**: Mix of densities, but NEVER place more than 2 high-density questions consecutively
- **Last questions**: Maintain challenge - NO cooldown, keep difficulty consistent

**High-density definition**: Long stems (>50 words) OR 3+ decisions (like Assertion-Reason) OR Match-the-Following
**FROZEN RULE**: After any 2 consecutive high-density questions, MUST place at least 1 low-density question

---

## FROZEN PROHIBITIONS (Zero Violations Allowed)

### Question Stems - NEVER use:
- "Always" or "Never"
- Double negatives
- Ambiguous pronouns without clear referents
- Meta-references to sources: "according to the study material", "according to the provided material", "as mentioned in"
- Outdated IT terminology or deprecated technologies

**CRITICAL**: Write questions as direct, authoritative statements. This is a REET Mains exam, not a textbook quiz.

### Options - NEVER include:
- "None of the above"
- "All of the above"
- Subset inclusion (where Option A is completely contained in Option B)
- Lopsided visual weight (one massive option + three tiny options)
- Non-mutually exclusive options (options must be distinct)

### Answer Key - NEVER violate:
- No more than 3 consecutive questions with the same correct answer

---

## OPTION CONSTRUCTION RULES

- All 4 options must be approximately equal length (87% of questions)
- All 4 options must use the same grammatical structure (98% of questions)
- All 4 options must be mutually exclusive
- Make distractors plausible - use common IT misconceptions, partially correct facts, reversal traps

---

## ANSWER KEY BALANCE

- Distribute correct answers evenly: approximately 25% each for options A, B, C, D
- Never place more than 3 consecutive questions with the same correct answer
- Randomize answer positions naturally

---

## CONTENT FIDELITY (Critical)

- Use exact terminology and definitions from the provided study materials
- Approximately 60% of questions should use strict wording from the materials
- For remaining questions, paraphrase concepts accurately but maintain technical precision
- **NEVER mention the source in the question stem** - write as if this is established IT knowledge
- Extract content from materials but present it authoritatively without attribution
- Use current (2024-2025) IT terminology and standards

---

## OUTPUT FORMAT (JSON Schema)

Generate questions in this exact JSON format:

\`\`\`json
{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "Full question text here with all options",
      "archetype": "directRecall" | "directApplication" | "integrative" | "discriminator" | "exceptionOutlier",
      "structuralForm": "standardMCQ" | "matchFollowing" | "assertionReason" | "negativePhrasing" | "multiStatement",
      "cognitiveLoad": "low" | "medium" | "high",
      "correctAnswer": "A" | "B" | "C" | "D",
      "options": {
        "A": "Full text of option A",
        "B": "Full text of option B",
        "C": "Full text of option C",
        "D": "Full text of option D"
      },
      "explanation": "Clear explanation of why the correct answer is right and why other options are wrong",
      "difficulty": "easy" | "medium" | "hard",
      "ncertFidelity": "strict" | "moderate" | "loose"
    }
  ]
}
\`\`\`

---

## FINAL INSTRUCTIONS - READ CAREFULLY

Generate ${questionCount} questions now following ALL rules above.

**CRITICAL REQUIREMENTS** (violations will cause system errors):
1. Extract content EXCLUSIVELY from the provided study materials
2. Return ONLY valid JSON - no explanations, no comments, no text before/after
3. Follow the exact JSON format shown in the examples above - COPY the structure exactly
4. **NEVER reference sources in questions** - No "according to study material", "as per the notes", etc. Write questions as direct, authoritative statements like a real REET Mains exam

**FOR MATCH-THE-FOLLOWING QUESTIONS** (${structuralCounts.matchFollowing || 0} required):
- Only generate if count > 0
- Put the COMPLETE matrix (Column I items A-D, Column II items I-IV) in questionText
- End questionText with: "Choose the correct answer from the options given below:"
- Put ONLY coded combinations (e.g., "A-III, B-I, C-IV, D-II") in options
- If you omit the matrix or ending phrase, the question will be rejected

Example IT Match Question topics:
- Computer Generations with Underlying Technologies
- Input/Output Devices with their Primary Functions
- MS Office Tools with their Main Uses
- Network Protocols with their Purposes
- Storage Devices with their Storage Capacities
- Programming Languages with their Application Domains

**JSON OUTPUT**:
- Do NOT wrap JSON in markdown code blocks (\`\`\`json)
- Do NOT add any text before { or after }
- Ensure all ${questionCount} questions are in the "questions" array
- Validate your JSON structure before returning

Return the JSON now:`
  },

  validators: [],

  metadata: {
    description: 'REET Mains Level 2 - Information Technology (Common Section - 10 marks)',
    analysisSource: 'RSMSSB Official Pattern',
    version: '1.0.0',
    lastUpdated: '2025-12-27',
    examType: 'SELECTION (Merit-based)',
    sectionWeightage: 'Common Section - 10 marks (5 questions @ 2 marks each) out of 160-mark common section'
  }
}
