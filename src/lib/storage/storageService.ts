/**
 * aachaaryAI Storage Service
 *
 * Handles file uploads, deletions, and URL generation for Supabase Storage.
 * All storage operations are institute-isolated following the path pattern:
 * institute_{uuid}/bucket_type/{resource_id}/{filename}
 */

import { supabaseAdmin } from '../supabase'

// Storage bucket names (must match Supabase Storage configuration)
export const STORAGE_BUCKETS = {
  MATERIALS: 'materials_bucket',
  PAPERS: 'papers_bucket',
  DIAGRAMS: 'diagrams_bucket',
  TEMP: 'temp_bucket'
} as const

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]

/**
 * Generate storage path for material files
 *
 * @param instituteId - Institute UUID
 * @param materialId - Material UUID
 * @param filename - Original filename
 * @returns Storage path string
 *
 * @example
 * generateMaterialPath('abc-123', 'mat-456', 'physics_notes.pdf')
 * // => 'institute_abc-123/materials/mat-456/physics_notes.pdf'
 */
export function generateMaterialPath(
  instituteId: string,
  materialId: string,
  filename: string
): string {
  return `institute_${instituteId}/materials/${materialId}/${filename}`
}

/**
 * Generate storage path for test paper files
 *
 * @param instituteId - Institute UUID
 * @param paperId - Paper UUID
 * @param fileType - Type of paper file ('question_paper' | 'solution_sheet')
 * @returns Storage path string
 *
 * @example
 * generatePaperPath('abc-123', 'paper-456', 'question_paper')
 * // => 'institute_abc-123/papers/paper-456/question_paper.pdf'
 */
export function generatePaperPath(
  instituteId: string,
  paperId: string,
  fileType: 'question_paper' | 'solution_sheet'
): string {
  return `institute_${instituteId}/papers/${paperId}/${fileType}.pdf`
}

/**
 * Generate storage path for diagram files
 *
 * @param instituteId - Institute UUID
 * @param questionId - Question UUID
 * @param diagramType - Type of diagram (e.g., 'circuit', 'molecular')
 * @param extension - File extension (default: 'svg')
 * @returns Storage path string
 *
 * @example
 * generateDiagramPath('abc-123', 'q-456', 'circuit', 'svg')
 * // => 'institute_abc-123/diagrams/q-456/circuit.svg'
 */
export function generateDiagramPath(
  instituteId: string,
  questionId: string,
  diagramType: string,
  extension: string = 'svg'
): string {
  return `institute_${instituteId}/diagrams/${questionId}/${diagramType}.${extension}`
}

/**
 * Generate temp storage path for temporary uploads
 *
 * @param userId - User UUID
 * @param filename - Original filename
 * @returns Storage path string with timestamp
 *
 * @example
 * generateTempPath('user-123', 'temp.pdf')
 * // => 'temp_user-123/1702901234567/temp.pdf'
 */
export function generateTempPath(userId: string, filename: string): string {
  const timestamp = Date.now()
  return `temp_${userId}/${timestamp}/${filename}`
}

/**
 * Upload file to Supabase Storage
 *
 * @param bucket - Storage bucket name
 * @param path - Full storage path (use generate functions above)
 * @param file - File or Blob to upload
 * @param contentType - MIME type (optional, auto-detected from file)
 * @returns Object with url or error
 *
 * @example
 * const result = await uploadFile(STORAGE_BUCKETS.MATERIALS, path, file)
 * if (result.error) console.error(result.error)
 * else console.log('Uploaded:', result.url)
 */
export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File | Blob,
  contentType?: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    console.log(`[STORAGE_UPLOAD] bucket=${bucket} path=${path} size=${file.size}`)

    // Upload file to storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        upsert: false,
        contentType: contentType || (file as File).type,
        cacheControl: '3600'
      })

    if (error) {
      console.error(`[STORAGE_UPLOAD_ERROR] ${error.message}`, error)
      return { url: null, error: error.message }
    }

    console.log(`[STORAGE_UPLOAD_SUCCESS] path=${data.path}`)

    // Get public URL (or signed URL if bucket is private)
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path)

    return { url: urlData.publicUrl, error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown upload error'
    console.error(`[STORAGE_UPLOAD_EXCEPTION]`, err)
    return { url: null, error: errorMessage }
  }
}

