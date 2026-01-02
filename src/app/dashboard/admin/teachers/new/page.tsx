'use client'

import { useRequireAdmin } from '@/hooks/useSession'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TeacherForm } from '@/components/admin/TeacherForm'
import { AuthErrorBanner } from '@/components/errors/AuthErrorBanner'
import { AuthLoadingState } from '@/components/auth/AuthLoadingState'
import { ArrowLeft, UserPlus, Shield } from 'lucide-react'

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
    </motion.div>
  )
}
