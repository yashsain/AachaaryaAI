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

  buildPrompt: (config, chapterName, questionCount, totalQuestions, isBilingual = false) => {
    const archetypeCounts = getArchetypeCounts(config, questionCount)
    const structuralCounts = getStructuralFormCounts(config, questionCount)

    return `You are an expert REET Mains Level 2 Information Technology question paper generator. Generate ${questionCount} high-quality REET Mains-style Information Technology questions from the provided study materials for the chapter: "${chapterName}".

This is part of a ${totalQuestions}-question paper. Generate questions following the REET Mains Level 2 Information Technology protocol strictly.

**LANGUAGE**: ${isBilingual
  ? `BILINGUAL MODE - Generate questions in BOTH Hindi and English
- Hindi is PRIMARY (always required) - Use Devanagari script
- English is SECONDARY (for bilingual support)
- Both languages must convey the SAME meaning and difficulty
- Generate both languages in a SINGLE response

⚠️ CRITICAL BILINGUAL RULE - READ THIS FIRST ⚠️

Hindi fields (questionText, options) MUST NEVER contain English text in parentheses.

❌ ABSOLUTELY FORBIDDEN EXAMPLES (from actual broken questions):
   - "हार्डवेयर (Hardware) क्या है?"
   - "सॉफ्टवेयर (Software) का प्रकार"
   - "इनपुट डिवाइस (Input Device) की परिभाषा"

✅ REQUIRED FORMAT:
   - questionText: "हार्डवेयर क्या है?"
   - questionText_en: "What is Hardware?"
   - options.A: "सॉफ्टवेयर का प्रकार"
   - options_en.A: "Type of Software"

THIS IS NOT OPTIONAL. Violating this rule makes your output UNUSABLE.

**Pre-Generation Checklist** (ask yourself BEFORE generating):
1. Will my Hindi fields be PURE Hindi with NO English in parentheses?
2. Will my English fields be PURE English with NO Hindi in parentheses?
3. Am I using separate questionText/questionText_en and options/options_en fields?
4. If answer to ANY is "no" → STOP. You're about to make a critical error.

**Translation Guidelines**:
- Technical IT terms: Use standard English terms in English version (CPU, RAM, ROM, etc.)
- Software names: Keep identical in both languages (Microsoft Word, Windows, Excel)
- Concepts: Translate accurately (e.g., हार्डवेयर → Hardware, सॉफ्टवेयर → Software)
- Numbers/Dates: Keep identical in both languages
- Acronyms: Use English acronyms in both versions (HTML, HTTP, URL)
- Maintain factual accuracy and question difficulty in both languages
- Avoid literal word-by-word translation - preserve meaning and context

**CRITICAL - Clean Language Separation (NO Parenthetical Translations)**:
1. NEVER put English translations in parentheses after Hindi words:
   ❌ WRONG: "हार्डवेयर (Hardware) क्या है?"
   ✅ CORRECT: questionText: "हार्डवेयर क्या है?", questionText_en: "What is Hardware?"

2. NEVER put Hindi transliterations in parentheses after English words:
   ❌ WRONG: questionText_en: "What is RAM (रैम)?"
   ✅ CORRECT: questionText_en: "What is RAM?", questionText: "RAM क्या है?"

3. Technical acronyms with expansions are ALLOWED (same in both languages):
   ✅ CORRECT: "SaaS (Software as a Service)" - use in BOTH questionText and questionText_en
   ✅ CORRECT: "IaaS (Infrastructure as a Service)" - use in BOTH languages
   ✅ CORRECT: "HTTP (HyperText Transfer Protocol)" - use in BOTH languages

4. Keep each language pure and separate - use the dedicated fields:
   - questionText = Pure Hindi only (except technical acronyms)
   - questionText_en = Pure English only
   - options = Pure Hindi only (except technical acronyms)
   - options_en = Pure English only

⚠️ MANDATORY POST-GENERATION VALIDATION ⚠️

BEFORE returning your JSON, perform this validation:

**Step 1**: Search for "questionText" in your JSON
   - Does it contain ANY English words in (parentheses)? → If YES: DELETE the parentheses part immediately

**Step 2**: Search for "options" and check all A, B, C, D values
   - Does ANY option contain English in (parentheses)? → If YES: DELETE the parentheses part immediately

**Step 3**: Examples of what to find and fix:
   - FIND: "हार्डवेयर (Hardware) क्या है?" → FIX TO: "हार्डवेयर क्या है?"
   - FIND: "सॉफ्टवेयर (Software) का प्रकार" → FIX TO: "सॉफ्टवेयर का प्रकार"
   - FIND: "इनपुट डिवाइस (Input Device)" → FIX TO: "इनपुट डिवाइस"

**Step 4**: If you found and fixed ANY violations → Good, now your JSON is correct
   - If you found ZERO violations → Perfect, your JSON is already correct

DO NOT SKIP THIS VALIDATION. Your output will be rejected if Hindi fields contain English parentheses.`
  : `ALL questions MUST be in Hindi (हिंदी)
- Use Devanagari script for all questions and options
- Primary language for REET exam in Rajasthan`}

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
- **DUPLICATE OPTIONS - All 4 options MUST be textually unique**
  - WRONG: (A) RAM (B) ROM (C) CPU (D) CPU ← DUPLICATE!
  - CORRECT: All 4 options have different text
- Identical names/values in multiple options (even with different labels)
- **CRITICAL FOR NAME-BASED QUESTIONS** (software names, hardware names, people):
  - When options contain names, ensure all 4 are DIFFERENT
  - Example: Operating systems question - all 4 must be different OS names
  - NEVER repeat the same term in two options

- ❌ **NAME VARIATION DUPLICATES - SAME ITEM IN DIFFERENT FORMATS**
  - **MOST CRITICAL**: The same item appearing with different name formats is UNACCEPTABLE
  - ❌ WRONG: (A) Microsoft Word (full name) ... (D) MS Word (abbreviation) ← SAME SOFTWARE!
    - "MS Word" is just the abbreviated form of "Microsoft Word"
    - These are NOT different software - it's the SAME application with full name vs abbreviation
  - ❌ WRONG: Full form vs abbreviated forms of the SAME term
    - Example: (A) Central Processing Unit (B) CPU ← SAME COMPONENT!
    - Example: (A) Random Access Memory (B) RAM ← SAME COMPONENT!
    - Example: (A) Hypertext Markup Language (B) HTML ← SAME LANGUAGE!
    - Example: (A) World Wide Web (B) WWW ← SAME THING!
  - ❌ WRONG: Same software/hardware with version numbers or brand variations
    - Example: (A) Windows 10 (B) Microsoft Windows ← SAME OS!
    - Example: (A) MS Office (B) Microsoft Office ← SAME SUITE!
  - ✅ CORRECT: All 4 options are DIFFERENT items (software, hardware, or concepts)
    - Example: (A) Microsoft Word (B) LibreOffice Writer (C) Google Docs (D) Notepad
    - Example: (A) CPU (B) RAM (C) Hard Disk (D) Motherboard
    - All 4 are completely different items (not same item with different formats)

  **VERIFICATION RULE**: Before finalizing, ask yourself: "Are all 4 options different ITEMS (software/hardware/concepts), or is the same item appearing in multiple formats (full name vs abbreviation)?"

### Answer Key - NEVER violate:
- No more than 3 consecutive questions with the same correct answer

### Explanation Requirements - MANDATORY:
- ✅ Explanations MUST be concrete, factual, and helpful
- ✅ Explain WHY the correct answer is right (with technical reasoning)
- ✅ Explain WHY each incorrect option is wrong
- ❌ **NEVER write meta-commentary about the question quality**
- ❌ **NEVER admit errors in the question within the explanation**
- ❌ **NEVER write "this option should be X" or "the question has issues"**
- **If you detect an error while writing explanation, FIX THE QUESTION - don't document the error**

**WRONG Explanation Example** (NEVER do this):
"Option D should be 'Hard Disk' instead of 'CPU'" ← Admitting error in explanation!

**CORRECT Explanation Example**:
"RAM (Random Access Memory) is volatile memory used for temporary data storage. ROM (Read-Only Memory) is non-volatile and stores firmware. CPU (Central Processing Unit) executes instructions. A hard disk is a storage device for permanent data retention, making it the correct answer."

---

## OPTION CONSTRUCTION RULES

- **All 4 options MUST be textually unique (no duplicates - even single character difference matters)**
- **Name-based questions** (software, hardware, technology names): Use 4 DIFFERENT items - never repeat
- All 4 options must be approximately equal length (87% of questions)
- All 4 options must use the same grammatical structure (98% of questions)
- All 4 options must be mutually exclusive
- Make distractors plausible using DIFFERENT but related entities - use common IT misconceptions from DIFFERENT technologies, partially correct facts, reversal traps

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

${isBilingual
  ? `**BILINGUAL FORMAT** (Generate both Hindi and English):

\`\`\`json
{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "प्रश्न का हिंदी पाठ यहां (Full question in Hindi Devanagari)",
      "questionText_en": "Full question text in English",
      "archetype": "directRecall" | "directApplication" | "integrative" | "discriminator" | "exceptionOutlier",
      "structuralForm": "standardMCQ" | "matchFollowing" | "assertionReason" | "negativePhrasing" | "multiStatement",
      "cognitiveLoad": "low" | "medium" | "high",
      "correctAnswer": "A" | "B" | "C" | "D",
      "options": {
        "A": "विकल्प A हिंदी में (Option A in Hindi)",
        "B": "विकल्प B हिंदी में (Option B in Hindi)",
        "C": "विकल्प C हिंदी में (Option C in Hindi)",
        "D": "विकल्प D हिंदी में (Option D in Hindi)"
      },
      "options_en": {
        "A": "Option A in English",
        "B": "Option B in English",
        "C": "Option C in English",
        "D": "Option D in English"
      },
      "explanation": "व्याख्या हिंदी में (Explanation in Hindi)",
      "explanation_en": "Clear explanation in English",
      "difficulty": "easy" | "medium" | "hard",
      "language": "bilingual",
      "ncertFidelity": "strict" | "moderate" | "loose"
    }
  ]
}
\`\`\``
  : `**MONOLINGUAL FORMAT** (Hindi only):

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
      "language": "hindi",
      "ncertFidelity": "strict" | "moderate" | "loose"
    }
  ]
}
\`\`\``}

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
${isBilingual
  ? `
**BILINGUAL MODE REQUIREMENTS**:
- Generate BOTH Hindi and English in SINGLE response
- Include questionText + questionText_en, options + options_en, explanation + explanation_en
- Set "language": "bilingual" in each question
- Ensure both languages convey identical meaning and difficulty`
  : `
**MONOLINGUAL MODE**:
- ALL content in Hindi (Devanagari script)
- Set "language": "hindi" in each question`}

