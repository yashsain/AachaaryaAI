/**
 * GET /api/test-papers
 *
 * List all test papers for a subject with filtering and sorting
 * Used by Papers Management Interface
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subject_id = searchParams.get('subject_id')
    const status = searchParams.get('status') // 'draft' | 'review' | 'finalized' | 'all'
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'recent' // 'recent' | 'oldest' | 'title'

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

    console.log('[LIST_PAPERS] teacher_id:', teacher.id, 'subject_id:', subject_id, 'status:', status, 'search:', search, 'sort:', sort)

    // Build query
    let query = supabase
      .from('test_papers')
      .select(`
        id,
        title,
        status,
        question_count,
        difficulty_level,
        created_at,
        finalized_at,
        pdf_url,
        subject_id,
        subjects (
          id,
          name
        )
      `)
      .eq('institute_id', teacher.institute_id)

    // Filter by subject if provided
    if (subject_id) {
      query = query.eq('subject_id', subject_id)
    }

    // Filter by status if not 'all'
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Filter by title search
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    // Apply sorting
    if (sort === 'recent') {
      query = query.order('created_at', { ascending: false })
    } else if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true })
    } else if (sort === 'title') {
      query = query.order('title', { ascending: true })
    }

    const { data: papers, error: papersError } = await query

    if (papersError) {
      console.error('[LIST_PAPERS_ERROR]', papersError)
      return NextResponse.json({ error: 'Failed to fetch papers' }, { status: 500 })
    }

    console.log('[LIST_PAPERS] Found', papers?.length || 0, 'papers')

    // For each paper, fetch question statistics
    const papersWithStats = await Promise.all(
      (papers || []).map(async (paper: any) => {
        // Count total questions
        const { count: total_generated } = await supabase
          .from('questions')
          .select('id', { count: 'exact', head: true })
          .eq('paper_id', paper.id)

        // Count selected questions
        const { count: selected_count } = await supabase
          .from('questions')
          .select('id', { count: 'exact', head: true })
          .eq('paper_id', paper.id)
          .eq('is_selected', true)

        // Get last modified timestamp (latest question update or paper creation)
        const { data: lastQuestion } = await supabase
          .from('questions')
          .select('created_at')
          .eq('paper_id', paper.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        const last_modified = lastQuestion?.created_at || paper.created_at

        return {
          id: paper.id,
          title: paper.title,
          status: paper.status,
          question_count: paper.question_count,
          difficulty_level: paper.difficulty_level,
          created_at: paper.created_at,
          finalized_at: paper.finalized_at,
          pdf_url: paper.pdf_url,
          subject_id: paper.subject_id,
          subject_name: paper.subjects?.name || 'Unknown Subject',
          // Computed fields
          selected_count: selected_count || 0,
          total_generated: total_generated || 0,
          last_modified,
        }
      })
    )

    return NextResponse.json({
      success: true,
      papers: papersWithStats,
    })
  } catch (error) {
    console.error('[LIST_PAPERS_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
