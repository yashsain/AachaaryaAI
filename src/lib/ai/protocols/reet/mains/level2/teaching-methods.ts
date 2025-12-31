/**
 * REET Mains Level 2 - Teaching Methods Protocol
 *
 * Currently implements ONLY English teaching methods based on Q126-Q135 analysis.
 * Architecture designed to support multiple subjects when their papers are analyzed.
 *
 * ENGLISH TEACHING METHODS PATTERN (from Q126-Q135):
 * - 70% Negative phrasing ("Which is NOT true?", "not included") - 7/10 questions
 * - 20% Direct recall (Features, characteristics) - 2/10 questions
 * - 10% Theory attribution ("Who introduced?") - 1/10 question
 *
 * CONTENT MIX:
 * - 70% Subject-specific teaching methods (Audio-lingual, Bilingual, CLT)
 * - 30% General pedagogy (CCE, test types)
 *
 * Based on exhaustive analysis of Q126-Q135 from REET Mains Level 2 English paper.
 * Other subjects (Hindi, Science, SST) to be added when their papers are analyzed.
 */

import { Protocol, ProtocolConfig } from '../../../types'
import { Question } from '../../../../questionValidator'

/**
 * Teaching Methods archetype distribution
 * (Common pattern across all subjects)
 */
interface TeachingMethodsArchetypes {
  exceptionNegative: number      // "NOT true", "NOT included" questions
  directRecall: number            // Features, characteristics, definitions
  theoryAttribution: number       // "Who introduced?", "According to..."
  classificatory: number          // Types, classifications
}

/**
 * REMOVED: Literal content objects (englishTeachingMethods, hindiTeachingMethods, commonPedagogyContent)
 * Content should come from external sources (study materials, AI knowledge base)
 * Protocol defines PATTERNS and ARCHETYPES only
 */

/**
 * Teaching Methods Archetype Distribution
 * Based on Q126-Q135 analysis
 * Varies by subject
 */
const englishTeachingMethodsArchetypes: TeachingMethodsArchetypes = {
  exceptionNegative: 0.70,      // 7/10 questions (Q126, Q127, Q128, Q130, Q131, Q133, Q134)
  directRecall: 0.20,           // 2/10 questions (Q129, Q132)
  theoryAttribution: 0.10,      // 1/10 question (Q135)
  classificatory: 0.00          // 0/10 questions
}

/**
 * Hindi Teaching Methods Archetype Distribution
 * Based on Q126-Q135 Hindi analysis - different from English
 */
const hindiTeachingMethodsArchetypes: TeachingMethodsArchetypes = {
  exceptionNegative: 0.40,      // 4/10 questions (Q126, Q128, Q129, Q134)
  directRecall: 0.40,           // 4/10 questions (Q127, Q130, Q133, Q135)
  theoryAttribution: 0.10,      // 1/10 question (Q132)
  classificatory: 0.10          // 1/10 question (Q131)
}

/**
 * REMOVED: getTeachingMethodsConfig() - no longer needed
 * Content comes from external sources, not embedded in protocol
 */

/**
 * Get archetype distribution for a specific subject
 */
function getArchetypeDistribution(subjectName: string): TeachingMethodsArchetypes {
  const normalizedSubject = subjectName.toLowerCase().trim()

  if (normalizedSubject.includes('english')) {
    return englishTeachingMethodsArchetypes
  }

  if (normalizedSubject.includes('hindi') || normalizedSubject.includes('हिन्दी') || normalizedSubject.includes('हिंदी')) {
    return hindiTeachingMethodsArchetypes
  }

  // Default to English if subject not found
  return englishTeachingMethodsArchetypes
}

/**
 * Build prompt for teaching methods questions
 * Uses patterns and instructions, not literal content
 */
