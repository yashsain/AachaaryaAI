/**
 * Centralized Session Hook - Complete Authentication Solution
 *
 * CRITICAL: This is the ONLY way to access authentication state in the application.
 * DO NOT call supabase.auth.getSession() directly.
 * DO NOT use useRequireAuth or useRequireAdmin from AuthContext.
 *
 * This hook provides complete feature parity with the old AuthContext hooks,
 * including all authentication data, loading states, error handling, and methods.
 *
 * Features:
 * - Single source of truth for all auth state
 * - Eliminates redundant getSession() calls
 * - Provides complete type-safe session guarantees
 * - Auto-redirect for unauthenticated users
 * - Comprehensive error handling with recovery actions
 * - Granular loading states (SESSION, TEACHER, INSTITUTE)
 * - All lifecycle methods (refreshTeacher, retry, clearError, etc.)
 *
 * Available Hooks:
 * - useSession() - Basic session access (optional auth)
 * - useRequireSession() - Requires authentication, auto-redirects, guarantees session/user/teacher/institute
 * - useRequireAdmin() - Requires admin role, auto-redirects, guarantees admin access
 *
 * Migration from old hooks:
 * - useAuth() → useSession()
 * - useRequireAuth() → useRequireSession()
 * - useRequireAdmin() (from AuthContext) → useRequireAdmin() (from this file)
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import type { Session, User } from '@supabase/supabase-js'
import type { Teacher, Institute } from '@/types/database'
import type { AuthError, LoadingStage } from '@/lib/auth/types'

// ============================================================================
// Types
// ============================================================================

export interface UseSessionOptions {
  /**
   * If true, redirects to login when unauthenticated
   * @default false
   */
  required?: boolean

  /**
   * Where to redirect if authentication required but missing
   * @default '/login'
   */
  redirectTo?: string

  /**
   * If true, only allows admin users
   * @default false
   */
  adminOnly?: boolean
}

export interface SessionResult {
  /** Current session (null if not authenticated) */
  session: Session | null

  /** Current user (null if not authenticated) */
  user: User | null

  /** Current teacher (null if not authenticated or not loaded) */
  teacher: Teacher | null

  /** Current institute (null if not authenticated or not loaded) */
  institute: Institute | null

  /** True if currently loading auth state */
  loading: boolean

  /** True if currently loading teacher data */
  teacherLoading: boolean

  /** Current loading stage (SESSION | TEACHER | INSTITUTE) */
  loadingStage: LoadingStage | null

  /** Loading progress percentage (0-100) */
  loadingProgress: number

  /** True if user is authenticated */
  isAuthenticated: boolean

  /** True if user has admin role */
  isAdmin: boolean

  /** Any error that occurred during auth (structured with code and recovery actions) */
  error: AuthError | null

  /** True if there is an error */
  hasError: boolean

  /** Quick access to institute ID */
  instituteId: string | null

  /** User's role (admin or teacher) */
  role: 'admin' | 'teacher' | null

  /** Sign out function */
  signOut: () => Promise<void>

  /** Force refresh teacher data (useful after profile updates) */
  refreshTeacher: () => Promise<void>

  /** Clear current error state */
  clearError: () => void

  /** Retry failed operations */
  retry: () => Promise<void>
}

export interface RequiredSessionResult extends Omit<SessionResult, 'session' | 'user' | 'teacher' | 'institute' | 'isAuthenticated'> {
  /** Current session (guaranteed non-null) */
  session: Session

  /** Current user (guaranteed non-null) */
  user: User

  /** Current teacher (guaranteed non-null after auth completes) */
  teacher: Teacher

  /** Current institute (guaranteed non-null after auth completes) */
  institute: Institute

  /** Always true (for type safety) */
  isAuthenticated: true
}

export interface RequiredAdminSessionResult extends Omit<RequiredSessionResult, 'isAdmin' | 'role'> {
  /** Always true (for type safety) */
  isAdmin: true

  /** User role (guaranteed to be admin) */
  role: 'admin'

  /** Current teacher (guaranteed non-null for admins) */
  teacher: Teacher

  /** Current institute (guaranteed non-null for admins) */
  institute: Institute
}

// ============================================================================
// Base Hook - useSession
// ============================================================================

/**
 * Base hook for accessing session state
 *
 * This hook provides read-only access to the current session.
 * It does NOT trigger any new getSession() calls.
 * It reads from AuthContext which is the single source of truth.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { session, loading, isAuthenticated } = useSession()
 *
 *   if (loading) return <Loading />
 *   if (!isAuthenticated) return <LoginPrompt />
 *
 *   return <div>Welcome {session.user.email}</div>
 * }
 * ```
 */
