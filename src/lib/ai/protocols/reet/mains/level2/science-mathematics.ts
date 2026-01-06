/**
 * REET Mains Level 2 - Science & Mathematics Protocol
 *
 * ⚠️  PRELIMINARY PROTOCOL (N=1 paper analyzed - requires validation)
 * Analysis Source: REET 2023 Science-Mathematics Paper
 * - Mathematics Section: Q66-95 (30 questions analyzed)
 * - Science Section: Q96-125 (30 questions analyzed)
 * - Total Subject Content: 60 questions (excluding Common/Pedagogy/IT sections)
 *
 * CRITICAL INSIGHT: Math and Science have VERY different cognitive profiles
 * - Mathematics: CALCULATION-DOMINANT (80% numerical calculations)
 * - Science: RECALL-DOMINANT (63% single-fact recall)
 *
 * This protocol intelligently adapts based on subject type.
 */

import { Protocol, ProtocolConfig } from '../../../types'
import { Question } from '../../../../questionValidator'

/**
 * Subject-Specific Archetype Distributions
 * Based on Q66-125 analysis (60 questions: 30 Math + 30 Science)
 */

/**
 * MATHEMATICS-SPECIFIC ARCHETYPES (Q66-95, N=30)
 *
 * Math is HEAVILY calculation-based (93% require computation)
 * - Numerical Calculation (A8): 80.0% (24/30) - DOMINANT
 * - Multi-Step Word Problem (A9): 13.3% (4/30)
 * - Data Interpretation (A10): 6.7% (2/30)
 * - Diagram-Based (A11): 6.7% (2/30)
 * - Single-Fact Recall (A1): 3.3% (1/30)
 *
 * Math-exclusive archetypes: A9, A10, A11
 */
const mathematicsArchetypes = {
  balanced: {
    numericalCalculation: 0.80,      // Dominant: equations, formulas, computations
    wordProblem: 0.13,               // Multi-step real-world scenarios
    dataInterpretation: 0.07,        // Charts, histograms, data sets
    diagramBased: 0.07,              // Geometric figures, diagrams
    singleFactRecall: 0.03           // Minimal recall in Math
  },
  easy: {
    numericalCalculation: 0.75,      // Simpler calculations
    wordProblem: 0.08,               // Fewer complex word problems
    dataInterpretation: 0.07,
    diagramBased: 0.05,
    singleFactRecall: 0.05
  },
  hard: {
    numericalCalculation: 0.82,      // More complex calculations
    wordProblem: 0.18,               // More multi-step problems
    dataInterpretation: 0.07,
    diagramBased: 0.08,
    singleFactRecall: 0.02
  }
}

/**
 * SCIENCE-SPECIFIC ARCHETYPES (Q96-125, N=30)
 *
 * Science is RECALL-DOMINANT with some calculation and conceptual questions
 * - Single-Fact Recall (A1): 63.3% (19/30) - DOMINANT
 * - Numerical Calculation (A8): 13.3% (4/30) - Formula-based
 * - Process/Mechanism (A13): 6.7% (2/30)
 * - Exception/Negative (A2): 6.7% (2/30)
 * - Comparative (A3): 6.7% (2/30)
 * - Multi-Item Selection (A12): 6.7% (2/30)
 * - Causal/Conceptual (A6): 3.3% (1/30)
 *
 * Science-exclusive archetypes: A13, A12 (in this paper)
 */
const scienceArchetypes = {
  balanced: {
    singleFactRecall: 0.63,          // Dominant: definitions, facts, terminology
    numericalCalculation: 0.13,      // Formula-based: PE=mgh, R=V/I, moles
    processMechanism: 0.07,          // How processes work (reactions, cycles)
    exceptionNegative: 0.07,         // "NOT" questions
    comparative: 0.07,               // Largest, smallest, highest
    multiItemSelection: 0.07,        // Select correct combination
    causal: 0.03                     // Why/how conceptual understanding
  },
  easy: {
    singleFactRecall: 0.70,          // More recall for easier
    numericalCalculation: 0.10,      // Simpler formula applications
    processMechanism: 0.05,
    exceptionNegative: 0.05,
    comparative: 0.05,
    multiItemSelection: 0.03,
    causal: 0.02
  },
  hard: {
    singleFactRecall: 0.58,          // Less recall for harder
    numericalCalculation: 0.15,      // More complex calculations
    processMechanism: 0.10,          // More process understanding
    exceptionNegative: 0.08,
    comparative: 0.08,
    multiItemSelection: 0.10,
    causal: 0.05
  }
}

