import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary'
import { DashboardLayout as LayoutWrapper } from '@/components/layout/dashboard-layout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthErrorBoundary>
      <LayoutWrapper>{children}</LayoutWrapper>
    </AuthErrorBoundary>
  )
}
