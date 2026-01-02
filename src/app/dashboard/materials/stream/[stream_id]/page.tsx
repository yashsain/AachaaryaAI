'use client'

/**
 * Subject Picker Page - Materials (Filtered by Stream)
 *
 * Second step in material management workflow
 * Shows list of subjects for selected stream
 * - Teachers: see only their assigned subjects (filtered by stream)
 * - Admins: see all subjects for the stream
 */

import { useRequireSession } from '@/hooks/useSession'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, ArrowLeft, ChevronRight, FolderOpen, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Subject {
  id: string
  name: string
  stream_id: string
  streams: {
    id: string
    name: string
  }
}

// Subject-specific styling
const getSubjectConfig = (subjectName: string) => {
  const name = subjectName.toLowerCase()

  if (name.includes('biology')) {
    return {
      emoji: '🧬',
      gradient: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    }
  } else if (name.includes('physics')) {
    return {
      emoji: '⚛️',
      gradient: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    }
  } else if (name.includes('chemistry')) {
    return {
      emoji: '🧪',
      gradient: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    }
  } else if (name.includes('math')) {
    return {
      emoji: '📐',
      gradient: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    }
  } else {
    return {
      emoji: '📚',
      gradient: 'from-gray-500 to-slate-600',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700'
    }
  }
}

export default function MaterialsSubjectPickerPage() {
  const { session, teacher, loading, teacherLoading, error, retry, clearError, signOut } = useRequireSession()
  const router = useRouter()
  const params = useParams()
  const streamId = params?.stream_id as string

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [subjectsError, setSubjectsError] = useState<string | null>(null)
  const [streamName, setStreamName] = useState<string>('')

  useEffect(() => {
    if (teacher && !loading && !teacherLoading && streamId) {
      fetchSubjects()
    }
  }, [teacher, loading, teacherLoading, streamId])

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true)
      setSubjectsError(null)

      if (!session) {
        setSubjectsError('Session expired. Please sign in again.')
        return
      }

      const response = await fetch(`/api/subjects?stream_id=${streamId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch subjects')
      }

      const data = await response.json()
      const subjectsList = data.subjects || []
      setSubjects(subjectsList)

      // Get stream name from first subject
      if (subjectsList.length > 0) {
        setStreamName(subjectsList[0].streams.name)
      }
    } catch (err) {
      console.error('[MATERIALS_SUBJECT_PICKER_ERROR]', err)
      setSubjectsError(err instanceof Error ? err.message : 'Failed to load subjects')
    } finally {
      setLoadingSubjects(false)
    }
  }

  // Show error screen if there's an auth error
  if (error) {
    return <AuthErrorBanner error={error} onRetry={retry} onDismiss={clearError} onSignOut={signOut} />
  }

  // Show loading state
  if (loading || teacherLoading || loadingSubjects) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3 text-neutral-600">
          <Link
            href="/dashboard/materials"
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Streams
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-neutral-900">Study Materials</h1>
        <p className="text-lg text-neutral-600">
          {streamName ? `${streamName} - Select a subject to manage materials` : 'Select a subject to continue'}
        </p>
      </motion.div>
      {/* Error State */}
      {subjectsError && (
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
              <h3 className="text-lg font-semibold text-error-900 mb-1">Error Loading Subjects</h3>
              <p className="text-error-700 text-sm mb-4">{subjectsError}</p>
              <button
                onClick={fetchSubjects}
                className="inline-flex items-center gap-2 px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!subjectsError && subjects.length === 0 && !loadingSubjects && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center"
        >
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="h-10 w-10 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">No Subjects Found</h2>
          <p className="text-neutral-600 mb-6 max-w-md mx-auto">
            {teacher?.role === 'admin'
              ? 'No subjects have been added for this stream yet.'
              : 'You have not been assigned any subjects for this stream. Please contact your administrator.'}
          </p>
          <Link href="/dashboard/materials">
            <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all font-medium shadow-lg hover:shadow-xl">
              Back to Streams
            </button>
          </Link>
        </motion.div>
      )}

      {/* Subjects Grid */}
      {!subjectsError && subjects.length > 0 && !loadingSubjects && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Available Subjects</h2>
              <p className="text-sm text-neutral-600 mt-1">
                {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'} available for {streamName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => {
              const config = getSubjectConfig(subject.name)

              return (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/dashboard/materials/${subject.id}`}>
                    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-neutral-200 hover:border-transparent h-full">
                      {/* Gradient Background - visible on hover */}
                      <div className={cn(
                        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                        config.gradient
                      )} />

                      {/* Content */}
                      <div className="relative p-6">
                        {/* Subject Emoji */}
                        <div className={cn(
                          'w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 text-3xl',
                          config.bgColor,
                          'group-hover:bg-white/20'
                        )}>
                          {config.emoji}
                        </div>

                        {/* Subject Name */}
                        <h3 className="text-xl font-bold text-neutral-900 group-hover:text-white transition-colors duration-300 mb-2">
                          {subject.name}
                        </h3>

                        {/* Stream Badge */}
                        <p className="text-sm text-neutral-600 group-hover:text-white/90 transition-colors duration-300 mb-4">
                          {subject.streams.name} Stream
                        </p>

                        {/* Action */}
                        <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 group-hover:text-white transition-colors duration-300">
                          <span>Manage Materials</span>
                          <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>

                      {/* Decorative element */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </>
      )}

      {/* Helper Text */}
      {subjects.length > 0 && !loadingSubjects && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
        >
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">About Study Materials</h3>
              <p className="text-sm text-blue-700">
                Organize your study materials by uploading PDFs of notes, DPPs, past papers, and more.
                Materials are tagged by chapters for easy access during test paper generation.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
