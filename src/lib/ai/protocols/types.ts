/**
 * Protocol Type System
 *
 * Defines interfaces for exam-specific question generation protocols.
 * Each exam (NEET, JEE, SSC, etc.) + subject combination has its own protocol.
 */

import { Question, ValidationResult } from '../questionValidator'
import type { ChapterKnowledge } from '../types/chapterKnowledge'

/**
 * Configuration for protocol-based question generation
 * Contains distribution percentages for archetypes, structural forms, and cognitive load
 */
export interface ProtocolConfig {
  archetypeDistribution: {
    directRecall: number
    directApplication: number
    integrative?: number // Optional - not used in all exams (e.g., REET Ed Psych)
    discriminator: number
    exceptionOutlier: number
    theoryAttribution?: number // Optional - attribution questions (e.g., "Who proposed...?", "According to...")
    calculationNumerical?: number // Optional - numerical calculations (e.g., IQ calculation)
  }
  structuralForms: {
    standardMCQ: number
    matchFollowing: number
    assertionReason?: number // Optional - not used in all exams (e.g., REET Ed Psych)
    negativePhrasing: number
    multiStatement?: number // Optional - not used in all exams (e.g., REET Ed Psych)
    scenarioBasedMCQ?: number // Optional - scenario/case-study based questions
  }
  cognitiveLoad: {
    lowDensity: number
    mediumDensity: number
    highDensity: number
    maxConsecutiveHigh: number
    warmupCount: number
  }
  prohibitions: string[]
}

/**
 * Difficulty-specific configuration mapping
 * Each difficulty level (easy/balanced/hard) has its own distribution
 */
export interface DifficultyMappings {
  easy: {
    archetypes: ProtocolConfig['archetypeDistribution']
    structuralForms: ProtocolConfig['structuralForms']
    cognitiveLoad: Omit<ProtocolConfig['cognitiveLoad'], 'warmupCount' | 'maxConsecutiveHigh'>
  }
  balanced: {
    archetypes: ProtocolConfig['archetypeDistribution']
    structuralForms: ProtocolConfig['structuralForms']
    cognitiveLoad: Omit<ProtocolConfig['cognitiveLoad'], 'warmupCount' | 'maxConsecutiveHigh'>
  }
  hard: {
    archetypes: ProtocolConfig['archetypeDistribution']
    structuralForms: ProtocolConfig['structuralForms']
    cognitiveLoad: Omit<ProtocolConfig['cognitiveLoad'], 'warmupCount' | 'maxConsecutiveHigh'>
  }
}

/**
 * Validator function type
 * Takes questions array and returns array of error/warning messages
 */
export type ValidatorFunction = (questions: Question[]) => string[]

/**
 * Prompt builder function type
 * Takes protocol config and question metadata, returns formatted prompt
 */
export type PromptBuilderFunction = (
  config: ProtocolConfig,
  chapterName: string,
  questionCount: number,
  totalQuestions: number,
  isBilingual?: boolean,  // Optional: generate bilingual questions (Hindi + English)
  hasStudyMaterials?: boolean  // Optional: whether study materials are provided (used in Paper 1 protocols)
) => string

/**
 * Complete Protocol Definition
 * Each exam+subject combination implements this interface
 */
export interface Protocol {
  /** Unique identifier for this protocol (e.g., "neet-biology") */
  id: string

  /** Display name (e.g., "NEET Biology") */
  name: string

  /** Stream/exam name (e.g., "NEET", "JEE", "Banking") */
  streamName: string

  /** Subject name (e.g., "Biology", "Physics", "Reasoning") */
  subjectName: string

  /** Difficulty-specific configurations */
  difficultyMappings: DifficultyMappings

  /** Global prohibitions (rules that apply across all difficulties) */
  prohibitions: string[]

  /** Cognitive load constraints (apply across all difficulties) */
  cognitiveLoadConstraints: {
    maxConsecutiveHigh: number
    warmupPercentage: number // e.g., 0.1 = first 10% of questions
  }

  /** Function to build AI prompt based on config */
  buildPrompt: PromptBuilderFunction

  /** Validation functions specific to this protocol */
  validators: ValidatorFunction[]

  /** Optional metadata */
  metadata?: {
    description?: string
    analysisSource?: string // e.g., "NEET 2019-2024 papers (580 questions)"
    version?: string
    lastUpdated?: string
    examType?: string // e.g., "SELECTION (Merit-based)", "ELIGIBILITY (Qualifying)"
    sectionWeightage?: string // e.g., "Subject specialization - 140 marks"
    relatedExam?: string // e.g., "REET Pre Level 2 (Eligibility/Qualifying)"
    difficultyMultiplier?: string // e.g., "6-8x (B.Sc. competitive level)"
    cognitiveLoadTarget?: string // e.g., "65% high-density for balanced difficulty"
    note?: string // Additional notes about the exam structure
    officialSyllabus?: string // Official syllabus/curriculum for scope boundary
  }
}

/**
 * Helper type for protocol map keys
 */
export type ProtocolKey = `${string}-${string}` // e.g., "neet-biology", "jee-physics"
