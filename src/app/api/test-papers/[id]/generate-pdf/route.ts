/**
 * POST /api/test-papers/[id]/generate-pdf
 *
 * Generates a PDF for the test paper and uploads to Supabase Storage
 * Phase 6: PDF Generation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generatePDF, streamToBuffer, generateTestCode, formatDate, formatDuration } from '@/lib/pdf/utils/pdfGenerator'
import { getInstituteLogo } from '@/lib/pdf/utils/imageProcessor'
import { TemplateConfig, QuestionForPDF } from '@/lib/pdf/types'
import { generatePaperPath, STORAGE_BUCKETS } from '@/lib/storage/storageService'

interface GeneratePDFParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: GeneratePDFParams
) {
  try {
    const paperId = (await params).id

    console.log('[GENERATE_PDF] Starting PDF generation for paper:', paperId)

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

    console.log('[GENERATE_PDF] Teacher:', teacher.id, 'Institute:', teacher.institute_id)

    // Fetch test paper with institute and subject details
    const { data: paper, error: paperError } = await supabase
      .from('test_papers')
      .select(`
        id,
        title,
        question_count,
        difficulty_level,
        status,
        created_at,
        finalized_at,
        institute_id,
        subject_id,
        subjects (
          id,
          name
        ),
        institutes (
          id,
          name,
          code,
          city,
          email,
          phone,
          address,
          logo_url,
          primary_color,
          tagline
        )
      `)
      .eq('id', paperId)
      .eq('institute_id', teacher.institute_id)
      .single()

    if (paperError || !paper) {
      console.error('[GENERATE_PDF] Paper fetch error:', paperError)
      return NextResponse.json({ error: 'Test paper not found or access denied' }, { status: 404 })
    }

    console.log('[GENERATE_PDF] Paper found:', paper.title, 'Status:', paper.status)

    // Check if paper has selected questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        question_data,
        explanation,
        marks,
        negative_marks,
        question_order,
        is_selected,
        chapter_id,
        chapters (
          id,
          name
        )
      `)
      .eq('paper_id', paperId)
      .eq('is_selected', true)
      .order('question_order', { ascending: true })

    if (questionsError) {
      console.error('[GENERATE_PDF] Questions fetch error:', questionsError)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'No questions selected for this paper. Please select questions first.' }, { status: 400 })
    }

    console.log('[GENERATE_PDF] Found', questions.length, 'selected questions')

    // Parse questions for PDF
    const questionsForPDF: QuestionForPDF[] = questions.map((q: any) => ({
      id: q.id,
      question_text: q.question_text,
      options: q.question_data.options || {},
      correct_answer: q.question_data.correct_answer || q.question_data.correctAnswer,
      explanation: q.explanation,
      marks: q.marks,
      negative_marks: q.negative_marks,
      question_order: q.question_order,
      chapter_name: q.chapters?.name || 'Unknown',
      chapter_id: q.chapter_id,
    }))

    // Calculate total marks
    const maxMarks = questionsForPDF.reduce((sum, q) => sum + q.marks, 0)

    // Get unique chapter names for topics
    const topics = [...new Set(questionsForPDF.map(q => q.chapter_name))].filter(Boolean)

    // Process institute logo
    const institute = paper.institutes as any
    let instituteLogo: string | null = null
    if (institute.logo_url) {
      instituteLogo = await getInstituteLogo(
        institute.logo_url,
        process.env.NEXT_PUBLIC_SUPABASE_URL
      )
    }

    // Generate test code
    const subject = paper.subjects as any
    const testCode = generateTestCode(subject.name, new Date())

    // Build template configuration
    const config: TemplateConfig = {
      instituteLogo: instituteLogo || undefined,
      instituteName: institute.name,
      primaryColor: institute.primary_color || '#F7931E',
      tagline: institute.tagline || undefined,
      contactInfo: {
        city: institute.city || undefined,
        phone: institute.phone || undefined,
        address: institute.address || undefined,
        email: institute.email || undefined,
      },
      testTitle: paper.title,
      testCode: testCode,
      date: formatDate(paper.finalized_at || paper.created_at),
      duration: formatDuration(180), // Default 3 hours for NEET
      maxMarks: maxMarks,
      topics: topics,
      questions: questionsForPDF,
    }

    console.log('[GENERATE_PDF] Template config ready. Generating PDF...')

    // Generate PDF
    const pdfStream = await generatePDF(config)
    const pdfBuffer = await streamToBuffer(pdfStream)

    console.log('[GENERATE_PDF] PDF generated. Size:', pdfBuffer.length, 'bytes')

    // Generate storage path using helper function (institute isolation)
    const fileName = generatePaperPath(institute.id, paperId, 'question_paper')
    console.log('[GENERATE_PDF] Storage path:', fileName)

    // Create service role client for storage upload (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Upload with upsert=true to replace existing PDF on re-finalization
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from(STORAGE_BUCKETS.PAPERS)
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,  // Replace if exists (same filename every time)
      })

    if (uploadError) {
      console.error('[GENERATE_PDF] Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload PDF to storage' }, { status: 500 })
    }

    console.log('[GENERATE_PDF] PDF uploaded to storage:', uploadData.path)

    // Store storage path (not public URL) - will generate signed URLs on-demand
    // This allows the private bucket RLS policies to work correctly
    const pdfUrl = fileName

    // Update test paper with PDF storage path
    const { error: updateError } = await supabase
      .from('test_papers')
      .update({ pdf_url: pdfUrl })
      .eq('id', paperId)

    if (updateError) {
      console.error('[GENERATE_PDF] Update paper error:', updateError)
      return NextResponse.json({ error: 'Failed to update paper with PDF URL' }, { status: 500 })
    }

    console.log('[GENERATE_PDF] PDF generation complete:', pdfUrl)

    return NextResponse.json({
      success: true,
      pdf_url: pdfUrl,
      file_name: fileName,
      size: pdfBuffer.length,
      questions_count: questionsForPDF.length,
      test_code: testCode,
    })

  } catch (error) {
    console.error('[GENERATE_PDF_ERROR]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
