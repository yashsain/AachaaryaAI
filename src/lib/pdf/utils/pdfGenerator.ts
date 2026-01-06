/**
 * PDF Generator Utilities
 * Helper functions for PDF metadata generation
 * Phase 6: PDF Generation (Puppeteer Migration - @react-pdf/renderer REMOVED)
 *
 * NOTE: PDF generation now uses Puppeteer (see puppeteerGenerator.ts)
 * This file contains only utility functions for test codes, dates, and durations
 */

/**
 * Generates a test code for the paper
 * Format: {STREAM}-{SUBJECT_CODE}-{YYYYMMDD}-{RANDOM}
 * @param streamName - Exam/stream name (e.g., "NEET", "JEE", "Banking")
 * @param subjectName - Subject name (e.g., "Biology", "Physics")
 * @param date - Date object
 * @returns Generated test code
 */
export function generateTestCode(streamName: string, subjectName: string, date: Date = new Date()): string {
  const streamCode = streamName.substring(0, 4).toUpperCase()
  const subjectCode = subjectName.substring(0, 3).toUpperCase()
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()

  return `${streamCode}-${subjectCode}-${dateStr}-${random}`
}

/**
 * Formats a duration in minutes to HH:MM format
 * @param minutes - Duration in minutes
 * @returns Formatted duration string (e.g., "03:00 Hrs")
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} Hrs`
}

/**
 * Formats a date to DD-MM-YYYY format
 * @param date - Date object or string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()

  return `${day}-${month}-${year}`
}
