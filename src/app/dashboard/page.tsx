'use client'

/**
 * Modern Dashboard Page
 *
 * Main landing page after login with modern Bento grid layout
 * Uses new navigation components from DashboardLayout
 */

import { useRequireSession } from '@/hooks/useSession'
import { FileText, Upload, Clock, Users, TrendingUp, BookOpen } from 'lucide-react'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { StatsCard } from '@/components/dashboard/stats-card'
import { QuickActionCard } from '@/components/dashboard/quick-action-card'

export default function DashboardPage() {
  const { session, teacher, institute, loading, teacherLoading, error, retry, clearError, signOut } = useRequireSession()

  // Show error screen if there's an auth error
  if (error) {
    return <AuthErrorBanner error={error} onRetry={retry} onDismiss={clearError} onSignOut={signOut} />
  }

  // Show loading state while auth is initializing
  if (loading || teacherLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  // Show fallback error if teacher or institute data is missing
  if (!teacher || !institute) {
    console.error('[DashboardPage] Missing data - teacher:', !!teacher, 'institute:', !!institute)
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">Profile Not Found</h1>
          <p className="text-neutral-600 mb-6">
            Unable to load your teacher profile. Please contact your administrator.
          </p>
        </div>
      </div>
    )
  }

  const firstName = teacher.name.split(' ')[0]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-neutral-900">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-lg text-neutral-600">
          Here's what's happening with your test papers today.
        </p>
      </div>

      {/* Stats Grid - Bento Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Test Papers Created"
          value={0}
          icon={FileText}
          trend={{ value: 12, direction: 'up' }}
          delay={0}
        />
        <StatsCard
          title="Questions Generated"
          value={0}
          icon={TrendingUp}
          trend={{ value: 8, direction: 'up' }}
          delay={0.1}
        />
        <StatsCard
          title="Materials Uploaded"
          value={0}
          icon={Upload}
          trend={{ value: 15, direction: 'up' }}
          delay={0.2}
        />
        <StatsCard
          title="Time Saved"
          value={0}
          unit="hrs"
          icon={Clock}
          trend={{ value: 20, direction: 'up' }}
          delay={0.3}
        />
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-neutral-900">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="Create Test Paper"
            description="Generate a new test paper with AI assistance in minutes"
            icon={FileText}
            href="/dashboard/test-papers"
            variant="primary"
            delay={0.4}
          />
          <QuickActionCard
            title="Manage Materials"
            description="View, upload, and organize your study materials"
            icon={BookOpen}
            href="/dashboard/materials"
            variant="success"
            delay={0.5}
          />
          {teacher.role === 'admin' && (
            <QuickActionCard
              title="Admin Panel"
              description="Manage teachers and institute settings"
              icon={Users}
              href="/dashboard/admin"
              variant="warning"
              delay={0.6}
              badge="Admin"
            />
          )}
        </div>
      </div>
    </div>
  )
}
