'use client'

import { useRequireAdmin } from '@/hooks/useSession'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, use } from 'react'
import { motion } from 'framer-motion'
import { TeacherForm } from '@/components/admin/TeacherForm'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { AuthLoadingState } from '@/components/auth/AuthLoadingState'
import { ArrowLeft, Edit2, AlertCircle, Loader2 } from 'lucide-react'

interface TeacherData {
  name: string
  email: string
  phone?: string
  role: 'teacher' | 'admin'
  subject_ids: string[]
  class_ids: string[]
}

export default function EditTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: teacherId } = use(params)
  const { session, teacher, institute, loading, teacherLoading, loadingStage, loadingProgress, error: authError, retry, clearError, signOut } = useRequireAdmin()
  const router = useRouter()

  const [teacherData, setTeacherData] = useState<TeacherData | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [fetchError, setFetchError] = useState('')

  // Fetch teacher data
  useEffect(() => {
    async function fetchTeacherData() {
      try {
        setIsLoadingData(true)
        setFetchError('')

        // Using centralized session (no redundant getSession call)
        if (!session) {
          setFetchError('No active session')
          return
        }

        // Fetch teacher via API route
        const response = await fetch(`/api/admin/teachers/${teacherId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        })

        if (!response.ok) {
          const data = await response.json()
          setFetchError(data.error || 'Teacher not found')
          return
        }

        const { teacher: teacherRecord } = await response.json()

        // Transform data for form
        const formData: TeacherData = {
          name: teacherRecord.name,
          email: teacherRecord.email,
          phone: teacherRecord.phone || '',
          role: teacherRecord.role as 'teacher' | 'admin',
          subject_ids: teacherRecord.teacher_subjects?.map((ts: any) => ts.subject_id) || [],
          class_ids: teacherRecord.teacher_classes?.map((tc: any) => tc.class_id) || [],
        }

        setTeacherData(formData)
      } catch (err) {
        console.error('Error fetching teacher:', err)
        setFetchError('Failed to load teacher data')
      } finally {
        setIsLoadingData(false)
      }
    }

    if (teacher) {
      fetchTeacherData()
    }
  }, [teacher, teacherId])

  const handleSuccess = () => {
    router.push('/dashboard/admin/teachers')
  }

  const handleCancel = () => {
    router.push('/dashboard/admin/teachers')
  }

  // Show error screen if there's an auth error
  if (authError) {
    return <AuthErrorBanner error={authError} onRetry={retry} onDismiss={clearError} onSignOut={signOut} />
  }

  // Show loading state while checking authentication and admin role
  if (loading || teacherLoading || !teacher || !institute) {
    return <AuthLoadingState stage={loadingStage} progress={loadingProgress} message="Loading..." />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-neutral-200">
          <div className="mb-8 space-y-2">
            <h2 className="text-2xl font-bold text-neutral-900">Teacher Information</h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Update teacher details, subjects, and class assignments.
            </p>
          </div>

          {fetchError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-error-50 border border-error-200 rounded-2xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-error-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-error-900 mb-1">Error Loading Teacher</h3>
                  <p className="text-error-700 text-sm mb-4">{fetchError}</p>
                  <Link
                    href="/dashboard/admin/teachers"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors text-sm font-medium"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Teachers List
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {isLoadingData ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                </div>
                <p className="text-base font-medium text-neutral-900">Loading teacher data...</p>
                <p className="text-sm text-neutral-600 mt-1">Please wait</p>
              </div>
            </div>
          ) : teacherData ? (
            <TeacherForm
              mode="edit"
              session={session}
              teacherId={teacherId}
              initialData={teacherData}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          ) : null}
      </div>
    </motion.div>
  )
}
