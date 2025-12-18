'use client'

import { useRequireAdmin } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { TeacherTable } from '@/components/admin/TeacherTable'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { AuthLoadingState } from '@/components/auth/AuthLoadingState'

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
  const { teacher, institute, loading, teacherLoading, loadingStage, loadingProgress, error: authError, retry, clearError, signOut } = useRequireAdmin()

  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true)
  const [error, setError] = useState('')

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      setIsLoadingTeachers(true)
      setError('')

      const { data: { session } } = await supabase.auth.getSession()
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/admin"
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Admin Panel
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: institute.primary_color }}>
                  Manage Teachers
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-600">
              Manage teacher accounts and permissions
            </p>
          </div>
          <Link href="/dashboard/admin/teachers/new">
            <Button variant="primary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Teacher
            </Button>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={fetchTeachers}
              className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoadingTeachers ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600">Loading teachers...</p>
            </div>
          </div>
        ) : (
          <TeacherTable teachers={teachers} onDeleteSuccess={fetchTeachers} />
        )}
      </main>
    </div>
  )
}
