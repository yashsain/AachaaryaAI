/**
 * REET Mains Level 2 - English Protocol
 *
 * This protocol defines the structure and generation rules for English subject
 * questions in REET Mains Level 2 examination.
 *
 * Based on analysis of 70 questions (Q66-Q135) from REET Mains Level 2 English paper:
 * - Q66-Q125: English content (60 questions)
 * - Q126-Q135: Teaching Methods of English (10 questions)
 *
 * Key characteristics:
 * - All questions have exactly 4 options (A, B, C, D) - validated from actual paper
 * - Includes passage/poem comprehension with extended text
 * - Covers grammar, vocabulary, phonetics, literary devices, and pedagogy
 * - Emphasis on structural transformations and grammar application
 */

import { Protocol, ProtocolConfig } from '../../../types'
import { Question } from '../../../../questionValidator'

/**
 * Custom archetype distribution for English
 *
 * Derived from intrinsic cognitive operations (topic-agnostic analysis):
 * - passageComprehension: Reading extended text + extracting information
 * - vocabularyRecall: Synonyms, antonyms, semantic relationships
 * - grammarApplication: Applying grammar rules (tenses, modals, agreement)
 * - structuralTransformation: Converting between forms (voice, speech, sentence types)
 * - phrasalVerbIdiom: Multi-word expressions and idiomatic language
 * - phoneticTranscription: Sound-symbol mapping (IPA)
 * - syntacticAnalysis: Identifying clauses, parts of speech, structures
 * - literaryDeviceForm: Literary terminology and device identification
 * - prepositionCollocation: Fixed expressions and preposition usage
 * - oneWordSubstitution: Lexical precision
 * - errorDetection: Identifying and correcting grammatical errors
 *
 * NOTE: Teaching Methods (10 questions) are now handled separately in teaching-methods.ts
 * This protocol covers only English content questions (60 questions).
 */
interface EnglishArchetypeDistribution {
  passageComprehension: number
  vocabularyRecall: number
  grammarApplication: number
  structuralTransformation: number
  phrasalVerbIdiom: number
  phoneticTranscription: number
  syntacticAnalysis: number
  literaryDeviceForm: number
  prepositionCollocation: number
  oneWordSubstitution: number
  errorDetection: number
}

/**
 * English-specific protocol configuration
 */
interface EnglishProtocolConfig extends Omit<ProtocolConfig, 'archetypeDistribution'> {
  archetypeDistribution: EnglishArchetypeDistribution
}

/**
 * Protocol configuration based on analysis of 60 English content questions
 * (Teaching Methods - 10 questions - now handled separately in teaching-methods.ts)
 */
const config: EnglishProtocolConfig = {
  archetypeDistribution: {
    passageComprehension: 0.10,         // 6/60 - Passages/poems with comprehension questions
    vocabularyRecall: 0.067,            // 4/60 - Synonyms, antonyms
    grammarApplication: 0.167,          // 10/60 - Tenses, modals, agreement
    structuralTransformation: 0.217,    // 13/60 - Voice, speech, sentence transformations
    phrasalVerbIdiom: 0.10,            // 6/60 - Multi-word expressions
    phoneticTranscription: 0.05,        // 3/60 - IPA transcription
    syntacticAnalysis: 0.133,           // 8/60 - Clause/PoS identification
    literaryDeviceForm: 0.083,          // 5/60 - Literary terms and devices
    prepositionCollocation: 0.05,       // 3/60 - Fixed expressions
    oneWordSubstitution: 0.05,          // 3/60 - Lexical precision
    errorDetection: 0.017               // 1/60 - Error correction
  },

  structuralForms: {
    standardMCQ: 1.0,                   // 100% - All questions are standard MCQ
    matchFollowing: 0,
    negativePhrasing: 0,                // Negative phrasing exists but not tracked separately
  },

  cognitiveLoad: {
    lowDensity: 0.217,                  // ~13/60 - Simple recall, basic grammar
    mediumDensity: 0.683,               // ~41/60 - Transformations, analysis, application
    highDensity: 0.10,                  // 6/60 - Passage/poem comprehension
    maxConsecutiveHigh: 2,              // Avoid clustering heavy comprehension questions
    warmupCount: 0                      // No specific warmup requirement
  },

  prohibitions: [
    'Never use 5 options - REET Mains uses exactly 4 options (A, B, C, D) (100% validated from actual paper)',
    'Never create passage comprehension questions without providing the full passage text',
    'Never mix up voice transformation rules (active/passive)',
    'Never confuse direct/indirect speech tense backshift rules',
    'Never use incorrect phonetic symbols - must follow IPA standard',
    'Never create subject-verb agreement questions without clear subject identification',
    'Never ask about teaching methods from non-English pedagogical frameworks',
    'Never use ambiguous literary device examples',
    'Never create idiom questions with made-up or culturally unfamiliar expressions',
    'Never ignore exception cases (e.g., universal truths in reported speech)',
    'Never create transformation questions where multiple answers could be considered correct',
    'Never use passages that are too technical or domain-specific',
    'Never create phonetic transcription questions with dialectal variations',
    'Never ask about deprecated or non-standard English teaching methodologies'
  ]
}

