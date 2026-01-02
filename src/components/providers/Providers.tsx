/**
 * Client-side Providers Wrapper
 *
 * Wraps the app with all necessary providers including error boundaries
 * This is a client component that can be used in the server-side layout
 */

'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components/errors/ErrorBoundary'
import { Toaster } from '@/components/ui/toast'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  )
}
