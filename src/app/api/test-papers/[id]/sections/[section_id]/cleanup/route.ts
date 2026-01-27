/**
 * POST /api/test-papers/:id/sections/:section_id/cleanup
 *
 * Cleanup endpoint for stuck section generations
 * Called from frontend when sections are stuck in 'generating' status > 7 minutes
 * - Deletes orphaned questions from failed attempts
 * - Resets section to 'ready' state
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'

interface CleanupParams {
  params: Promise<{
    id: string
    section_id: string
  }>
}

export async function POST(request: NextRequest, { params }: CleanupParams) {
  try {
    const { id: paperId, section_id: sectionId } = await params

    // Auth check
    const supabase = createServerClient(await cookies())
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[CLEANUP] Starting cleanup for section ${sectionId}`)

    // Get section details
    const { data: section, error: fetchError } = await supabaseAdmin
      .from('test_paper_sections')
      .select('id, section_name, generation_attempt_id, generation_started_at, last_batch_completed_at, status')
      .eq('id', sectionId)
      .single()

    if (fetchError || !section) {
      console.error('[CLEANUP_ERROR] Section not found:', fetchError)
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    // Only cleanup if section is stuck in generating
    if (section.status !== 'generating') {
      console.log(`[CLEANUP] Section ${sectionId} not in generating status, skipping`)
      return NextResponse.json({ message: 'Section not in generating status' })
    }

    // Check if it's actually stuck (> 7 minutes since last activity)
    // Use last_batch_completed_at if available (heartbeat), otherwise fall back to generation_started_at
    const sevenMinutesAgo = new Date(Date.now() - 7 * 60 * 1000).toISOString()
    const lastActivity = section.last_batch_completed_at || section.generation_started_at

    if (!lastActivity || lastActivity > sevenMinutesAgo) {
      console.log(`[CLEANUP] Section ${sectionId} had activity recently (last: ${lastActivity}), skipping`)
      return NextResponse.json({ message: 'Generation had activity recently' })
    }

    console.log(`[CLEANUP] Cleaning stuck section ${sectionId} (${section.section_name})`)

    // Delete questions from this generation attempt
    if (section.generation_attempt_id) {
      const { error: deleteError } = await supabaseAdmin
        .from('questions')
        .delete()
        .eq('generation_attempt_id', section.generation_attempt_id)

      if (deleteError) {
        console.error(`[CLEANUP_ERROR] Failed to delete questions:`, deleteError)
      } else {
        console.log(`[CLEANUP] Deleted questions for attempt ${section.generation_attempt_id}`)
      }
    }

    // Reset section to 'ready' state
    const { error: updateError } = await supabaseAdmin
      .from('test_paper_sections')
      .update({
        status: 'ready',
        generation_attempt_id: null,
        generation_started_at: null,
        last_batch_completed_at: null,
        generation_error: 'Generation timed out and was automatically cleaned up',
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId)

    if (updateError) {
      console.error(`[CLEANUP_ERROR] Failed to update section:`, updateError)
      return NextResponse.json({ error: 'Failed to cleanup section' }, { status: 500 })
    }

    console.log(`[CLEANUP_SUCCESS] Section ${sectionId} cleaned successfully`)

    return NextResponse.json({
      success: true,
      message: 'Section cleaned up successfully',
      section_id: sectionId
    })

  } catch (error) {
    console.error('[CLEANUP_EXCEPTION]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
