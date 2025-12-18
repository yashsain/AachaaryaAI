'use client'

import { useRequireAdmin } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, use } from 'react'
import { TeacherForm } from '@/components/admin/TeacherForm'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { AuthLoadingState } from '@/components/auth/AuthLoadingState'

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
  const { teacher, institute, loading, teacherLoading, loadingStage, loadingProgress, error: authError, retry, clearError, signOut } = useRequireAdmin()
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

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setFetchError('No active session')
          return
        }

        // Fetch teacher with subjects and classes
        const { data: teacherRecord, error: teacherFetchError } = await supabase
          .from('teachers')
          .select(`
            id,
            name,
            email,
            phone,
            role,
            teacher_subjects (
              subject_id
            ),
            teacher_classes (
              class_id
            )
          `)
          .eq('id', teacherId)
          .is('deleted_at', null)
          .single()

        if (teacherFetchError || !teacherRecord) {
          setFetchError('Teacher not found')
          return
        }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/admin/teachers"
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Teachers
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: institute.primary_color }}>
                  Edit Teacher
                </h1>
                <p className="text-sm text-gray-600">{institute.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{teacher.name}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Teacher Information</h2>
            <p className="text-sm text-gray-600 mt-1">
              Update teacher details, subjects, and class assignments.
            </p>
          </div>

          {fetchError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{fetchError}</p>
              <Link
                href="/dashboard/admin/teachers"
                className="mt-2 inline-block text-sm text-red-600 hover:text-red-700 underline"
              >
                Back to teachers list
              </Link>
            </div>
          )}

          {isLoadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-sm text-gray-600">Loading teacher data...</p>
              </div>
            </div>
          ) : teacherData ? (
            <TeacherForm
              mode="edit"
              teacherId={teacherId}
              initialData={teacherData}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          ) : null}
        </div>
      </main>
    </div>
  )
}
