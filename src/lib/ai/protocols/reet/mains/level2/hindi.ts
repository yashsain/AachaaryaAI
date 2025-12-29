/**
 * REET Mains Level 2 - Hindi Protocol
 *
 * This protocol defines the structure and generation rules for Hindi subject
 * questions in REET Mains Level 2 examination.
 *
 * Based on analysis of 60 Hindi questions (Q66-Q125) from REET Mains Level 2 Hindi paper.
 *
 * Key characteristics:
 * - All questions have exactly 4 options (A, B, C, D)
 * - ALL content MUST be in Devanagari script (Hindi only)
 * - Pattern-based archetypes (not topic-based)
 * - Covers grammar, vocabulary, literature, idioms through cognitive patterns
 *
 * CRITICAL: This protocol generates questions in HINDI ONLY (Devanagari script).
 * No English or Roman transliteration is allowed in generated content.
 */

import { Protocol, ProtocolConfig } from '../../../types'
import { Question } from '../../../../questionValidator'

/**
 * Custom archetype distribution for Hindi
 *
 * Pattern-based analysis (topic-agnostic, focused on cognitive operations):
 * - directRecall: Simple factual questions requiring memorized knowledge
 * - errorDetection: Identify correct/incorrect options based on rules
 * - classification: Analyze and categorize into types
 * - structuralAnalysis: Break down, transform, or analyze word/sentence structure
 * - idiomsProverbs: Understand cultural expressions (muhavare, lokoktiyan)
 * - wordSemantics: Understand subtle meanings and word relationships
 * - passageComprehension: Reading extended poetry/text with inference
 *
 * These archetypes cover ALL Hindi content: vyakaran, shabd-bhandar, sahitya, muhavare
 */
interface HindiArchetypeDistribution {
  directRecall: number           // Simple memory-based questions
  errorDetection: number          // Find correct/incorrect
  classification: number          // Identify type/category
  structuralAnalysis: number      // Analyze structure
  idiomsProverbs: number          // Cultural expressions
  wordSemantics: number           // Semantic understanding
  passageComprehension: number    // Poetry/passage comprehension
}

/**
 * Hindi-specific protocol configuration
 */
interface HindiProtocolConfig extends Omit<ProtocolConfig, 'archetypeDistribution'> {
  archetypeDistribution: HindiArchetypeDistribution
}

/**
 * Protocol configuration based on analysis of 60 Hindi content questions
 * Distribution derived from actual REET Mains Level 2 Hindi paper pattern
 */
const config: HindiProtocolConfig = {
  archetypeDistribution: {
    directRecall: 0.283,            // 17/60 - ling, paryayvachi, vilom, vartani, etc.
    errorDetection: 0.10,            // 6/60 - shuddh-ashuddh vakya, karak errors
    classification: 0.233,           // 14/60 - kriya bhed, vakya bhed, shabd bhed
    structuralAnalysis: 0.133,       // 8/60 - sandhi-vichchhed, samas analysis, roopantar
    idiomsProverbs: 0.083,           // 5/60 - muhavare aur lokoktiyon ka arth
    wordSemantics: 0.117,            // 7/60 - anekarthi, shabd-yugm, vakyansh
    passageComprehension: 0.083      // 5/60 - padyansh-bodh (poetry comprehension)
  },

  structuralForms: {
    standardMCQ: 1.0,                // 100% - All questions are standard MCQ
    matchFollowing: 0,
    negativePhrasing: 0.15,          // ~15% use negative phrasing
  },

  cognitiveLoad: {
    lowDensity: 0.367,               // 22/60 - Simple recall, basic grammar
    mediumDensity: 0.533,            // 32/60 - Application, understanding, classification
    highDensity: 0.10,               // 6/60 - Complex sandhi, samas, deep poetry analysis
    maxConsecutiveHigh: 2,           // Avoid clustering complex questions
    warmupCount: 0                   // No specific warmup requirement
  },

  prohibitions: [
    'Each question MUST have exactly 4 options (A, B, C, D) - validated from actual paper',
    'ALL question text, options, and explanations MUST be in Devanagari script (Hindi only) - NO English or Roman transliteration',
    'Passage comprehension questions MUST include full poem/passage text in Devanagari',
    'Grammatical rules must be accurate - sandhi, samas, karak rules must be correct',
    'Idioms and proverbs meanings must follow standard Hindi usage',
    'Tatsam-tadbhav pairs must be etymologically correct',
    'Never use obscene, offensive, or regional dialect words',
    'Poems should be from recognized poets OR AI-generated (copyright-free)',
    'Spelling must follow NCERT standard Hindi conventions',
    'Questions must have only ONE unambiguously correct answer',
    'Distractors must be plausible but clearly incorrect',
    'Do not overuse complex Sanskrit-derived words - maintain modern Hindi balance',
    'Devanagari matras, anusvara, visarga, chandrabindu must be spelled correctly'
  ]
}

