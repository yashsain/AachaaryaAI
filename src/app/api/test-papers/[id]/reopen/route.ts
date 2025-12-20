/**
 * POST /api/test-papers/[id]/reopen
 *
 * Reopens a finalized paper for editing
 * Changes status from 'finalized' back to 'review'
 * Clears finalized_at timestamp
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface ReopenPaperParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: ReopenPaperParams
) {
  try {
    const paperId = (await params).id

    console.log('[REOPEN_PAPER] Reopening paper for editing:', paperId)

    // Validate authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Create Supabase client with user token
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

    console.log('[REOPEN_PAPER] Teacher:', teacher.id, 'Institute:', teacher.institute_id)

    // Verify paper belongs to teacher's institute and is finalized
    const { data: paper, error: paperError } = await supabase
      .from('test_papers')
      .select('id, title, status, institute_id')
      .eq('id', paperId)
      .eq('institute_id', teacher.institute_id)
      .single()

    if (paperError || !paper) {
      console.error('[REOPEN_PAPER] Paper fetch error:', paperError)
      return NextResponse.json({ error: 'Test paper not found or access denied' }, { status: 404 })
    }

    if (paper.status !== 'finalized') {
      return NextResponse.json({ error: 'Paper is not finalized. Only finalized papers can be reopened.' }, { status: 400 })
    }

    console.log('[REOPEN_PAPER] Paper found:', paper.title, 'Current status:', paper.status)

    // Reopen paper: change status to review and clear finalized_at
    const { error: updateError } = await supabase
      .from('test_papers')
      .update({
        status: 'review',
        finalized_at: null,
      })
      .eq('id', paperId)

    if (updateError) {
      console.error('[REOPEN_PAPER] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to reopen paper' }, { status: 500 })
    }

    console.log('[REOPEN_PAPER] Paper successfully reopened for editing')

    return NextResponse.json({
      success: true,
      message: 'Paper reopened for editing',
      paper_id: paperId,
      new_status: 'review',
    })

  } catch (error) {
    console.error('[REOPEN_PAPER_ERROR]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
