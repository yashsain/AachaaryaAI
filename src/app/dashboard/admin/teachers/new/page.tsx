'use client'

import { useRequireAdmin } from '@/hooks/useSession'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TeacherForm } from '@/components/admin/TeacherForm'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { AuthLoadingState } from '@/components/auth/AuthLoadingState'

export default function NewTeacherPage() {
  const { session, teacher, institute, loading, teacherLoading, loadingStage, loadingProgress, error: authError, retry, clearError, signOut } = useRequireAdmin()
  const router = useRouter()

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
                  Add New Teacher
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
              Fill in the details to create a new teacher account. The teacher will receive an invitation email to set their password.
            </p>
          </div>

          <TeacherForm
            mode="create"
            session={session}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </main>
    </div>
  )
}
