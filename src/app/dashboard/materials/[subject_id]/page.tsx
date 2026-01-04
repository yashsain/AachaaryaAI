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

import { useRequireSession } from '@/hooks/useSession'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { ChapterSection } from '@/components/chapters/ChapterSection'
import { AddChapterModal } from '@/components/chapters/AddChapterModal'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, BookOpen, Plus, AlertCircle, FolderOpen } from 'lucide-react'

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
  const { session, teacher, loading, teacherLoading, error, retry, clearError, signOut } = useRequireSession()
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
      // Using centralized session (no redundant getSession call)
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

      // Using centralized session (no redundant getSession call)
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
      // Using centralized session (no redundant getSession call)
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

  const handleChapterDeleted = (chapterId: string) => {
    // Remove deleted chapter from the list
    setChapters(prev => prev.filter(chapter => chapter.id !== chapterId))
  }

  const totalMaterials = chapters.reduce((sum, chapter) => sum + chapter.material_count, 0)

  // Show error screen if there's an auth error
  if (error) {
    return <AuthErrorBanner error={error} onRetry={retry} onDismiss={clearError} onSignOut={signOut} />
  }

  // Show loading state
  if (loading || teacherLoading || loadingChapters) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
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
        session={session}
        onSuccess={handleChapterCreated}
      />

      <div className="space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 text-neutral-600">
            <Link
              href={hasOnlyOneSubject ? "/dashboard" : "/dashboard/materials"}
              className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {hasOnlyOneSubject ? "Dashboard" : "Subjects"}
            </Link>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-neutral-900">
                {subject?.name || 'Materials'}
              </h1>
              <div className="flex items-center gap-3 text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {totalMaterials} {totalMaterials === 1 ? 'material' : 'materials'}
                  </span>
                </div>
                <span className="text-neutral-400">•</span>
                <span className="text-sm font-medium">
                  {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => setIsAddChapterModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Chapter
            </Button>
          </div>
        </motion.div>
        {/* Error State */}
        {chaptersError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-error-50 border border-error-200 rounded-xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-error-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-error-900 mb-1">Error Loading Chapters</h3>
                <p className="text-error-700 text-sm mb-4">{chaptersError}</p>
                <button
                  onClick={fetchChaptersWithMaterials}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State - No Chapters */}
        {!chaptersError && chapters.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center"
          >
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="h-10 w-10 text-neutral-400" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">No Chapters Yet</h2>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              Start by creating chapters to organize your study materials for this subject.
            </p>
            <button
              onClick={() => setIsAddChapterModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all font-medium shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Chapter
            </button>
          </motion.div>
        )}

        {/* Chapters List */}
        {!chaptersError && chapters.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {chapters.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ChapterSection
                  chapter={chapter}
                  subjectId={subject_id}
                  onUpload={handleUploadClick}
                  onDelete={handleChapterDeleted}
                  isDefaultExpanded={chapters.length === 1}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </>
  )
}
