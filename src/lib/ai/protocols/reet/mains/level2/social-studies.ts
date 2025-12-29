/**
 * REET Mains Level 2 - Social Studies Protocol
 *
 * ⚠️  PRELIMINARY PROTOCOL (N=1 paper analyzed - requires validation)
 * Analysis Source: REET 2023 SST Paper
 * - Social Studies Section: Q66-150 (85 questions analyzed)
 * - This is the SUBJECT-SPECIFIC SECTION for SST stream candidates
 *
 * CRITICAL INSIGHTS:
 * - Social Studies has 3x MORE negative pattern questions (20% vs 4-7.5% in common sections)
 * - Introduces 5 NEW complex archetypes: Matching, Chronological Ordering, Error Detection, Analogy, Comparative Fill-in-Blank
 * - More cognitively diverse than common sections (14.2% complex archetypes)
 * - Tests relational knowledge, not just isolated facts
 *
 * EXAM STRUCTURE (Based on Official RSMSSB Pattern):
 * =====================================================
 * SUBJECT-SPECIFIC SECTION: SOCIAL STUDIES (170 Marks, 85 questions)
 *
 * Part I: History & Political Science (60 marks, 30 questions)
 * - Indian History (ancient, medieval, modern)
 * - Indian Constitution & Political System
 * - Governance, Institutions, Legislative Framework
 *
 * Part II: Geography & Economics (60 marks, 30 questions)
 * - Physical & Human Geography
 * - World Geography, Agriculture, Industry
 * - Indian Economy, Economic Development, Global Economics
 *
 * Part III: Education & Psychology (40 marks, 20 questions)
 * - Pedagogy, Teaching Methods, Learning Theories
 * - Educational Psychology, Child Development
 *
 * Part IV: General Awareness (10 marks, 5 questions)
 * - Computer Science, Environmental Science, Current Affairs
 *
 * TOTAL: 170 Marks (85 questions, 2 marks each)
 * NOTE: This is the subject-specific section for SST stream
 */

import { Protocol, ProtocolConfig } from '../../../types'
import { Question } from '../../../../questionValidator'

/**
 * Social Studies Archetype Distributions
 * Based on Q66-150 analysis (85 questions from 2023 paper)
 *
 * Key Finding: NEGATIVE PATTERN HEAVY + COMPLEX ARCHETYPES (20% Exception/Negative, 14.2% NEW types)
 * - Single-Fact Recall: 56.5% (48/85) - DOMINANT but lower than common sections
 * - Exception/Negative: 20.0% (17/85) - 3x higher than common sections
 * - Definitional: 9.4% (8/85)
 * - Comparative/Superlative: 7.1% (6/85)
 * - Chronological Ordering: 4.7% (4/85) - NEW
 * - Matching/Pairing: 4.7% (4/85) - NEW
 * - Fill-in-Blank: 3.5% (3/85)
 * - Comparative Fill-in-Blank: 2.4% (2/85) - NEW
 * - Multi-Item Selection: 2.4% (2/85)
 * - Analogy/Comparison: 1.2% (1/85) - NEW
 * - Error Detection: 1.2% (1/85) - NEW
 */

const socialStudiesArchetypes = {
  balanced: {
    singleFactRecall: 0.565,          // Dominant: dates, names, places, facts
    exceptionNegative: 0.20,          // VERY HIGH: "NOT", "does NOT", "EXCEPT"
    definitional: 0.094,              // Terminology, concepts, definitions
    comparative: 0.071,               // Largest, oldest, first, highest
    chronologicalOrdering: 0.047,     // NEW: Arrange in sequence
    matchingPairing: 0.047,           // NEW: Match items across lists
    fillInBlank: 0.035,               // Sentence completion
    comparativeFillInBlank: 0.024,    // NEW: Two-blank with related concepts
    multiItemSelection: 0.024,        // Multiple items, select combination
    analogy: 0.012,                   // NEW: Similarity/comparison
    errorDetection: 0.012             // NEW: Find incorrect statement
  },
  easy: {
    singleFactRecall: 0.70,           // More simple recall
    exceptionNegative: 0.10,          // Less negative pattern
    definitional: 0.08,
    comparative: 0.10,
    fillInBlank: 0.05,
    chronologicalOrdering: 0.00,      // No complex ordering
    matchingPairing: 0.00,            // No matching
    comparativeFillInBlank: 0.02,
    multiItemSelection: 0.02,
    analogy: 0.00,
    errorDetection: 0.00
  },
  hard: {
    singleFactRecall: 0.40,           // Less straightforward recall
    exceptionNegative: 0.15,          // Moderate negative pattern
    definitional: 0.10,
    comparative: 0.05,
    chronologicalOrdering: 0.15,      // HIGH: Complex sequencing
    matchingPairing: 0.15,            // HIGH: Multiple relationships
    fillInBlank: 0.02,
    comparativeFillInBlank: 0.05,
    multiItemSelection: 0.05,
    analogy: 0.03,                    // Some analogy questions
    errorDetection: 0.05              // Error detection for hardest
  }
}

