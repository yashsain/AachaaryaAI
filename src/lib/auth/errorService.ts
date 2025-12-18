/**
 * Auth Error Service
 *
 * Centralized error handling for authentication and session management.
 * Provides consistent error creation, classification, and recovery actions.
 */

import { PostgrestError } from '@supabase/supabase-js'
import {
  AuthError,
  AuthErrorCode,
  AUTH_ERROR_MESSAGES,
  RecoveryAction,
} from './types'

/**
 * Service for creating and managing auth errors
 */
export class AuthErrorService {
  /**
   * Generate a unique correlation ID for error tracking
   */
  private static generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * Create a structured AuthError from an error code
   */
  static createError(
    code: AuthErrorCode,
    originalError?: Error,
    context?: Record<string, any>
  ): AuthError {
    const error: AuthError = {
      code,
      message: AUTH_ERROR_MESSAGES[code],
      recoverable: this.isRecoverable(code),
      timestamp: new Date(),
      correlationId: this.generateCorrelationId(),
      originalError,
      context,
    }

    // Add recovery actions based on error type
    error.recoveryActions = this.getRecoveryActions(error)

    return error
  }

  /**
   * Detect error code from various error types
   */
  static detectErrorCode(error: unknown): AuthErrorCode {
    if (!error) {
      return AuthErrorCode.UNKNOWN_ERROR
    }

    // Handle Supabase Postgrest errors
    if (this.isPostgrestError(error)) {
      const pgError = error as PostgrestError

      // RLS policy violations
      if (pgError.code === 'PGRST301' || pgError.message?.includes('policy')) {
        return AuthErrorCode.RLS_POLICY_VIOLATION
      }

      // Not found errors
      if (pgError.code === 'PGRST116' || pgError.message?.includes('not found')) {
        return AuthErrorCode.TEACHER_NOT_FOUND
      }

      return AuthErrorCode.UNKNOWN_ERROR
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return AuthErrorCode.NETWORK_ERROR
    }

    // Handle timeout errors
    if (error instanceof Error && error.message.includes('timeout')) {
      return AuthErrorCode.NETWORK_TIMEOUT
    }

    // Handle session errors
    if (error instanceof Error && error.message.includes('session')) {
      return AuthErrorCode.SESSION_INVALID
    }

    return AuthErrorCode.UNKNOWN_ERROR
  }