/**
 * Difficulty mappings for Hindi protocol
 * Defines archetype and cognitive load distributions for each difficulty level
 */
const difficultyMappings: Protocol['difficultyMappings'] = {
  easy: {
    archetypes: {
      directRecall: 0.40,           // High recall for easy questions
      errorDetection: 0.10,
      classification: 0.15,
      structuralAnalysis: 0.05,
      idiomsProverbs: 0.15,
      wordSemantics: 0.12,
      passageComprehension: 0.03
    } as any,
    structuralForms: {
      standardMCQ: 1.0,
      matchFollowing: 0,
      negativePhrasing: 0.10
    } as any,
    cognitiveLoad: {
      lowDensity: 0.70,             // 70% low cognitive load for easy
      mediumDensity: 0.25,
      highDensity: 0.05
    }
  },
  balanced: {
    archetypes: config.archetypeDistribution as any,
    structuralForms: config.structuralForms as any,
    cognitiveLoad: {
      lowDensity: config.cognitiveLoad.lowDensity,
      mediumDensity: config.cognitiveLoad.mediumDensity,
      highDensity: config.cognitiveLoad.highDensity
    }
  },
  hard: {
    archetypes: {
      directRecall: 0.10,           // Low recall for hard questions
      errorDetection: 0.12,
      classification: 0.28,
      structuralAnalysis: 0.25,     // More structural analysis
      idiomsProverbs: 0.05,
      wordSemantics: 0.10,
      passageComprehension: 0.10    // More comprehension
    } as any,
    structuralForms: {
      standardMCQ: 1.0,
      matchFollowing: 0,
      negativePhrasing: 0.20
    } as any,
    cognitiveLoad: {
      lowDensity: 0.10,
      mediumDensity: 0.55,
      highDensity: 0.35             // 35% high cognitive load for hard
    }
  }
}

/**
 * Calculate archetype counts based on total question count
 */
function getArchetypeCounts(questionCount: number): Record<string, number> {
  const dist = config.archetypeDistribution
  return {
    directRecall: Math.round(questionCount * dist.directRecall),
    errorDetection: Math.round(questionCount * dist.errorDetection),
    classification: Math.round(questionCount * dist.classification),
    structuralAnalysis: Math.round(questionCount * dist.structuralAnalysis),
    idiomsProverbs: Math.round(questionCount * dist.idiomsProverbs),
    wordSemantics: Math.round(questionCount * dist.wordSemantics),
    passageComprehension: Math.round(questionCount * dist.passageComprehension)
  }
}

/**
 * Build prompt for Hindi question generation
 *
 * CRITICAL: All generated content MUST be in Devanagari script (Hindi)
 */
