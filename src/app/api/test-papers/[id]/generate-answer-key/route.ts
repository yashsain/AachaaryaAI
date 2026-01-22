/**
 * POST /api/test-papers/[id]/generate-answer-key
 *
 * Generates an Answer Key PDF for the test paper and uploads to Supabase Storage
 * Shows questions with correct answers highlighted and explanations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateTestCode, formatDate } from '@/lib/pdf/utils/pdfGenerator'
import { getInstituteLogo, getDefaultLogo } from '@/lib/pdf/utils/imageProcessor'
import { generatePaperPath, STORAGE_BUCKETS } from '@/lib/storage/storageService'
import { generateAnswerKeyHTML, AnswerKeyConfig } from '@/lib/pdf/templates/answerKeyTemplate'
import { generatePDFFromHTML } from '@/lib/pdf/utils/puppeteerGenerator'

// Allow up to 60 seconds for PDF generation
export const maxDuration = 60

interface GenerateAnswerKeyParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: GenerateAnswerKeyParams
) {
  try {
    const paperId = (await params).id

    console.log('[GENERATE_ANSWER_KEY] Starting answer key generation for paper:', paperId)

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

    // Create service role client for storage operations (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    console.log('[GENERATE_ANSWER_KEY] Teacher:', teacher.id, 'Institute:', teacher.institute_id)

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
        stream_id,
        subjects (
          id,
          name
        ),
        streams (
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
      console.error('[GENERATE_ANSWER_KEY] Paper fetch error:', paperError)
      return NextResponse.json({ error: 'Test paper not found or access denied' }, { status: 404 })
    }

    console.log('[GENERATE_ANSWER_KEY] Paper found:', paper.title, 'Status:', paper.status)

    // Fetch selected questions with answers and explanations
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
        section_id,
        test_paper_sections (
          id,
          section_name,
          section_order,
          subject_id,
          subjects (
            id,
            name
          )
        )
      `)
      .eq('paper_id', paperId)
      .eq('is_selected', true)
      .order('question_order', { ascending: true })

    if (questionsError) {
      console.error('[GENERATE_ANSWER_KEY] Questions fetch error:', questionsError)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'No questions selected for this paper. Please select questions first.' }, { status: 400 })
    }

    console.log('[GENERATE_ANSWER_KEY] Found', questions.length, 'selected questions')

    // Extract institute details
    const institute = paper.institutes as any
    const subject = paper.subjects as any
    const stream = paper.streams as any

    // Generate test code
    const testCode = generateTestCode(stream.name, subject.name, new Date(paper.created_at))

    // Get institute logo (with fallback to default)
    let instituteLogo: string | null = null
    if (institute.logo_url) {
      console.log('[GENERATE_ANSWER_KEY] Processing logo from:', institute.logo_url)

      // If logo is in Supabase storage, generate a signed URL first
      if (institute.logo_url.includes('supabase') || !institute.logo_url.startsWith('http')) {
        try {
          // Extract bucket and path if it's a storage path
          const logoPath = institute.logo_url.replace(/^\/storage\/v1\/object\/public\//, '')
          const [bucket, ...pathParts] = logoPath.split('/')
          const filePath = pathParts.join('/')

          console.log('[GENERATE_ANSWER_KEY] Creating signed URL for:', bucket, filePath)

          const { data: signedData, error: signedError } = await supabaseAdmin.storage
            .from(bucket || 'logos')
            .createSignedUrl(filePath || institute.logo_url, 3600) // 1 hour expiry

          if (!signedError && signedData?.signedUrl) {
            console.log('[GENERATE_ANSWER_KEY] Signed URL created, converting to base64')
            instituteLogo = await getInstituteLogo(signedData.signedUrl)
          } else {
            console.error('[GENERATE_ANSWER_KEY] Signed URL error:', signedError)
            instituteLogo = await getInstituteLogo(institute.logo_url, process.env.NEXT_PUBLIC_SUPABASE_URL)
          }
        } catch (error) {
          console.error('[GENERATE_ANSWER_KEY] Logo processing error:', error)
          instituteLogo = null
        }
      } else {
        // External URL, use directly
        instituteLogo = await getInstituteLogo(institute.logo_url)
      }

      console.log('[GENERATE_ANSWER_KEY] Institute logo processed:', instituteLogo ? 'Success' : 'Failed')
    }

    // Allow PDF generation without logo (logo is optional)
    if (!instituteLogo) {
      console.log('[GENERATE_ANSWER_KEY] Using default logo')
      instituteLogo = await getDefaultLogo()
    }

    // Check if paper has multiple sections
    const hasSections = questions.some((q: any) => q.section_id !== null)

    // Group questions by section if multi-section
    let sections: any[] = []
    if (hasSections) {
      // Get unique sections
      const sectionMap = new Map()
      questions.forEach((q: any) => {
        if (q.section_id && q.test_paper_sections) {
          if (!sectionMap.has(q.section_id)) {
            sectionMap.set(q.section_id, {
              section_id: q.section_id,
              section_name: q.test_paper_sections.section_name,
              section_order: q.test_paper_sections.section_order,
              subject_name: q.test_paper_sections.subjects?.name || null,
              questions: []
            })
          }
        }
      })

      // Group questions into sections
      questions.forEach((q: any, idx: number) => {
        const questionData = q.question_data || {}

        const answerKeyQuestion = {
          question_number: idx + 1,
          question_text: q.question_text,
          question_text_en: questionData.questionText_en || null,
          options: questionData.options || {},
          options_en: questionData.options_en || null,
          correct_answer: questionData.correctAnswer || questionData.correct_answer || '',
          explanation: q.explanation || questionData.explanation || null,
          explanation_en: questionData.explanation_en || null,
          marks: q.marks || 1,
          is_bilingual: questionData.language === 'bilingual'
        }

        if (q.section_id && sectionMap.has(q.section_id)) {
          sectionMap.get(q.section_id).questions.push(answerKeyQuestion)
        }
      })

      // Convert map to array and sort by section order
      sections = Array.from(sectionMap.values()).sort((a, b) => a.section_order - b.section_order)
    }

    // Prepare answer key config
    const answerKeyConfig: AnswerKeyConfig = {
      instituteLogo: instituteLogo || undefined,
      instituteName: institute.name,
      primaryColor: institute.primary_color || '#8B1A1A',
      tagline: institute.tagline || undefined,
      contactInfo: {
        phone: institute.phone || undefined,
        email: institute.email || undefined,
        address: institute.address || undefined
      },
      testTitle: paper.title,
      testCode,
      date: formatDate(paper.finalized_at || paper.created_at),
      examType: stream.name,
      hasSections,
      sections: hasSections ? sections : undefined,
      questions: !hasSections ? questions.map((q: any, idx: number) => {
        const questionData = q.question_data || {}
        return {
          question_number: idx + 1,
          question_text: q.question_text,
          question_text_en: questionData.questionText_en || null,
          options: questionData.options || {},
          options_en: questionData.options_en || null,
          correct_answer: questionData.correctAnswer || questionData.correct_answer || '',
          explanation: q.explanation || questionData.explanation || null,
          explanation_en: questionData.explanation_en || null,
          marks: q.marks || 1,
          is_bilingual: questionData.language === 'bilingual'
        }
      }) : undefined
    }

    console.log('[GENERATE_ANSWER_KEY] Generating HTML...')

    // Generate HTML for answer key
    const htmlContent = generateAnswerKeyHTML(answerKeyConfig)

    console.log('[GENERATE_ANSWER_KEY] HTML generated, creating PDF with Puppeteer...')

    // Generate PDF from HTML using Puppeteer
    const pdfBuffer = await generatePDFFromHTML(htmlContent, {
      format: 'A4',
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      }
    })

    console.log('[GENERATE_ANSWER_KEY] PDF generated. Size:', pdfBuffer.length, 'bytes')

    // Generate storage path using helper function (institute isolation)
    const fileName = generatePaperPath(institute.id, paperId, 'answer_key')
    console.log('[GENERATE_ANSWER_KEY] Storage path:', fileName)

    // Upload with upsert=true to replace existing PDF on re-finalization
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from(STORAGE_BUCKETS.PAPERS)
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,  // Replace if exists
      })

    if (uploadError) {
      console.error('[GENERATE_ANSWER_KEY] Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload answer key PDF to storage' }, { status: 500 })
    }

    console.log('[GENERATE_ANSWER_KEY] PDF uploaded to storage:', uploadData.path)

    // Store storage path (not public URL)
    const answerKeyUrl = fileName

    // Update test paper with answer key storage path
    const { error: updateError } = await supabase
      .from('test_papers')
      .update({ answer_key_url: answerKeyUrl })
      .eq('id', paperId)

    if (updateError) {
      console.error('[GENERATE_ANSWER_KEY] Update paper error:', updateError)
      return NextResponse.json({ error: 'Failed to update paper with answer key URL' }, { status: 500 })
    }

    console.log('[GENERATE_ANSWER_KEY] Answer key generation complete:', answerKeyUrl)

    return NextResponse.json({
      success: true,
      answer_key_url: answerKeyUrl,
      file_name: fileName,
      size: pdfBuffer.length,
      questions_count: questions.length,
      test_code: testCode,
    })

  } catch (error) {
    console.error('[GENERATE_ANSWER_KEY_ERROR]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