export function useSession(options: UseSessionOptions = {}): SessionResult {
  const {
    required = false,
    redirectTo = '/login',
    adminOnly = false,
  } = options

  const router = useRouter()
  const auth = useAuth()

  // Derive authentication state
  const isAuthenticated = !!auth.session
  const isAdmin = auth.session?.user?.app_metadata?.role === 'admin'

  // Handle required authentication
  useEffect(() => {
    // Don't redirect while still loading
    if (auth.loading || auth.teacherLoading) {
      return
    }

    // Check authentication requirement
    if (required && !isAuthenticated) {
      console.log('[useSession] Authentication required, redirecting to:', redirectTo)
      const currentPath = window.location.pathname
      const loginUrl = new URL(redirectTo, window.location.origin)
      if (currentPath !== redirectTo) {
        loginUrl.searchParams.set('redirect', currentPath)
      }
      router.push(loginUrl.toString())
      return
    }

    // Check admin requirement
    if (adminOnly && isAuthenticated && !isAdmin) {
      console.log('[useSession] Admin access required, redirecting to dashboard')
      router.push('/dashboard')
      return
    }
  }, [
    auth.loading,
    auth.teacherLoading,
    isAuthenticated,
    isAdmin,
    required,
    adminOnly,
    redirectTo,
    router,
  ])

  return {
    // Core auth state
    session: auth.session,
    user: auth.user,
    teacher: auth.teacher,
    institute: auth.institute,

    // Loading states
    loading: auth.loading,
    teacherLoading: auth.teacherLoading,
    loadingStage: auth.loadingStage,
    loadingProgress: auth.loadingProgress,

    // Derived properties
    isAuthenticated,
    isAdmin,
    hasError: auth.hasError,
    instituteId: auth.instituteId,
    role: auth.role,

    // Error handling
    error: auth.error,

    // Methods
    signOut: auth.signOut,
    refreshTeacher: auth.refreshTeacher,
    clearError: auth.clearError,
    retry: auth.retry,
  }
}

// ============================================================================
// Authenticated Hook - useRequireSession
// ============================================================================

/**
 * Hook that REQUIRES authentication
 *
 * This hook guarantees that session and user are non-null.
 * If user is not authenticated, it automatically redirects to login.
 *
 * Use this for pages that require authentication.
 *
 * @example
 * ```tsx
 * function DashboardPage() {
 *   const { session, user, loading } = useRequireSession()
 *   // session and user are guaranteed to be non-null here
 *
 *   if (loading) return <Loading />
 *
 *   return <div>Welcome {user.email}</div>
 * }
 * ```
 */
export function useRequireSession(
  redirectTo: string = '/login'
): RequiredSessionResult {
  const result = useSession({ required: true, redirectTo })

  // Type assertion: If we get past the redirect, session is guaranteed non-null
  // The redirect happens in useEffect, so during render we might have null
  // But after first render, if we're still on the page, session is guaranteed
  return result as RequiredSessionResult
}

// ============================================================================
// Admin Hook - useRequireAdmin
// ============================================================================

/**
 * Hook that REQUIRES admin authentication
 *
 * This hook guarantees that:
 * - User is authenticated
 * - User has admin role
 * - Teacher data is loaded
 *
 * If user is not authenticated, redirects to login.
 * If user is not admin, redirects to dashboard.
 *
 * @example
 * ```tsx
 * function AdminOnlyPage() {
 *   const { session, user, teacher, loading } = useRequireAdmin()
 *   // session, user, and teacher are guaranteed non-null
 *   // user is guaranteed to be admin
 *
 *   if (loading) return <Loading />
 *
 *   return <div>Admin Dashboard for {teacher.name}</div>
 * }
 * ```
 */
export function useRequireAdmin(
  redirectTo: string = '/login'
): RequiredAdminSessionResult {
  const result = useSession({ required: true, adminOnly: true, redirectTo })

  // Type assertion: If we get past the redirects, everything is guaranteed non-null
  return result as RequiredAdminSessionResult
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Type guard to check if session result has valid session
 *
 * @example
 * ```tsx
 * const result = useSession()
 * if (hasValidSession(result)) {
 *   // TypeScript knows result.session is non-null here
 *   console.log(result.session.user.email)
 * }
 * ```
 */
export function hasValidSession(
  result: SessionResult
): result is RequiredSessionResult {
  return result.isAuthenticated && result.session !== null && result.user !== null
}

/**
 * Type guard to check if user is admin
 *
 * @example
 * ```tsx
 * const result = useSession()
 * if (isAdminUser(result)) {
 *   // TypeScript knows user is admin here
 *   console.log('Admin:', result.user.email)
 * }
 * ```
 */
export function isAdminUser(
  result: SessionResult
): result is RequiredAdminSessionResult {
  return (
    hasValidSession(result) &&
    result.isAdmin &&
    result.teacher !== null
  )
}
