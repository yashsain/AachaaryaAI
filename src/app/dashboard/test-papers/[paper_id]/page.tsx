/**
 * Paper Dashboard
 *
 * Central hub for managing a multi-section test paper
 * - Shows paper metadata and all sections
 * - Each section tile allows: assign chapters, generate questions, view/edit, regenerate
 * - Progress tracking across all sections
 * - Navigation to section-specific pages
 */

'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SectionTile } from '@/components/ui/SectionTile'
import { Button } from '@/components/ui/Button'

interface PaperDashboardProps {
  params: Promise<{
    paper_id: string
  }>
}

interface Section {
  id: string
  section_name: string
  section_order: number
  status: 'pending' | 'ready' | 'in_review' | 'finalized'
  chapter_count: number
  question_count: number
}

interface Paper {
  id: string
  title: string
  status: 'draft' | 'review' | 'finalized'
  difficulty_level: 'easy' | 'balanced' | 'hard'
  created_at: string
  paper_template_id: string | null
  pdf_url: string | null
  institutes: {
    name: string
  }
  paper_templates?: {
    name: string
  }
}

export default function PaperDashboardPage({ params }: PaperDashboardProps) {
  const resolvedParams = use(params)
  const paperId = resolvedParams.paper_id
  const router = useRouter()

  const [paper, setPaper] = useState<Paper | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPaperData()
  }, [paperId])

  const fetchPaperData = async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

      // Fetch paper details
      const { data: paperData, error: paperError } = await supabase
        .from('test_papers')
        .select(`
          id,
          title,
          status,
          difficulty_level,
          created_at,
          paper_template_id,
          pdf_url,
          institutes (
            name
          ),
          paper_templates (
            name
          )
        `)
        .eq('id', paperId)
        .single()

      if (paperError) {
        console.error('Error fetching paper:', paperError)
        setError('Failed to load paper')
        return
      }

      setPaper(paperData as any)

      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('test_paper_sections')
        .select('id, section_name, section_order, status, question_count')
        .eq('paper_id', paperId)
        .order('section_order', { ascending: true })

      if (sectionsError) {
        console.error('Error fetching sections:', sectionsError)
        setError('Failed to load sections')
        return
      }

      // Fetch chapter counts for each section
      const { data: chapterCounts, error: chapterCountsError } = await supabase
        .from('section_chapters')
        .select('section_id')
        .in('section_id', sectionsData.map(s => s.id))

      const chapterCountMap = new Map<string, number>()
      if (!chapterCountsError && chapterCounts) {
        chapterCounts.forEach(sc => {
          chapterCountMap.set(sc.section_id, (chapterCountMap.get(sc.section_id) || 0) + 1)
        })
      }

      const sectionsWithCounts: Section[] = sectionsData.map(section => ({
        ...section,
        chapter_count: chapterCountMap.get(section.id) || 0
      }))

      setSections(sectionsWithCounts)

    } catch (err) {
      console.error('Error loading paper:', err)
      setError('Failed to load paper dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSectionAction = (sectionId: string, action: 'assign' | 'generate' | 'regenerate' | 'view') => {
    switch (action) {
      case 'assign':
        router.push(`/dashboard/test-papers/${paperId}/section/${sectionId}/chapters`)
        break
      case 'generate':
      case 'regenerate':
        router.push(`/dashboard/test-papers/${paperId}/section/${sectionId}/generate`)
        break
      case 'view':
        router.push(`/dashboard/test-papers/${paperId}/review`)
        break
    }
  }

  const [generatingPDF, setGeneratingPDF] = useState(false)

  const handleGenerateFinalPDF = async () => {
    // Check if all sections are finalized
    const allFinalized = sections.every(s => s.status === 'finalized')
    if (!allFinalized) {
      const unfinalizedSections = sections.filter(s => s.status !== 'finalized')
      const unfinalizedNames = unfinalizedSections.map(s => s.section_name).join(', ')
      alert(`All sections must be finalized before generating PDF.\n\nUnfinalized sections: ${unfinalizedNames}`)
      return
    }

    if (!confirm('Generate final PDF for this paper? This will finalize the paper and make it read-only.')) {
      return
    }

    try {
      setGeneratingPDF(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

      console.log('[GENERATE_FINAL_PDF] Step 1: Finalizing paper...')

      // Step 1: Finalize paper (validates all sections are finalized)
      const finalizeResponse = await fetch(`/api/test-papers/${paperId}/finalize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      const finalizeData = await finalizeResponse.json()

      if (!finalizeResponse.ok) {
        throw new Error(finalizeData.error || 'Failed to finalize paper')
      }

      console.log('[GENERATE_FINAL_PDF] Step 2: Generating PDF...')

      // Step 2: Generate PDF
      const pdfResponse = await fetch(`/api/test-papers/${paperId}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      const pdfData = await pdfResponse.json()

      if (!pdfResponse.ok) {
        // If PDF generation fails, try to reopen the paper
        console.error('[GENERATE_FINAL_PDF] PDF generation failed, rolling back...')
        await fetch(`/api/test-papers/${paperId}/reopen`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        })
        throw new Error(pdfData.error || 'Failed to generate PDF')
      }

      console.log('[GENERATE_FINAL_PDF] Success! PDF:', pdfData.pdf_url)

      alert('Final PDF generated successfully!')

      // Refresh paper data to show finalized status
      fetchPaperData()
    } catch (err) {
      console.error('[GENERATE_FINAL_PDF_ERROR]', err)
      alert(err instanceof Error ? err.message : 'Failed to generate PDF')
    } finally {
      setGeneratingPDF(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-gray-900 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Loading paper...</p>
        </div>
      </div>
    )
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Paper not found'}</p>
          <Button onClick={() => router.push('/dashboard/test-papers')}>Go Back</Button>
        </div>
      </div>
    )
  }

  const finalizedSections = sections.filter(s => s.status === 'finalized').length
  const totalSections = sections.length
  const progressPercentage = totalSections > 0 ? (finalizedSections / totalSections) * 100 : 0
  const allFinalized = sections.every(s => s.status === 'finalized')

  const getDifficultyColor = () => {
    switch (paper.difficulty_level) {
      case 'easy': return 'bg-green-50 text-green-700 border-green-200'
      case 'balanced': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'hard': return 'bg-red-50 text-red-700 border-red-200'
    }
  }

  const getStatusColor = () => {
    switch (paper.status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'review': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'finalized': return 'bg-green-100 text-green-700 border-green-300'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => {
                  // Navigate to template page if paper was created from template
                  // Otherwise go to main test papers list
                  if (paper.paper_template_id) {
                    router.push(`/dashboard/test-papers/template/${paper.paper_template_id}`)
                  } else {
                    router.push('/dashboard/test-papers')
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{paper.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor()}`}>
                    {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
                  </span>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getDifficultyColor()}`}>
                    {paper.difficulty_level.charAt(0).toUpperCase() + paper.difficulty_level.slice(1)}
                  </span>
                  {paper.paper_templates && (
                    <span className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-full border border-gray-300">
                      {paper.paper_templates.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {allFinalized && paper.status !== 'finalized' && (
              <Button
                variant="primary"
                onClick={handleGenerateFinalPDF}
                disabled={generatingPDF}
              >
                {generatingPDF ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating PDF...
                  </span>
                ) : (
                  'Generate Final PDF'
                )}
              </Button>
            )}
            {paper.status === 'finalized' && paper.pdf_url && (
              <a
                href={paper.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-brand-saffron text-white rounded-lg font-medium hover:bg-brand-saffron/90 transition-colors"
              >
                View PDF
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Section Progress</h2>
            <span className="text-sm text-gray-600">
              {finalizedSections} / {totalSections} finalized
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {allFinalized && paper.status !== 'finalized' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-green-800">
                  All sections finalized! You can now generate the final PDF.
                </p>
              </div>
            </div>
          )}
          {paper.status === 'finalized' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-blue-800">
                  Paper finalized! PDF is ready for viewing.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sections Grid */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => (
              <SectionTile
                key={section.id}
                section={section}
                paperId={paperId}
                onActionClick={handleSectionAction}
              />
            ))}
          </div>
        </div>

        {/* No Sections Message */}
        {sections.length === 0 && (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sections found</h3>
            <p className="text-gray-600">This paper doesn't have any sections yet.</p>
          </div>
        )}
      </main>
    </div>
  )
}
