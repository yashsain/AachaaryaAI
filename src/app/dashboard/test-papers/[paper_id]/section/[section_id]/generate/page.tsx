/**
 * Section Question Generation Page
 *
 * Generates or regenerates questions for a section with assigned chapters
 * - Shows section details and assigned chapters
 * - Calls generate or regenerate API based on section status
 * - Shows real-time generation progress
 * - Redirects to Paper Dashboard on completion
 */

'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireSession } from '@/hooks/useSession'
import { Button } from '@/components/ui/Button'

interface SectionGeneratePageProps {
  params: Promise<{
    paper_id: string
    section_id: string
  }>
}

interface SectionDetails {
  id: string
  section_name: string
  subject_name: string
  status: string
  question_count: number
  assigned_chapters: Array<{ id: string; name: string }>
}

type GenerationStatus = 'idle' | 'generating' | 'completed' | 'error'

export default function SectionGeneratePage({ params }: SectionGeneratePageProps) {
  const resolvedParams = use(params)
  const paperId = resolvedParams.paper_id
  const sectionId = resolvedParams.section_id
  const { session } = useRequireSession()
  const router = useRouter()

  const [section, setSection] = useState<SectionDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [generationResult, setGenerationResult] = useState<any>(null)

  useEffect(() => {
    fetchSectionDetails()
  }, [sectionId])

  const fetchSectionDetails = async () => {
    try {
      setIsLoading(true)
      if (!session) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`/api/test-papers/${paperId}/sections/${sectionId}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch section details')
      }

      const data = await response.json()

      setSection({
        id: data.section.id,
        section_name: data.section.section_name,
        subject_name: data.section.subject_name,
        status: data.section.status,
        question_count: data.section.question_count,
        assigned_chapters: data.assigned_chapters || []
      })

    } catch (err) {
      console.error('Error fetching section details:', err)
      setError(err instanceof Error ? err.message : 'Failed to load section details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!section) return

    // Check if section has chapters assigned
    if (section.assigned_chapters.length === 0) {
      setError('No chapters assigned to this section')
      return
    }

    try {
      setGenerationStatus('generating')
      setError(null)

      if (!session) {
        setError('Session expired. Please sign in again.')
        setGenerationStatus('idle')
        return
      }

      // Determine endpoint based on section status
      const endpoint = section.status === 'completed'
        ? `/api/test-papers/${paperId}/sections/${sectionId}/regenerate`
        : `/api/test-papers/${paperId}/sections/${sectionId}/generate`

      console.log(`[GENERATE_START] Calling ${endpoint}`)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions')
      }

      console.log('[GENERATE_SUCCESS]', data)
      setGenerationResult(data)
      setGenerationStatus('completed')

      // Auto-redirect after 2 seconds (replace to avoid history pollution)
      setTimeout(() => {
        router.replace(`/dashboard/test-papers/${paperId}`)
      }, 2000)

    } catch (err) {
      console.error('[GENERATE_ERROR]', err)
      setError(err instanceof Error ? err.message : 'Failed to generate questions')
      setGenerationStatus('error')
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
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !section) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const isRegenerate = section?.status === 'completed'
  const canGenerate = section?.assigned_chapters.length && section.assigned_chapters.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/dashboard/test-papers/${paperId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={generationStatus === 'generating'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isRegenerate ? 'Regenerate' : 'Generate'} Questions
              </h1>
              <p className="text-sm text-gray-500 mt-1">{section?.section_name} - {section?.subject_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Generation Card */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Status Display */}
          {generationStatus === 'idle' && (
            <>
              {/* Section Info */}
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Ready to {isRegenerate ? 'Regenerate' : 'Generate'} Questions
                </h2>
                <p className="text-gray-600 mb-6">
                  {isRegenerate
                    ? 'This will delete existing questions and generate new ones'
                    : `Generate ${section?.question_count} questions for this section`}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">Section</p>
                  <p className="text-lg font-semibold text-gray-900">{section?.section_name}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">Subject</p>
                  <p className="text-lg font-semibold text-gray-900">{section?.subject_name}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Assigned Chapters ({section?.assigned_chapters.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {section?.assigned_chapters.map((chapter) => (
                      <span
                        key={chapter.id}
                        className="px-3 py-1 bg-white text-gray-700 rounded border border-gray-200 text-sm"
                      >
                        {chapter.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">Target Questions</p>
                  <p className="text-lg font-semibold text-gray-900">{section?.question_count} questions</p>
                  <p className="text-sm text-gray-500 mt-1">
                    AI will generate ~{Math.ceil((section?.question_count || 0) * 1.5)} questions for selection
                  </p>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-red-800 font-medium">Error</p>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/dashboard/test-papers/${paperId}`)}
                >
                  Cancel
                </Button>
                <Button
                  variant={isRegenerate ? 'danger' : 'primary'}
                  className="flex-1"
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                >
                  {isRegenerate ? 'Regenerate Questions' : 'Generate Questions'}
                </Button>
              </div>
            </>
          )}

          {/* Generating Status */}
          {generationStatus === 'generating' && (
            <div className="text-center py-12">
              <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Generating Questions...</h3>
              <p className="text-gray-600">
                This may take a few minutes. Please don't close this page.
              </p>
              <p className="text-gray-500 text-sm mt-4">
                Processing {section?.assigned_chapters.length} chapters
              </p>
            </div>
          )}

          {/* Success Status */}
          {generationStatus === 'completed' && generationResult && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Questions Generated!</h3>
              <p className="text-gray-600 mb-6">
                Successfully generated {generationResult.questions_generated} questions
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Chapters Processed:</span>
                    <span className="font-semibold text-green-900">{generationResult.chapters_processed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Questions Generated:</span>
                    <span className="font-semibold text-green-900">{generationResult.questions_generated}</span>
                  </div>
                  {generationResult.questions_deleted > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Old Questions Deleted:</span>
                      <span className="font-semibold text-green-900">{generationResult.questions_deleted}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                Redirecting to Paper Dashboard...
              </p>
            </div>
          )}

          {/* Error Status */}
          {generationStatus === 'error' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Generation Failed</h3>
              <p className="text-gray-600 mb-6">{error}</p>

              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/dashboard/test-papers/${paperId}`)}
                >
                  Back to Dashboard
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setGenerationStatus('idle')}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
