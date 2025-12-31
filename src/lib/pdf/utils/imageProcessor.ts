/**
 * Image Processing Utility
 * Converts institute logos to base64 data URIs for PDF embedding
 * Phase 6: PDF Generation
 */

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

/**
 * Fetches and converts an image to base64 data URI
 * @param imageUrl - URL to the image (can be Supabase storage URL or external)
 * @returns Base64 data URI string or null if conversion fails
 */
export async function convertImageToBase64(imageUrl: string): Promise<string | null> {
  try {
    console.log('[IMAGE_PROCESSOR] Converting image:', imageUrl)

    // Fetch image from URL
    const response = await fetch(imageUrl)
    if (!response.ok) {
      console.error('[IMAGE_PROCESSOR] Failed to fetch image:', response.statusText)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Convert to PNG with Sharp (standardize format)
    const pngBuffer = await sharp(buffer)
      .resize(200, 200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png()
      .toBuffer()

    // Convert to base64 data URI
    const base64String = pngBuffer.toString('base64')
    const dataUri = `data:image/png;base64,${base64String}`

    console.log('[IMAGE_PROCESSOR] Image converted successfully, size:', dataUri.length, 'bytes')

    return dataUri
  } catch (error) {
    console.error('[IMAGE_PROCESSOR] Error converting image:', error)
    return null
  }
}

/**
 * Converts local file to base64 data URI
 * @param filePath - Absolute path to the local image file
 * @returns Base64 data URI string or null if conversion fails
 */
export async function convertLocalImageToBase64(filePath: string): Promise<string | null> {
  try {
    console.log('[IMAGE_PROCESSOR] Converting local image:', filePath)

    // Read file from filesystem
    const buffer = fs.readFileSync(filePath)

    // Convert to PNG with Sharp (standardize format)
    const pngBuffer = await sharp(buffer)
      .resize(200, 200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png()
      .toBuffer()

    // Convert to base64 data URI
    const base64String = pngBuffer.toString('base64')
    const dataUri = `data:image/png;base64,${base64String}`

    console.log('[IMAGE_PROCESSOR] Local image converted successfully')
    return dataUri
  } catch (error) {
    console.error('[IMAGE_PROCESSOR] Error converting local image:', error)
    return null
  }
}

/**
 * Gets the default logo from /public/logo.png
 * @returns Base64 data URI or null
 */
export async function getDefaultLogo(): Promise<string | null> {
  const defaultLogoPath = path.join(process.cwd(), 'public', 'logo.png')
  console.log('[IMAGE_PROCESSOR] Using default logo from:', defaultLogoPath)
  return await convertLocalImageToBase64(defaultLogoPath)
}

/**
 * Gets the logo for an institute from Supabase storage or returns default
 * @param logoUrl - Logo URL from institute record (can be relative or absolute)
 * @param supabaseStorageUrl - Base URL for Supabase storage
 * @returns Base64 data URI or null
 */
export async function getInstituteLogo(
  logoUrl: string | null,
  supabaseStorageUrl?: string
): Promise<string | null> {
  if (!logoUrl) {
    console.log('[IMAGE_PROCESSOR] No logo URL provided')
    return null
  }

  try {
    // If logoUrl is relative (e.g., /logo.png), construct full URL
    let fullUrl = logoUrl
    if (logoUrl.startsWith('/') && supabaseStorageUrl) {
      fullUrl = `${supabaseStorageUrl}${logoUrl}`
    }

    // If it's already a full URL (https://...), use it directly
    return await convertImageToBase64(fullUrl)
  } catch (error) {
    console.error('[IMAGE_PROCESSOR] Error getting institute logo:', error)
    return null
  }
}
