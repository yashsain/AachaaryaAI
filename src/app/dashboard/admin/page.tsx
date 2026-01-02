'use client'

import { useRequireAdmin } from '@/hooks/useSession'
import { motion } from 'framer-motion'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { AuthLoadingState } from '@/components/auth/AuthLoadingState'
import {
  Users,
  Settings,
  Building2,
  BarChart3,
  Database,
  CreditCard,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

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
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Management Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Teacher Management Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link
                href="/dashboard/admin/teachers"
                className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-neutral-200 hover:border-primary-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">Manage Teachers</h3>
                  <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                    Add, edit, or remove teacher accounts for your institute
                  </p>
                  <div className="flex items-center text-sm font-semibold text-primary-600 group-hover:gap-2 gap-1 transition-all">
                    <span>Open</span>
                    <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Institute Settings Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm p-8 border border-neutral-200"
            >
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-md">
                  Coming Soon
                </span>
              </div>
              <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
                <Settings className="h-7 w-7 text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Institute Settings</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Update branding, contact info, and subscription details
              </p>
            </motion.div>

            {/* Classes & Streams Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="relative bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm p-8 border border-neutral-200"
            >
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-md">
                  Coming Soon
                </span>
              </div>
              <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
                <Building2 className="h-7 w-7 text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Classes & Streams</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Manage classes, streams, and subjects for your institute
              </p>
            </motion.div>

            {/* Reports & Analytics Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="relative bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm p-8 border border-neutral-200"
            >
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-md">
                  Coming Soon
                </span>
              </div>
              <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 className="h-7 w-7 text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Reports & Analytics</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                View usage statistics and performance metrics
              </p>
            </motion.div>

            {/* Storage Management Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="relative bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm p-8 border border-neutral-200"
            >
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-md">
                  Coming Soon
                </span>
              </div>
              <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
                <Database className="h-7 w-7 text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Storage Management</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Monitor and manage file storage usage
              </p>
            </motion.div>

            {/* Subscription & Billing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="relative bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm p-8 border border-neutral-200"
            >
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-md">
                  Coming Soon
                </span>
              </div>
              <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
                <CreditCard className="h-7 w-7 text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Subscription & Billing</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Manage your subscription plan and billing details
              </p>
            </motion.div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-white rounded-2xl shadow-sm p-8 border border-neutral-200"
      >
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Institute Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-xl border border-neutral-200">
            <div className="text-3xl font-bold text-neutral-400 mb-1">-</div>
            <div className="text-sm font-medium text-neutral-600">Total Teachers</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-xl border border-neutral-200">
            <div className="text-3xl font-bold text-neutral-400 mb-1">-</div>
            <div className="text-sm font-medium text-neutral-600">Active Classes</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-xl border border-neutral-200">
            <div className="text-3xl font-bold text-neutral-400 mb-1">-</div>
            <div className="text-sm font-medium text-neutral-600">Test Papers</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl border border-primary-200">
            <div className="text-3xl font-bold text-primary-600 mb-1">
              {institute.subscription_status.toUpperCase()}
            </div>
            <div className="text-sm font-medium text-primary-700">Subscription</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