function buildTeachingMethodsPrompt(
  _config: ProtocolConfig,
  subjectName: string,
  questionCount: number,
  totalQuestions: number
): string {
  const archetypes = getArchetypeDistribution(subjectName)
  const isHindi = subjectName.toLowerCase().includes('hindi') ||
                   subjectName.toLowerCase().includes('हिन्दी') ||
                   subjectName.toLowerCase().includes('हिंदी')

  const languageRequirement = isHindi
    ? `
LANGUAGE REQUIREMENTS:
- ALL question text, options, and explanations MUST be in Hindi (Devanagari script) ONLY
- NO English or Roman transliteration allowed in generated content
- Use proper Devanagari script (देवनागरी लिपि)
- Technical terms can use transliteration where standard (e.g., माण्टेसरी, स्क्रीवेन)
`
    : ''

  return `Generate ${questionCount} high-quality Teaching Methods questions for ${subjectName} in REET Mains Level 2 examination.

CRITICAL REQUIREMENTS:
- Each question MUST have exactly 4 options (A, B, C, D)
- This is part of a ${totalQuestions}-question test paper
- Teaching Methods section represents Q${totalQuestions - 9}-Q${totalQuestions} (last 10 questions)
- Extract teaching methods content from your knowledge base and study materials
${languageRequirement}

ARCHETYPE DISTRIBUTION (for ${questionCount} questions):

1. EXCEPTION/NEGATIVE PATTERN (${Math.round(questionCount * archetypes.exceptionNegative)} questions - ${Math.round(archetypes.exceptionNegative * 100)}%)
   - Use "Which is NOT true?", "not included", "not applicable", "incorrect statement"
   - Provide 3 TRUE statements and 1 FALSE statement (the answer)
   - Requires careful reading to identify the exception
   - Cognitive load: MEDIUM

   ${isHindi ? 'Example: "निम्नलिखित में से कौन सा [विधि] की विशेषता नहीं है?"' : 'Example: "Which is NOT true of the [Teaching Method]?"'}
   Pattern:
   (A) [True feature of the method]
   (B) [True feature of the method]
   (C) [FALSE feature - this is the answer]
   (D) [True feature of the method]

2. DIRECT RECALL (${Math.round(questionCount * archetypes.directRecall)} questions - ${Math.round(archetypes.directRecall * 100)}%)
   - Features, characteristics, definitions, purposes
   - Straightforward factual questions
   - Cognitive load: LOW

   ${isHindi ? 'Example: "[विधि/अवधारणा] का मुख्य उद्देश्य क्या है?"' : 'Example: "What is the main feature of [Teaching Method]?"'}
   Pattern: Direct question about a specific fact or concept

3. THEORY ATTRIBUTION (${Math.round(questionCount * archetypes.theoryAttribution)} question - ${Math.round(archetypes.theoryAttribution * 100)}%)
   - "Who introduced [Concept]?"
   - "According to [Theorist]..."
   - Cognitive load: LOW

   ${isHindi ? 'Example: "[अवधारणा] का प्रत्यय किसने दिया?"' : 'Example: "Who introduced the [Concept]?"'}

${archetypes.classificatory > 0 ? `
4. CLASSIFICATORY (${Math.round(questionCount * archetypes.classificatory)} question - ${Math.round(archetypes.classificatory * 100)}%)
   - Identify correct sequence, classification, or categorization
   - Cognitive load: MEDIUM

   ${isHindi ? 'Example: "[कौशल/प्रक्रिया] का सही क्रम पहचानिए"' : 'Example: "Identify the correct sequence of [Skills/Process]"'}
` : ''}

CONTENT COVERAGE (70% subject-specific + 30% general pedagogy):

SUBJECT-SPECIFIC TEACHING METHODS (${Math.round(questionCount * 0.7)} questions):
${isHindi ? `
Topics to cover from knowledge base/study materials:
- Language teaching methodologies (व्याख्यान विधि, अभिक्रमित अनुदेशन, कविता शिक्षण, etc.)
- Teaching aids (दृश्य-श्रव्य साधन)
- Language learning sequences (भाषायी कौशल: सुनना → बोलना → पढ़ना → लिखना)
- Modern teaching approaches (माण्टेसरी, साहचर्य विधि)

Focus on:
- Principles and features of each method
- Merits and demerits
- Appropriate contexts for use
- Common misconceptions (e.g., which features do NOT apply)
` : `
Topics to cover from knowledge base/study materials:
- Language teaching methodologies (Audio-lingual, Bilingual, CLT, etc.)
- Natural order of language acquisition
- L1 vs L2 usage in teaching
- Teaching approaches and their characteristics

Focus on:
- Principles and features of each method
- Merits and demerits
- Appropriate contexts for use
- Common misconceptions (e.g., "Language is NOT for communication" in Audio-lingual)
`}

GENERAL PEDAGOGY (${Math.round(questionCount * 0.3)} questions):
${isHindi ? `
Topics to cover from knowledge base/study materials:
- मूल्यांकन vs मापन (Evaluation vs Measurement) - differences and relationship
- संरचनात्मक और योगात्मक मूल्यांकन (Formative and Summative) - introduced by Michael Scriven
- निदानात्मक परीक्षण (Diagnostic Testing) - purpose is to identify weaknesses, NOT for gifted students

Common traps:
- मापन के अभाव में मूल्यांकन वैज्ञानिक नहीं होता (evaluation needs measurement to be scientific)
` : `
Topics to cover from knowledge base/study materials:
- CCE (Continuous Comprehensive Evaluation) - introduced by CBSE, reduces stress, promotes holistic development
- Test Types - Aptitude, Achievement, Proficiency, Diagnostic (Attitude Test is NOT a valid type)
- Assessment and evaluation concepts

Common traps:
- CCE DOES help develop concept clarity (this is a true benefit)
- Attitude Test is NOT a valid test type
`}

COGNITIVE LOAD DISTRIBUTION:
- Low Density: 30% (simple recall, factual)
- Medium Density: 70% (requires understanding principles, identifying exceptions)
- High Density: 0% (no complex multi-step reasoning)

FORMATTING:
1. Clear question stem
2. Exactly 4 options (A, B, C, D)
3. One unambiguously correct answer
4. For negative phrasing: 3 TRUE statements + 1 FALSE statement

OUTPUT FORMAT (JSON Schema):

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no explanation text.
${isHindi ? 'ALL CONTENT MUST BE IN DEVANAGARI (HINDI) - No English or Roman transliteration.' : ''}

\`\`\`json
{
  "questions": [
    {
      "questionText": "${isHindi ? 'प्रश्न पाठ देवनागरी में (केवल हिंदी)' : 'Question text here'}",
      "options": {
        "A": "${isHindi ? 'विकल्प A देवनागरी में' : 'Option A text'}",
        "B": "${isHindi ? 'विकल्प B देवनागरी में' : 'Option B text'}",
        "C": "${isHindi ? 'विकल्प C देवनागरी में' : 'Option C text'}",
        "D": "${isHindi ? 'विकल्प D देवनागरी में' : 'Option D text'}"
      },
      "correctAnswer": "A",
      "explanation": "${isHindi ? 'व्याख्या देवनागरी में (हिंदी में)' : 'Why this answer is correct'}",
      "archetype": "exceptionNegative",
      "difficulty": "medium",
      "cognitiveLoad": "medium",
      "tags": ["teaching-methods"]
    }
  ]
}
\`\`\`

CRITICAL FORMATTING RULES:
1. ✅ MUST wrap questions in { "questions": [...] } object
2. ✅ Field name is "questionText" (NOT "question")
3. ✅ correctAnswer is ONLY the letter: "A", "B", "C", or "D" (NO brackets, NO text like "[Correct answer: A]")
4. ✅ All option keys must be exactly: "A", "B", "C", "D"
5. ✅ archetype must be one of: exceptionNegative, directRecall, theoryAttribution, classificatory
6. ✅ cognitiveLoad must be: "low" or "medium"
${isHindi ? '7. ✅ ALL text content (questionText, options, explanation) MUST be in Devanagari script ONLY' : ''}

VALIDATION CHECKLIST (before submitting):
□ Response starts with { "questions": [ and ends with ] }
□ Every question uses "questionText" field (not "question")
□ Every correctAnswer is just a single letter: "A", "B", "C", or "D"
□ No markdown code blocks (\`\`\`json) in the actual response
□ No explanatory text outside the JSON structure
${isHindi ? '□ All content is in Devanagari (Hindi) script' : ''}

Generate questions now.`
}

