/**
 * Debug Logger for Question Generation
 *
 * Logs requests/responses to files for verification before DB commit
 */

import { writeFileSync } from 'fs'
import { join } from 'path'

const DEBUG_DIR = join(process.cwd(), 'debug_logs')

/**
 * Log Gemini request to file
 */
export function logGeminiRequest(
  paperId: string,
  chapterName: string,
  chapterIndex: number,
  data: {
    prompt: string
    fileUris: string[]
    questionCount: number
    difficulty: string
    protocolConfig: any
  }
) {
  const timestamp = new Date().toISOString().replace(/:/g, '-')
  const filename = `${timestamp}_paper-${paperId}_ch${chapterIndex}_${sanitize(chapterName)}_REQUEST.json`
  const filepath = join(DEBUG_DIR, filename)

  const logData = {
    timestamp: new Date().toISOString(),
    paperId,
    chapterName,
    chapterIndex,
    ...data
  }

  try {
    writeFileSync(filepath, JSON.stringify(logData, null, 2))
    console.log(`[DEBUG_LOG] Request saved to: ${filename}`)
    return filepath
  } catch (err) {
    console.error('[DEBUG_LOG_ERROR] Failed to write request log:', err)
    return null
  }
}

/**
 * Log Gemini response to file
 */
export function logGeminiResponse(
  paperId: string,
  chapterName: string,
  chapterIndex: number,
  data: {
    rawResponse: string
    parsedQuestions: any[]
    validationResult: any
  }
) {
  const timestamp = new Date().toISOString().replace(/:/g, '-')
  const filename = `${timestamp}_paper-${paperId}_ch${chapterIndex}_${sanitize(chapterName)}_RESPONSE.json`
  const filepath = join(DEBUG_DIR, filename)

  const logData = {
    timestamp: new Date().toISOString(),
    paperId,
    chapterName,
    chapterIndex,
    ...data
  }

  try {
    writeFileSync(filepath, JSON.stringify(logData, null, 2))
    console.log(`[DEBUG_LOG] Response saved to: ${filename}`)
    return filepath
  } catch (err) {
    console.error('[DEBUG_LOG_ERROR] Failed to write response log:', err)
    return null
  }
}

/**
 * Log what would be inserted into DB (without actually inserting)
 */
export function logDBPreview(
  paperId: string,
  chapterName: string,
  chapterIndex: number,
  dbRecords: any[]
) {
  const timestamp = new Date().toISOString().replace(/:/g, '-')
  const filename = `${timestamp}_paper-${paperId}_ch${chapterIndex}_${sanitize(chapterName)}_DB_PREVIEW.json`
  const filepath = join(DEBUG_DIR, filename)

  const logData = {
    timestamp: new Date().toISOString(),
    paperId,
    chapterName,
    chapterIndex,
    recordCount: dbRecords.length,
    records: dbRecords
  }

  try {
    writeFileSync(filepath, JSON.stringify(logData, null, 2))
    console.log(`[DEBUG_LOG] DB preview saved to: ${filename}`)
    return filepath
  } catch (err) {
    console.error('[DEBUG_LOG_ERROR] Failed to write DB preview log:', err)
    return null
  }
}

/**
 * Log summary of entire generation run
 */
export function logGenerationSummary(
  paperId: string,
  summary: {
    totalChapters: number
    totalQuestionsGenerated: number
    chaptersProcessed: number
    validationErrors: string[]
    validationWarnings: string[]
    timing: Record<string, number>
  }
) {
  const timestamp = new Date().toISOString().replace(/:/g, '-')
  const filename = `${timestamp}_paper-${paperId}_SUMMARY.json`
  const filepath = join(DEBUG_DIR, filename)

  const logData = {
    timestamp: new Date().toISOString(),
    paperId,
    ...summary
  }

  try {
    writeFileSync(filepath, JSON.stringify(logData, null, 2))
    console.log(`[DEBUG_LOG] Summary saved to: ${filename}`)
    return filepath
  } catch (err) {
    console.error('[DEBUG_LOG_ERROR] Failed to write summary log:', err)
    return null
  }
}

/**
 * Sanitize filename
 */
function sanitize(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 50)
}
