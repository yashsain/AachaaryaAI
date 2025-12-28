/**
 * Stream to Paper Types Mapping
 *
 * Maps stream names to their valid paper/material types for test paper generation.
 * This ensures that only appropriate paper types are shown for each stream.
 *
 * Example:
 * - NEET stream should only show "NEET Paper", "DPP"
 * - REET streams should only show their respective REET paper types + "DPP"
 * - JEE stream should show JEE paper types + "DPP"
 */

/**
 * Mapping of stream names to their valid paper type names
 * Keys are stream names (case-insensitive), values are arrays of material_type names
 */
export const STREAM_PAPER_TYPES: Record<string, string[]> = {
  // NEET Stream
  'NEET': ['NEET Paper', 'dpp'],

  // JEE Stream (when implemented)
  'JEE': ['JEE Mains Paper', 'JEE Advanced Paper', 'dpp'],

  // REET Streams
  'REET Level 1': ['REET Level 1 Paper', 'dpp'],
  'REET Level 2': ['REET Level 2 Paper', 'dpp'],
  'REET Mains Level 1': ['REET Mains Level 1 Paper', 'dpp'],
  'REET Mains Level 2': ['REET Mains Level 2 Paper', 'dpp'],
}

/**
 * Get valid paper type names for a given stream
 *
 * @param streamName - The name of the stream (e.g., "NEET", "REET Level 1")
 * @returns Array of valid paper type names for the stream
 * @throws Error if stream name is not found in mapping
 *
 * @example
 * const paperTypes = getValidPaperTypes("NEET")
 * // Returns: ["NEET Paper", "dpp"]
 *
 * @example
 * const paperTypes = getValidPaperTypes("REET Mains Level 2")
 * // Returns: ["REET Mains Level 2 Paper", "dpp"]
 */
export function getValidPaperTypes(streamName: string): string[] {
  const paperTypes = STREAM_PAPER_TYPES[streamName]

  if (!paperTypes) {
    throw new Error(
      `No paper types defined for stream "${streamName}". ` +
      `Available streams: ${Object.keys(STREAM_PAPER_TYPES).join(', ')}`
    )
  }

  return paperTypes
}

/**
 * Check if a paper type is valid for a given stream
 *
 * @param streamName - The name of the stream
 * @param paperTypeName - The name of the paper type to check
 * @returns true if the paper type is valid for the stream, false otherwise
 *
 * @example
 * isValidPaperTypeForStream("NEET", "NEET Paper") // true
 * isValidPaperTypeForStream("NEET", "JEE Mains Paper") // false
 * isValidPaperTypeForStream("REET Level 1", "dpp") // true
 */
export function isValidPaperTypeForStream(streamName: string, paperTypeName: string): boolean {
  try {
    const validTypes = getValidPaperTypes(streamName)
    return validTypes.includes(paperTypeName)
  } catch {
    return false
  }
}

/**
 * Get list of all streams that have defined paper types
 *
 * @returns Array of stream names
 *
 * @example
 * const streams = getAvailableStreams()
 * // Returns: ["NEET", "JEE", "REET Level 1", ...]
 */
export function getAvailableStreams(): string[] {
  return Object.keys(STREAM_PAPER_TYPES)
}