/**
 * Get signed URL for private file access
 *
 * @param bucket - Storage bucket name
 * @param path - Full storage path
 * @param expiresIn - URL expiration in seconds (default: 1 hour)
 * @returns Object with signed url or error
 *
 * @example
 * const result = await getSignedUrl(STORAGE_BUCKETS.MATERIALS, path, 3600)
 * if (result.url) window.open(result.url)
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600
): Promise<{ url: string | null; error: string | null }> {
  try {
    console.log(`[STORAGE_SIGNED_URL] bucket=${bucket} path=${path} expiresIn=${expiresIn}`)

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error(`[STORAGE_SIGNED_URL_ERROR] ${error.message}`, error)
      return { url: null, error: error.message }
    }

    return { url: data.signedUrl, error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[STORAGE_SIGNED_URL_EXCEPTION]`, err)
    return { url: null, error: errorMessage }
  }
}

/**
 * Delete file from Supabase Storage
 *
 * @param bucket - Storage bucket name
 * @param path - Full storage path
 * @returns Object with success boolean and error
 *
 * @example
 * const result = await deleteFile(STORAGE_BUCKETS.MATERIALS, path)
 * if (!result.success) console.error(result.error)
 */
export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log(`[STORAGE_DELETE] bucket=${bucket} path=${path}`)

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error(`[STORAGE_DELETE_ERROR] ${error.message}`, error)
      return { success: false, error: error.message }
    }

    console.log(`[STORAGE_DELETE_SUCCESS] path=${path}`)
    return { success: true, error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown delete error'
    console.error(`[STORAGE_DELETE_EXCEPTION]`, err)
    return { success: false, error: errorMessage }
  }
}

/**
 * Delete multiple files from Supabase Storage
 *
 * @param bucket - Storage bucket name
 * @param paths - Array of storage paths
 * @returns Object with success boolean and error
 *
 * @example
 * const result = await deleteFiles(STORAGE_BUCKETS.MATERIALS, [path1, path2])
 * if (!result.success) console.error(result.error)
 */
export async function deleteFiles(
  bucket: StorageBucket,
  paths: string[]
): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log(`[STORAGE_DELETE_BATCH] bucket=${bucket} count=${paths.length}`)

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove(paths)

    if (error) {
      console.error(`[STORAGE_DELETE_BATCH_ERROR] ${error.message}`, error)
      return { success: false, error: error.message }
    }

    console.log(`[STORAGE_DELETE_BATCH_SUCCESS] deleted=${paths.length}`)
    return { success: true, error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown delete error'
    console.error(`[STORAGE_DELETE_BATCH_EXCEPTION]`, err)
    return { success: false, error: errorMessage }
  }
}

/**
 * Extract file path from Supabase Storage URL
 *
 * @param url - Full Supabase storage URL
 * @returns File path or null if invalid URL
 *
 * @example
 * extractPathFromUrl('https://xyz.supabase.co/storage/v1/object/public/materials_bucket/institute_123/...')
 * // => 'institute_123/...'
 */
export function extractPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(/\/object\/public\/[^/]+\/(.+)/)
    return pathMatch ? pathMatch[1] : null
  } catch {
    return null
  }
}

/**
 * Validate file type against allowed MIME types
 *
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types or extensions
 * @returns true if valid, false otherwise
 *
 * @example
 * validateFileType(file, ['application/pdf', 'image/png'])
 * // => true if file is PDF or PNG
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()

  return allowedTypes.some(type => {
    if (type.startsWith('.')) {
      // Extension-based validation
      return fileName.endsWith(type.toLowerCase())
    } else {
      // MIME type validation
      return fileType === type.toLowerCase() || fileType.startsWith(type.toLowerCase())
    }
  })
}

/**
 * Format file size for display
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., '1.5 MB')
 *
 * @example
 * formatFileSize(1536000) // => '1.5 MB'
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