/**
 * Difficulty mappings for English protocol
 * Defines archetype and cognitive load distributions for each difficulty level
 */
const difficultyMappings: Protocol['difficultyMappings'] = {
  easy: {
    archetypes: {
      passageComprehension: 0.03,
      vocabularyRecall: 0.18,
      grammarApplication: 0.12,
      structuralTransformation: 0.10,
      phrasalVerbIdiom: 0.10,
      phoneticTranscription: 0.12,
      syntacticAnalysis: 0.05,
      literaryDeviceForm: 0.05,
      prepositionCollocation: 0.12,
      oneWordSubstitution: 0.10,
      errorDetection: 0.03
    } as any,
    structuralForms: {
      standardMCQ: 1.0,
      matchFollowing: 0,
      negativePhrasing: 0
    } as any,
    cognitiveLoad: {
      lowDensity: 0.70,
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
      passageComprehension: 0.17,
      vocabularyRecall: 0.02,
      grammarApplication: 0.10,
      structuralTransformation: 0.28,
      phrasalVerbIdiom: 0.08,
      phoneticTranscription: 0.02,
      syntacticAnalysis: 0.17,
      literaryDeviceForm: 0.12,
      prepositionCollocation: 0.02,
      oneWordSubstitution: 0.02,
      errorDetection: 0.02
    } as any,
    structuralForms: {
      standardMCQ: 1.0,
      matchFollowing: 0,
      negativePhrasing: 0
    } as any,
    cognitiveLoad: {
      lowDensity: 0.10,
      mediumDensity: 0.60,
      highDensity: 0.30
    }
  }
}

/**
 * Calculate archetype counts based on total question count
 */
function getArchetypeCounts(questionCount: number): Record<string, number> {
  const dist = config.archetypeDistribution
  return {
    passageComprehension: Math.round(questionCount * dist.passageComprehension),
    vocabularyRecall: Math.round(questionCount * dist.vocabularyRecall),
    grammarApplication: Math.round(questionCount * dist.grammarApplication),
    structuralTransformation: Math.round(questionCount * dist.structuralTransformation),
    phrasalVerbIdiom: Math.round(questionCount * dist.phrasalVerbIdiom),
    phoneticTranscription: Math.round(questionCount * dist.phoneticTranscription),
    syntacticAnalysis: Math.round(questionCount * dist.syntacticAnalysis),
    literaryDeviceForm: Math.round(questionCount * dist.literaryDeviceForm),
    prepositionCollocation: Math.round(questionCount * dist.prepositionCollocation),
    oneWordSubstitution: Math.round(questionCount * dist.oneWordSubstitution),
    errorDetection: Math.round(questionCount * dist.errorDetection)
  }
}

/**
 * Build prompt for English question generation
 */
