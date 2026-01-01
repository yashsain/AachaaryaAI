import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthErrorBoundary>
      {children}
    </AuthErrorBoundary>
  )
}