/**
 * COMBINED ARCHETYPES (For mixed Math+Science papers)
 * Based on all 60 questions (Q66-125)
 */
const combinedArchetypes = {
  balanced: {
    numericalCalculation: 0.47,      // 28/60 (24 Math + 4 Science)
    singleFactRecall: 0.33,          // 20/60 (1 Math + 19 Science)
    wordProblem: 0.07,               // 4/60 (Math-exclusive)
    exceptionNegative: 0.03,         // 2/60 (Science)
    comparative: 0.03,               // 2/60 (Science)
    dataInterpretation: 0.03,        // 2/60 (Math)
    diagramBased: 0.03,              // 2/60 (Math)
    multiItemSelection: 0.03,        // 2/60 (Science)
    processMechanism: 0.03,          // 2/60 (Science)
    causal: 0.02                     // 1/60 (Science)
  }
}

/**
 * Difficulty Mappings - Subject-Aware
 */
const difficultyMappings: Protocol['difficultyMappings'] = {
  easy: {
    archetypes: {
      // Overall combined distribution
      numericalCalculation: 0.45,
      singleFactRecall: 0.35,
      wordProblem: 0.05,
      exceptionNegative: 0.03,
      comparative: 0.03,
      dataInterpretation: 0.03,
      diagramBased: 0.02,
      multiItemSelection: 0.02,
      processMechanism: 0.02,
      causal: 0.02
    } as any,
    structuralForms: {
      standard4OptionMCQ: 1.00       // 100% validated from 2023 paper
    } as any,
    cognitiveLoad: {
      lowDensity: 0.50,
      mediumDensity: 0.40,
      highDensity: 0.10
    }
  },
  balanced: {
    archetypes: combinedArchetypes.balanced as any,
    structuralForms: {
      standard4OptionMCQ: 1.00
    } as any,
    cognitiveLoad: {
      lowDensity: 0.40,
      mediumDensity: 0.45,
      highDensity: 0.15
    }
  },
  hard: {
    archetypes: {
      numericalCalculation: 0.48,
      singleFactRecall: 0.30,
      wordProblem: 0.10,
      exceptionNegative: 0.03,
      comparative: 0.03,
      dataInterpretation: 0.03,
      diagramBased: 0.03,
      multiItemSelection: 0.03,
      processMechanism: 0.03,
      causal: 0.03
    } as any,
    structuralForms: {
      standard4OptionMCQ: 1.00
    } as any,
    cognitiveLoad: {
      lowDensity: 0.35,
      mediumDensity: 0.45,
      highDensity: 0.20
    }
  }
}

/**
 * Prohibitions - Validated from Q66-125 analysis
 */
const prohibitions: string[] = [
  '⚠️  PRELIMINARY PROHIBITIONS (N=1 paper - validate with more data)',
  'NEVER use "All of the above" or "None of the above" (0% observed in Q66-125)',
  'NEVER use 5 options - MUST use exactly 4 options (A, B, C, D) (100% validated)',
  'NEVER use match-the-following format (0% observed in Science-Math sections)',
  'NEVER use assertion-reason format (0% observed in Science-Math sections)',
  'NEVER use subset inclusion (Option A contained in Option B)',
  'NEVER use ambiguous pronouns without clear referents',
  'NEVER reference study materials in questions ("according to NCERT", "as per material")'
]

/**
 * Helper function to detect subject type from chapter name
 */
