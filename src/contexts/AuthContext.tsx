'use client'

/**
 * Authentication Context
 *
 * Thin React wrapper around the unified AuthStateManager.
 * Provides authentication state and methods throughout the application.
 *
 * All auth logic is now centralized in AuthStateManager:
 * - Session management
 * - Teacher profile fetching
 * - Institute data loading
 * - Operation deduplication
 * - Multi-tab synchronization
 * - Cookie sync validation
 * - JWT claim waiting (RLS fix)
 *
 * This context simply subscribes to state updates and exposes
 * them via React Context for component consumption.
 *
 * @module contexts/AuthContext
 */

import React, { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react'
import { authStateManager } from '@/lib/auth/stateManager'
import type { User, Session } from '@supabase/supabase-js'
import type { Teacher, Institute } from '@/types/database'
import type { AuthError, LoadingStage } from '@/lib/auth/types'

// ============================================================================
// Context Type
// ============================================================================

/**
 * Auth context interface
 * Matches the previous API for backward compatibility
 */
interface AuthContextType {
  // Core auth state
  user: User | null
  session: Session | null
  teacher: Teacher | null
  institute: Institute | null

  // State machine status
  status: 'INITIALIZING' | 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED' | 'ERROR'

  // Loading states
  loading: boolean
  teacherLoading: boolean
  loadingStage: LoadingStage | null
  loadingProgress: number // 0-100

  // Error state
  error: AuthError | null
  hasError: boolean

  // Quick access properties (derived)
  instituteId: string | null
  role: 'admin' | 'teacher' | null
  isAdmin: boolean

  // Methods
  signOut: () => Promise<void>
  refreshTeacher: () => Promise<void>
  clearError: () => void
  retry: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================================================
// Provider Component
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  // Subscribe to state manager (single source of truth)
  const [authState, setAuthState] = useState(authStateManager.getState())

  useEffect(() => {
    console.log('[AuthContext] Setting up subscription to StateManager')

    // Subscribe to state updates from manager
    const unsubscribe = authStateManager.subscribe((newState) => {
      console.log('[AuthContext] Received state update from StateManager')
      setAuthState(newState)
    })

    // Initialize auth system
    authStateManager.initialize()

    // Cleanup on unmount
    return () => {
      console.log('[AuthContext] Cleaning up subscription')
      unsubscribe()

      // FIX: Reset state manager in development for Strict Mode
      // Delay reset to ensure all operations complete
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          authStateManager.reset()
        }, 100)
      }
    }
  }, [])

  // Memoized context value (prevents unnecessary re-renders)
  const value = useMemo((): AuthContextType => {
    const isLoading = authState.status === 'INITIALIZING' || authState.status === 'LOADING'
    const isTeacherLoading = authState.loadingStage === 'TEACHER' || authState.loadingStage === 'INSTITUTE'

    return {
      // Core state (directly from manager)
      user: authState.user,
      session: authState.session,
      teacher: authState.teacher,
      institute: authState.institute,

      // State machine status
      status: authState.status,

      // Loading states
      loading: isLoading,
      teacherLoading: isTeacherLoading,
      loadingStage: authState.loadingStage,
      loadingProgress: authState.loadingProgress,

      // Error state
      error: authState.error,
      hasError: !!authState.error,

      // Derived properties (computed from state)
      instituteId: authState.teacher?.institute_id ?? null,
      role: authState.teacher?.role ?? null,
      isAdmin: authState.teacher?.role === 'admin',

      // Methods (delegate to state manager)
      signOut: () => authStateManager.signOut(),

      refreshTeacher: async () => {
        if (authState.user) {
          await authStateManager.fetchTeacher(authState.user.id, true) // force = true
        }
      },

      clearError: () => authStateManager.clearError(),

      retry: () => authStateManager.retry(),
    }
  }, [authState])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Use auth context
 *
 * @throws {Error} If used outside AuthProvider
 * @returns {AuthContextType} Auth context value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, teacher, signOut } = useAuth()
 *
 *   if (!user) {
 *     return <Login />
 *   }
 *
 *   return (
 *     <div>
 *       <h1>Welcome {teacher?.name}</h1>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

// Export types
export type { AuthContextType }
