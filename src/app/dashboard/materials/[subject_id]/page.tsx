'use client'

/**
 * Materials Browse Page (Chapter-Centric)
 *
 * Displays materials organized by chapters with management capabilities
 * - Chapter-centric view with collapsible sections
 * - Add new chapters inline
 * - Upload materials per chapter
 * - Shows all chapters including empty ones
 * - Role-based access control enforced
 */

import { useRequireAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { ChapterSection } from '@/components/chapters/ChapterSection'
import { AddChapterModal } from '@/components/chapters/AddChapterModal'
import { Button } from '@/components/ui/Button'

interface Material {
  id: string
  title: string
  file_url: string
  created_at: string
  material_types?: { name: string }
  chapter_count: number
  all_chapters: string[]
}

interface Chapter {
  id: string
  name: string
  material_count: number
  materials: Material[]
}

interface Subject {
  id: string
  name: string
}

export default function MaterialsBrowsePage() {
  const { teacher, loading, teacherLoading, error, retry, clearError, signOut } = useRequireAuth()
  const router = useRouter()
  const params = useParams()
  const subject_id = params.subject_id as string

  const [subject, setSubject] = useState<Subject | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loadingChapters, setLoadingChapters] = useState(true)
  const [chaptersError, setChaptersError] = useState<string | null>(null)
  const [hasOnlyOneSubject, setHasOnlyOneSubject] = useState<boolean>(false)
  const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false)

  useEffect(() => {
    if (teacher && !loading && !teacherLoading && subject_id) {
      fetchChaptersWithMaterials()
      fetchSubjectInfo()
      checkSubjectCount()
    }
  }, [teacher, loading, teacherLoading, subject_id])

  const fetchSubjectInfo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`/api/subjects/${subject_id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSubject(data.subject)
      }
    } catch (err) {
      console.error('[SUBJECT_INFO_ERROR]', err)
    }
  }

  const fetchChaptersWithMaterials = async () => {
    try {
      setLoadingChapters(true)
      setChaptersError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setChaptersError('Session expired. Please sign in again.')
        return
      }

      const response = await fetch(`/api/chapters?subject_id=${subject_id}&with_materials=true`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch chapters')
      }

      const data = await response.json()
      setChapters(data.chapters || [])
    } catch (err) {
      console.error('[CHAPTERS_FETCH_ERROR]', err)
      setChaptersError(err instanceof Error ? err.message : 'Failed to load chapters')
    } finally {
      setLoadingChapters(false)
    }
  }

  const checkSubjectCount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/subjects', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setHasOnlyOneSubject(data.subjects?.length === 1)
      }
    } catch (err) {
      console.error('[CHECK_SUBJECT_COUNT_ERROR]', err)
      // Non-critical error, don't show to user
    }
  }

  const handleUploadClick = (chapterId: string) => {
    router.push(`/dashboard/materials/${subject_id}/upload?chapter_id=${chapterId}`)
  }

  const handleChapterCreated = (chapter: Chapter) => {
    // Add new chapter to the list
    setChapters(prev => [...prev, { ...chapter, materials: [], material_count: 0 }])
  }

  const totalMaterials = chapters.reduce((sum, chapter) => sum + chapter.material_count, 0)

  // Show error screen if there's an auth error
  if (error) {
    return <AuthErrorBanner error={error} onRetry={retry} onDismiss={clearError} onSignOut={signOut} />
  }

  // Show loading state
  if (loading || teacherLoading || loadingChapters) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading chapters...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AddChapterModal
        isOpen={isAddChapterModalOpen}
        onClose={() => setIsAddChapterModalOpen(false)}
        subjectId={subject_id}
        onSuccess={handleChapterCreated}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href={hasOnlyOneSubject ? "/dashboard" : "/dashboard/materials"}>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {subject?.name || 'Materials'}
                  </h1>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {totalMaterials} {totalMaterials === 1 ? 'material' : 'materials'} •{' '}
                    {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => setIsAddChapterModalOpen(true)}
              >
                + Add Chapter
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error State */}
          {chaptersError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-red-600 text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-red-600 font-medium">Error Loading Chapters</p>
                  <p className="text-red-500 text-sm mt-1">{chaptersError}</p>
                  <button
                    onClick={fetchChaptersWithMaterials}
                    className="mt-3 text-sm text-red-600 hover:underline font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State - No Chapters */}
          {!chaptersError && chapters.length === 0 && (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📘</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Chapters Yet</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start by creating chapters to organize your study materials for this subject.
              </p>
              <Button
                variant="primary"
                onClick={() => setIsAddChapterModalOpen(true)}
              >
                + Add Your First Chapter
              </Button>
            </div>
          )}

          {/* Chapters List */}
          {!chaptersError && chapters.length > 0 && (
            <div className="space-y-4">
              {chapters.map((chapter) => (
                <ChapterSection
                  key={chapter.id}
                  chapter={chapter}
                  subjectId={subject_id}
                  onUpload={handleUploadClick}
                  isDefaultExpanded={chapters.length === 1}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