function detectSubjectType(chapterName: string): 'mathematics' | 'science' | 'mixed' {
  const mathKeywords = ['algebra', 'geometry', 'number', 'equation', 'polynomial', 'trigonometry', 'mensuration', 'statistics', 'probability', 'ratio', 'coordinate']
  const scienceKeywords = ['physics', 'chemistry', 'biology', 'energy', 'motion', 'force', 'atom', 'cell', 'reaction', 'element', 'organism', 'electricity', 'magnetism']

  const lowerChapter = chapterName.toLowerCase()

  const isMath = mathKeywords.some(keyword => lowerChapter.includes(keyword))
  const isScience = scienceKeywords.some(keyword => lowerChapter.includes(keyword))

  if (isMath && !isScience) return 'mathematics'
  if (isScience && !isMath) return 'science'
  return 'mixed'
}

/**
 * Get subject-specific archetype counts
 */
function getSubjectSpecificArchetypeCounts(
  difficulty: 'easy' | 'balanced' | 'hard',
  subjectType: 'mathematics' | 'science' | 'mixed',
  questionCount: number
): Record<string, number> {
  let archetypes: Record<string, number>

  if (subjectType === 'mathematics') {
    archetypes = mathematicsArchetypes[difficulty]
  } else if (subjectType === 'science') {
    archetypes = scienceArchetypes[difficulty]
  } else {
    archetypes = difficultyMappings[difficulty].archetypes as Record<string, number>
  }

  const counts: Record<string, number> = {}
  for (const [key, value] of Object.entries(archetypes)) {
    counts[key] = Math.round(questionCount * value)
  }

  return counts
}

/**
 * REET Science-Math Prompt Builder
 * Subject-aware prompt that adapts to Math vs Science
 */
