/**
 * Difficulty Mapper
 *
 * Maps difficulty level (easy/balanced/hard) to NEET protocol configuration
 * Includes archetype distribution, structural forms, cognitive load, and prohibitions
 */

export interface ProtocolConfig {
  archetypeDistribution: {
    directRecall: number
    directApplication: number
    integrative: number
    discriminator: number
    exceptionOutlier: number
  }
  structuralForms: {
    standardMCQ: number
    matchFollowing: number
    assertionReason: number
    negativePhrasing: number
    multiStatement: number
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
 * Map difficulty level to NEET protocol configuration
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
 */
export function getArchetypeCounts(
  config: ProtocolConfig,
  questionCount: number
): Record<string, number> {
  return {
    directRecall: Math.round(questionCount * config.archetypeDistribution.directRecall),
    directApplication: Math.round(questionCount * config.archetypeDistribution.directApplication),
    integrative: Math.round(questionCount * config.archetypeDistribution.integrative),
    discriminator: Math.round(questionCount * config.archetypeDistribution.discriminator),
    exceptionOutlier: Math.round(questionCount * config.archetypeDistribution.exceptionOutlier)
  }
}

/**
 * Get target counts for each structural form based on question count
 */
export function getStructuralFormCounts(
  config: ProtocolConfig,
  questionCount: number
): Record<string, number> {
  return {
    standardMCQ: Math.round(questionCount * config.structuralForms.standardMCQ),
    matchFollowing: Math.round(questionCount * config.structuralForms.matchFollowing),
    assertionReason: Math.round(questionCount * config.structuralForms.assertionReason),
    negativePhrasing: Math.round(questionCount * config.structuralForms.negativePhrasing),
    multiStatement: Math.round(questionCount * config.structuralForms.multiStatement)
  }
}
