'use client'

import { useRequireAdmin } from '@/contexts/AuthContext'
import Link from 'next/link'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { AuthLoadingState } from '@/components/auth/AuthLoadingState'

export default function AdminDashboardPage() {
  const { teacher, institute, loading, teacherLoading, loadingStage, loadingProgress, error: authError, retry, clearError, signOut } = useRequireAdmin()

  // Show error screen if there's an auth error
  if (authError) {
    return <AuthErrorBanner error={authError} onRetry={retry} onDismiss={clearError} onSignOut={signOut} />
  }

  // Show loading state while checking authentication and admin role
  if (loading || teacherLoading || !teacher || !institute) {
    return <AuthLoadingState stage={loadingStage} progress={loadingProgress} message="Loading admin panel..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: institute.primary_color }}>
                  Admin Panel
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Teacher Management Card */}
          <Link
            href="/dashboard/admin/teachers"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-2 border-transparent hover:border-gray-200"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-4" style={{ backgroundColor: `${institute.primary_color}20` }}>
              <svg className="w-6 h-6" style={{ color: institute.primary_color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Teachers</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add, edit, or remove teacher accounts for your institute
            </p>
            <div className="flex items-center text-sm font-medium" style={{ color: institute.primary_color }}>
              Open →
            </div>
          </Link>

          {/* Institute Settings Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100 opacity-60">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Institute Settings</h3>
            <p className="text-sm text-gray-600 mb-4">
              Update branding, contact info, and subscription details
            </p>
            <div className="text-sm text-gray-400">
              Coming Soon →
            </div>
          </div>

          {/* Classes & Streams Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100 opacity-60">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Classes & Streams</h3>
            <p className="text-sm text-gray-600 mb-4">
              Manage classes, streams, and subjects for your institute
            </p>
            <div className="text-sm text-gray-400">
              Coming Soon →
            </div>
          </div>

          {/* Reports & Analytics Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100 opacity-60">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports & Analytics</h3>
            <p className="text-sm text-gray-600 mb-4">
              View usage statistics and performance metrics
            </p>
            <div className="text-sm text-gray-400">
              Coming Soon →
            </div>
          </div>

          {/* Storage Management Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100 opacity-60">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Storage Management</h3>
            <p className="text-sm text-gray-600 mb-4">
              Monitor and manage file storage usage
            </p>
            <div className="text-sm text-gray-400">
              Coming Soon →
            </div>
          </div>

          {/* Subscription & Billing Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100 opacity-60">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Subscription & Billing</h3>
            <p className="text-sm text-gray-600 mb-4">
              Manage your subscription plan and billing details
            </p>
            <div className="text-sm text-gray-400">
              Coming Soon →
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Institute Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-400">-</div>
              <div className="text-sm text-gray-600 mt-1">Total Teachers</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-400">-</div>
              <div className="text-sm text-gray-600 mt-1">Active Classes</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-400">-</div>
              <div className="text-sm text-gray-600 mt-1">Test Papers</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold" style={{ color: institute.primary_color }}>
                {institute.subscription_status.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600 mt-1">Subscription</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
