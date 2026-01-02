/**
 * GET /api/dashboard/stats
 *
 * Returns aggregated statistics for the dashboard
 * Shows institute-wide metrics (all teachers in the organization)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
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

    // Fetch teacher profile to get institute_id
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

    console.log('[DASHBOARD_STATS] Fetching institute-wide stats for institute:', teacher.institute_id)

    // Query 1: Count test papers (institute-wide)
    const { count: testPapersCount } = await supabase
      .from('test_papers')
      .select('*', { count: 'exact', head: true })
      .eq('institute_id', teacher.institute_id)

    console.log('[DASHBOARD_STATS] Test papers count:', testPapersCount)

    // Query 2: Count materials (institute-wide)
    const { count: materialsCount } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true })
      .eq('institute_id', teacher.institute_id)

    console.log('[DASHBOARD_STATS] Materials count:', materialsCount)

    // Query 3: Count questions (across all institute's papers)
    // First get all paper IDs for this institute
    const { data: papers } = await supabase
      .from('test_papers')
      .select('id')
      .eq('institute_id', teacher.institute_id)

    const paperIds = papers?.map(p => p.id) || []

    let questionsCount = 0
    if (paperIds.length > 0) {
      const { count } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .in('paper_id', paperIds)
      questionsCount = count || 0
    }

    console.log('[DASHBOARD_STATS] Questions count:', questionsCount)

    // Calculate time saved (institute-wide)
    // Assumptions documented:
    // - Creating 1 test paper manually: 2.5 hours
    // - Creating 1 question manually: 6 minutes (0.1 hours)
    // - Uploading/organizing 1 material: 15 minutes (0.25 hours)
    const timeSaved = Math.round(
      (testPapersCount || 0) * 2.5 +
      questionsCount * 0.1 +
      (materialsCount || 0) * 0.25
    )

    console.log('[DASHBOARD_STATS] Time saved (hours):', timeSaved)

    return NextResponse.json({
      success: true,
      stats: {
        test_papers: testPapersCount || 0,
        questions: questionsCount,
        materials: materialsCount || 0,
        time_saved_hours: timeSaved,
      },
    })
  } catch (error) {
    console.error('[DASHBOARD_STATS_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Cache results for 60 seconds to reduce database load
export const revalidate = 60
