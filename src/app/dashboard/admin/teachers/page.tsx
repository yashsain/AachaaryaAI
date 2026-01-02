'use client'

import { useRequireAdmin } from '@/hooks/useSession'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TeacherTable } from '@/components/admin/TeacherTable'
import { Button } from '@/components/ui/Button'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { AuthLoadingState } from '@/components/auth/AuthLoadingState'
import { ArrowLeft, Plus, Users, AlertCircle, Loader2 } from 'lucide-react'

interface TeacherSubject {
  subject_id: string
  subjects: {
    id: string
    name: string
  }
}

interface Teacher {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  created_at: string
  teacher_subjects: TeacherSubject[]
}

export default function TeachersListPage() {
  const { session, teacher, institute, loading, teacherLoading, loadingStage, loadingProgress, error: authError, retry, clearError, signOut } = useRequireAdmin()

  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true)
  const [error, setError] = useState('')

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      setIsLoadingTeachers(true)
      setError('')

      if (!session) {
        setError('No active session')
        return
      }

      const response = await fetch('/api/admin/teachers', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to load teachers')
        return
      }

      const data = await response.json()
      setTeachers(data.teachers || [])
    } catch (err) {
      console.error('Error fetching teachers:', err)
      setError('Failed to load teachers')
    } finally {
      setIsLoadingTeachers(false)
    }
  }

  useEffect(() => {
    if (teacher) {
      fetchTeachers()
    }
  }, [teacher])

  // Show error screen if there's an auth error
  if (authError) {
    return <AuthErrorBanner error={authError} onRetry={retry} onDismiss={clearError} onSignOut={signOut} />
  }

  // Show loading state while checking authentication and admin role
  if (loading || teacherLoading || !teacher || !institute) {
    return <AuthLoadingState stage={loadingStage} progress={loadingProgress} message="Loading teachers..." />
  }

  return (
    <div className="space-y-6">
        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-base text-neutral-600">
              Manage teacher accounts and permissions
            </p>
          </div>
          <Link href="/dashboard/admin/teachers/new">
            <Button
              variant="primary"
              className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Add Teacher
            </Button>
          </Link>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-error-50 border border-error-200 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-error-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-error-900 mb-1">Error Loading Teachers</h3>
                <p className="text-error-700 text-sm mb-4">{error}</p>
                <button
                  onClick={fetchTeachers}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoadingTeachers ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-24 bg-white rounded-2xl border border-neutral-200"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
              </div>
              <p className="text-base font-medium text-neutral-900">Loading teachers...</p>
              <p className="text-sm text-neutral-600 mt-1">Please wait</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <TeacherTable teachers={teachers} session={session} onDeleteSuccess={fetchTeachers} />
          </motion.div>
        )}
    </div>
  )
}
