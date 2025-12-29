/**
 * Protocol Resolver
 *
 * Central registry for all exam-specific question generation protocols.
 * Maps (stream, subject) combinations to their respective protocols.
 */

import { Protocol, ProtocolKey } from './types'
import { neetBiologyProtocol } from './neet/biology'
import { supabaseAdmin } from '@/lib/supabase'

// REET Mains Level 2 Protocols
import { reetMainsLevel2ScienceMathematicsProtocol } from './reet/mains/level2/science-mathematics'
import { reetMainsLevel2SocialStudiesProtocol } from './reet/mains/level2/social-studies'
import { reetMainsLevel2EnglishProtocol } from './reet/mains/level2/english'
import { reetMainsLevel2HindiProtocol } from './reet/mains/level2/hindi'
import {
  reetMainsLevel2EnglishTeachingMethodsProtocol,
  reetMainsLevel2HindiTeachingMethodsProtocol
} from './reet/mains/level2/teaching-methods'
import { reetMainsLevel2RajasthanGKProtocol } from './reet/mains/level2/common_sections/rajasthan-general-knowledge'
import { reetMainsLevel2EducationalPsychologyProtocol } from './reet/mains/level2/common_sections/educational-psychology'
import { reetMainsLevel2InformationTechnologyProtocol } from './reet/mains/level2/common_sections/information-technology'

/**
 * Protocol Registry
 * Maps protocol keys (e.g., "neet-biology") to Protocol objects
 */
const protocolRegistry: Map<ProtocolKey, Protocol> = new Map([
  // NEET Protocols
  ['neet-biology', neetBiologyProtocol],

  // REET Mains Level 2 Protocols
  ['reet mains level 2-science & mathematics', reetMainsLevel2ScienceMathematicsProtocol],
  ['reet mains level 2-social studies', reetMainsLevel2SocialStudiesProtocol],
  ['reet mains level 2-english', reetMainsLevel2EnglishProtocol],
  ['reet mains level 2-hindi', reetMainsLevel2HindiProtocol],
  ['reet mains level 2-english-teaching-methods', reetMainsLevel2EnglishTeachingMethodsProtocol],
  ['reet mains level 2-hindi-teaching-methods', reetMainsLevel2HindiTeachingMethodsProtocol],
  ['reet mains level 2-rajasthan general knowledge', reetMainsLevel2RajasthanGKProtocol],
  ['reet mains level 2-psychology (child development & pedagogy)', reetMainsLevel2EducationalPsychologyProtocol],
  ['reet mains level 2-information technology', reetMainsLevel2InformationTechnologyProtocol],

  // JEE Protocols (stubs - to be implemented)
  // ['jee-physics', jeePhysicsProtocol],
  // ['jee-chemistry', jeeChemistryProtocol],
  // ['jee-mathematics', jeeMathematicsProtocol],

  // Banking Protocols (stubs - to be implemented)
  // ['banking-reasoning', bankingReasoningProtocol],
  // ['banking-quantitative aptitude', bankingQuantitativeProtocol],
  // ['banking-english', bankingEnglishProtocol],

  // Add more protocols here as they are created
])

/**
 * Get protocol by stream and subject name
 *
 * @param streamName - The exam/stream name (e.g., "NEET", "JEE", "Banking")
 * @param subjectName - The subject name (e.g., "Biology", "Physics", "Reasoning")
 * @returns Protocol object for the given stream+subject combination
 * @throws Error if no protocol found for the given combination
 *
 * @example
 * const protocol = getProtocol("NEET", "Biology")
 * // Returns neetBiologyProtocol
 *
 * @example
 * const protocol = getProtocol("JEE", "Physics")
 * // Throws error if JEE Physics protocol not yet created
 */
export function getProtocol(streamName: string, subjectName: string): Protocol {
  // Normalize to lowercase and create key
  const key: ProtocolKey = `${streamName.toLowerCase()}-${subjectName.toLowerCase()}`

  const protocol = protocolRegistry.get(key)

  if (!protocol) {
    throw new Error(
      `No protocol found for stream "${streamName}" and subject "${subjectName}". ` +
      `Available protocols: ${Array.from(protocolRegistry.keys()).join(', ')}`
    )
  }

  return protocol
}

/**
 * Get protocol for a specific test paper by fetching stream and subject from database
 *
 * @param paperId - UUID of the test paper
 * @returns Protocol object for the paper's stream+subject combination
 * @throws Error if paper not found or no protocol exists for the paper's stream+subject
 *
 * @example
 * const protocol = await getProtocolForPaper('123e4567-e89b-12d3-a456-426614174000')
 * // Fetches paper from DB, gets stream and subject, returns appropriate protocol
 */
export async function getProtocolForPaper(paperId: string): Promise<Protocol> {
  // Fetch paper with stream and subject names
  const { data: paper, error } = await supabaseAdmin
    .from('test_papers')
    .select(`
      id,
      streams (name),
      subjects (name)
    `)
    .eq('id', paperId)
    .single()

  if (error || !paper) {
    throw new Error(`Test paper not found: ${paperId}`)
  }

  const streamName = (paper.streams as any)?.name
  const subjectName = (paper.subjects as any)?.name

  if (!streamName || !subjectName) {
    throw new Error(`Paper ${paperId} missing stream or subject information`)
  }

  return getProtocol(streamName, subjectName)
}

/**
 * Check if a protocol exists for a given stream+subject combination
 *
 * @param streamName - The exam/stream name
 * @param subjectName - The subject name
 * @returns true if protocol exists, false otherwise
 *
 * @example
 * if (hasProtocol("NEET", "Biology")) {
 *   // Protocol exists, can generate questions
 * }
 */
export function hasProtocol(streamName: string, subjectName: string): boolean {
  const key: ProtocolKey = `${streamName.toLowerCase()}-${subjectName.toLowerCase()}`
  return protocolRegistry.has(key)
}

/**
 * Get list of all available protocols
 *
 * @returns Array of protocol IDs
 *
 * @example
 * const available = getAvailableProtocols()
 * // Returns: ['neet-biology', 'jee-physics', ...]
 */
export function getAvailableProtocols(): ProtocolKey[] {
  return Array.from(protocolRegistry.keys())
}

/**
 * Get protocol metadata without loading the full protocol
 * Useful for listing available protocols in UI
 *
 * @returns Array of protocol metadata objects
 */
export function getProtocolMetadata() {
  return Array.from(protocolRegistry.values()).map(protocol => ({
    id: protocol.id,
    name: protocol.name,
    streamName: protocol.streamName,
    subjectName: protocol.subjectName,
    description: protocol.metadata?.description,
    version: protocol.metadata?.version
  }))
}

// Export types for convenience
export type { Protocol, ProtocolConfig, ProtocolKey } from './types'
