/**
 * NEET Biology Protocol
 *
 * Complete protocol definition for NEET Biology question generation
 * Based on analysis of NEET 2019-2024 papers (580 questions)
 *
 * This protocol defines:
 * - Archetype distributions (Direct Recall, Integrative, Discriminator, etc.)
 * - Structural forms (Match-the-Following, Assertion-Reason, etc.)
 * - Cognitive load management
 * - Validation rules
 * - Prompt templates
 */

import { Protocol, ProtocolConfig } from '../types'
import { Question } from '../../questionValidator'

/**
 * NEET Biology Difficulty Mappings
 * Derived from 6 years of NEET paper analysis (2019-2024)
 */
const difficultyMappings: Protocol['difficultyMappings'] = {
  easy: {
    archetypes: {
      directRecall: 0.65,
      directApplication: 0.14,
      integrative: 0.08,
      discriminator: 0.06,
      exceptionOutlier: 0.07
    },
    structuralForms: {
      standardMCQ: 0.50,
      matchFollowing: 0.20,
      assertionReason: 0.08,
      negativePhrasing: 0.12,
      multiStatement: 0.10
    },
    cognitiveLoad: {
      lowDensity: 0.40,
      mediumDensity: 0.49,
      highDensity: 0.11
    }
  },
  balanced: {
    archetypes: {
      directRecall: 0.60,
      directApplication: 0.12,
      integrative: 0.10,
      discriminator: 0.08,
      exceptionOutlier: 0.10
    },
    structuralForms: {
      standardMCQ: 0.50,
      matchFollowing: 0.20,
      assertionReason: 0.08,
      negativePhrasing: 0.12,
      multiStatement: 0.10
    },
    cognitiveLoad: {
      lowDensity: 0.40,
      mediumDensity: 0.45,
      highDensity: 0.15
    }
  },
  hard: {
    archetypes: {
      directRecall: 0.58,
      directApplication: 0.10,
      integrative: 0.12,
      discriminator: 0.12,
      exceptionOutlier: 0.08
    },
    structuralForms: {
      standardMCQ: 0.50,
      matchFollowing: 0.20,
      assertionReason: 0.08,
      negativePhrasing: 0.12,
      multiStatement: 0.10
    },
    cognitiveLoad: {
      lowDensity: 0.40,
      mediumDensity: 0.44,
      highDensity: 0.16
    }
  }
}

/**
 * NEET Biology Prohibitions (FROZEN - Zero Violations Allowed)
 * Validated across 580 questions with 0 violations
 */
const prohibitions: string[] = [
  'NEVER use "Always" or "Never" in question stems',
  'NEVER use double negatives',
  'NEVER include "None of the above" or "All of the above"',
  'NEVER create subset inclusion (Option A contained in Option B)',
  'NEVER place more than 2 consecutive high-density questions',
  'NEVER create lopsided visual weight (1 long + 3 short options)',
  'NEVER use ambiguous pronouns without clear referents',
  'NEVER create non-mutually exclusive options',
  'NEVER create Match questions without 4×4 matrix and coded options',
  'NEVER violate max-3-consecutive same answer key'
]

/**
 * Helper functions for target counts
 */
function getArchetypeCounts(config: ProtocolConfig, questionCount: number): Record<string, number> {
  return {
    directRecall: Math.round(questionCount * config.archetypeDistribution.directRecall),
    directApplication: Math.round(questionCount * config.archetypeDistribution.directApplication),
    integrative: Math.round(questionCount * config.archetypeDistribution.integrative),
    discriminator: Math.round(questionCount * config.archetypeDistribution.discriminator),
    exceptionOutlier: Math.round(questionCount * config.archetypeDistribution.exceptionOutlier)
  }
}

