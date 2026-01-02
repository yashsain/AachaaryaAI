'use client'

/**
 * Modern Test Papers Stream Picker Page
 *
 * First step in test paper creation workflow
 * Features:
 * - Stream selection with modern card design
 * - Animated loading states
 * - Empty state handling
 * - Error recovery
 */

import { useRequireSession } from '@/hooks/useSession'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, BookOpen, GraduationCap, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface Stream {
  id: string
  name: string
  created_at: string
}

// Stream-specific styling
const getStreamConfig = (streamName: string) => {
  const name = streamName.toLowerCase()

  if (name.includes('neet')) {
    return {
      icon: BookOpen,
      gradient: 'from-emerald-500 to-teal-600',
      hoverGradient: 'hover:from-emerald-600 hover:to-teal-700',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200'
    }
  } else if (name.includes('jee')) {
    return {
      icon: TrendingUp,
      gradient: 'from-blue-500 to-indigo-600',
      hoverGradient: 'hover:from-blue-600 hover:to-indigo-700',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    }
  } else {
    return {
      icon: GraduationCap,
      gradient: 'from-primary-500 to-primary-600',
      hoverGradient: 'hover:from-primary-600 hover:to-primary-700',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-700',
      borderColor: 'border-primary-200'
    }
  }
}

export default function TestPapersStreamPickerPage() {
  const { session, teacher, loading, teacherLoading, error, retry, clearError, signOut } = useRequireSession()
  const router = useRouter()
  const [streams, setStreams] = useState<Stream[]>([])
  const [loadingStreams, setLoadingStreams] = useState(true)
  const [streamsError, setStreamsError] = useState<string | null>(null)

  useEffect(() => {
    if (teacher && !loading && !teacherLoading) {
      fetchStreams()
    }
  }, [teacher, loading, teacherLoading])

  const fetchStreams = async () => {
    try {
      setLoadingStreams(true)
      setStreamsError(null)

      if (!session) {
        setStreamsError('Session expired. Please sign in again.')
        return
      }

      const response = await fetch('/api/streams', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch streams')
      }

      const data = await response.json()
      const streamsList = data.streams || []
      setStreams(streamsList)
    } catch (err) {
      console.error('[TEST_PAPERS_STREAM_PICKER_ERROR]', err)
      setStreamsError(err instanceof Error ? err.message : 'Failed to load streams')
    } finally {
      setLoadingStreams(false)
    }
  }

  // Show error screen if there's an auth error
  if (error) {
    return <AuthErrorBanner error={error} onRetry={retry} onDismiss={clearError} onSignOut={signOut} />
  }

  // Show loading state
  if (loading || teacherLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
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
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-neutral-900">Create Test Paper</h1>
        <p className="text-lg text-neutral-600">
          Select a stream to view available paper templates
        </p>
      </motion.div>

      {/* Error State */}
      {streamsError && (
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
              <h3 className="text-lg font-semibold text-error-900 mb-1">Error Loading Streams</h3>
              <p className="text-error-700 text-sm mb-4">{streamsError}</p>
              <button
                onClick={fetchStreams}
                className="inline-flex items-center gap-2 px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loadingStreams && !streamsError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!streamsError && streams.length === 0 && !loadingStreams && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center"
        >
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="h-10 w-10 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">No Streams Found</h2>
          <p className="text-neutral-600 mb-6 max-w-md mx-auto">
            {teacher?.role === 'admin'
              ? 'No streams have been added to your institute yet. Get started by adding your first stream.'
              : 'Your institute has no streams configured yet. Please contact your administrator to set up streams.'}
          </p>
          {teacher?.role === 'admin' && (
            <Link href="/dashboard/admin">
              <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all font-medium shadow-lg hover:shadow-xl">
                Go to Admin Panel
              </button>
            </Link>
          )}
        </motion.div>
      )}

      {/* Streams Grid */}
      {streams.length > 0 && !loadingStreams && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream, index) => {
            const config = getStreamConfig(stream.name)
            const Icon = config.icon

            return (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/dashboard/test-papers/stream/${stream.id}`}>
                  <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-neutral-200 hover:border-transparent">
                    {/* Gradient Background - visible on hover */}
                    <div className={cn(
                      'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                      config.gradient
                    )} />

                    {/* Content */}
                    <div className="relative p-8">
                      {/* Icon */}
                      <div className={cn(
                        'w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300',
                        config.bgColor,
                        'group-hover:bg-white/20'
                      )}>
                        <Icon className={cn(
                          'h-8 w-8 transition-colors duration-300',
                          config.textColor,
                          'group-hover:text-white'
                        )} />
                      </div>

                      {/* Stream Name */}
                      <h3 className="text-2xl font-bold text-neutral-900 group-hover:text-white transition-colors duration-300 mb-2">
                        {stream.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-neutral-600 group-hover:text-white/90 transition-colors duration-300 mb-6">
                        View and create test papers for {stream.name}
                      </p>

                      {/* Action */}
                      <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 group-hover:text-white transition-colors duration-300">
                        <span>View Templates</span>
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>

                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Helper Text */}
      {streams.length > 0 && !loadingStreams && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-primary-50 border border-primary-200 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-primary-900 mb-1">What's Next?</h4>
              <p className="text-sm text-primary-700">
                Select a stream to view available paper templates. Each template defines the structure, sections, and question distribution for your test paper.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
