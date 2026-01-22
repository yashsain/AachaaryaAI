/**
 * PDF Cleanup Service
 *
 * Handles deletion of question paper and answer key PDFs from Supabase Storage
 * Used when papers are reopened, deleted, or sections are regenerated
 */

import { supabaseAdmin } from '../supabase/admin'
import { STORAGE_BUCKETS } from './storageService'

/**
 * Delete both question paper and answer key PDFs for a paper
 *
 * @param pdf_url - Storage path for question paper (from test_papers.pdf_url)
 * @param answer_key_url - Storage path for answer key (from test_papers.answer_key_url)
 * @returns Object with success status and details
 */
export async function deletePaperPDFs(
  pdf_url: string | null,
  answer_key_url: string | null
): Promise<{
  success: boolean
  deleted_question_paper: boolean
  deleted_answer_key: boolean
  errors: string[]
}> {
  const errors: string[] = []
  let deleted_question_paper = false
  let deleted_answer_key = false

  try {
    // Delete question paper PDF
    if (pdf_url) {
      console.log('[PDF_CLEANUP] Deleting question paper:', pdf_url)
      const { error: pdfError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKETS.PAPERS)
        .remove([pdf_url])

      if (pdfError) {
        console.error('[PDF_CLEANUP] Failed to delete question paper:', pdfError)
        errors.push(`Question paper: ${pdfError.message}`)
      } else {
        deleted_question_paper = true
        console.log('[PDF_CLEANUP] Question paper deleted successfully')
      }
    }

    // Delete answer key PDF
    if (answer_key_url) {
      console.log('[PDF_CLEANUP] Deleting answer key:', answer_key_url)
      const { error: answerKeyError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKETS.PAPERS)
        .remove([answer_key_url])

      if (answerKeyError) {
        console.error('[PDF_CLEANUP] Failed to delete answer key:', answerKeyError)
        errors.push(`Answer key: ${answerKeyError.message}`)
      } else {
        deleted_answer_key = true
        console.log('[PDF_CLEANUP] Answer key deleted successfully')
      }
    }

    const success = errors.length === 0
    if (success) {
      console.log('[PDF_CLEANUP] All PDFs deleted successfully')
    } else {
      console.warn('[PDF_CLEANUP] Some PDFs failed to delete:', errors)
    }

    return {
      success,
      deleted_question_paper,
      deleted_answer_key,
      errors
    }
  } catch (error) {
    console.error('[PDF_CLEANUP_EXCEPTION]', error)
    return {
      success: false,
      deleted_question_paper,
      deleted_answer_key,
      errors: [...errors, error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

/**
 * Clear PDF URLs from test_papers table
 *
 * @param supabase - Supabase client (can be regular or admin)
 * @param paperId - Paper UUID
 * @returns True if successful, false otherwise
 */
export async function clearPaperPDFUrls(
  supabase: any,
  paperId: string
): Promise<boolean> {
  try {
    console.log('[PDF_CLEANUP] Clearing PDF URLs for paper:', paperId)

    const { error } = await supabase
      .from('test_papers')
      .update({
        pdf_url: null,
        answer_key_url: null
      })
      .eq('id', paperId)

    if (error) {
      console.error('[PDF_CLEANUP] Failed to clear PDF URLs:', error)
      return false
    }

    console.log('[PDF_CLEANUP] PDF URLs cleared successfully')
    return true
  } catch (error) {
    console.error('[PDF_CLEANUP_EXCEPTION]', error)
    return false
  }
}
