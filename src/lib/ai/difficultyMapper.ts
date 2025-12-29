/**
 * Difficulty Mapper
 *
 * Maps difficulty level (easy/balanced/hard) to protocol configuration
 * Works with any exam protocol (NEET, JEE, Banking, etc.)
 * Includes archetype distribution, structural forms, cognitive load, and prohibitions
 */

import { Protocol, ProtocolConfig as IProtocolConfig } from './protocols/types'

// Re-export ProtocolConfig for backward compatibility
export interface ProtocolConfig extends IProtocolConfig {}

// Also export directly from types for convenience
export type { ProtocolConfig as Config } from './protocols/types'

/**
 * Map difficulty level to protocol configuration (protocol-aware version)
 * This is the new, protocol-aware mapper
 */
export function mapDifficultyToConfig(
  protocol: Protocol,
  difficulty: 'easy' | 'balanced' | 'hard',
  questionCount: number
): ProtocolConfig {
  const difficultyMapping = protocol.difficultyMappings[difficulty]

  const warmupCount = Math.min(
    Math.floor(questionCount * protocol.cognitiveLoadConstraints.warmupPercentage),
    3
  )

  return {
    archetypeDistribution: difficultyMapping.archetypes,
    structuralForms: difficultyMapping.structuralForms,
    cognitiveLoad: {
      ...difficultyMapping.cognitiveLoad,
      maxConsecutiveHigh: protocol.cognitiveLoadConstraints.maxConsecutiveHigh,
      warmupCount
    },
    prohibitions: protocol.prohibitions
  }
}

/**
 * Map difficulty level to NEET Biology protocol configuration (legacy version)
 * This function is hardcoded for NEET Biology only
 * @deprecated Use mapDifficultyToConfig(protocol, difficulty, questionCount) instead
 */
export function mapDifficultyToProtocol(
  difficulty: 'easy' | 'balanced' | 'hard',
  questionCount: number
): ProtocolConfig {
  // Base configuration (Balanced)
  let config: ProtocolConfig = {
    archetypeDistribution: {
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
      highDensity: 0.15,
      maxConsecutiveHigh: 2,
      warmupCount: Math.min(3, Math.floor(questionCount * 0.1))
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
      'NEVER violate max-3-consecutive same answer key'
    ]
  }

  // Adjust for difficulty
  if (difficulty === 'easy') {
    config.archetypeDistribution = {
      directRecall: 0.65,
      directApplication: 0.14,
      integrative: 0.08,
      discriminator: 0.06,
      exceptionOutlier: 0.07
    }
    config.cognitiveLoad.highDensity = 0.11
    config.cognitiveLoad.mediumDensity = 0.49
    config.cognitiveLoad.lowDensity = 0.40
  } else if (difficulty === 'hard') {
    config.archetypeDistribution = {
      directRecall: 0.58,
      directApplication: 0.10,
      integrative: 0.12,
      discriminator: 0.12,
      exceptionOutlier: 0.08
    }
    config.cognitiveLoad.highDensity = 0.16
    config.cognitiveLoad.mediumDensity = 0.44
    config.cognitiveLoad.lowDensity = 0.40
  }

  return config
}

/**
 * Get target counts for each archetype based on question count
 * Dynamically handles all archetypes defined in the protocol (including optional ones)
 */
export function getArchetypeCounts(
  config: ProtocolConfig,
  questionCount: number
): Record<string, number> {
  const counts: Record<string, number> = {}

  // Iterate through all archetypes in the distribution
  for (const [archetype, percentage] of Object.entries(config.archetypeDistribution)) {
    if (percentage !== undefined && percentage > 0) {
      counts[archetype] = Math.round(questionCount * percentage)
    }
  }

  return counts
}

/**
 * Get target counts for each structural form based on question count
 * Dynamically handles all structural forms defined in the protocol (including optional ones)
 */
export function getStructuralFormCounts(
  config: ProtocolConfig,
  questionCount: number
): Record<string, number> {
  const counts: Record<string, number> = {}

  // Iterate through all structural forms in the distribution
  for (const [form, percentage] of Object.entries(config.structuralForms)) {
    if (percentage !== undefined && percentage > 0) {
      counts[form] = Math.round(questionCount * percentage)
    }
  }

  return counts
}