/**
 * Teaching Methods Protocol for English
 */
export const reetMainsLevel2EnglishTeachingMethodsProtocol: Protocol = {
  id: 'reet mains level 2-english-teaching-methods',
  name: 'REET Mains Level 2 - English Teaching Methods',
  streamName: 'REET Mains Level 2',
  subjectName: 'English (Teaching Methods)',

  difficultyMappings: {
    easy: {
      archetypes: {
        directRecall: 0.60,
        directApplication: 0,
        discriminator: 0.20,
        exceptionOutlier: 0.20
      } as any,
      structuralForms: {
        standardMCQ: 1.0,
        matchFollowing: 0,
        negativePhrasing: 0.40
      } as any,
      cognitiveLoad: {
        lowDensity: 0.60,
        mediumDensity: 0.40,
        highDensity: 0
      }
    },
    balanced: {
      archetypes: {
        directRecall: 0.20,
        directApplication: 0,
        discriminator: 0.20,
        exceptionOutlier: 0.60
      } as any,
      structuralForms: {
        standardMCQ: 1.0,
        matchFollowing: 0,
        negativePhrasing: 0.70
      } as any,
      cognitiveLoad: {
        lowDensity: 0.30,
        mediumDensity: 0.70,
        highDensity: 0
      }
    },
    hard: {
      archetypes: {
        directRecall: 0.10,
        directApplication: 0,
        discriminator: 0.30,
        exceptionOutlier: 0.60
      } as any,
      structuralForms: {
        standardMCQ: 1.0,
        matchFollowing: 0,
        negativePhrasing: 0.70
      } as any,
      cognitiveLoad: {
        lowDensity: 0.10,
        mediumDensity: 0.90,
        highDensity: 0
      }
    }
  },

  prohibitions: [
    'Never use 5 options - REET Mains uses exactly 4 options (A, B, C, D)',
    'Never create negative phrasing questions with ambiguous TRUE/FALSE statements',
    'Never ignore the "NOT" in negative phrasing questions',
    'Never create questions about non-standard or deprecated teaching methodologies',
    'Ensure accuracy when referencing teaching methods - verify facts from study materials'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 0,  // No high-density questions in teaching methods
    warmupPercentage: 0
  },

  buildPrompt: buildTeachingMethodsPrompt,

  validators: [
    // Validate 4 options
    (questions: Question[]) => {
      const errors: string[] = []
      questions.forEach((q, idx) => {
        const optionKeys = Object.keys(q.options)
        if (optionKeys.length !== 4 || !optionKeys.every(key => ['A', 'B', 'C', 'D'].includes(key))) {
          errors.push(`Question ${idx + 1}: Must have exactly 4 options (A, B, C, D)`)
        }
      })
      return errors
    },

    // Validate questionText field exists (not "question")
    (questions: Question[]) => {
      const errors: string[] = []
      questions.forEach((q, idx) => {
        if (!q.questionText || typeof q.questionText !== 'string' || q.questionText.trim().length === 0) {
          errors.push(`Question ${idx + 1}: Missing or invalid "questionText" field`)
        }
      })
      return errors
    },

    // Validate correctAnswer is single letter (A/B/C/D)
    (questions: Question[]) => {
      const errors: string[] = []
      const validAnswers = ['A', 'B', 'C', 'D']
      questions.forEach((q, idx) => {
        if (!validAnswers.includes(q.correctAnswer)) {
          errors.push(`Question ${idx + 1}: correctAnswer must be exactly "A", "B", "C", or "D" (got: "${q.correctAnswer}")`)
        }
      })
      return errors
    },

    // Validate archetype is valid for teaching methods
    (questions: Question[]) => {
      const errors: string[] = []
      const validArchetypes = ['exceptionNegative', 'directRecall', 'theoryAttribution', 'classificatory']
      questions.forEach((q, idx) => {
        if (!validArchetypes.includes(q.archetype)) {
          errors.push(`Question ${idx + 1}: archetype must be one of: ${validArchetypes.join(', ')} (got: "${q.archetype}")`)
        }
      })
      return errors
    }
  ],

  metadata: {
    version: '2.0.0',
    description: 'Teaching Methods protocol for REET Mains Level 2 English. Defines question generation patterns (archetypes, difficulty, cognitive load). Pattern: 70% negative phrasing, 20% direct recall, 10% attribution. Content extracted from study materials/knowledge base.',
    analysisSource: 'REET Mains Level 2 English paper Q126-Q135 pattern analysis',
    lastUpdated: new Date().toISOString(),
    examType: 'SELECTION (Merit-based)',
    sectionWeightage: 'Teaching Methods - 10 questions (part of 70-question English paper)',
    note: 'Protocol defines generation patterns only. Actual teaching methods content comes from external sources.'
  }
}