function buildPrompt(
  protocolConfig: ProtocolConfig,
  chapterName: string,
  questionCount: number,
  totalQuestions: number
): string {
  const archetypeCounts = getArchetypeCounts(questionCount)

  return `Generate ${questionCount} high-quality Hindi questions for REET Mains Level 2 examination.

CRITICAL REQUIREMENTS:
- ALL question text, options, and explanations MUST be in Devanagari script (Hindi) ONLY
- NO English or Roman transliteration allowed in generated content
- Each question MUST have exactly 4 options (A, B, C, D)
- This is part of a ${totalQuestions}-question test paper
- Questions must align with REET Mains Level 2 Hindi syllabus

ARCHETYPE DISTRIBUTION (for ${questionCount} questions):
${Object.entries(archetypeCounts)
  .map(([archetype, count]) => `- ${archetype}: ${count} question${count !== 1 ? 's' : ''}`)
  .join('\n')}

ARCHETYPE DEFINITIONS (Pattern-based, topic-agnostic):

1. DIRECT RECALL (${archetypeCounts.directRecall} questions)
   - Simple factual questions requiring memorized knowledge
   - Difficulty: Easy
   - Cognitive load: LOW

   Example topics (content can cover any Hindi grammar/vocabulary):
   * Gender identification (ling): What is the gender of word X?
   * Synonyms (paryayvachi): Synonym of word X?
   * Antonyms (vilom): Antonym of word X?
   * Basic spelling (vartani): Identify correct spelling
   * Tense identification (kaal): Identify tense in sentence
   * Linguistic units: What is smallest unit of language?
   * Technical terminology: Hindi term for English word X
   * Tatsam words: Identify tatsam word
   * Punctuation marks (viram chinh)

2. ERROR DETECTION (${archetypeCounts.errorDetection} questions)
   - Identify correct/incorrect sentences or words
   - Apply grammatical rules to find errors
   - Difficulty: Medium
   - Cognitive load: MEDIUM

   Examples:
   * Shuddh-ashuddh vakya: Which sentence is correct/incorrect?
   * Karak errors: Identify case-relation errors
   * Spelling errors: Find correctly spelled word

3. CLASSIFICATION (${archetypeCounts.classification} questions)
   - Identify type or category
   - Grammatical categorization
   - Difficulty: Medium
   - Cognitive load: MEDIUM

   Examples:
   * Verb types (kriya bhed): Identify sakarmak/akarmak kriya
   * Sentence types (vakya bhed): Simple/compound/complex
   * Word types (shabd bhed): Rudh/yaugik/yogrudh
   * Phonetics (varn vichar): Place of articulation
   * Pronoun types (sarvnam bhed): Identify pronoun category
   * Indeclinables (avyay): Type of avyay
   * Visheshshya: Identify visheshshya in sentence
   * Shabd shakti: Literary device identification

4. STRUCTURAL ANALYSIS (${archetypeCounts.structuralAnalysis} questions)
   - Break down or transform word/sentence structure
   - Analyze formation and composition
   - Difficulty: Medium to Hard
   - Cognitive load: HIGH

   Examples:
   * Sandhi-vichchhed: Break compound into constituent parts
   * Samas analysis: Identify type of samas (tatpurush, dvandva, etc.)
   * Samas vigrah: Expand compound word
   * Noun transformation (sangya): Convert jativachak to bhavavachak
   * Prefix identification (upsarg)
   * Suffix identification (pratyay)
   * Tadbhav words: Identify tadbhav form of tatsam

5. IDIOMS & PROVERBS (${archetypeCounts.idiomsProverbs} questions)
   - Meaning of idiomatic expressions
   - Understanding cultural sayings
   - Difficulty: Easy to Medium
   - Cognitive load: MEDIUM

   Examples:
   * Muhavare: Meaning of common Hindi idioms
   * Lokoktiyan: Interpretation of proverbs
   * Contextual usage of expressions

6. WORD SEMANTICS (${archetypeCounts.wordSemantics} questions)
   - Understand subtle meanings and relationships
   - Distinguish between similar words
   - Difficulty: Medium
   - Cognitive load: MEDIUM

   Examples:
   * Anekarthi shabd: Words with multiple meanings
   * Ekarthak shabd-yugm: Distinguish word pairs (e.g., rat-rati)
   * Vakyansh ke liye ek shabd: One-word substitution
   * Semantic differences between similar-sounding words

7. PASSAGE COMPREHENSION (${archetypeCounts.passageComprehension} questions)
   - Extended Hindi poetry or prose with inference questions
   - Deep understanding of meaning and sentiment
   - Difficulty: Medium to Hard
   - Cognitive load: HIGH

   * Provide complete poem (10-20 lines) or prose passage in Devanagari
   * Ask about bhav (sentiment), meaning, ras, alankar
   * Use poems from recognized poets (Kabir, Tulsi, Surdas, Meera, etc.)
   * Or generate original AI poetry (copyright-free)
   * Questions test interpretation, not just literal reading

STRUCTURAL FORMS:
- All ${questionCount} questions are standard MCQ format
- Each has exactly 4 options (A, B, C, D)

COGNITIVE LOAD DISTRIBUTION:
- Low density: ${Math.round(questionCount * config.cognitiveLoad.lowDensity)} questions
- Medium density: ${Math.round(questionCount * config.cognitiveLoad.mediumDensity)} questions
- High density: ${Math.round(questionCount * config.cognitiveLoad.highDensity)} questions
- Maximum consecutive high-load questions: ${config.cognitiveLoad.maxConsecutiveHigh}

FORMATTING REQUIREMENTS:

1. For passage-based questions:
   - First provide complete poem/passage in Devanagari
   - Then provide all questions based on that passage
   - Format: "PADYANSH (Questions X-Y):" followed by full text in Hindi

2. For all questions:
   - Clear question stem in Devanagari (Hindi)
   - Exactly 4 options labeled (A), (B), (C), (D) in Devanagari
   - One unambiguously correct answer
   - Distractors must be plausible but clearly incorrect

3. Devanagari accuracy:
   - All matras correct (vowel marks)
   - Anusvara, visarga, chandrabindu in correct places
   - Conjunct letters properly formed
   - Follow NCERT standard Hindi spelling

PROHIBITIONS:
${config.prohibitions.map((p: string) => `- ${p}`).join('\n')}

OUTPUT FORMAT:
Return a JSON array of question objects. ALL CONTENT MUST BE IN DEVANAGARI (HINDI):
[
  {
    "question": "Question text in Devanagari (Hindi) only",
    "options": {
      "A": "Option A in Devanagari only",
      "B": "Option B in Devanagari only",
      "C": "Option C in Devanagari only",
      "D": "Option D in Devanagari only"
    },
    "correctAnswer": "A",
    "explanation": "Explanation in Devanagari (Hindi) only",
    "archetype": "directRecall",
    "difficulty": "medium",
    "cognitiveLoad": "low",
    "tags": ["grammar_topic", "specific_concept"],
    "passage": "Full poem/passage text (only for passage comprehension questions)"
  }
]

REMEMBER: All generated content (questions, options, explanations) MUST be in Devanagari script (Hindi) ONLY.
Generate questions now.`
}