/**
 * Difficulty Mappings
 */
const difficultyMappings: Protocol['difficultyMappings'] = {
  easy: {
    archetypes: socialStudiesArchetypes.easy as any,
    structuralForms: {
      standard4OptionMCQ: 1.00
    } as any,
    cognitiveLoad: {
      lowDensity: 0.85,              // High proportion of easy questions
      mediumDensity: 0.12,
      highDensity: 0.03
    }
  },
  balanced: {
    archetypes: socialStudiesArchetypes.balanced as any,
    structuralForms: {
      standard4OptionMCQ: 1.00
    } as any,
    cognitiveLoad: {
      lowDensity: 0.68,              // From analysis: 68.2% low
      mediumDensity: 0.29,           // 29.4% medium range
      highDensity: 0.03              // 2.4% high (rounded to 3%)
    }
  },
  hard: {
    archetypes: socialStudiesArchetypes.hard as any,
    structuralForms: {
      standard4OptionMCQ: 1.00
    } as any,
    cognitiveLoad: {
      lowDensity: 0.50,
      mediumDensity: 0.35,
      highDensity: 0.15
    }
  }
}

/**
 * Prohibitions
 */
const prohibitions: string[] = [
  '⚠️  PRELIMINARY PROHIBITIONS (N=1 paper - validate with more data)',
  'NEVER use "All of the above" or "None of the above" (0% observed in Q66-150)',
  'NEVER use 5 options - MUST use exactly 4 options (A, B, C, D) (100% validated)',
  'NEVER allow multiple correct answers - exactly ONE correct answer per question',
  'AVOID fill-in-blank format (only 3.5% observed) - prefer direct questions',
  'NEVER use assertion-reason format (0% observed)',
  'NEVER use diagram/image-based questions (0% observed)',
  'NEVER use "Both A and B are correct" style options (0% observed)',
  'ALWAYS generate questions in Hindi (हिंदी) - focus language for generation'
]

/**
 * Get archetype counts based on difficulty
 */
function getArchetypeCounts(
  difficulty: 'easy' | 'balanced' | 'hard',
  questionCount: number
): Record<string, number> {
  const archetypes = socialStudiesArchetypes[difficulty]
  const counts: Record<string, number> = {}

  for (const [key, value] of Object.entries(archetypes)) {
    const count = Math.round(questionCount * value)
    if (count > 0) {
      counts[key] = count
    }
  }

  return counts
}

/**
 * Social Studies Prompt Builder
 */
