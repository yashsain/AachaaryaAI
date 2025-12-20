/**
 * PDF Generator Utility
 * Core logic for generating NEET test paper PDFs
 * Phase 6: PDF Generation
 */

import { renderToStream } from '@react-pdf/renderer'
import { TemplateConfig } from '../types'
import { NEETTemplate } from '../templates/NEETTemplate'
import { Readable } from 'stream'

/**
 * Generates a PDF from template configuration
 * @param config - Template configuration with all paper and institute data
 * @returns Readable stream of the generated PDF
 */
export async function generatePDF(config: TemplateConfig): Promise<Readable> {
  try {
    console.log('[PDF_GENERATOR] Starting PDF generation for:', config.testTitle)
    console.log('[PDF_GENERATOR] Questions count:', config.questions.length)
    console.log('[PDF_GENERATOR] Institute:', config.instituteName)

    // Validate configuration
    if (!config.questions || config.questions.length === 0) {
      throw new Error('No questions provided for PDF generation')
    }

    if (!config.instituteName) {
      throw new Error('Institute name is required for PDF generation')
    }

    if (!config.testTitle) {
      throw new Error('Test title is required for PDF generation')
    }

    // Generate PDF using React-PDF
    const pdfStream = await renderToStream(NEETTemplate({ config }))

    console.log('[PDF_GENERATOR] PDF generation completed successfully')

    return pdfStream as Readable
  } catch (error) {
    console.error('[PDF_GENERATOR] Error generating PDF:', error)
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Converts a readable stream to a buffer
 * Useful for uploading to Supabase Storage
 * @param stream - Readable stream
 * @returns Buffer containing the PDF data
 */
export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []

    stream.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk))
    })

    stream.on('end', () => {
      resolve(Buffer.concat(chunks))
    })

    stream.on('error', (error) => {
      reject(error)
    })
  })
}

/**
 * Generates a test code for the paper
 * Format: NEET-{SUBJECT_CODE}-{YYYYMMDD}-{RANDOM}
 * @param subjectName - Subject name (e.g., "Biology", "Physics")
 * @param date - Date object
 * @returns Generated test code
 */
export function generateTestCode(subjectName: string, date: Date = new Date()): string {
  const subjectCode = subjectName.substring(0, 3).toUpperCase()
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()

  return `NEET-${subjectCode}-${dateStr}-${random}`
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
