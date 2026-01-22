/**
 * POST /api/test-papers/[id]/force-clear-pdfs
 *
 * Force clear PDF URLs for papers stuck in inconsistent state
 * (status is 'review' but pdf_url/answer_key_url are still set)
 *
 * This is a one-time fix for the RLS bug where updates didn't clear the URLs
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { deletePaperPDFs } from '@/lib/storage/pdfCleanupService'

interface ForceClearParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: ForceClearParams
) {
  try {
    const paperId = (await params).id

    console.log('[FORCE_CLEAR_PDFS] Forcing PDF cleanup for paper:', paperId)

    // Validate authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Create Supabase client with user token for auth verification
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    // Fetch teacher profile
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('id, institute_id, role')
      .eq('email', user.email)
      .single()

    if (teacherError || !teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Verify paper belongs to teacher's institute using admin client
    const { data: paper, error: paperError } = await supabaseAdmin
      .from('test_papers')
      .select('id, title, status, institute_id, pdf_url, answer_key_url')
      .eq('id', paperId)
      .single()

    if (paperError || !paper) {
      console.error('[FORCE_CLEAR_PDFS] Paper fetch error:', paperError)
      return NextResponse.json({ error: 'Test paper not found' }, { status: 404 })
    }

    if (paper.institute_id !== teacher.institute_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    console.log('[FORCE_CLEAR_PDFS] Paper found:', paper.title)
    console.log('[FORCE_CLEAR_PDFS] Current state:', {
      status: paper.status,
      pdf_url: paper.pdf_url,
      answer_key_url: paper.answer_key_url
    })

    // Delete PDFs from storage
    const cleanupResult = await deletePaperPDFs(paper.pdf_url, paper.answer_key_url)
    if (!cleanupResult.success) {
      console.warn('[FORCE_CLEAR_PDFS] PDF cleanup had errors:', cleanupResult.errors)
      // Continue anyway
    }

    // Force clear PDF URLs using admin client
    const { error: updateError } = await supabaseAdmin
      .from('test_papers')
      .update({
        pdf_url: null,
        answer_key_url: null,
      })
      .eq('id', paperId)

    if (updateError) {
      console.error('[FORCE_CLEAR_PDFS] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to clear PDF URLs' }, { status: 500 })
    }

    console.log('[FORCE_CLEAR_PDFS] PDF URLs successfully cleared')

    return NextResponse.json({
      success: true,
      message: 'PDF URLs cleared successfully',
      paper_id: paperId,
      status: paper.status,
      deleted_from_storage: {
        question_paper: cleanupResult.deleted_question_paper,
        answer_key: cleanupResult.deleted_answer_key
      }
    })

  } catch (error) {
    console.error('[FORCE_CLEAR_PDFS_ERROR]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