function buildREETScienceMathPrompt(
  config: ProtocolConfig,
  chapterName: string,
  questionCount: number,
  totalQuestions: number
): string {
  const subjectType = detectSubjectType(chapterName)
  const difficulty = 'balanced' // Default, can be parameterized
  const archetypeCounts = getSubjectSpecificArchetypeCounts(difficulty, subjectType, questionCount)

  // Build subject-specific archetype list
  const archetypeList = Object.entries(archetypeCounts)
    .filter(([_, count]) => count > 0)
    .map(([archetype, count]) => `- **${count} ${archetype}**`)
    .join('\n')

  const subjectSpecificGuidance = subjectType === 'mathematics'
    ? getMathematicsGuidance(archetypeCounts)
    : subjectType === 'science'
    ? getScienceGuidance(archetypeCounts)
    : getMixedGuidance(archetypeCounts)

  return `You are an expert REET Mains Level 2 Science & Mathematics question paper generator for Class 6-8 teacher selection. Generate ${questionCount} high-quality REET-style questions from the provided study materials for the chapter: "${chapterName}".

**Subject Type Detected:** ${subjectType.toUpperCase()}
This is part of a ${totalQuestions}-question paper.

---

## CRITICAL REET-SPECIFIC REQUIREMENTS

⚠️  **OPTION COUNT**: Each question MUST have exactly 4 options labeled (A), (B), (C), (D)
- NOT 5 options - REET Mains uses 4-option MCQ format (100% validated from 2023 paper)

**DIFFICULTY LEVEL**: Graduation-level content for Classes 6-8 Science/Math Teachers
**EXAM CONTEXT**: 3rd Grade Teacher Selection (Merit-based, not qualifying)

---

## QUESTION ARCHETYPE DISTRIBUTION (Target Counts)

${archetypeList}

${subjectSpecificGuidance}

---

## STRUCTURAL FORMAT

**STANDARD 4-OPTION MCQ (100% of questions):**
\`\`\`
Question stem here?
(A) First option
(B) Second option
(C) Third option
(D) Fourth option
\`\`\`

**CRITICAL**: REET uses 4-option format EXCLUSIVELY. Validated: 60/60 questions in Science-Math sections use this format.

---

## FROZEN PROHIBITIONS (Zero Violations Allowed)

### NEVER include in options:
- ❌ "None of the above" (0% observed)
- ❌ "All of the above" (0% observed)
- ❌ Subset inclusion (Option A contained in Option B)
- ❌ Non-mutually exclusive options

### NEVER use in question stems:
- ❌ Meta-references: "according to NCERT", "as per study material", "according to the provided material"
- ❌ Ambiguous pronouns without clear referents
- ❌ Double negatives

### FORMAT RULES:
- ✅ MUST use exactly 4 options (A, B, C, D)
- ✅ MUST NOT use match-the-following format (0% in Science-Math sections)
- ✅ MUST NOT use assertion-reason format (0% in Science-Math sections)

---

## OPTION CONSTRUCTION RULES

- All 4 options should be approximately equal length
- All 4 options should use the same grammatical structure
- Make distractors plausible - use common misconceptions, calculation errors
- For numerical answers: Include realistic wrong answers (formula errors, sign errors, unit errors)

---

## ANSWER KEY BALANCE

- Distribute correct answers approximately evenly: ~25% each for (A), (B), (C), (D)
- Avoid long streaks of same answer (max 3 consecutive recommended)
- Randomize answer positions naturally

---

## COGNITIVE LOAD SEQUENCING

- **First ${Math.ceil(questionCount * 0.1)} questions**: WARM-UP ZONE - Use low-density questions
- **Middle questions**: Mix of densities appropriate to subject type
- **High-density**: Long stems (>50 words) OR Multi-step calculations OR Word problems OR Diagram interpretation

---

## OUTPUT FORMAT (JSON Schema)

\`\`\`json
{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "Full question text here",
      "archetype": "numericalCalculation" | "singleFactRecall" | "wordProblem" | "exceptionNegative" | "comparative" | "dataInterpretation" | "diagramBased" | "multiItemSelection" | "processMechanism" | "causal",
      "structuralForm": "standard4OptionMCQ",
      "cognitiveLoad": "low" | "medium" | "high",
      "correctAnswer": "A" | "B" | "C" | "D",
      "options": {
        "A": "Full text of option A",
        "B": "Full text of option B",
        "C": "Full text of option C",
        "D": "Full text of option D"
      },
      "explanation": "Clear explanation of correct answer and why others are wrong",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}
\`\`\`

---

## FINAL INSTRUCTIONS

Generate ${questionCount} questions now following ALL rules above.

⚠️  **CRITICAL**:
- Use EXACTLY 4 options per question (NOT 5)
- Extract content from study materials but write authoritatively
- NO meta-references ("according to", "as per material")
- Return ONLY valid JSON

Return the JSON now:`
}

/**
 * Mathematics-Specific Guidance
 */
function getMathematicsGuidance(counts: Record<string, number>): string {
  return `---

## MATHEMATICS-SPECIFIC GUIDANCE

**Cognitive Profile:** CALCULATION-DOMINANT (80% require computation in 2023 paper)

### Archetype Definitions for Mathematics:

**Numerical Calculation (${counts.numericalCalculation || 0} required - DOMINANT):**
- Solve equations (linear, quadratic, polynomial)
- Apply formulas (area, volume, trigonometry)
- Perform computations (arithmetic, algebraic)
- Examples: "Solve for x", "Calculate the area", "Find the value"
- **CRITICAL**: Verify ALL calculations are correct. Show working if complex.

**Multi-Step Word Problem (${counts.wordProblem || 0} required):**
- Real-world scenarios requiring multiple computational steps
- Examples: Compound interest, age problems, work-time, mixture, profit-loss
- Must translate scenario → mathematical model → solve → interpret
- **Pattern from 2023**: Q68 (compound interest), Q74 (digit problem), Q75 (apple exchange), Q88 (diamond price)

**Data Interpretation (${counts.dataInterpretation || 0} required):**
- Extract information from data sets, charts, histograms
- Calculate mode, median, mean from given data
- Read values from graphical representations
- **Pattern from 2023**: Q70 (mode from dataset), Q78 (histogram reading)

**Diagram-Based (${counts.diagramBased || 0} required):**
- Reference geometric figures (triangles, parallelograms, circles)
- Apply geometric theorems and properties
- Require spatial reasoning
- **Pattern from 2023**: Q86 (triangle congruence), Q90 (angle bisector)

### Mathematics Topics Coverage:
- **Number System**: Rational, irrational, real numbers, properties
- **Algebra**: Linear equations, quadratic equations, polynomials, factorization
- **Geometry**: Properties, theorems, congruence, similarity
- **Mensuration**: Area, volume, surface area of 2D/3D shapes
- **Statistics**: Mean, median, mode, data representation
- **Probability**: Basic probability concepts
- **Coordinate Geometry**: Distance, section formula

### Mathematics Accuracy Requirements:
- ✅ Verify ALL numerical answers by solving completely
- ✅ Use proper mathematical notation (√, ², ³, π, etc.)
- ✅ Include SI units where applicable (m, m², m³, kg, etc.)
- ✅ For word problems: Ensure realistic scenarios and logical constraints
- ✅ For calculations: Include plausible wrong answers (sign errors, formula errors, arithmetic mistakes)

---`
}