/**
 * Teaching Methods Protocol for Hindi
 */
export const reetMainsLevel2HindiTeachingMethodsProtocol: Protocol = {
  id: 'reet mains level 2-hindi-teaching-methods',
  name: 'REET Mains Level 2 - Hindi Teaching Methods',
  streamName: 'REET Mains Level 2',
  subjectName: 'Hindi (Teaching Methods)',

  difficultyMappings: {
    easy: {
      archetypes: {
        directRecall: 0.50,
        directApplication: 0,
        discriminator: 0.20,
        exceptionOutlier: 0.30
      } as any,
      structuralForms: {
        standardMCQ: 1.0,
        matchFollowing: 0,
        negativePhrasing: 0.30
      } as any,
      cognitiveLoad: {
        lowDensity: 0.60,
        mediumDensity: 0.40,
        highDensity: 0
      }
    },
    balanced: {
      archetypes: {
        directRecall: 0.40,
        directApplication: 0,
        discriminator: 0.20,
        exceptionOutlier: 0.40
      } as any,
      structuralForms: {
        standardMCQ: 1.0,
        matchFollowing: 0,
        negativePhrasing: 0.40
      } as any,
      cognitiveLoad: {
        lowDensity: 0.30,
        mediumDensity: 0.70,
        highDensity: 0
      }
    },
    hard: {
      archetypes: {
        directRecall: 0.30,
        directApplication: 0,
        discriminator: 0.30,
        exceptionOutlier: 0.40
      } as any,
      structuralForms: {
        standardMCQ: 1.0,
        matchFollowing: 0,
        negativePhrasing: 0.40
      } as any,
      cognitiveLoad: {
        lowDensity: 0.10,
        mediumDensity: 0.90,
        highDensity: 0
      }
    }
  },

  prohibitions: [
    'Never use 5 options - REET Mains uses exactly 4 options (A, B, C, D)',
    'ALL content MUST be in Devanagari (Hindi) script ONLY - no English or Roman transliteration except for standard technical terms',
    'Never create negative phrasing questions with ambiguous TRUE/FALSE statements',
    'Never ignore the "NOT" (नहीं/असत्य) in negative phrasing questions',
    'Ensure accuracy when referencing teaching methods - verify facts from study materials'
  ],

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 0,  // No high-density questions in teaching methods
    warmupPercentage: 0
  },

  buildPrompt: buildTeachingMethodsPrompt,

  validators: [
    // Validate 4 options
    (questions: Question[]) => {
      const errors: string[] = []
      questions.forEach((q, idx) => {
        const optionKeys = Object.keys(q.options)
        if (optionKeys.length !== 4 || !optionKeys.every(key => ['A', 'B', 'C', 'D'].includes(key))) {
          errors.push(`Question ${idx + 1}: Must have exactly 4 options (A, B, C, D)`)
        }
      })
      return errors
    },

    // Validate questionText field exists (not "question")
    (questions: Question[]) => {
      const errors: string[] = []
      questions.forEach((q, idx) => {
        if (!q.questionText || typeof q.questionText !== 'string' || q.questionText.trim().length === 0) {
          errors.push(`Question ${idx + 1}: Missing or invalid "questionText" field`)
        }
      })
      return errors
    },

    // Validate correctAnswer is single letter (A/B/C/D)
    (questions: Question[]) => {
      const errors: string[] = []
      const validAnswers = ['A', 'B', 'C', 'D']
      questions.forEach((q, idx) => {
        if (!validAnswers.includes(q.correctAnswer)) {
          errors.push(`Question ${idx + 1}: correctAnswer must be exactly "A", "B", "C", or "D" (got: "${q.correctAnswer}")`)
        }
      })
      return errors
    },

    // Validate archetype is valid for teaching methods
    (questions: Question[]) => {
      const errors: string[] = []
      const validArchetypes = ['exceptionNegative', 'directRecall', 'theoryAttribution', 'classificatory']
      questions.forEach((q, idx) => {
        if (!validArchetypes.includes(q.archetype)) {
          errors.push(`Question ${idx + 1}: archetype must be one of: ${validArchetypes.join(', ')} (got: "${q.archetype}")`)
        }
      })
      return errors
    },

    // Validate Devanagari content (Hindi questions)
    (questions: Question[]) => {
      const errors: string[] = []
      questions.forEach((q, idx) => {
        const hasDevanagari = /[\u0900-\u097F]/.test(q.questionText)
        if (!hasDevanagari) {
          errors.push(`Question ${idx + 1}: Question text must be in Devanagari (Hindi) script`)
        }

        // Check options are also in Devanagari
        const optionValues = Object.values(q.options)
        const allOptionsHaveDevanagari = optionValues.every(opt => /[\u0900-\u097F]/.test(opt))
        if (!allOptionsHaveDevanagari) {
          errors.push(`Question ${idx + 1}: All options must be in Devanagari (Hindi) script`)
        }

        // Check explanation is in Devanagari
        if (q.explanation && !/[\u0900-\u097F]/.test(q.explanation)) {
          errors.push(`Question ${idx + 1}: Explanation must be in Devanagari (Hindi) script`)
        }
      })
      return errors
    }
  ],

  metadata: {
    version: '2.0.0',
    description: 'Teaching Methods protocol for REET Mains Level 2 Hindi. Defines question generation patterns (archetypes, difficulty, cognitive load). Pattern: 40% negative, 40% direct recall, 10% attribution, 10% classificatory. ALL content in Hindi (Devanagari). Content extracted from study materials/knowledge base.',
    analysisSource: 'REET Mains Level 2 Hindi paper Q126-Q135 pattern analysis',
    lastUpdated: new Date().toISOString(),
    examType: 'SELECTION (Merit-based)',
    sectionWeightage: 'Teaching Methods - 10 questions (part of 70-question Hindi paper)',
    note: 'Protocol defines generation patterns only. All generated content MUST be in Devanagari script (Hindi) ONLY.'
  }
}

// Export types
export type { TeachingMethodsArchetypes }
