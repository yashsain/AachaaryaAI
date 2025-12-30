/**
 * GET /api/paper-templates/[id]/papers
 *
 * Lists all papers created from a specific template
 * Used by Papers List Screen to show papers with section status
 *
 * Query Parameters:
 * - status: Optional filter by paper status
 * - class_id: Optional filter by class
 * - search: Optional search by title
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface GetPapersParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: GetPapersParams
) {
  try {
    const templateId = (await params).id
    const { searchParams } = new URL(request.url)

    // Optional filters
    const statusFilter = searchParams.get('status') as 'draft' | 'review' | 'finalized' | null
    const classIdFilter = searchParams.get('class_id')
    const searchQuery = searchParams.get('search')

    // Validate authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
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

    // Fetch teacher profile to verify authentication and get institute
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

    console.log(`[GET_TEMPLATE_PAPERS] template_id=${templateId} teacher_id=${teacher.id} institute_id=${teacher.institute_id}`)

    // Build query for test papers
    let query = supabase
      .from('test_papers')
      .select(`
        id,
        title,
        created_at,
        status,
        difficulty_level,
        paper_template_id,
        institute_id
      `)
      .eq('paper_template_id', templateId)
      .eq('institute_id', teacher.institute_id)
      .order('created_at', { ascending: false })

    // Apply status filter
    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    // Apply search filter
    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`)
    }

    const { data: papers, error: papersError } = await query

    if (papersError) {
      console.error('[GET_TEMPLATE_PAPERS_ERROR]', papersError)
      return NextResponse.json(
        { error: 'Failed to fetch papers' },
        { status: 500 }
      )
    }

    if (!papers || papers.length === 0) {
      return NextResponse.json({
        papers: []
      })
    }

    // Fetch all paper IDs for subsequent queries
    const paperIds = papers.map(p => p.id)

    // Fetch sections for all papers
    const { data: sections, error: sectionsError } = await supabase
      .from('test_paper_sections')
      .select(`
        id,
        paper_id,
        section_name,
        section_order,
        status,
        question_count
      `)
      .in('paper_id', paperIds)
      .order('section_order', { ascending: true })

    if (sectionsError) {
      console.error('[GET_TEMPLATE_PAPERS_ERROR] Sections fetch failed:', sectionsError)
      return NextResponse.json(
        { error: 'Failed to fetch paper sections' },
        { status: 500 }
      )
    }

    // Count chapters per section
    const { data: sectionChapterCounts, error: chapterCountError } = await supabase
      .from('section_chapters')
      .select('section_id')
      .in('section_id', sections?.map(s => s.id) || [])

    const chapterCountMap = new Map<string, number>()
    if (!chapterCountError && sectionChapterCounts) {
      sectionChapterCounts.forEach(sc => {
        chapterCountMap.set(sc.section_id, (chapterCountMap.get(sc.section_id) || 0) + 1)
      })
    }

    // Fetch classes for all papers
    const { data: paperClasses, error: paperClassesError } = await supabase
      .from('paper_classes')
      .select(`
        paper_id,
        classes (
          id,
          batch_name,
          medium,
          class_levels (
            name
          )
        )
      `)
      .in('paper_id', paperIds)

    if (paperClassesError) {
      console.error('[GET_TEMPLATE_PAPERS_ERROR] Classes fetch failed:', paperClassesError)
    }

    // Group classes by paper_id
    const classesMap = new Map<string, any[]>()
    if (paperClasses) {
      paperClasses.forEach(pc => {
        if (!classesMap.has(pc.paper_id)) {
          classesMap.set(pc.paper_id, [])
        }
        classesMap.get(pc.paper_id)!.push(pc.classes)
      })
    }

    // Group sections by paper_id
    const sectionsMap = new Map<string, any[]>()
    if (sections) {
      sections.forEach(section => {
        if (!sectionsMap.has(section.paper_id)) {
          sectionsMap.set(section.paper_id, [])
        }
        sectionsMap.get(section.paper_id)!.push({
          id: section.id,
          section_name: section.section_name,
          section_order: section.section_order,
          status: section.status,
          chapter_count: chapterCountMap.get(section.id) || 0,
          question_count: section.question_count || 0,
        })
      })
    }

    // Build response
    const papersWithDetails = papers.map(paper => ({
      id: paper.id,
      title: paper.title,
      created_at: paper.created_at,
      status: paper.status,
      difficulty_level: paper.difficulty_level,
      classes: classesMap.get(paper.id) || [],
      sections: sectionsMap.get(paper.id) || [],
    }))

    // Apply class filter if provided
    let filteredPapers = papersWithDetails
    if (classIdFilter) {
      filteredPapers = papersWithDetails.filter(paper =>
        paper.classes.some((cls: any) => cls.id === classIdFilter)
      )
    }

    console.log(`[GET_TEMPLATE_PAPERS_SUCCESS] Found ${filteredPapers.length} papers for template ${templateId}`)

    return NextResponse.json({
      papers: filteredPapers
    })

  } catch (error) {
    console.error('[GET_TEMPLATE_PAPERS_EXCEPTION]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