/**
 * Science-Specific Guidance
 */
function getScienceGuidance(counts: Record<string, number>): string {
  return `---

## SCIENCE-SPECIFIC GUIDANCE

**Cognitive Profile:** RECALL-DOMINANT (63% single-fact recall in 2023 paper)

### Archetype Definitions for Science:

**Single-Fact Recall (${counts.singleFactRecall || 0} required - DOMINANT):**
- Definitions, terminology, facts
- "What is...", "Which organ...", "The formula for..."
- Direct knowledge questions, no multi-step reasoning
- **Examples from 2023**: Q97 (gas produced), Q100 (polymer storage), Q110 (plaster of Paris formula), Q113 (moon landing date)

**Numerical Calculation (${counts.numericalCalculation || 0} required):**
- Formula-based calculations (NOT complex multi-step like Math)
- Examples: PE = mgh, KE = ½mv², R = V/I, PV = nRT, mole calculations
- **Pattern from 2023**: Q98 (PE=mgh), Q107 (mole calculation), Q116 (time period), Q118 (parallel resistance)
- **CRITICAL**: Use correct formulas, proper SI units, significant figures

**Process/Mechanism Understanding (${counts.processMechanism || 0} required):**
- How biological/chemical processes work
- Chemical reactions, metabolic pathways, physiological processes
- Require understanding of steps/sequence
- **Examples from 2023**: Q96 (fermentation enzymes), Q114 (zinc-NaOH reaction)

**Exception/Negative (${counts.exceptionNegative || 0} required):**
- "Which is NOT...", "All EXCEPT...", "Which does NOT belong..."
- Test understanding of categories and classifications
- **Examples from 2023**: Q102 (NOT non-contact force), Q105 (NOT natural polymer)

**Comparative/Superlative (${counts.comparative || 0} required):**
- "Which has highest...", "Largest...", "Most..."
- Require comparing properties across options
- **Examples from 2023**: Q122 (homologous series), Q123 (highest inertia)

**Multi-Item Selection (${counts.multiItemSelection || 0} required):**
- Multiple statements/items given, select correct combination
- Format: "1. Item A, 2. Item B, 3. Item C, 4. Item D → Choose correct option"
- **Examples from 2023**: Q99 (bacterial diseases), Q124 (excretory structures match)

### Science Topics Coverage:

**PHYSICS:**
- Mechanics: Motion, force, work, energy, power
- Electricity & Magnetism: Current, resistance, circuits
- Heat: Temperature, thermal expansion, heat transfer
- Light: Reflection, refraction, optics
- Modern Physics: Atoms, nuclear physics basics

**CHEMISTRY:**
- Matter: States, properties, changes
- Atomic Structure: Atoms, molecules, ions
- Chemical Reactions: Types, equations, balancing
- Acids, Bases, Salts: Properties, neutralization
- Periodic Table: Groups, periods, trends
- Organic Chemistry: Hydrocarbons, functional groups

**BIOLOGY:**
- Cell Structure: Organelles, functions
- Life Processes: Nutrition, respiration, excretion
- Human Body Systems: Digestive, circulatory, nervous
- Genetics: DNA, inheritance basics
- Ecology: Ecosystems, environment
- Microorganisms: Bacteria, viruses, fungi

### Science Accuracy Requirements:
- ✅ Verify scientific terminology (use NCERT-aligned terms)
- ✅ Correct chemical formulas (H₂O, NaCl, CaSO₄·½H₂O)
- ✅ Correct biological names (Latin names, organ systems)
- ✅ Proper SI units (J for energy, Ω for resistance, mol for amount)
- ✅ Physical constants accuracy (g = 10 m/s², c = 3×10⁸ m/s)
- ✅ Chemical equations balanced correctly

---`
}