function getStructuralFormCounts(config: ProtocolConfig, questionCount: number): Record<string, number> {
  return {
    standardMCQ: Math.round(questionCount * config.structuralForms.standardMCQ),
    matchFollowing: Math.round(questionCount * config.structuralForms.matchFollowing),
    assertionReason: Math.round(questionCount * config.structuralForms.assertionReason),
    negativePhrasing: Math.round(questionCount * config.structuralForms.negativePhrasing),
    multiStatement: Math.round(questionCount * config.structuralForms.multiStatement)
  }
}

/**
 * NEET Biology Prompt Builder
 * Comprehensive ~1000-word prompt with all NEET-specific rules
 */
function buildNEETBiologyPrompt(
  config: ProtocolConfig,
  chapterName: string,
  questionCount: number,
  totalQuestions: number
): string {
  const archetypeCounts = getArchetypeCounts(config, questionCount)
  const structuralCounts = getStructuralFormCounts(config, questionCount)

  return `You are an expert NEET Biology question paper generator. Generate ${questionCount} high-quality NEET-style Biology questions from the provided study materials for the chapter: "${chapterName}".

This is part of a ${totalQuestions}-question paper. Generate questions following the NEET Biology protocol strictly.

---

## QUESTION ARCHETYPE DISTRIBUTION (Target Counts)

Generate exactly:
- **${archetypeCounts.directRecall} Direct Recall questions**: Single-concept factual knowledge, definitions, terminology. Use exact wording from the study materials.
- **${archetypeCounts.directApplication} Direct Application questions**: Single-step application of concepts to straightforward scenarios.
- **${archetypeCounts.integrative} Integrative/Multi-concept questions**: Combine two or more concepts requiring connections across topics.
- **${archetypeCounts.discriminator} Conceptual Discriminator questions**: Deep conceptual understanding to separate subtle distinctions. Exploit specific misconceptions.
- **${archetypeCounts.exceptionOutlier} Exception/Outlier Logic questions**: Identify exceptions to general rules, special cases, outliers.

Every question must fall into exactly ONE archetype category.

---

## STRUCTURAL FORMS DISTRIBUTION (Target Counts)

Generate exactly:
- **${structuralCounts.standardMCQ} Standard 4-Option MCQ**: Traditional single stem with 4 options (A, B, C, D).
- **${structuralCounts.matchFollowing} Match-the-Following**: Always use 4×4 matrix with coded options (see template below).
- **${structuralCounts.assertionReason} Assertion-Reason**: Two statements with 4 options about truth and linkage (see template below).
- **${structuralCounts.negativePhrasing} Negative Phrasing**: Use "Which is NOT correct", "incorrect statement", "exception" format.
- **${structuralCounts.multiStatement} Multi-Statement Combination**: Provide 4-5 statements, ask to select correct group from coded combinations.

Every question must use exactly ONE structural form.

---

## STRUCTURAL FORM TEMPLATES (Use Exact Formats)

### Match-the-Following Template (MANDATORY - ZERO DEVIATION ALLOWED):
**FROZEN RULE**: The questionText field MUST contain the COMPLETE matrix showing Column I and Column II items, followed by the exact ending phrase.

Display Format (what students see):
\`\`\`
Match Column I with Column II:

Column I                          Column II
A. [Term/Concept 1]               I. [Definition/Description 1]
B. [Term/Concept 2]               II. [Definition/Description 2]
C. [Term/Concept 3]               III. [Definition/Description 3]
D. [Term/Concept 4]               IV. [Definition/Description 4]

Choose the correct answer from the options given below:
(1) A-III, B-I, C-IV, D-II
(2) A-I, B-II, C-III, D-IV
(3) A-II, B-IV, C-I, D-III
(4) A-IV, B-III, C-II, D-I
\`\`\`

**CRITICAL**: Put the ENTIRE matrix (Column I, Column II, all A-D and I-IV items) INSIDE questionText. Options field ONLY contains coded combinations like "A-III, B-I, C-IV, D-II".

### Assertion-Reason Template (MANDATORY - ZERO DEVIATION ALLOWED):
**FROZEN RULE**: The questionText field MUST contain Assertion (A), Reason (R), AND the ending phrase "In the light of the above statements, choose the correct answer from the options given below:"

Display Format (what students see):
\`\`\`
Assertion (A): [Statement about concept]
Reason (R): [Statement about reasoning or explanation]

In the light of the above statements, choose the correct answer from the options given below:
(1) Both A and R are true and R is the correct explanation of A
(2) Both A and R are true but R is NOT the correct explanation of A
(3) A is true but R is false
(4) A is false but R is true
\`\`\`

**CRITICAL**: The word "explanation" MUST appear in option (1) and option (2). The ending phrase "In the light of the above statements, choose the correct answer from the options given below:" is MANDATORY in questionText.

### Multi-Statement Combination Template:
\`\`\`
Given below are two statements:

Statement I: [First statement]
Statement II: [Second statement]

In the light of the above statements, choose the correct answer from the options given below:
(1) Both Statement I and Statement II are true
(2) Both Statement I and Statement II are false
(3) Statement I is true but Statement II is false
(4) Statement I is false but Statement II is true
\`\`\`

OR use this variant:
\`\`\`
Which of the following statements are correct?

A. [Statement A]
B. [Statement B]
C. [Statement C]
D. [Statement D]

Choose the correct answer from the options given below:
(1) A and B only
(2) B and C only
(3) A, B and D only
(4) B, C and D only
\`\`\`

---

## CO-OCCURRENCE RULES (Apply Strictly)

- **Integrative/Multi-concept archetype** → MUST use Multi-Statement Combination OR Assertion-Reason format
- **Exception/Outlier archetype** → STRONGLY prefer Negative Phrasing format
- **Match-the-Following format** → STRONGLY prefer Direct Recall archetype content

---

## COGNITIVE LOAD SEQUENCING

- **First ${config.cognitiveLoad.warmupCount} questions**: WARM-UP ZONE - Use low-density, Direct Recall only (short stems, simple concepts)
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
- Meta-references to sources: "according to NCERT", "according to the study material", "according to the provided material", "as mentioned in", "as per the notes"
- Phrases like "What does the study material say about..." or "According to WHO as per the material..."

**CRITICAL**: Write questions as direct, authoritative statements. This is a NEET exam, not a textbook quiz.

**WRONG EXAMPLES** (meta-references - NEVER do this):
❌ "What is the definition of Reproductive Health according to the provided study material?"
❌ "According to NCERT, which hormone is responsible for..."
❌ "As mentioned in the study material, the process of..."
❌ "What does the provided material say about DNA replication?"

**CORRECT EXAMPLES** (direct, authoritative):
✅ "Reproductive Health refers to:"
✅ "Which hormone is responsible for..."
✅ "The process of spermatogenesis involves:"
✅ "DNA replication is:"

### Options - NEVER include:
- "None of the above"
- "All of the above"
- Subset inclusion (where Option A is completely contained in Option B)
- Lopsided visual weight (one massive option + three tiny options)
- Non-mutually exclusive options (options must be distinct)

### Answer Key - NEVER violate:
- No more than 3 consecutive questions with the same correct answer

### Match Questions - MUST follow:
- Always 4×4 matrix format
- Always coded options format (A-III, B-I, C-IV, D-II)
- Always end with "Choose the correct answer from the options given below"

---

## OPTION CONSTRUCTION RULES

- All 4 options must be approximately equal length (87% of questions)
- All 4 options must use the same grammatical structure (98% of questions)
- All 4 options must be mutually exclusive
- Make distractors plausible - use common misconceptions, partially correct facts, reversal traps

---

## ANSWER KEY BALANCE

- Distribute correct answers evenly: approximately 25% each for options (1), (2), (3), (4)
- Never place more than 3 consecutive questions with the same correct answer
- Randomize answer positions naturally

---

## NCERT FIDELITY (Critical)

- Use exact terminology, phrases, and definitions from the provided study materials
- Approximately 60% of questions should use strict wording from the materials
- For remaining questions, paraphrase concepts accurately but maintain scientific precision
- **NEVER mention the source in the question stem** - write as if this is established scientific fact
- Extract content from materials but present it authoritatively without attribution

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
      "correctAnswer": "(1)" | "(2)" | "(3)" | "(4)",
      "options": {
        "(1)": "Full text of option 1",
        "(2)": "Full text of option 2",
        "(3)": "Full text of option 3",
        "(4)": "Full text of option 4"
      },
      "explanation": "Clear explanation of why the correct answer is right and why other options are wrong",
      "difficulty": "easy" | "medium" | "hard",
      "ncertFidelity": "strict" | "moderate" | "loose"
    }
  ]
}
\`\`\`

### MATCH-THE-FOLLOWING: COMPLETE JSON EXAMPLE (COPY THIS EXACTLY)

**WRONG WAY** (validator will reject this):
\`\`\`json
{
  "questionText": "Match Column I with Column II regarding cell organelles:",
  "options": {
    "(1)": "A-II, B-I, C-IV, D-III"
  }
}
\`\`\`
❌ Missing matrix! Missing ending phrase! Will fail validation!

**CORRECT WAY** (the ONLY acceptable format):
\`\`\`json
{
  "questionNumber": 3,
  "questionText": "Match Column I with Column II:\\n\\nColumn I                          Column II\\nA. Mitochondria                   I. Protein synthesis\\nB. Ribosome                       II. Energy production\\nC. Golgi apparatus                III. Lipid synthesis\\nD. Endoplasmic reticulum          IV. Packaging and secretion\\n\\nChoose the correct answer from the options given below:",
  "archetype": "directRecall",
  "structuralForm": "matchFollowing",
  "cognitiveLoad": "high",
  "correctAnswer": "(1)",
  "options": {
    "(1)": "A-II, B-I, C-IV, D-III",
    "(2)": "A-I, B-II, C-III, D-IV",
    "(3)": "A-III, B-IV, C-I, D-II",
    "(4)": "A-IV, B-III, C-II, D-I"
  },
  "explanation": "Mitochondria produce energy (A-II), Ribosomes synthesize proteins (B-I), Golgi apparatus packages and secretes (C-IV), Endoplasmic reticulum synthesizes lipids (D-III).",
  "difficulty": "medium",
  "ncertFidelity": "strict"
}
\`\`\`
✅ Contains full matrix! Contains ending phrase! NO meta-references! Will pass validation!

### ASSERTION-REASON: COMPLETE JSON EXAMPLE (COPY THIS EXACTLY)

**WRONG WAY** (validator will reject this):
\`\`\`json
{
  "questionText": "Assertion (A): DNA replication is semi-conservative.\\nReason (R): Each daughter DNA contains one old and one new strand.",
  "options": {
    "(1)": "Both are true and R explains A"
  }
}
\`\`\`
❌ Missing ending phrase! Missing word "explanation"! Will fail validation!

**CORRECT WAY** (the ONLY acceptable format):
\`\`\`json
{
  "questionNumber": 9,
  "questionText": "Assertion (A): DNA replication is semi-conservative.\\nReason (R): Each daughter DNA molecule contains one parental strand and one newly synthesized strand.\\n\\nIn the light of the above statements, choose the correct answer from the options given below:",
  "archetype": "integrative",
  "structuralForm": "assertionReason",
  "cognitiveLoad": "high",
  "correctAnswer": "(1)",
  "options": {
    "(1)": "Both A and R are true and R is the correct explanation of A",
    "(2)": "Both A and R are true but R is NOT the correct explanation of A",
    "(3)": "A is true but R is false",
    "(4)": "A is false but R is true"
  },
  "explanation": "Both statements are correct. DNA replication is indeed semi-conservative because each new DNA molecule retains one original (parental) strand and synthesizes one new strand, which directly explains the mechanism of semi-conservative replication.",
  "difficulty": "medium",
  "ncertFidelity": "strict"
}
\`\`\`
✅ Contains ending phrase! Contains "explanation" in options! Will pass validation!

---

## QUALITY CHECKLIST (Self-Validate Before Returning)

✓ All archetype counts match targets
✓ All structural form counts match targets
✓ First ${config.cognitiveLoad.warmupCount} questions are low-density Direct Recall
✓ No more than 2 consecutive high-density questions
✓ No prohibited patterns present (Always/Never, None/All, double negatives, meta-references)
✓ All Match questions use exact 4×4 template with full matrix in questionText
✓ All Assertion-Reason questions use exact template with ending phrase
✓ All options mutually exclusive and similar length
✓ Answer key balanced (~25% each option)
✓ No more than 3 consecutive same answers
✓ Content is factually accurate from study materials
✓ Use exact NCERT terminology from provided PDFs
✓ NO meta-references to sources ("according to", "as per", "the material says")

---

## FINAL INSTRUCTIONS - READ CAREFULLY

Generate ${questionCount} questions now following ALL rules above.

**CRITICAL REQUIREMENTS** (violations will cause system errors):
1. Extract content EXCLUSIVELY from the provided study materials
2. Return ONLY valid JSON - no explanations, no comments, no text before/after
3. Follow the exact JSON format shown in the examples above - COPY the structure exactly
4. **NEVER reference sources in questions** - No "according to NCERT", "as per study material", "the material states", etc. Write questions as direct, authoritative statements like a real NEET exam

**FOR MATCH-THE-FOLLOWING QUESTIONS** (${structuralCounts.matchFollowing} required):
- Put the COMPLETE matrix (Column I items A-D, Column II items I-IV) in questionText
- End questionText with: "Choose the correct answer from the options given below:"
- Put ONLY coded combinations (e.g., "A-III, B-I, C-IV, D-II") in options
- If you omit the matrix or ending phrase, the question will be rejected

**FOR ASSERTION-REASON QUESTIONS** (${structuralCounts.assertionReason} required):
- Put Assertion (A) and Reason (R) in questionText
- End questionText with: "In the light of the above statements, choose the correct answer from the options given below:"
- Option (1) MUST say: "Both A and R are true and R is the correct explanation of A"
- Option (2) MUST say: "Both A and R are true but R is NOT the correct explanation of A"
- The word "explanation" must appear in options (1) and (2)
- If you omit the ending phrase or "explanation", the question will be rejected

**JSON OUTPUT**:
- Do NOT wrap JSON in markdown code blocks (\`\`\`json)
- Do NOT add any text before { or after }
- Ensure all ${questionCount} questions are in the "questions" array
- Validate your JSON structure before returning

Return the JSON now:`
}

