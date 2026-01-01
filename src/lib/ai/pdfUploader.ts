/**
 * PDF Uploader Utility
 *
 * Downloads PDFs from Supabase storage and uploads to Gemini File API
 * Handles file processing state and returns file URI for question generation
 */

import { supabaseAdmin } from '@/lib/supabase/admin'
import { ai } from './geminiClient'

export interface UploadedFile {
  fileUri: string
  fileName: string
  state: string
  mimeType: string
}

/**
 * Upload a PDF from Supabase storage to Gemini File API
 *
 * @param supabaseFilePath - Path to file in Supabase storage bucket (e.g., "materials/abc123.pdf")
 * @param displayName - Optional display name for the file
 * @returns Uploaded file info with URI
 */
export async function uploadPDFToGemini(
  supabaseFilePath: string,
  displayName?: string
): Promise<UploadedFile> {
  try {
    console.log('[PDF_UPLOADER] Starting upload:', supabaseFilePath)

    let arrayBuffer: ArrayBuffer
    let fileName: string

    // Check if it's already a full URL
    if (supabaseFilePath.startsWith('http://') || supabaseFilePath.startsWith('https://')) {
      console.log('[PDF_UPLOADER] Parsing Supabase URL')

      // Parse URL to extract bucket and file path
      // Format: https://PROJECT.supabase.co/storage/v1/object/public/BUCKET/PATH
      const urlObj = new URL(supabaseFilePath)
      const pathSegments = urlObj.pathname.split('/').filter(Boolean)

      // Find 'public' index to determine bucket and file path
      const publicIndex = pathSegments.indexOf('public')
      if (publicIndex === -1 || publicIndex + 1 >= pathSegments.length) {
        throw new Error('Invalid Supabase public URL format')
      }

      const bucket = pathSegments[publicIndex + 1] // Bucket name after 'public'
      const filePath = pathSegments.slice(publicIndex + 2).join('/') // Everything after bucket

      console.log('[PDF_UPLOADER] Extracted:', { bucket, filePath })

      // Use supabaseAdmin to bypass RLS (already validated in API route)
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .download(filePath)

      if (error || !data) {
        throw new Error(`Failed to download from Supabase: ${error?.message || 'Unknown error'}`)
      }

      arrayBuffer = await data.arrayBuffer()
      fileName = displayName || filePath.split('/').pop() || 'material.pdf'

      console.log('[PDF_UPLOADER] Downloaded via Supabase Admin:', fileName)
    } else {
      // Step 1: Extract bucket and file path
      // Assuming format: "bucket-name/path/to/file.pdf" or just "path/to/file.pdf" (bucket=materials)
      const pathParts = supabaseFilePath.split('/')
      const bucket = pathParts.length > 1 && !supabaseFilePath.includes('.')
        ? pathParts[0]
        : 'materials_bucket' // Default bucket

      const filePath = pathParts.length > 1 && !supabaseFilePath.includes('.')
        ? pathParts.slice(1).join('/')
        : supabaseFilePath

      console.log('[PDF_UPLOADER] Using path-based download:', { bucket, filePath })

      // Step 2: Download using Supabase Admin (bypasses RLS)
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .download(filePath)

      if (error || !data) {
        throw new Error(`Failed to download from Supabase: ${error?.message || 'Unknown error'}`)
      }

      console.log('[PDF_UPLOADER] Downloaded via Supabase Admin')
      arrayBuffer = await data.arrayBuffer()
      fileName = displayName || filePath.split('/').pop() || 'material.pdf'
    }

    console.log('[PDF_UPLOADER] Downloaded PDF:', (arrayBuffer.byteLength / 1024 / 1024).toFixed(2), 'MB')

    // Step 4: Create Blob with application/pdf MIME type
    const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' })

    // Step 5: Upload to Gemini File API
    console.log('[PDF_UPLOADER] Uploading to Gemini as:', fileName)

    const uploadResult = await ai.files.upload({
      file: pdfBlob,
      config: {
        displayName: fileName
      }
    })

    if (!uploadResult.name) {
      throw new Error('Upload succeeded but no file name returned')
    }

    console.log('[PDF_UPLOADER] Uploaded to Gemini:', uploadResult.name)

    // Step 6: Wait for file processing (poll until ACTIVE or FAILED)
    let fileState = await ai.files.get({ name: uploadResult.name })
    let attempts = 0
    const maxAttempts = 30 // 30 attempts * 2 seconds = 60 seconds max wait

    while (fileState.state === 'PROCESSING' && attempts < maxAttempts) {
      console.log('[PDF_UPLOADER] Processing... (attempt', attempts + 1, ')')
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
      fileState = await ai.files.get({ name: uploadResult.name })
      attempts++
    }

    // Step 7: Handle processing result
    if (fileState.state === 'FAILED') {
      throw new Error(`Gemini file processing failed for: ${fileName}`)
    }

    if (fileState.state === 'PROCESSING') {
      throw new Error(`Gemini file processing timeout for: ${fileName}`)
    }

    console.log('[PDF_UPLOADER_SUCCESS] File active:', {
      name: fileState.name,
      uri: fileState.uri,
      state: fileState.state
    })

    if (!fileState.uri || !fileState.name || !fileState.state || !fileState.mimeType) {
      throw new Error('File state missing required fields')
    }

    return {
      fileUri: fileState.uri,
      fileName: fileState.name,
      state: fileState.state,
      mimeType: fileState.mimeType
    }
  } catch (err) {
    console.error('[PDF_UPLOADER_ERROR]', err)
    throw err
  }
}

/**
 * Upload multiple PDFs to Gemini in parallel
 *
 * @param supabaseFilePaths - Array of file paths in Supabase storage
 * @returns Array of uploaded file info
 */
export async function uploadMultiplePDFsToGemini(
  supabaseFilePaths: string[]
): Promise<UploadedFile[]> {
  console.log('[PDF_UPLOADER] Uploading', supabaseFilePaths.length, 'PDFs in parallel')

  const uploadPromises = supabaseFilePaths.map(filePath =>
    uploadPDFToGemini(filePath)
  )

  const results = await Promise.all(uploadPromises)

  console.log('[PDF_UPLOADER_SUCCESS] Uploaded', results.length, 'PDFs to Gemini')

  return results
}
