'use client'

/**
 * Modern Section Chapter Selection Page
 *
 * Allows users to select/assign chapters for a specific section
 * Features:
 * - Modern card-based layout with animations
 * - Visual section info card with stats
 * - Enhanced multi-select with chapter count
 * - Warning banners for edge cases
 * - Smooth loading and error states
 */

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, BookOpen, Hash, AlertCircle, Info, AlertTriangle, CheckCircle2, Layers } from 'lucide-react'
import { useRequireSession } from '@/hooks/useSession'
import { Button } from '@/components/ui/Button'
import { MultiSelect, MultiSelectOption } from '@/components/ui/MultiSelect'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

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

// Subject-specific colors
const getSubjectColor = (subjectName: string) => {
  const name = subjectName.toLowerCase()

  if (name.includes('physics')) {
    return {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100'
    }
  } else if (name.includes('chemistry')) {
    return {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      iconBg: 'bg-purple-100'
    }
  } else if (name.includes('biology')) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100'
    }
  } else if (name.includes('math')) {
    return {
      bg: 'bg-primary-50',
      text: 'text-primary-700',
      border: 'border-primary-200',
      iconBg: 'bg-primary-100'
    }
  } else {
    return {
      bg: 'bg-neutral-50',
      text: 'text-neutral-700',
      border: 'border-neutral-200',
      iconBg: 'bg-neutral-100'
    }
  }
}

export default function SectionChaptersPage({ params }: SectionChaptersPageProps) {
  const resolvedParams = use(params)
  const paperId = resolvedParams.paper_id
  const sectionId = resolvedParams.section_id
  const { session, loading, teacherLoading } = useRequireSession()
  const router = useRouter()

  const [section, setSection] = useState<SectionDetails | null>(null)
  const [availableChapters, setAvailableChapters] = useState<Chapter[]>([])
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only fetch when auth is fully loaded
    // Prevents race condition with useRequireSession redirect logic
    if (session && !loading && !teacherLoading) {
      fetchSectionDetails()
    }
  }, [session, loading, teacherLoading, sectionId])

  const fetchSectionDetails = async () => {
    try {
      setIsLoading(true)

      // Session is guaranteed to exist here due to useEffect guard above
      // No need for manual redirect - useRequireSession handles it

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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  // Error state (no section loaded)
  if (error && !section) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center"
      >
        <div className="w-20 h-20 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-error-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-3">Error Loading Section</h2>
        <p className="text-neutral-600 mb-6 max-w-md mx-auto">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </motion.div>
    )
  }

  const chapterOptions: MultiSelectOption[] = availableChapters.map(ch => ({
    id: ch.id,
    name: ch.name
  }))

  // Mutual exclusion: AI Knowledge cannot be selected with other chapters
  // Find AI Knowledge chapter (synthetic or real UUID from DB)
  const aiKnowledgeChapter = availableChapters.find(ch => ch.name === '[AI Knowledge] Full Syllabus')
  const aiKnowledgeId = aiKnowledgeChapter?.id

  const isAIKnowledgeSelected = aiKnowledgeId ? selectedChapterIds.includes(aiKnowledgeId) : false
  const hasOtherChaptersSelected = selectedChapterIds.some(id => id !== aiKnowledgeId)

  const disabledOptions = isAIKnowledgeSelected
    ? availableChapters.filter(ch => ch.id !== aiKnowledgeId).map(ch => ch.id)
    : hasOtherChaptersSelected && aiKnowledgeId
      ? [aiKnowledgeId]
      : []

  const subjectColor = getSubjectColor(section?.subject_name || '')

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3 text-neutral-600">
          <button
            onClick={() => router.push(`/dashboard/test-papers/${paperId}`)}
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Paper Dashboard
          </button>
        </div>
        <h1 className="text-4xl font-bold text-neutral-900">Assign Chapters</h1>
        <p className="text-lg text-neutral-600">
          Select chapters for <span className="font-semibold text-neutral-900">{section?.section_name}</span>
        </p>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-error-50 border border-error-200 rounded-xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-error-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-error-900 mb-1">Error</h3>
                <p className="text-error-700 text-sm">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Section Info Card */}
          <div className={cn(
            'border-2 rounded-2xl p-6',
            subjectColor.bg,
            subjectColor.border
          )}>
            <div className="flex items-start gap-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                subjectColor.iconBg
              )}>
                <BookOpen className={cn('h-6 w-6', subjectColor.text)} />
              </div>
              <div className="flex-1">
                <h3 className={cn('font-bold text-lg mb-1', subjectColor.text)}>
                  {section?.section_name}
                </h3>
                <p className="text-sm text-neutral-700 mb-3">
                  Subject: <span className="font-semibold">{section?.subject_name}</span> • Target: <span className="font-semibold">{section?.question_count} questions</span>
                </p>
                <p className="text-sm text-neutral-700">
                  Select chapters for this section. Questions will be generated from the selected chapters during the next step.
                </p>
              </div>
            </div>
          </div>

          {/* Chapter Selection Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Chapter Selection</h2>
                <p className="text-sm text-neutral-600">Choose chapters to include in this section</p>
              </div>
            </div>

            {/* Multi-Select */}
            <div>
              <MultiSelect
                label="Chapters"
                options={chapterOptions}
                selectedIds={selectedChapterIds}
                onChange={setSelectedChapterIds}
                placeholder="Select chapters for this section..."
                required
                disabledOptions={disabledOptions}
              />
              <div className="mt-3 flex items-center gap-2 text-sm">
                <div className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold',
                  selectedChapterIds.length > 0
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'bg-neutral-50 text-neutral-600 border border-neutral-200'
                )}>
                  <CheckCircle2 className="h-4 w-4" />
                  {selectedChapterIds.length} selected
                </div>
                <span className="text-neutral-600">
                  of {availableChapters.length} available
                </span>
              </div>
            </div>

            {/* No Chapters Available Warning */}
            {availableChapters.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">No Chapters Available</h4>
                    <p className="text-sm text-amber-700">
                      No chapters found for {section?.subject_name}. Please contact your administrator to add chapters for this subject.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Section Has Questions Warning */}
            {(section?.status === 'in_review' || section?.status === 'finalized') && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">
                      Section Has Questions
                    </h4>
                    <p className="text-sm text-amber-700">
                      Changing chapters will delete all existing questions for this section. You'll need to regenerate questions after assignment.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push(`/dashboard/test-papers/${paperId}`)}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleAssign}
              isLoading={isAssigning}
              disabled={isAssigning || selectedChapterIds.length === 0 || availableChapters.length === 0}
            >
              {isAssigning ? 'Assigning Chapters...' : 'Assign Chapters & Continue'}
            </Button>
          </div>
        </motion.div>

        {/* Info Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {/* Stats Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-100">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <Hash className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-neutral-900">Section Stats</h3>
                <p className="text-xs text-neutral-600">Overview of this section</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-xl">
                <span className="text-sm font-medium text-primary-900">Target Questions</span>
                <span className="text-lg font-bold text-primary-900">{section?.question_count}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                <span className="text-sm font-medium text-neutral-900">Available Chapters</span>
                <span className="text-lg font-bold text-neutral-900">{availableChapters.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                <span className="text-sm font-medium text-neutral-900">Selected Chapters</span>
                <span className={cn(
                  'text-lg font-bold',
                  selectedChapterIds.length > 0 ? 'text-primary-900' : 'text-neutral-400'
                )}>
                  {selectedChapterIds.length}
                </span>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Info className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Next Steps</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  After assigning chapters, you'll be able to generate questions from the selected chapters in the next step.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