function buildPrompt(
  protocolConfig: ProtocolConfig,
  chapterName: string,
  questionCount: number,
  totalQuestions: number
): string {
  const archetypeCounts = getArchetypeCounts(questionCount)

  return `Generate ${questionCount} high-quality English questions for REET Mains Level 2 examination.

CRITICAL REQUIREMENTS:
- Each question MUST have exactly 4 options (A, B, C, D) - validated from actual paper
- Questions must align with REET Mains Level 2 English syllabus
- Include both English content and Teaching Methods of English
- This is part of a ${totalQuestions}-question test paper

ARCHETYPE DISTRIBUTION (for ${questionCount} questions):
${Object.entries(archetypeCounts)
  .map(([archetype, count]) => `- ${archetype}: ${count} question${count !== 1 ? 's' : ''}`)
  .join('\n')}

ARCHETYPE DEFINITIONS:

1. PASSAGE COMPREHENSION (${archetypeCounts.passageComprehension} questions)
   - Provide a complete passage (100-250 words) or poem (10-30 lines)
   - Ask inference, main idea, vocabulary in context, or literary analysis questions
   - Passages can be narrative, expository, or argumentative
   - Poems should be from recognized English literature
   - Cognitive load: HIGH - requires processing extended text

2. VOCABULARY RECALL (${archetypeCounts.vocabularyRecall} questions)
   - Synonyms and antonyms of common to advanced words
   - Direct semantic relationship testing
   - Cognitive load: LOW
   - Example: "The synonym of 'confess' is - (A) refuse (B) decline (C) admit (D) deny"

3. GRAMMAR APPLICATION (${archetypeCounts.grammarApplication} questions)
   - Verb tenses (simple, continuous, perfect)
   - Modals (can, could, shall, should, will, would, may, might, must, ought to)
   - Subject-verb agreement (including tricky cases like "Politics is/are")
   - Conditionals (type 0, 1, 2, 3)
   - Subjunctive mood
   - Cognitive load: LOW to MEDIUM

4. STRUCTURAL TRANSFORMATION (${archetypeCounts.structuralTransformation} questions)
   - Active � Passive voice conversion
   - Direct � Indirect speech (statements, questions, commands)
   - Sentence type transformations (assertive, interrogative, exclamatory, imperative)
   - Simple � Compound � Complex sentence conversion
   - Remember exception rules (universal truths, habitual actions)
   - Cognitive load: MEDIUM

5. PHRASAL VERBS & IDIOMS (${archetypeCounts.phrasalVerbIdiom} questions)
   - Common phrasal verbs (give up, look after, turn down, cut down, etc.)
   - Idiomatic expressions (strike while the iron is hot, turn a blind eye, etc.)
   - Meaning or contextual usage
   - Cognitive load: LOW to MEDIUM

6. PHONETIC TRANSCRIPTION (${archetypeCounts.phoneticTranscription} questions)
   - Word � IPA transcription
   - IPA � Word (including homophones like see/sea)
   - Use standard IPA symbols accurately
   - Cognitive load: LOW
   - Example: apple � /�pl/, /si:/ � both see and sea

7. SYNTACTIC ANALYSIS (${archetypeCounts.syntacticAnalysis} questions)
   - Identify clauses (main, subordinate, adjective, adverb, noun)
   - Identify parts of speech (noun, verb, adjective, adverb, etc.)
   - Identify tense from sentence context
   - Cognitive load: MEDIUM

8. LITERARY DEVICES & FORMS (${archetypeCounts.literaryDeviceForm} questions)
   - Literary devices: metaphor, simile, personification, alliteration, etc.
   - Literary forms: sonnet, ode, elegy, allegory, satire, etc.
   - Features and definitions
   - Cognitive load: LOW to MEDIUM

9. PREPOSITIONS & COLLOCATIONS (${archetypeCounts.prepositionCollocation} questions)
   - Correct preposition usage (at, in, on, by, with, etc.)
   - Fixed collocations (time by watch, cut with knife, etc.)
   - Cognitive load: LOW

10. ONE-WORD SUBSTITUTION (${archetypeCounts.oneWordSubstitution} questions)
    - Replace phrase/definition with single word
    - Lexical precision testing
    - Example: "A person who thinks only of himself" � Egoist
    - Cognitive load: LOW to MEDIUM

11. ERROR DETECTION & CORRECTION (${archetypeCounts.errorDetection} questions)
    - Identify grammatical errors in sentences
    - Provide correct form
    - Common errors: tense, agreement, conditional, modals
    - Cognitive load: MEDIUM

NOTE: Teaching Methods (10 questions) are handled separately via teaching-methods.ts protocol.
This protocol generates only English content questions (60 questions).

STRUCTURAL FORMS:
- Standard MCQ: ${Math.round(questionCount * config.structuralForms.standardMCQ)} questions (all questions)

COGNITIVE LOAD DISTRIBUTION:
- Low density: ${Math.round(questionCount * config.cognitiveLoad.lowDensity)} questions
- Medium density: ${Math.round(questionCount * config.cognitiveLoad.mediumDensity)} questions
- High density: ${Math.round(questionCount * config.cognitiveLoad.highDensity)} questions
- Maximum consecutive high-load questions: ${config.cognitiveLoad.maxConsecutiveHigh}

FORMATTING REQUIREMENTS:
1. For passage-based questions:
   - First provide the complete passage/poem
   - Then provide all questions based on that passage
   - Format: "PASSAGE (Questions X-Y):" followed by full text

2. For all questions:
   - Clear question stem
   - Exactly 4 options labeled (A), (B), (C), (D)
   - One unambiguously correct answer
   - Distractors must be plausible but clearly incorrect

3. For transformation questions:
   - Provide the original sentence clearly
   - Specify the transformation type
   - Ensure only one option follows all grammatical rules

4. For teaching methodology questions:
   - Be specific about the teaching method/concept
   - Use official terminology (Audio-lingual, CLT, CCE, etc.)
   - Base on established pedagogical principles

PROHIBITIONS:
${config.prohibitions.map((p: string) => `- ${p}`).join('\n')}

OUTPUT FORMAT (JSON Schema):

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no explanation text.

\`\`\`json
{
  "questions": [
    {
      "questionText": "Question text here",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctAnswer": "A",
      "explanation": "Why this answer is correct",
      "archetype": "grammarApplication",
      "difficulty": "medium",
      "cognitiveLoad": "medium",
      "tags": ["grammar", "tenses"]
    },
    {
      "questionText": "According to the passage, reading is described primarily as:",
      "options": {
        "A": "A simple visual exercise",
        "B": "A mechanism for decoding ink marks",
        "C": "A complex cognitive process",
        "D": "A cultural tradition only"
      },
      "correctAnswer": "C",
      "explanation": "The first sentence explicitly states that reading 'is a complex cognitive process'.",
      "archetype": "passageComprehension",
      "difficulty": "medium",
      "cognitiveLoad": "high",
      "tags": ["comprehension", "inference"],
      "passage": "Reading is not just a mechanism of decoding symbols; it is a complex cognitive process. When we read, our brains translate visual information into meaning, connecting new ideas with existing knowledge. This interaction transforms simple ink marks into vivid worlds, profound emotions, and rigorous arguments. Therefore, a decline in reading habits among youth is not merely a cultural loss but a potential cognitive deficit."
    }
  ]
}
\`\`\`

IMPORTANT NOTES:
1. The "passage" field should ONLY be included for questions with archetype "passageComprehension"
2. When multiple questions share the same passage, include the full passage text in EACH question
3. All passages must be 100-250 words (or 10-30 lines for poems)
4. Return pure JSON wrapped in {"questions": [...]} structure
5. Use "questionText" field name (not "question")

Generate questions now.`
}