/**
 * NEET Biology Validators
 * These are imported from questionValidator.ts - no need to redefine
 */
import {
  validateProhibitedPatterns,
  validateMatchQuestions,
  validateAssertionReason,
  validateAnswerKeyBalance,
  validateCognitiveLoad
} from '../../questionValidator'

const validators: Protocol['validators'] = [
  (questions: Question[]) => {
    const errors: string[] = []
    for (const q of questions) {
      errors.push(...validateProhibitedPatterns(q))
    }
    return errors
  },
  validateMatchQuestions,
  validateAssertionReason,
  validateAnswerKeyBalance,
  validateCognitiveLoad
]

/**
 * Complete NEET Biology Protocol
 */
export const neetBiologyProtocol: Protocol = {
  id: 'neet-biology',
  name: 'NEET Biology',
  streamName: 'NEET',
  subjectName: 'Biology',
  difficultyMappings,
  prohibitions,
  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,
    warmupPercentage: 0.1 // First 10% of questions
  },
  buildPrompt: buildNEETBiologyPrompt,
  validators,
  metadata: {
    description: 'NEET Biology question generation protocol',
    analysisSource: 'NEET 2019-2024 papers (580 questions analyzed)',
    version: '1.0.0',
    lastUpdated: '2025-12-27'
  }
}
