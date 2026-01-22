/**
 * GET /api/test-papers/[id]/debug-state
 *
 * Debug endpoint to check actual database state
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface DebugStateParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: DebugStateParams
) {
  try {
    const paperId = (await params).id

    const { data: paper, error } = await supabaseAdmin
      .from('test_papers')
      .select('id, title, status, pdf_url, answer_key_url, finalized_at')
      .eq('id', paperId)
      .single()

    if (error || !paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    return NextResponse.json({
      paper_id: paper.id,
      title: paper.title,
      status: paper.status,
      pdf_url: paper.pdf_url,
      answer_key_url: paper.answer_key_url,
      finalized_at: paper.finalized_at,
      pdf_url_is_null: paper.pdf_url === null,
      answer_key_url_is_null: paper.answer_key_url === null,
    })
  } catch (error) {
    console.error('[DEBUG_STATE_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