**QUALITY VERIFICATION** (check before returning):
✓ All 4 options are textually unique - NO DUPLICATES (character-by-character check)
✓ For name-based questions: All 4 options contain DIFFERENT software/hardware/technology names
✓ Explanation is concrete and factual - NO meta-commentary about errors
✓ Explanation explains correct answer AND why wrong options are incorrect
✓ No option says "None of the above" or "All of the above"
✓ All IT terminology is current and accurate (2024-2025 standards)

Return the JSON now:`
  },

  validators: [
    // Bilingual validation
    (questions: any[]) => {
      const errors: string[] = []
      const devanagariPattern = /[\u0900-\u097F]/

      for (const q of questions) {
        if (q.language === 'bilingual') {
          // Check English question text exists
          if (!q.questionText_en || q.questionText_en.trim().length === 0) {
            errors.push(`Question ${q.questionNumber}: Bilingual question missing English translation (questionText_en)`)
          }

          // Check English options exist and match Hindi options count
          if (!q.options_en || typeof q.options_en !== 'object') {
            errors.push(`Question ${q.questionNumber}: Bilingual question missing English options (options_en)`)
          } else {
            const hindiKeys = Object.keys(q.options)
            const englishKeys = Object.keys(q.options_en)
            if (hindiKeys.length !== englishKeys.length) {
              errors.push(`Question ${q.questionNumber}: Mismatch between Hindi (${hindiKeys.length}) and English (${englishKeys.length}) option counts`)
            }
            // Check English options have no Devanagari
            for (const [key, value] of Object.entries(q.options_en)) {
              if (devanagariPattern.test(value as string)) {
                errors.push(`Question ${q.questionNumber}: English option ${key} contains Devanagari script`)
              }
            }
          }

          // Check English explanation exists
          if (!q.explanation_en || q.explanation_en.trim().length === 0) {
            errors.push(`Question ${q.questionNumber}: Bilingual question missing English explanation (explanation_en)`)
          }

          // Validate English content doesn't contain Devanagari
          if (q.questionText_en && devanagariPattern.test(q.questionText_en)) {
            errors.push(`Question ${q.questionNumber}: English questionText contains Devanagari script`)
          }
          if (q.explanation_en && devanagariPattern.test(q.explanation_en)) {
            errors.push(`Question ${q.questionNumber}: English explanation contains Devanagari script`)
          }

          // Validate Hindi content contains Devanagari
          if (!devanagariPattern.test(q.questionText)) {
            errors.push(`Question ${q.questionNumber}: Hindi questionText missing Devanagari script`)
          }
        }
      }

      return errors
    }
  ],

  metadata: {
    description: 'REET Mains Level 2 - Information Technology (Common Section - 10 marks)',
    analysisSource: 'RSMSSB Official Pattern',
    version: '1.0.0',
    lastUpdated: '2025-12-27',
    examType: 'SELECTION (Merit-based)',
    sectionWeightage: 'Common Section - 10 marks (5 questions @ 2 marks each) out of 160-mark common section'
  }
}
