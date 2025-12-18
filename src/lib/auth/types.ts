/**
 * Auth State Machine & Type Definitions
 *
 * Centralized type system for authentication, session management, and error handling.
 * Provides explicit state machine instead of boolean flags for better control flow.
 */

import type { User, Session } from '@supabase/supabase-js'
import type { Teacher, Institute } from '@/types/database'

/**
 * Loading stages during authentication flow
 */
export type LoadingStage = 'SESSION' | 'TEACHER' | 'INSTITUTE'

/**
 * Comprehensive error codes for all auth failure scenarios
 */
export enum AuthErrorCode {
  // Session errors
  SESSION_FETCH_FAILED = 'SESSION_FETCH_FAILED',
  SESSION_INVALID = 'SESSION_INVALID',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Teacher profile errors
  TEACHER_NOT_FOUND = 'TEACHER_NOT_FOUND',
  TEACHER_DELETED = 'TEACHER_DELETED',
  TEACHER_FETCH_FAILED = 'TEACHER_FETCH_FAILED',

  // Institute errors
  INSTITUTE_NOT_FOUND = 'INSTITUTE_NOT_FOUND',
  INSTITUTE_DELETED = 'INSTITUTE_DELETED',
  INSTITUTE_FETCH_FAILED = 'INSTITUTE_FETCH_FAILED',

  // Network errors
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_ERROR = 'NETWORK_ERROR',

  // Permission errors
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RLS_POLICY_VIOLATION = 'RLS_POLICY_VIOLATION',
  INSUFFICIENT_ROLE = 'INSUFFICIENT_ROLE',

  // Data integrity errors
  DATA_CORRUPTION = 'DATA_CORRUPTION',
  MISSING_REQUIRED_DATA = 'MISSING_REQUIRED_DATA',

  // Multi-tab/concurrent errors
  CONCURRENT_SESSION = 'CONCURRENT_SESSION',
  SIGNED_OUT_ELSEWHERE = 'SIGNED_OUT_ELSEWHERE',

  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
}

/**
 * User-facing error messages for each error code
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  // Session errors
  [AuthErrorCode.SESSION_FETCH_FAILED]: 'Unable to verify your session. Please try again.',
  [AuthErrorCode.SESSION_INVALID]: 'Your session is invalid. Please sign in again.',
  [AuthErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',

  // Teacher profile errors
  [AuthErrorCode.TEACHER_NOT_FOUND]: 'Your teacher profile was not found. Please contact your administrator.',
  [AuthErrorCode.TEACHER_DELETED]: 'Your account has been disabled. Please contact your administrator.',
  [AuthErrorCode.TEACHER_FETCH_FAILED]: 'Unable to load your profile. Please try again.',

  // Institute errors
  [AuthErrorCode.INSTITUTE_NOT_FOUND]: 'Your institute information was not found. Please contact support.',
  [AuthErrorCode.INSTITUTE_DELETED]: 'Your institute has been deactivated. Please contact support.',
  [AuthErrorCode.INSTITUTE_FETCH_FAILED]: 'Unable to load institute information. Please try again.',

  // Network errors
  [AuthErrorCode.NETWORK_TIMEOUT]: 'Connection timed out. Please check your internet connection and try again.',
  [AuthErrorCode.NETWORK_OFFLINE]: 'You appear to be offline. Please check your internet connection.',
  [AuthErrorCode.NETWORK_ERROR]: 'A network error occurred. Please check your connection and try again.',

  // Permission errors
  [AuthErrorCode.PERMISSION_DENIED]: 'You do not have permission to access this resource.',
  [AuthErrorCode.RLS_POLICY_VIOLATION]: 'Access denied by security policy. Contact your administrator.',
  [AuthErrorCode.INSUFFICIENT_ROLE]: 'You do not have the required role to access this page.',

  // Data integrity errors
  [AuthErrorCode.DATA_CORRUPTION]: 'Your account data appears to be corrupted. Please contact support.',
  [AuthErrorCode.MISSING_REQUIRED_DATA]: 'Required account information is missing. Please contact support.',

  // Multi-tab/concurrent errors
  [AuthErrorCode.CONCURRENT_SESSION]: 'Another session is active. Please close other tabs or sign out.',
  [AuthErrorCode.SIGNED_OUT_ELSEWHERE]: 'You were signed out in another tab or window.',

  // Generic errors
  [AuthErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  [AuthErrorCode.TIMEOUT_ERROR]: 'The operation timed out. Please try again.',
}

/**
 * Recovery action for an error
 */
