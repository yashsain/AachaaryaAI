/**
 * Section Chapter Selection Page
 *
 * Allows users to select/assign chapters for a specific section
 * - Shows available chapters filtered by section's subject
 * - Shows currently assigned chapters (if any)
 * - Assigns chapters via API endpoint
 * - Redirects back to Paper Dashboard after assignment
 */

'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireSession } from '@/hooks/useSession'
import { Button } from '@/components/ui/Button'
import { MultiSelect, MultiSelectOption } from '@/components/ui/MultiSelect'

interface SectionChaptersPageProps {
  params: Promise<{
    paper_id: string
    section_id: string
  }>
}

interface SectionDetails {
  id: string
  section_name: string
  subject_id: string
  subject_name: string
  status: string
  question_count: number
}

interface Chapter {
  id: string
  name: string
}

export default function SectionChaptersPage({ params }: SectionChaptersPageProps) {
  const resolvedParams = use(params)
  const paperId = resolvedParams.paper_id
  const sectionId = resolvedParams.section_id
  const { session } = useRequireSession()
  const router = useRouter()

  const [section, setSection] = useState<SectionDetails | null>(null)
  const [availableChapters, setAvailableChapters] = useState<Chapter[]>([])
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        subject_id: data.section.subject_id,
        subject_name: data.section.subject_name,
        status: data.section.status,
        question_count: data.section.question_count
      })

      setAvailableChapters(data.available_chapters || [])

      // Pre-select currently assigned chapters
      const assignedIds = data.assigned_chapters?.map((ch: Chapter) => ch.id) || []
      setSelectedChapterIds(assignedIds)

    } catch (err) {
      console.error('Error fetching section details:', err)
      setError(err instanceof Error ? err.message : 'Failed to load section details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssign = async () => {
    if (selectedChapterIds.length === 0) {
      setError('Please select at least one chapter')
      return
    }

    try {
      setIsAssigning(true)
      setError(null)

      if (!session) {
        setError('Session expired. Please sign in again.')
        return
      }

      const response = await fetch(`/api/test-papers/${paperId}/sections/${sectionId}/assign-chapters`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chapter_ids: selectedChapterIds
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign chapters')
      }

      console.log('[ASSIGN_CHAPTERS_SUCCESS]', data)

      // Redirect back to Paper Dashboard (replace to avoid history pollution)
      router.replace(`/dashboard/test-papers/${paperId}`)

    } catch (err) {
      console.error('[ASSIGN_CHAPTERS_ERROR]', err)
      setError(err instanceof Error ? err.message : 'Failed to assign chapters')
    } finally {
      setIsAssigning(false)
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

  const chapterOptions: MultiSelectOption[] = availableChapters.map(ch => ({
    id: ch.id,
    name: ch.name
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/dashboard/test-papers/${paperId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assign Chapters</h1>
              <p className="text-sm text-gray-500 mt-1">{section?.section_name} - {section?.subject_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Section Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 mb-1">
                  Section: {section?.section_name}
                </p>
                <p className="text-sm text-blue-700 mb-2">
                  Subject: {section?.subject_name} • Target: {section?.question_count} questions
                </p>
                <p className="text-sm text-blue-700 font-medium">
                  Select chapters for this section. Questions will be generated from selected chapters.
                </p>
              </div>
            </div>
          </div>

          {/* Chapter Selection */}
          <div>
            <MultiSelect
              label="Chapters"
              options={chapterOptions}
              selectedIds={selectedChapterIds}
              onChange={setSelectedChapterIds}
              placeholder="Select chapters for this section..."
              required
            />
            <p className="mt-2 text-sm text-gray-600">
              {selectedChapterIds.length} chapter{selectedChapterIds.length !== 1 ? 's' : ''} selected from {availableChapters.length} available
            </p>
          </div>

          {/* No Chapters Available */}
          {availableChapters.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-yellow-800 font-medium">No Chapters Available</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    No chapters found for {section?.subject_name}. Please contact your administrator to add chapters.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warning for Completed Section */}
          {section?.status === 'completed' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-yellow-800 font-medium">Warning: Section Already Completed</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Changing chapters will delete all existing questions for this section. You'll need to regenerate questions after assignment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => router.push(`/dashboard/test-papers/${paperId}`)}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleAssign}
              isLoading={isAssigning}
              disabled={isAssigning || selectedChapterIds.length === 0 || availableChapters.length === 0}
            >
              {isAssigning ? 'Assigning...' : 'Assign Chapters'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
