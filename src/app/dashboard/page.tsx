'use client'

/**
 * Dashboard Page
 *
 * Main landing page after login
 * Uses AuthContext for session management
 * Shows institute-branded UI with teacher profile
 */

import { useRequireAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import Link from 'next/link'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'

export default function DashboardPage() {
  const { teacher, institute, loading, teacherLoading, error, retry, clearError, signOut } = useRequireAuth()

  // Show error screen if there's an auth error
  if (error) {
    return <AuthErrorBanner error={error} onRetry={retry} onDismiss={clearError} onSignOut={signOut} />
  }

  // Show loading state while auth is initializing
  if (loading || teacherLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-saffron border-r-transparent"></div>
          <p className="mt-4 text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Show fallback error if teacher or institute data is missing (shouldn't happen with new error system)
  if (!teacher || !institute) {
    console.error('[DashboardPage] Missing data - teacher:', !!teacher, 'institute:', !!institute)
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">Profile Not Found</h1>
          <p className="text-neutral-600 mb-6">
            Unable to load your teacher profile. Please contact your administrator.
          </p>
          <button
            onClick={() => signOut()}
            className="px-6 py-2 bg-brand-saffron text-white rounded-lg hover:bg-brand-saffron-dark transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50">
      {/* Header with Institute Branding */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Institute Branding */}
            <div className="flex items-center gap-4">
              <Image
                src={institute.logo_url || '/logo.png'}
                alt={`${institute.name} Logo`}
                width={50}
                height={33}
                className="rounded-lg"
              />
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ color: institute.primary_color }}
                >
                  {institute.name}
                </h1>
                <p className="text-xs text-neutral-500">
                  Powered by <span className="font-medium">aachaaryAI</span>
                </p>
              </div>
            </div>

            {/* User Info & Sign Out */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-neutral-800">{teacher.name}</p>
                <p className="text-sm text-neutral-600 capitalize">{teacher.role}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-brand-saffron transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Card with Institute Branding */}
        <div
          className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-l-4"
          style={{ borderLeftColor: institute.primary_color }}
        >
          <h2 className="text-3xl font-bold text-neutral-800 mb-2">
            Welcome back, {teacher.name.split(' ')[0]}!
          </h2>
          <p className="text-lg text-neutral-600 mb-1">
            Ready to generate some amazing test papers?
          </p>
          {institute.tagline && (
            <p className="text-sm text-neutral-500 italic mt-2">
              "{institute.tagline}"
            </p>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Test Paper - Institute Branded */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-neutral-100 hover:shadow-lg transition-shadow">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
              style={{
                background: `linear-gradient(to bottom right, ${institute.primary_color}, ${institute.primary_color}dd)`,
              }}
            >
              <span className="text-2xl text-white">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">Create Test Paper</h3>
            <p className="text-neutral-600 mb-4">
              Generate a new test paper with AI assistance
            </p>
            <button
              style={{ color: institute.primary_color }}
              className="font-medium transition-opacity hover:opacity-70"
            >
              Coming Soon →
            </button>
          </div>

          {/* Manage Study Materials */}
          <Link href="/dashboard/materials">
            <div className="bg-white rounded-xl shadow-md p-6 border border-neutral-100 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl text-white">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">Manage Study Materials</h3>
              <p className="text-neutral-600 mb-4">View, upload, and organize study materials</p>
              <span className="text-brand-blue hover:text-brand-blue-dark font-medium transition-colors">
                Open →
              </span>
            </div>
          </Link>

          {/* Question Bank */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-neutral-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-success to-success/80 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl text-white">💾</span>
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">Question Bank</h3>
            <p className="text-neutral-600 mb-4">Browse and manage generated questions</p>
            <button className="text-success hover:text-success/80 font-medium transition-colors">
              Coming Soon →
            </button>
          </div>

          {/* Admin Panel (Only for admins) */}
          {teacher.role === 'admin' && (
            <Link href="/dashboard/admin">
              <div className="bg-white rounded-xl shadow-md p-6 border border-neutral-100 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-warning to-warning/80 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl text-white">⚙️</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">Admin Panel</h3>
                <p className="text-neutral-600 mb-4">Manage teachers and institute settings</p>
                <span className="text-warning hover:text-warning/80 font-medium transition-colors">
                  Open →
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Stats Section */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-8 border border-neutral-100">
          <h3 className="text-xl font-semibold text-neutral-800 mb-6">Your Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p
                className="text-4xl font-bold mb-2"
                style={{ color: institute.primary_color }}
              >
                0
              </p>
              <p className="text-neutral-600">Test Papers Created</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-brand-blue mb-2">0</p>
              <p className="text-neutral-600">Questions Generated</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-success mb-2">0</p>
              <p className="text-neutral-600">Materials Uploaded</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-warning mb-2">0h</p>
              <p className="text-neutral-600">Time Saved</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
