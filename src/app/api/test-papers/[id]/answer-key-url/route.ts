/**
 * GET /api/test-papers/[id]/answer-key-url
 *
 * Generate signed URL for Answer Key PDF viewing
 * Verifies institute access before generating URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { STORAGE_BUCKETS } from '@/lib/storage/storageService'

interface AnswerKeyUrlParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: AnswerKeyUrlParams
) {
  try {
    const paperId = (await params).id

    console.log('[ANSWER_KEY_URL] Generating signed URL for paper:', paperId)

    const supabase = createServerClient(await cookies())
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .select('id, institute_id, role')
      .eq('id', user.id)
      .is('deleted_at', null)
      .single()

    if (teacherError || !teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    console.log('[ANSWER_KEY_URL] Teacher:', teacher.id, 'Institute:', teacher.institute_id)

    // Fetch paper details and verify access
    const { data: paper, error: paperError } = await supabaseAdmin
      .from('test_papers')
      .select('id, title, answer_key_url, institute_id')
      .eq('id', paperId)
      .eq('institute_id', teacher.institute_id)
      .single()

    if (paperError || !paper) {
      console.error('[ANSWER_KEY_URL] Paper fetch error:', paperError)
      return NextResponse.json({ error: 'Test paper not found or access denied' }, { status: 404 })
    }

    if (!paper.answer_key_url) {
      return NextResponse.json({ error: 'Answer key not generated yet' }, { status: 404 })
    }

    // Extract storage path from answer_key_url
    // answer_key_url can be either a full URL or just a path
    let storagePath: string

    if (paper.answer_key_url.startsWith('http://') || paper.answer_key_url.startsWith('https://')) {
      // Parse URL to extract path
      const urlObj = new URL(paper.answer_key_url)
      const pathSegments = urlObj.pathname.split('/').filter(Boolean)

      const publicIndex = pathSegments.indexOf('public')
      if (publicIndex === -1 || publicIndex + 2 >= pathSegments.length) {
        console.error('[ANSWER_KEY_URL] Invalid URL format:', paper.answer_key_url)
        return NextResponse.json({ error: 'Invalid answer key URL format' }, { status: 500 })
      }

      // Skip 'public' and bucket name, get the rest
      storagePath = pathSegments.slice(publicIndex + 2).join('/')
    } else {
      // Already a path
      storagePath = paper.answer_key_url
    }

    console.log('[ANSWER_KEY_URL] Storage path:', storagePath)

    // Generate signed URL (valid for 1 hour)
    const { data: signedUrlData, error: signedError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.PAPERS)
      .createSignedUrl(storagePath, 3600) // 1 hour expiration

    if (signedError || !signedUrlData) {
      console.error('[ANSWER_KEY_URL] Signed URL error:', signedError)
      return NextResponse.json({ error: 'Failed to generate answer key URL' }, { status: 500 })
    }

    console.log('[ANSWER_KEY_URL] Signed URL generated successfully')

    return NextResponse.json({
      success: true,
      answer_key_url: signedUrlData.signedUrl,
      expires_in: 3600,
    })

  } catch (error) {
    console.error('[ANSWER_KEY_URL_ERROR]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