  /**
   * Check if error is a Supabase Postgrest error
   */
  private static isPostgrestError(error: unknown): error is PostgrestError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error
    )
  }

  /**
   * Create error from unknown error type
   */
  static fromError(
    error: unknown,
    fallbackCode: AuthErrorCode = AuthErrorCode.UNKNOWN_ERROR,
    context?: Record<string, any>
  ): AuthError {
    const code = this.detectErrorCode(error) || fallbackCode
    const originalError = error instanceof Error ? error : new Error(String(error))

    return this.createError(code, originalError, context)
  }

  /**
   * Determine if an error code represents a recoverable error
   */
  static isRecoverable(code: AuthErrorCode): boolean {
    // Network errors are recoverable - user can retry
    const recoverableErrors = [
      AuthErrorCode.NETWORK_TIMEOUT,
      AuthErrorCode.NETWORK_OFFLINE,
      AuthErrorCode.NETWORK_ERROR,
      AuthErrorCode.TEACHER_FETCH_FAILED,
      AuthErrorCode.INSTITUTE_FETCH_FAILED,
      AuthErrorCode.SESSION_FETCH_FAILED,
      AuthErrorCode.TIMEOUT_ERROR,
      AuthErrorCode.UNKNOWN_ERROR,
    ]

    return recoverableErrors.includes(code)
  }

  /**
   * Determine if an error represents a network issue
   */
  static isNetworkError(code: AuthErrorCode): boolean {
    return [
      AuthErrorCode.NETWORK_TIMEOUT,
      AuthErrorCode.NETWORK_OFFLINE,
      AuthErrorCode.NETWORK_ERROR,
    ].includes(code)
  }

  /**
   * Determine if an error represents a permission issue
   */
  static isPermissionError(code: AuthErrorCode): boolean {
    return [
      AuthErrorCode.PERMISSION_DENIED,
      AuthErrorCode.RLS_POLICY_VIOLATION,
      AuthErrorCode.INSUFFICIENT_ROLE,
    ].includes(code)
  }

  /**
   * Determine if an error represents a data issue
   */
  static isDataError(code: AuthErrorCode): boolean {
    return [
      AuthErrorCode.TEACHER_NOT_FOUND,
      AuthErrorCode.TEACHER_DELETED,
      AuthErrorCode.INSTITUTE_NOT_FOUND,
      AuthErrorCode.INSTITUTE_DELETED,
      AuthErrorCode.DATA_CORRUPTION,
      AuthErrorCode.MISSING_REQUIRED_DATA,
    ].includes(code)
  }

  /**
   * Get recommended recovery actions for an error
   */
  static getRecoveryActions(error: AuthError): RecoveryAction[] {
    const actions: RecoveryAction[] = []

    // For recoverable errors, add retry action
    if (error.recoverable) {
      actions.push({
        label: 'Try Again',
        action: async () => {
          // Retry will be handled by the component/context
          console.log('[AuthErrorService] Retry requested for:', error.correlationId)
        },
        primary: true,
        icon: 'refresh',
      })
    }

    // For network errors, suggest checking connection
    if (this.isNetworkError(error.code)) {
      actions.push({
        label: 'Check Connection',
        action: () => {
          window.open('https://www.google.com', '_blank')
        },
        primary: false,
        icon: 'wifi',
      })
    }

    // For data errors, suggest contacting admin
    if (this.isDataError(error.code)) {
      actions.push({
        label: 'Contact Administrator',
        action: () => {
          // This could open a support modal or email client
          console.log('[AuthErrorService] Contact admin requested')
        },
        primary: !error.recoverable,
        icon: 'help',
      })
    }

    // For permission errors, suggest signing out
    if (this.isPermissionError(error.code)) {
      actions.push({
        label: 'Sign Out',
        action: async () => {
          // Sign out will be handled by the context
          console.log('[AuthErrorService] Sign out requested')
        },
        primary: true,
        icon: 'logout',
      })
    }

    // Always provide a sign out option as last resort
    if (actions.length > 0 && !this.isPermissionError(error.code)) {
      actions.push({
        label: 'Sign Out',
        action: async () => {
          console.log('[AuthErrorService] Sign out requested')
        },
        primary: false,
        icon: 'logout',
      })
    }

    return actions
  }

  /**
   * Log error with full context
   */
  static logError(error: AuthError, additionalContext?: Record<string, any>): void {
    const logData = {
      correlationId: error.correlationId,
      code: error.code,
      message: error.message,
      timestamp: error.timestamp.toISOString(),
      recoverable: error.recoverable,
      context: { ...error.context, ...additionalContext },
      originalError: error.originalError
        ? {
            name: error.originalError.name,
            message: error.originalError.message,
            stack: error.originalError.stack,
          }
        : null,
    }

    // Use appropriate console method based on error severity
    if (error.recoverable) {
      console.warn('[AuthError]', logData)
    } else {
      console.error('[AuthError]', logData)
    }

    // Here you could also send to external monitoring service
    // Example: Sentry, LogRocket, DataDog, etc.
    // sendToMonitoring(logData)
  }

  /**
   * Get user-friendly message for an error
   */
  static getUserMessage(error: AuthError): string {
    return error.message
  }

  /**
   * Create specific error for teacher not found scenario
   */
  static createTeacherNotFoundError(userId: string): AuthError {
    return this.createError(
      AuthErrorCode.TEACHER_NOT_FOUND,
      new Error('Teacher profile not found'),
      { userId }
    )
  }

  /**
   * Create specific error for teacher deleted scenario
   */
  static createTeacherDeletedError(userId: string, deletedAt: string): AuthError {
    return this.createError(
      AuthErrorCode.TEACHER_DELETED,
      new Error('Teacher account is deleted'),
      { userId, deletedAt }
    )
  }

  /**
   * Create specific error for institute not found scenario
   */
  static createInstituteNotFoundError(instituteId: string): AuthError {
    return this.createError(
      AuthErrorCode.INSTITUTE_NOT_FOUND,
      new Error('Institute not found'),
      { instituteId }
    )
  }

  /**
   * Create specific error for network timeout
   */
  static createNetworkTimeoutError(operation: string, timeoutMs: number): AuthError {
    return this.createError(
      AuthErrorCode.NETWORK_TIMEOUT,
      new Error(`Operation timed out after ${timeoutMs}ms`),
      { operation, timeoutMs }
    )
  }

  /**
   * Create specific error for permission denied
   */
  static createPermissionDeniedError(resource: string, requiredRole?: string): AuthError {
    return this.createError(
      AuthErrorCode.PERMISSION_DENIED,
      new Error('Permission denied'),
      { resource, requiredRole }
    )
  }

  /**
   * Create specific error for insufficient role
   */
  static createInsufficientRoleError(currentRole: string, requiredRole: string): AuthError {
    return this.createError(
      AuthErrorCode.INSUFFICIENT_ROLE,
      new Error('Insufficient role'),
      { currentRole, requiredRole }
    )
  }
}