function buildSocialStudiesPrompt(
  config: ProtocolConfig,
  chapterName: string,
  questionCount: number,
  totalQuestions: number
): string {
  const difficulty = 'balanced' // Default
  const archetypeCounts = getArchetypeCounts(difficulty, questionCount)

  const archetypeList = Object.entries(archetypeCounts)
    .filter(([_, count]) => count > 0)
    .map(([archetype, count]) => `- **${count} ${archetype}**`)
    .join('\n')

  return `You are an expert REET Mains Level 2 Social Studies (SST) question paper generator. Generate ${questionCount} high-quality REET-style questions from the provided study materials for the topic: "${chapterName}".

This is part of a ${totalQuestions}-question paper testing comprehensive Social Studies knowledge for SST stream candidates.

---

## CRITICAL REET-SPECIFIC REQUIREMENTS

⚠️  **OPTION COUNT**: Each question MUST have exactly 4 options labeled (A), (B), (C), (D)
- NOT 5, NOT 3, EXACTLY 4 options - REET Mains uses 4-option MCQ format

**EXAM CONTEXT**: Subject-Specific Section for SST (Social Science) stream candidates
- Only SST stream candidates take this section
- Tests deep knowledge of History, Political Science, Geography, Economics, and Pedagogy

**LANGUAGE**: ALL questions MUST be in Hindi (हिंदी)
- Use proper Devanagari script (देवनागरी लिपि)
- Use formal/standard Hindi (मानक हिंदी), not colloquial
- Use formal/academic register

---

## QUESTION ARCHETYPE DISTRIBUTION (Target Counts)

${archetypeList}

### ARCHETYPE PRIORITY NOTE:
- **CRITICAL**: 20% of questions MUST use Exception/Negative pattern (signature of SST paper)
- Include complex archetypes (Matching, Chronological Ordering) for variety and higher difficulty
- Balance factual recall with relational/analytical questions

---

## OUTPUT FORMAT (JSON Schema)

\`\`\`json
{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "प्रश्न का पूर्ण पाठ यहाँ हिंदी में",
      "archetype": "singleFactRecall" | "exceptionNegative" | "definitional" | "comparative" | "chronologicalOrdering" | "matchingPairing" | "fillInBlank" | "comparativeFillInBlank" | "multiItemSelection" | "analogy" | "errorDetection",
      "structuralForm": "standard4OptionMCQ",
      "cognitiveLoad": "low" | "medium" | "high",
      "decisionPoints": 1 | 2 | 3 | 4 | 5 | 6,
      "correctAnswer": "(A)" | "(B)" | "(C)" | "(D)",
      "options": {
        "(A)": "विकल्प A का पूर्ण पाठ हिंदी में",
        "(B)": "विकल्प B का पूर्ण पाठ हिंदी में",
        "(C)": "विकल्प C का पूर्ण पाठ हिंदी में",
        "(D)": "विकल्प D का पूर्ण पाठ हिंदी में"
      },
      "explanation": "सही उत्तर की स्पष्ट व्याख्या हिंदी में",
      "difficulty": "easy" | "medium" | "hard",
      "language": "hindi",
      "contentDomain": "history" | "politicalScience" | "geography" | "economics" | "education" | "psychology" | "computerScience" | "environmentalScience"
    }
  ]
}
\`\`\`

---

## FINAL INSTRUCTIONS

Generate ${questionCount} questions now following ALL rules above.

⚠️  **CRITICAL REQUIREMENTS**:
- Use EXACTLY 4 options per question (NOT 5)
- MUST be in Hindi (हिंदी) for ALL questions and options
- Use proper Devanagari script - formal/standard Hindi (मानक हिंदी)
- Factual accuracy is MANDATORY (verify all dates, facts, data)
- Extract content from study materials but verify accuracy
- NO meta-references ("according to", "as per material")
- Maintain 20% negative pattern questions (signature of SST paper)
- Include complex archetypes (Matching, Ordering) for variety
- Return ONLY valid JSON

**Archetype Mix to Generate:**
${archetypeList}

**Target Cognitive Load:**
- Low: ${Math.round(questionCount * 0.68)} questions (68%)
- Medium: ${Math.round(questionCount * 0.29)} questions (29%)
- High: ${Math.round(questionCount * 0.03)} questions (3%)

Return the JSON now:`
}

/**
 * Validators
 */
import {
  validateProhibitedPatterns,
  validateAnswerKeyBalance,
  validateCognitiveLoad
} from '../../../../questionValidator'

const validators: Protocol['validators'] = [
  (questions: Question[]) => {
    const errors: string[] = []

    // Validate 4-option format (CRITICAL for REET)
    for (const q of questions) {
      const optionKeys = Object.keys(q.options)
      if (optionKeys.length !== 4) {
        errors.push(`Question ${q.questionNumber}: Must have exactly 4 options (found ${optionKeys.length}). REET uses 4-option format.`)
      }
      if (!optionKeys.every(k => ['(A)', '(B)', '(C)', '(D)'].includes(k))) {
        errors.push(`Question ${q.questionNumber}: Options must be labeled (A), (B), (C), (D)`)
      }
    }

    // Validate Hindi language (all questions must be in Hindi)
    for (const q of questions) {
      if (!q.language || q.language !== 'hindi') {
        errors.push(`Question ${q.questionNumber}: Must be in Hindi (हिंदी). Found language: ${q.language}`)
      }
    }

    // Validate archetype distribution (should have some negative pattern questions - signature of SST)
    const negativeCount = questions.filter(q => q.archetype === 'exceptionNegative').length
    const targetNegative = Math.round(questions.length * 0.20)
    if (negativeCount < targetNegative * 0.5) {
      errors.push(`SST paper should have ~20% negative pattern questions. Found ${negativeCount} (${Math.round(negativeCount/questions.length*100)}%), expected ${targetNegative}`)
    }

    // Standard prohibitions
    for (const q of questions) {
      errors.push(...validateProhibitedPatterns(q))
    }

    return errors
  },
  validateAnswerKeyBalance,
  validateCognitiveLoad
]

