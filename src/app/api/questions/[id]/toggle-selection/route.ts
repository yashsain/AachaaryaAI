/**
 * POST /api/questions/[id]/toggle-selection
 *
 * Toggles the is_selected field for a question
 * If paper has PDFs, automatically reopens it and clears PDFs
 *
 * This endpoint replaces the dangerous frontend direct DB update
 * Ensures PDFs are always in sync with question selections
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { deletePaperPDFs } from '@/lib/storage/pdfCleanupService'

interface ToggleSelectionParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: ToggleSelectionParams
) {
  try {
    const questionId = (await params).id

    console.log('[TOGGLE_SELECTION] Toggling selection for question:', questionId)

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

    // Fetch question with paper details using admin client
    const { data: question, error: questionError } = await supabaseAdmin
      .from('questions')
      .select(`
        id,
        paper_id,
        is_selected,
        institute_id,
        test_papers!inner (
          id,
          title,
          status,
          pdf_url,
          answer_key_url,
          institute_id
        )
      `)
      .eq('id', questionId)
      .single()

    if (questionError || !question) {
      console.error('[TOGGLE_SELECTION] Question fetch error:', questionError)
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // Verify question belongs to teacher's institute
    if (question.institute_id !== teacher.institute_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const paper = question.test_papers as any
    const paperId = question.paper_id
    const currentSelection = question.is_selected
    const newSelection = !currentSelection

    console.log('[TOGGLE_SELECTION] Current selection:', currentSelection, '→', newSelection)

    // If paper has PDFs, clear them (selection change invalidates PDFs)
    let paperWasReopened = false
    if (paper.status === 'finalized' || paper.pdf_url || paper.answer_key_url) {
      console.log('[TOGGLE_SELECTION] Paper has PDFs (status:', paper.status, '), clearing them...')

      // Delete PDFs from storage
      const cleanupResult = await deletePaperPDFs(paper.pdf_url, paper.answer_key_url)
      if (!cleanupResult.success) {
        console.warn('[TOGGLE_SELECTION] PDF cleanup had errors:', cleanupResult.errors)
        // Continue anyway
      }

      // Clear PDFs and ensure paper is in review status
      const { error: reopenError } = await supabaseAdmin
        .from('test_papers')
        .update({
          status: 'review',
          finalized_at: null,
          pdf_url: null,
          answer_key_url: null
        })
        .eq('id', paperId)

      if (reopenError) {
        console.error('[TOGGLE_SELECTION] Failed to clear PDFs:', reopenError)
        return NextResponse.json({ error: 'Failed to clear PDFs' }, { status: 500 })
      }

      paperWasReopened = true
      console.log('[TOGGLE_SELECTION] Paper reopened and PDFs cleared')
    }

    // Toggle is_selected using admin client
    const { error: updateError } = await supabaseAdmin
      .from('questions')
      .update({ is_selected: newSelection })
      .eq('id', questionId)

    if (updateError) {
      console.error('[TOGGLE_SELECTION] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to toggle selection' }, { status: 500 })
    }

    console.log('[TOGGLE_SELECTION] Selection toggled successfully')

    return NextResponse.json({
      success: true,
      question_id: questionId,
      is_selected: newSelection,
      paper_reopened: paperWasReopened,
      message: paperWasReopened
        ? 'Selection updated. Paper reopened and PDFs cleared because content changed.'
        : 'Selection updated successfully'
    })

  } catch (error) {
    console.error('[TOGGLE_SELECTION_ERROR]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