/**
 * Validators for English protocol
 */
const validators = {
  /**
   * Validate that all questions have exactly 4 options
   */
  hasFourOptions: (question: any): boolean => {
    const options = question.options
    if (!options) return false
    const optionKeys = Object.keys(options)
    return optionKeys.length === 4 &&
           optionKeys.every(key => ['A', 'B', 'C', 'D'].includes(key))
  },

  /**
   * Validate passage comprehension questions have passage text
   */
  passageHasText: (question: any): boolean => {
    if (question.archetype === 'passageComprehension') {
      return Boolean(question.passage && question.passage.trim().length > 50)
    }
    return true
  },

  /**
   * Validate phonetic transcription questions use IPA symbols
   */
  validPhonetics: (question: any): boolean => {
    if (question.archetype === 'phoneticTranscription') {
      const hasIPAPattern = /[\u0250-\u02AF\u1D00-\u1D7F\u1D80-\u1DBF]/.test(
        question.question + JSON.stringify(question.options)
      ) || /[�[j�YT�]/.test(question.question + JSON.stringify(question.options))
      return hasIPAPattern
    }
    return true
  },

  /**
   * Validate that transformation questions specify the transformation type
   */
  transformationTypeSpecified: (question: any): boolean => {
    if (question.archetype === 'structuralTransformation') {
      const transformationKeywords = [
        'active', 'passive', 'direct', 'indirect', 'speech',
        'voice', 'assertive', 'interrogative', 'exclamatory',
        'compound', 'complex', 'simple'
      ]
      return transformationKeywords.some(keyword =>
        question.question.toLowerCase().includes(keyword) ||
        (question.tags && question.tags.some((tag: string) => tag.toLowerCase().includes(keyword)))
      )
    }
    return true
  },

  /**
   * Validate pedagogical methodology questions reference specific methods
   */
  pedagogyMethodSpecified: (question: any): boolean => {
    if (question.archetype === 'pedagogicalMethodology') {
      const methodKeywords = [
        'audio-lingual', 'bilingual', 'clt', 'communicative',
        'cce', 'teaching', 'method', 'evaluation', 'test'
      ]
      return methodKeywords.some(keyword =>
        question.question.toLowerCase().includes(keyword)
      )
    }
    return true
  },

  /**
   * Validate cognitive load matches archetype expectations
   */
  cognitiveLoadConsistent: (question: any): boolean => {
    const highLoadArchetypes = ['passageComprehension']
    const lowLoadArchetypes = ['vocabularyRecall', 'prepositionCollocation', 'phoneticTranscription']

    if (highLoadArchetypes.includes(question.archetype)) {
      return question.cognitiveLoad === 'high'
    }
    if (lowLoadArchetypes.includes(question.archetype)) {
      return question.cognitiveLoad === 'low'
    }
    return true
  }
}

/**
 * English Protocol Export
 */
export const reetMainsLevel2EnglishProtocol: Protocol = {
  id: 'reet mains level 2-english',
  name: 'REET Mains Level 2 - English',
  streamName: 'REET Mains Level 2',
  subjectName: 'English',

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
        if (q.archetype === 'passageComprehension' && (!q.passage || q.passage.trim().length < 50)) {
          errors.push(`Question ${idx + 1}: Passage comprehension must include full passage text`)
        }
      })
      return errors
    }
  ],

  metadata: {
    version: '2.0.0',
    description: 'Protocol for generating English content questions in REET Mains Level 2 examination. Covers grammar, vocabulary, comprehension, phonetics, and literary devices. Teaching Methods (10 questions) handled separately in teaching-methods.ts.',
    analysisSource: 'REET Mains Level 2 English paper Q66-Q125 (60 English content questions)',
    lastUpdated: new Date().toISOString(),
    examType: 'SELECTION (Merit-based)',
    sectionWeightage: 'English content - 60 questions out of 70-question paper (120 marks)',
    note: 'Teaching Methods questions (Q126-Q135, 10 questions, 20 marks) are generated using the teaching-methods.ts protocol'
  }
}