/**
 * Mixed (Math+Science) Guidance
 */
function getMixedGuidance(counts: Record<string, number>): string {
  return `---

## MIXED SCIENCE-MATHEMATICS GUIDANCE

When generating for integrated/mixed content, balance both profiles:
- Mathematics questions: Calculation-heavy (80% computational)
- Science questions: Recall-heavy (63% factual knowledge)

Refer to subject-specific guidance sections above for detailed archetype definitions.

---`
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
        errors.push(`Question ${q.questionNumber}: Must have exactly 4 options (found ${optionKeys.length}). REET uses 4-option format, not 5.`)
      }
      if (!optionKeys.every(k => ['A', 'B', 'C', 'D'].includes(k))) {
        errors.push(`Question ${q.questionNumber}: Options must be labeled A, B, C, D`)
      }
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
 * Complete REET Mains Level 2 Science-Math Protocol
 */
export const reetMainsLevel2ScienceMathematicsProtocol: Protocol = {
  id: 'reet-mains-level2-science-mathematics',
  name: 'REET Mains Level 2 - Science & Mathematics',
  streamName: 'REET Mains Level 2',
  subjectName: 'Science & Mathematics',
  difficultyMappings,
  prohibitions,
  cognitiveLoadConstraints: {
    maxConsecutiveHigh: 2,
    warmupPercentage: 0.10
  },
  buildPrompt: buildREETScienceMathPrompt,
  validators,
  metadata: {
    description: 'REET Mains Level 2 Science & Mathematics protocol - Subject-aware protocol for Classes 6-8 Science/Math teacher selection',
    analysisSource: '⚠️  PRELIMINARY: REET 2023 Science-Mathematics paper Q66-125 (60 questions: 30 Math + 30 Science)',
    version: '1.0.0-preliminary',
    lastUpdated: '2025-12-27',
    examType: 'SELECTION (Merit-based)',
    note: `⚠️  CONFIDENCE: LOW (N=1 paper - requires validation with 2-3 more papers)

DISCOVERY NOTES:

**Mathematics (Q66-95, N=30):** CALCULATION-DOMINANT
  - Numerical Calculation: 80.0% (24/30)
  - Multi-Step Word Problem: 13.3% (4/30)
  - Data Interpretation: 6.7% (2/30)
  - Diagram-Based: 6.7% (2/30)
  - Single-Fact Recall: 3.3% (1/30)

**Science (Q96-125, N=30):** RECALL-DOMINANT
  - Single-Fact Recall: 63.3% (19/30)
  - Numerical Calculation: 13.3% (4/30) [formula-based]
  - Process/Mechanism: 6.7% (2/30)
  - Exception/Negative: 6.7% (2/30)
  - Comparative: 6.7% (2/30)
  - Multi-Item Selection: 6.7% (2/30)
  - Causal/Conceptual: 3.3% (1/30)

**Validated Patterns:**
  - Standard 4-option MCQ: 100% (60/60 questions)
  - No "All/None of above": 0%
  - No match-the-following: 0%
  - No assertion-reason: 0%

**Subject-Aware Design:**
  - Protocol detects subject type from chapter name
  - Applies Math-specific distribution for Math chapters (80% calculation)
  - Applies Science-specific distribution for Science chapters (63% recall)
  - Uses combined distribution for mixed content`
  }
}
