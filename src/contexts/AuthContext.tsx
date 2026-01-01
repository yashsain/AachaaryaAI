'use client'

/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the application
 * Manages:
 * - Current user session
 * - Teacher profile data
 * - Institute information
 * - Sign in/out methods
 *
 * Features:
 * - Session persistence via localStorage
 * - Automatic token refresh
 * - Request deduplication to prevent race conditions
 * - Memoized derived values for performance
 */

import { createContext, useContext, useEffect, useState, useMemo, useRef, type ReactNode } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Teacher, Institute } from '@/types/database'
import { AuthError, AuthErrorCode, LoadingStage } from '@/lib/auth/types'
import { AuthErrorService } from '@/lib/auth/errorService'
import { AuthRetryService } from '@/lib/auth/retryService'

// Create singleton Supabase client
const supabase = createBrowserClient()

interface AuthContextType {
  // Core auth state
  user: User | null
  session: Session | null
  teacher: Teacher | null
  institute: Institute | null

  // Loading states
  loading: boolean
  teacherLoading: boolean
  loadingStage: LoadingStage | null
  loadingProgress: number // 0-100

  // Error state
  error: AuthError | null
  hasError: boolean

  // Quick access properties
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

export function AuthProvider({ children }: { children: ReactNode }) {
  // Session state
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Teacher and institute state
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [institute, setInstitute] = useState<Institute | null>(null)
  const [teacherLoading, setTeacherLoading] = useState(false)

  // Loading progress state
  const [loadingStage, setLoadingStage] = useState<LoadingStage | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Error state
  const [error, setError] = useState<AuthError | null>(null)

  // Pending auth event: Queues auth state changes to be processed asynchronously
  // This prevents blocking onAuthStateChange callback with async operations (RLS fix)
  const [pendingAuthEvent, setPendingAuthEvent] = useState<{
    event: string
    userId: string
    session: Session
  } | null>(null)

  // Request deduplication: Track ongoing teacher fetch requests
  const fetchingTeacherRef = useRef<string | null>(null)
  const fetchTeacherPromiseRef = useRef<Promise<void> | null>(null)

  // Session recovery flag: Prevent duplicate fetches during initial load
  const initialLoadCompleteRef = useRef(false)

  // Track teacher state in ref for use in callbacks
  const teacherRef = useRef<Teacher | null>(null)

  // Timeout protection: Clear stuck loading states
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sync teacher ref with state
  useEffect(() => {
    teacherRef.current = teacher
  }, [teacher])

  // Timeout protection moved to TimeoutCoordinator (Phase 2.1)
  // Old 30s timeout removed - now using unified 45s timeout via timeoutCoordinator.withTimeout()

  // Memoized derived properties for performance
  const instituteId = useMemo(() => teacher?.institute_id || null, [teacher?.institute_id])
  const role = useMemo(() => teacher?.role || null, [teacher?.role])
  const isAdmin = useMemo(() => role === 'admin', [role])

  /**
   * Ensure JWT has custom claims before making RLS queries
   *
   * PROBLEM: JWT custom_access_token_hook queries teachers table to add claims
   * But RLS policies check JWT claims that don't exist yet → circular dependency
   *
   * SOLUTION: Wait for JWT to have required claims before querying teachers table
   * This prevents RLS queries from hanging while waiting for claims
   *
   * @param session - Current session with JWT
   * @param maxWaitMs - Maximum time to wait (default 5000ms)
   * @returns true if JWT has claims, false if timeout
   */
  async function ensureJWTReady(session: Session | null, maxWaitMs = 5000): Promise<boolean> {
    if (!session) return false

    const startTime = Date.now()
    const checkInterval = 200 // Check every 200ms

    while (Date.now() - startTime < maxWaitMs) {
      // Check if JWT has app_metadata.role claim
      const { data: { user } } = await supabase.auth.getUser()
      const hasRoleClaim = user?.app_metadata?.role || user?.app_metadata?.app_role

      if (hasRoleClaim) {
        console.log('[AuthContext] JWT ready with role claim:', hasRoleClaim)
        return true
      }

      console.log('[AuthContext] Waiting for JWT claims... (elapsed:', Date.now() - startTime, 'ms)')
      await new Promise(resolve => setTimeout(resolve, checkInterval))
    }

    console.warn('[AuthContext] JWT claims not ready after', maxWaitMs, 'ms - proceeding anyway')
    return false
  }

  // Fetch teacher profile with request deduplication and retry logic
  async function fetchTeacher(userId: string, force = false) {
    console.log('[AuthContext] fetchTeacher called:', userId, 'force:', force, 'currently fetching:', fetchingTeacherRef.current)

    // Guard: Validate userId is a valid string
    if (!userId || typeof userId !== 'string' || userId === 'undefined') {
      console.error('[AuthContext] Invalid userId passed to fetchTeacher:', userId)
      return
    }

    // Request deduplication: If already fetching for same user, return existing promise
    if (!force && fetchingTeacherRef.current === userId && fetchTeacherPromiseRef.current) {
      console.log('[AuthContext] Returning existing fetch promise')
      return fetchTeacherPromiseRef.current
    }

    // Mark as fetching this user
    fetchingTeacherRef.current = userId
    setTeacherLoading(true)
    setLoadingStage('TEACHER')
    setLoadingProgress(33) // 33% - session done, now fetching teacher

    const fetchPromise = (async () => {
      try {
        console.log('[AuthContext] Fetching teacher from database with retry logic:', userId)

        // Fetch teacher with retry
        const { data: teacherData, error: teacherError } = await AuthRetryService.withNetworkAwareRetry(
          async () => {
            return await supabase
              .from('teachers')
              .select('*')
              .eq('id', userId)
              .is('deleted_at', null)
              .single()
          },
          {
            maxAttempts: 3,
            onRetry: (attempt, error) => {
              console.log(`[AuthContext] Retrying teacher fetch (attempt ${attempt})`, error.message)
            },
          }
        )

        if (teacherError) {
          console.error('[AuthContext] Error fetching teacher:', teacherError)

          // Create appropriate error
          const authError = AuthErrorService.createError(
            AuthErrorCode.TEACHER_FETCH_FAILED,
            teacherError,
            { userId }
          )
          AuthErrorService.logError(authError)
          setError(authError)
          setTeacher(null)
          setInstitute(null)
          return
        }

        if (!teacherData) {
          console.error('[AuthContext] Teacher not found')
          const authError = AuthErrorService.createTeacherNotFoundError(userId)
          AuthErrorService.logError(authError)
          setError(authError)
          setTeacher(null)
          setInstitute(null)
          return
        }

        console.log('[AuthContext] Teacher data fetched:', teacherData.name)
        const teacherObj = teacherData as Teacher
        setTeacher(teacherObj)
        teacherRef.current = teacherObj
        setLoadingProgress(66) // 66% - teacher done, now fetching institute

        // Fetch institute data
        if (teacherData.institute_id) {
          console.log('[AuthContext] Fetching institute:', teacherData.institute_id)
          setLoadingStage('INSTITUTE')

          const { data: instituteData, error: instituteError } = await AuthRetryService.withNetworkAwareRetry(
            async () => {
              return await supabase
                .from('institutes')
                .select('*')
                .eq('id', teacherData.institute_id)
                .single()
            },
            {
              maxAttempts: 3,
              onRetry: (attempt, error) => {
                console.log(`[AuthContext] Retrying institute fetch (attempt ${attempt})`, error.message)
              },
            }
          )

          if (instituteError) {
            console.error('[AuthContext] Error fetching institute:', instituteError)
            const authError = AuthErrorService.createError(
              AuthErrorCode.INSTITUTE_FETCH_FAILED,
              instituteError,
              { instituteId: teacherData.institute_id }
            )
            AuthErrorService.logError(authError)
            setError(authError)
            setInstitute(null)
          } else if (!instituteData) {
            console.error('[AuthContext] Institute not found')
            const authError = AuthErrorService.createInstituteNotFoundError(teacherData.institute_id)
            AuthErrorService.logError(authError)
            setError(authError)
            setInstitute(null)
          } else {
            console.log('[AuthContext] Institute data fetched:', instituteData.name)
            setInstitute(instituteData as Institute)
            setLoadingProgress(100) // 100% - complete
          }
        }
      } catch (error) {
        console.error('[AuthContext] Unexpected error fetching teacher:', error)

        // Create error from exception
        const authError = AuthErrorService.fromError(error, AuthErrorCode.TEACHER_FETCH_FAILED, { userId })
        AuthErrorService.logError(authError)
        setError(authError)
        setTeacher(null)
        setInstitute(null)
        teacherRef.current = null
      } finally {
        console.log('[AuthContext] fetchTeacher complete, setting teacherLoading=false')
        setTeacherLoading(false)
        setLoadingStage(null)
        setLoadingProgress(0)
        fetchingTeacherRef.current = null
        fetchTeacherPromiseRef.current = null
      }
    })()

    fetchTeacherPromiseRef.current = fetchPromise
    return fetchPromise
  }

  // Refresh teacher data (useful after profile updates)
  // Force flag bypasses deduplication cache
  async function refreshTeacher() {
    if (user?.id) {
      clearError() // Clear any previous errors
      await fetchTeacher(user.id, true)
    }
  }

  // Clear error state
  function clearError() {
    console.log('[AuthContext] Clearing error state')
    setError(null)
  }

  // Retry last failed operation
  async function retry() {
    console.log('[AuthContext] Retry requested')
    clearError()

    // If we have a user but no teacher, retry fetching teacher
    if (user?.id && !teacher) {
      console.log('[AuthContext] Retrying teacher fetch')
      await fetchTeacher(user.id, true)
      return
    }

    // Otherwise, reinitialize auth
    console.log('[AuthContext] Retrying auth initialization')
    setLoading(true)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      const authError = AuthErrorService.createError(
        AuthErrorCode.SESSION_FETCH_FAILED,
        sessionError || undefined,
        {}
      )
      AuthErrorService.logError(authError)
      setError(authError)
      setLoading(false)
      return
    }

    setSession(session)
    setUser(session.user)

    if (session.user) {
      await fetchTeacher(session.user.id)
    }

    setLoading(false)
  }

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('[AuthContext] Initializing auth...')

        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mounted) {
          console.log('[AuthContext] Component unmounted, aborting initialization')
          return
        }

        if (error) {
          console.error('[AuthContext] Error getting session:', error)
          setSession(null)
          setUser(null)
          setLoading(false)
          return
        }

        console.log('[AuthContext] Session retrieved:', session?.user?.id || 'no session')
        setSession(session)
        setUser(session?.user ?? null)

        // Fetch teacher data if we have a session
        if (session?.user) {
          console.log('[AuthContext] Fetching teacher data for user:', session.user.id)
          await fetchTeacher(session.user.id)
        }

        // Mark initial load as complete
        initialLoadCompleteRef.current = true
        console.log('[AuthContext] Initialization complete, setting loading=false')
        setLoading(false)
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) {
        console.log('[AuthContext] onAuthStateChange called but component unmounted, ignoring')
        return
      }

      console.log('[AuthContext] Auth state change - event:', event, 'user:', session?.user?.id, 'initialLoadComplete:', initialLoadCompleteRef.current)

      // Skip duplicate INITIAL_SESSION after we've already initialized
      if (event === 'INITIAL_SESSION' && initialLoadCompleteRef.current) {
        console.log('[AuthContext] Skipping duplicate INITIAL_SESSION - already initialized')
        return
      }

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        console.log('[AuthContext] Session exists, checking if need to fetch teacher data')

        // Fetch teacher data if:
        // 1. We don't have teacher data yet (use ref for current value), OR
        // 2. Token was refreshed (need to ensure permissions are current), OR
        // 3. User profile was updated in Supabase Auth
        //
        // NOTE: We do NOT refetch on SIGNED_IN because it's just a confirmation event,
        // not a data-changing event. This prevents unnecessary loading spinners.
        const hasTeacherData = teacherRef.current !== null
        const shouldFetchTeacher =
          !hasTeacherData ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED'

        console.log('[AuthContext] Should fetch teacher?', shouldFetchTeacher, '(hasTeacherData:', hasTeacherData, 'teacher:', teacherRef.current?.name || 'none', 'event:', event, ')')

        if (shouldFetchTeacher) {
          console.log('[AuthContext] Queuing teacher fetch for event:', event)
          // CRITICAL FIX: Don't call fetchTeacher directly (causes RLS circular dependency)
          // Instead, queue the event to be processed asynchronously in a useEffect
          // This prevents blocking the onAuthStateChange callback
          setPendingAuthEvent({
            event,
            userId: session.user.id,
            session
          })
        } else {
          console.log('[AuthContext] Skipping teacher fetch - already have data for event:', event)
        }
      } else {
        // Clear data on sign out
        console.log('[AuthContext] No session - clearing auth data')
        setTeacher(null)
        setInstitute(null)
        teacherRef.current = null
        fetchingTeacherRef.current = null
        fetchTeacherPromiseRef.current = null
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Process pending auth events asynchronously
  // This is the RLS circular dependency fix - we process auth events in a separate effect
  // instead of blocking the onAuthStateChange callback with async operations
  useEffect(() => {
    if (!pendingAuthEvent) return

    const processPendingEvent = async () => {
      console.log('[AuthContext] Processing pending auth event:', pendingAuthEvent.event)

      try {
        // CRITICAL FIX: Ensure JWT has claims before making RLS queries
        // This prevents the circular dependency:
        // 1. JWT hook queries teachers table for claims
        // 2. RLS policy checks JWT claims that don't exist yet
        // 3. Query hangs waiting for claims → 45s timeout
        console.log('[AuthContext] Ensuring JWT is ready before fetching teacher...')
        await ensureJWTReady(pendingAuthEvent.session)

        // Now fetch teacher data - JWT should have claims, so RLS won't hang
        console.log('[AuthContext] JWT ready, fetching teacher data')
        await fetchTeacher(pendingAuthEvent.userId)
        console.log('[AuthContext] Teacher data fetch completed successfully')
      } catch (error) {
        console.error('[AuthContext] Error processing pending auth event:', error)
        // Don't leave loading states stuck on error
        setTeacherLoading(false)
      } finally {
        // Clear the pending event
        setPendingAuthEvent(null)
      }
    }

    processPendingEvent()
  }, [pendingAuthEvent])

  // Note: Session persistence is now handled by Supabase client configuration
  // - autoRefreshToken: automatically refreshes tokens before expiry
  // - persistSession: stores session in localStorage
  // - detectSessionInUrl: handles email confirmation links
  // - onAuthStateChange: automatically detects TOKEN_REFRESHED events
  // No manual visibility change handling needed

  // Sign out handler
  async function signOut() {
    console.log('[AuthContext] Signing out...')

    try {
      // Clear any pending timeouts FIRST to prevent them from firing after state is cleared
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }

      // Call Supabase signOut (clears tokens from both localStorage AND cookies)
      // Using scope: 'global' to ensure server-side middleware also recognizes sign out
      // This prevents redirect loops where cookies persist after localStorage is cleared
      await supabase.auth.signOut({ scope: 'global' })

      // Clear ALL React state
      setUser(null)
      setSession(null)
      setTeacher(null)
      setInstitute(null)

      // Clear error state
      setError(null)

      // Reset loading states
      setLoading(false)
      setTeacherLoading(false)
      setLoadingStage(null)
      setLoadingProgress(0)

      // Clear all refs
      teacherRef.current = null
      fetchingTeacherRef.current = null
      fetchTeacherPromiseRef.current = null

      console.log('[AuthContext] Sign out complete, redirecting to login...')

      // Redirect to login page
      // Using window.location instead of router to ensure clean state reset
      window.location.href = '/login'

    } catch (error) {
      console.error('[AuthContext] Sign out failed:', error)

      // Even if Supabase signOut fails, clear local state to prevent stuck state
      setUser(null)
      setSession(null)
      setTeacher(null)
      setInstitute(null)
      setError(null)
      setLoading(false)
      setTeacherLoading(false)
      setLoadingStage(null)
      setLoadingProgress(0)
      teacherRef.current = null
      fetchingTeacherRef.current = null
      fetchTeacherPromiseRef.current = null

      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }

      // Still redirect even if signOut failed
      // This ensures user can't be stuck in a bad state
      window.location.href = '/login'
    }
  }

  // Memoize derived error state
  const hasError = useMemo(() => error !== null, [error])

  // Memoize context value to prevent unnecessary re-renders
  const value: AuthContextType = useMemo(
    () => ({
      user,
      session,
      teacher,
      institute,
      loading,
      teacherLoading,
      loadingStage,
      loadingProgress,
      error,
      hasError,
      instituteId,
      role,
      isAdmin,
      signOut,
      refreshTeacher,
      clearError,
      retry,
    }),
    [
      user,
      session,
      teacher,
      institute,
      loading,
      teacherLoading,
      loadingStage,
      loadingProgress,
      error,
      hasError,
      instituteId,
      role,
      isAdmin,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access auth context
 *
 * @deprecated For internal use only. External consumers should use useSession() from '@/hooks/useSession'
 * @internal
 *
 * This hook is kept for internal use by the useSession hooks.
 * Direct usage outside of hooks/useSession.ts is discouraged.
 *
 * Migration guide:
 * - For optional auth: import { useSession } from '@/hooks/useSession'
 * - For required auth: import { useRequireSession } from '@/hooks/useSession'
 * - For admin auth: import { useRequireAdmin } from '@/hooks/useSession'
 *
 * @throws Error if used outside AuthProvider
 * @returns Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * ============================================================================
 * DEPRECATED HOOKS - REMOVED
 * ============================================================================
 *
 * The following hooks have been removed in favor of centralized hooks:
 *
 * - useRequireAuth() → Use useRequireSession() from '@/hooks/useSession'
 * - useRequireAdmin() → Use useRequireAdmin() from '@/hooks/useSession'
 *
 * These hooks have been fully migrated across the codebase. If you see
 * TypeScript errors about missing exports, update your imports to use
 * the hooks from '@/hooks/useSession' instead.
 *
 * Migration:
 * ```typescript
 * // OLD:
 * import { useRequireAuth } from '@/contexts/AuthContext'
 * const { teacher, session, ... } = useRequireAuth()
 *
 * // NEW:
 * import { useRequireSession } from '@/hooks/useSession'
 * const { teacher, session, ... } = useRequireSession()
 * ```
 * ============================================================================
 */