/**
 * Complete REET Mains Level 2 Social Studies Protocol
 */
export const reetMainsLevel2SocialStudiesProtocol: Protocol = {
  id: 'reet-mains-level2-social-studies',
  name: 'REET Mains Level 2 - Social Studies',
  streamName: 'REET Mains Level 2',
  subjectName: 'Social Studies (SST Stream)',
  difficultyMappings,
  prohibitions,
  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,
    warmupPercentage: 0.10
  },
  buildPrompt: buildSocialStudiesPrompt,
  validators,
  metadata: {
    description: 'REET Mains Level 2 Social Studies protocol - Subject-specific section for SST stream candidates',
    analysisSource: '⚠️  PRELIMINARY: REET 2023 SST paper Q66-150 (85 questions analyzed)',
    version: '1.0.0-preliminary',
    lastUpdated: '2025-12-28',
    examType: 'SELECTION (Merit-based) - Subject-Specific Section for SST Stream',
    sectionWeightage: 'Subject Section - 170 marks (History/PolSci 60m + Geography/Economics 60m + Education/Psychology 40m + General Awareness 10m)',
    note: `⚠️  CONFIDENCE: LOW (N=1 paper - requires validation with 2-3 more papers)

DISCOVERY NOTES:

**Social Studies (Q66-150, N=85):** NEGATIVE PATTERN HEAVY + COMPLEX ARCHETYPES
  - Single-Fact Recall: 56.5% (48/85) - Dominant but lower than common sections
  - Exception/Negative: 20.0% (17/85) - 3x HIGHER than common sections
  - Definitional/Terminology: 9.4% (8/85)
  - Comparative/Superlative: 7.1% (6/85)
  - Chronological Ordering: 4.7% (4/85) - NEW archetype
  - Matching/Pairing: 4.7% (4/85) - NEW archetype
  - Fill-in-Blank: 3.5% (3/85)
  - Comparative Fill-in-Blank: 2.4% (2/85) - NEW archetype
  - Multi-Item Selection: 2.4% (2/85)
  - Analogy/Comparison: 1.2% (1/85) - NEW archetype
  - Error Detection/Mismatch: 1.2% (1/85) - NEW archetype

**NEW Archetypes (14.2% total):**
  - Chronological Ordering (4.7%): Arrange events/steps in sequence - HIGH complexity
  - Matching/Pairing (4.7%): Match items across two lists - HIGH complexity
  - Comparative Fill-in-Blank (2.4%): Two blanks with related concepts
  - Analogy/Comparison (1.2%): Compare similar phenomena
  - Error Detection (1.2%): Find incorrect statement among multiple - HIGHEST complexity

**Cognitive Load Distribution:**
  - Low: 68.2% (vs 88-92% in common sections) - SST is HARDER
  - Medium: 29.4% (vs 8-12% in common sections)
  - High: 2.4% (vs 0% in common sections) - Only SST has high-complexity questions

**Validated Patterns (from analyzed 2023 paper):**
  - Standard 4-option MCQ: 100% (85/85 questions)
  - Paper format was bilingual (English + Hindi): 100% (85/85 questions)
  - No "All/None of above": 0%
  - No assertion-reason: 0%
  - No diagram-based: 0%

**Quality Characteristics:**
  - 94.1% clean questions, 5.9% with printing errors/defects
  - Factual accuracy critical (especially for dates, constitutional provisions, geographical facts)
  - NOTE: Analyzed paper was bilingual, but THIS PROTOCOL generates Hindi-only questions
  - Negative pattern is SIGNATURE (20% vs 4-7.5% in common sections)
  - Complex archetypes test relational knowledge, not just isolated facts

**Key Insight:**
SST section is HARDER and MORE DIVERSE than common sections:
  - Lower pure recall (56.5% vs 65-76%)
  - Higher negative pattern (20% vs 4-7.5%) - requires careful reading
  - More complex archetypes (14.2% NEW types) - tests relationships, sequencing, multi-verification
  - Higher cognitive load (32% medium+ vs 8-12%)
  - More decision points (1.5 avg vs 1.1 avg)

This protocol generates questions matching these validated patterns.`
  }
}