export interface RecoveryAction {
  /** Display label for the action button */
  label: string
  /** Function to execute when action is clicked */
  action: () => Promise<void> | void
  /** Whether this is the primary/recommended action */
  primary: boolean
  /** Optional icon name */
  icon?: string
}

/**
 * Structured auth error with recovery information
 */
export interface AuthError {
  /** Error code for programmatic handling */
  code: AuthErrorCode
  /** User-facing error message */
  message: string
  /** Whether the error can be recovered from automatically */
  recoverable: boolean
  /** Timestamp when error occurred */
  timestamp: Date
  /** Unique ID for tracing this error in logs */
  correlationId: string
  /** Original error that caused this auth error */
  originalError?: Error
  /** Additional context about the error */
  context?: Record<string, any>
  /** Suggested recovery actions for the user */
  recoveryActions?: RecoveryAction[]
}

/**
 * Auth state machine - explicit states instead of boolean flags
 */
export type AuthState =
  | {
      type: 'INITIALIZING'
    }
  | {
      type: 'LOADING'
      stage: LoadingStage
      progress: number // 0-100
      elapsed: number // milliseconds
    }
  | {
      type: 'AUTHENTICATED'
      user: User
      session: Session
      teacher: Teacher
      institute: Institute
    }
  | {
      type: 'UNAUTHENTICATED'
    }
  | {
      type: 'ERROR'
      error: AuthError
      retryCount: number
    }
  | {
      type: 'RETRYING'
      attempt: number
      maxAttempts: number
      nextRetryIn: number // milliseconds
      previousError: AuthError
    }

/**
 * Actions that can transition the auth state machine
 */
export type AuthAction =
  | { type: 'INITIALIZE' }
  | { type: 'START_LOADING'; stage: LoadingStage }
  | { type: 'UPDATE_PROGRESS'; stage: LoadingStage; progress: number; elapsed: number }
  | { type: 'COMPLETE_LOADING'; stage: LoadingStage }
  | { type: 'AUTHENTICATE'; user: User; session: Session; teacher: Teacher; institute: Institute }
  | { type: 'UNAUTHENTICATE' }
  | { type: 'ERROR'; error: AuthError }
  | { type: 'START_RETRY'; attempt: number; maxAttempts: number; nextRetryIn: number; previousError: AuthError }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SIGN_OUT' }

/**
 * Progress information during multi-stage loading
 */
export interface LoadingProgress {
  /** Current loading stage */
  stage: LoadingStage
  /** Progress percentage (0-100) */
  progress: number
  /** Time elapsed in milliseconds */
  elapsed: number
  /** Estimated time remaining in milliseconds (null if unknown) */
  remaining: number | null
  /** Whether loading is taking longer than expected */
  slow: boolean
  /** Whether loading has timed out */
  timedOut: boolean
}

/**
 * Options for retry behavior
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts: number
  /** Initial delay before first retry (ms) */
  initialDelay: number
  /** Maximum delay between retries (ms) */
  maxDelay: number
  /** Multiplier for exponential backoff */
  backoffMultiplier: number
  /** Function to determine if error should be retried */
  shouldRetry: (error: Error, attempt: number) => boolean
  /** Callback when retry starts */
  onRetry?: (attempt: number, error: Error) => void
  /** Callback when max attempts reached */
  onMaxAttemptsReached?: (error: Error) => void
}

/**
 * Default retry options
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  shouldRetry: () => true,
}

/**
 * Network status
 */
export interface NetworkStatus {
  /** Whether device is online */
  online: boolean
  /** Whether connection is slow (detected via timeout) */
  slow: boolean
  /** Timestamp of last successful network operation */
  lastSuccess: Date | null
  /** Timestamp of last network failure */
  lastFailure: Date | null
}

/**
 * Authenticated context with guaranteed user/teacher/institute data
 */
export interface AuthenticatedContext {
  user: User
  session: Session
  teacher: Teacher
  institute: Institute
  role: 'admin' | 'teacher'
  isAdmin: boolean
  instituteId: string
  signOut: () => Promise<void>
  refreshTeacher: () => Promise<void>
}

/**
 * Admin context with guaranteed admin role
 */
export interface AdminContext extends AuthenticatedContext {
  role: 'admin'
  isAdmin: true
}