/**
 * Hindi Protocol Export
 */
export const reetMainsLevel2HindiProtocol: Protocol = {
  id: 'reet mains level 2-hindi',
  name: 'REET Mains Level 2 - Hindi',
  streamName: 'REET Mains Level 2',
  subjectName: 'Hindi',

  difficultyMappings,

  prohibitions: config.prohibitions,

  cognitiveLoadConstraints: {
    maxConsecutiveHigh: config.cognitiveLoad.maxConsecutiveHigh,
    warmupPercentage: 0
  },

  buildPrompt,

  validators: [
    // Validate all questions have exactly 4 options
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

    // Validate passage comprehension questions have passage text
    (questions: Question[]) => {
      const errors: string[] = []
      questions.forEach((q, idx) => {
        const qWithPassage = q as any
        if (q.archetype === 'passageComprehension' && (!qWithPassage.passage || qWithPassage.passage.trim().length < 50)) {
          errors.push(`Question ${idx + 1}: Passage comprehension must include full passage text (Devanagari)`)
        }
      })
      return errors
    },

    // Validate all content is in Devanagari (Hindi)
    (questions: Question[]) => {
      const errors: string[] = []
      questions.forEach((q, idx) => {
        // Check if question has substantial Devanagari content
        const hasDevanagari = /[\u0900-\u097F]/.test(q.questionText)
        if (!hasDevanagari) {
          errors.push(`Question ${idx + 1}: Question text must be in Devanagari (Hindi) script`)
        }

        // Check options
        Object.entries(q.options).forEach(([key, value]) => {
          const hasDevanagari = /[\u0900-\u097F]/.test(value)
          if (!hasDevanagari && value.length > 0) {
            errors.push(`Question ${idx + 1}, Option ${key}: Must be in Devanagari (Hindi) script`)
          }
        })

        // Check explanation
        if (q.explanation && q.explanation.length > 0) {
          const hasDevanagari = /[\u0900-\u097F]/.test(q.explanation)
          if (!hasDevanagari) {
            errors.push(`Question ${idx + 1}: Explanation must be in Devanagari (Hindi) script`)
          }
        }
      })
      return errors
    }
  ],

  metadata: {
    version: '1.0.0',
    description: 'Protocol for generating Hindi content questions in REET Mains Level 2 examination. Uses pattern-based archetypes (not topic-based). ALL content generated in Devanagari (Hindi) script only.',
    analysisSource: 'REET Mains Level 2 Hindi paper Q66-Q125 (60 Hindi content questions)',
    lastUpdated: new Date().toISOString(),
    examType: 'SELECTION (Merit-based)',
    sectionWeightage: 'Hindi content - 60 questions (120 marks)',
    note: 'Pattern-based archetypes: directRecall, errorDetection, classification, structuralAnalysis, idiomsProverbs, wordSemantics, passageComprehension. Covers all Hindi topics (vyakaran, shabd-bhandar, sahitya, muhavare) through cognitive patterns.'
  }
}
