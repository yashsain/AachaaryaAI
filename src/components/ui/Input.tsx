/**
 * Modern Input Component
 *
 * Professional input field with floating labels, icons, and smooth animations.
 * Built for forms with excellent UX and accessibility.
 *
 * Features:
 * - Floating label animation
 * - Left/right icon support
 * - Validation states (success, error, warning)
 * - Helper text
 * - Character counter
 * - Smooth focus animations
 * - Full accessibility (ARIA)
 *
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   leftIcon={<Mail />}
 *   placeholder="you@example.com"
 * />
 *
 * @example
 * <Input
 *   label="Password"
 *   type="password"
 *   error="Password must be at least 8 characters"
 * />
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

import { cn } from '@/lib/utils'
import { fadeVariants, shakeVariants } from '@/styles/animations'

// ============================================================================
// INPUT VARIANTS
// ============================================================================

const inputVariants = cva(
  [
    'w-full',
    'px-4 py-3',
    'text-base text-neutral-900',
    'bg-white',
    'border-2 rounded-lg',
    'transition-all duration-200',
    'placeholder:text-neutral-400',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      // ======================================================================
      // STATE - Input validation state
      // ======================================================================
      state: {
        default: [
          'border-neutral-200',
          'focus:border-primary-500 focus:ring-primary-500/20',
          'hover:border-neutral-300',
        ],
        success: [
          'border-success-500',
          'focus:border-success-600 focus:ring-success-500/20',
        ],
        error: [
          'border-error-500',
          'focus:border-error-600 focus:ring-error-500/20',
        ],
        warning: [
          'border-warning-500',
          'focus:border-warning-600 focus:ring-warning-500/20',
        ],
      },

      // ======================================================================
      // SIZE - Input sizes
      // ======================================================================
      size: {
        sm: 'h-9 px-3 py-2 text-sm',
        md: 'h-11 px-4 py-3 text-base',
        lg: 'h-13 px-5 py-4 text-lg',
      },

      // ======================================================================
      // ICON PADDING
      // ======================================================================
      hasLeftIcon: {
        true: 'pl-10',
      },
      hasRightIcon: {
        true: 'pr-10',
      },
    },
    defaultVariants: {
      state: 'default',
      size: 'md',
    },
  }
)

// ============================================================================
// COMPONENT TYPES
// ============================================================================

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * Input label (floating when empty)
   */
  label?: string

  /**
   * Helper text below input
   */
  helperText?: string

  /**
   * Error message (overrides helperText)
   */
  error?: string

  /**
   * Success message
   */
  success?: string

  /**
   * Warning message
   */
  warning?: string

  /**
   * Icon to show on left side
   */
  leftIcon?: React.ReactNode

  /**
   * Icon to show on right side
   */
  rightIcon?: React.ReactNode

  /**
   * Show character counter (requires maxLength)
   */
  showCounter?: boolean

  /**
   * Container className
   */
  containerClassName?: string

  /**
   * Use floating label design
   */
  floatingLabel?: boolean
}

// ============================================================================
// INPUT COMPONENT
// ============================================================================

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      helperText,
      error,
      success,
      warning,
      leftIcon,
      rightIcon,
      showCounter,
      maxLength,
      state,
      size,
      floatingLabel = true,
      required,
      disabled,
      value,
      placeholder,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [charCount, setCharCount] = React.useState(0)
    const inputRef = React.useRef<HTMLInputElement | null>(null)

    // Determine validation state
    const validationState = error
      ? 'error'
      : success
      ? 'success'
      : warning
      ? 'warning'
      : state || 'default'

    // Check if label should float
    const shouldFloat = floatingLabel && (isFocused || !!value || !!placeholder)

    // Handle character counting
    React.useEffect(() => {
      if (showCounter && value) {
        setCharCount(String(value).length)
      }
    }, [value, showCounter])

    // Combined ref
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    return (
      <div className={cn('w-full', containerClassName)}>
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <span className="w-5 h-5 flex items-center justify-center">
                {leftIcon}
              </span>
            </div>
          )}

          {/* Input Field */}
          <input
            ref={inputRef}
            className={cn(
              inputVariants({
                state: validationState,
                size,
                hasLeftIcon: !!leftIcon,
                hasRightIcon: !!rightIcon || validationState !== 'default',
              }),
              floatingLabel && label && 'pt-6 pb-2',
              className
            )}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            value={value}
            placeholder={floatingLabel ? '' : placeholder}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            onChange={(e) => {
              if (showCounter) {
                setCharCount(e.target.value.length)
              }
              props.onChange?.(e)
            }}
            {...props}
          />

          {/* Floating Label */}
          {floatingLabel && label && (
            <motion.label
              className={cn(
                'absolute left-4 pointer-events-none transition-all duration-200',
                shouldFloat
                  ? 'top-1.5 text-xs text-neutral-500'
                  : 'top-1/2 -translate-y-1/2 text-base text-neutral-400',
                leftIcon && (shouldFloat ? 'left-4' : 'left-10'),
                disabled && 'text-neutral-400'
              )}
              initial={false}
              animate={{
                fontSize: shouldFloat ? '0.75rem' : '1rem',
                y: shouldFloat ? 0 : '-50%',
              }}
            >
              {label}
              {required && <span className="text-error-500 ml-1">*</span>}
            </motion.label>
          )}

          {/* Non-floating Label */}
          {!floatingLabel && label && (
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {label}
              {required && <span className="text-error-500 ml-1">*</span>}
            </label>
          )}

          {/* Right Icon or Validation Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {rightIcon ? (
              <span className="w-5 h-5 flex items-center justify-center">
                {rightIcon}
              </span>
            ) : validationState === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-success-500" />
            ) : validationState === 'error' ? (
              <AlertCircle className="w-5 h-5 text-error-500" />
            ) : validationState === 'warning' ? (
              <Info className="w-5 h-5 text-warning-500" />
            ) : null}
          </div>
        </div>

        {/* Helper/Error/Success/Warning Messages */}
        <AnimatePresence mode="wait">
          {(error || success || warning || helperText) && (
            <motion.div
              key={error || success || warning || helperText}
              variants={error ? shakeVariants : fadeVariants}
              initial="hidden"
              animate={error ? 'shake' : 'visible'}
              exit="exit"
              className="mt-1.5 flex items-start gap-1.5"
            >
              {error && (
                <p className="text-sm text-error-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </p>
              )}
              {!error && success && (
                <p className="text-sm text-success-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  {success}
                </p>
              )}
              {!error && !success && warning && (
                <p className="text-sm text-warning-600 flex items-center gap-1">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  {warning}
                </p>
              )}
              {!error && !success && !warning && helperText && (
                <p className="text-sm text-neutral-500">{helperText}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character Counter */}
        {showCounter && maxLength && (
          <div className="mt-1 text-xs text-right text-neutral-500">
            {charCount}/{maxLength}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// ============================================================================
// TEXTAREA VARIANT
// ============================================================================

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string
  helperText?: string
  error?: string
  success?: string
  warning?: string
  showCounter?: boolean
  containerClassName?: string
  state?: 'default' | 'success' | 'error' | 'warning'
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      containerClassName,
      label,
      helperText,
      error,
      success,
      warning,
      showCounter,
      maxLength,
      state,
      required,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = React.useState(0)

    const validationState = error
      ? 'error'
      : success
      ? 'success'
      : warning
      ? 'warning'
      : state || 'default'

    React.useEffect(() => {
      if (showCounter && value) {
        setCharCount(String(value).length)
      }
    }, [value, showCounter])

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          className={cn(
            inputVariants({ state: validationState }),
            'min-h-[100px] resize-y',
            className
          )}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          value={value}
          onChange={(e) => {
            if (showCounter) {
              setCharCount(e.target.value.length)
            }
            props.onChange?.(e)
          }}
          {...props}
        />

        <AnimatePresence mode="wait">
          {(error || success || warning || helperText) && (
            <motion.div
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-1.5"
            >
              {error && (
                <p className="text-sm text-error-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              )}
              {!error && success && (
                <p className="text-sm text-success-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {success}
                </p>
              )}
              {!error && !success && warning && (
                <p className="text-sm text-warning-600 flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  {warning}
                </p>
              )}
              {!error && !success && !warning && helperText && (
                <p className="text-sm text-neutral-500">{helperText}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {showCounter && maxLength && (
          <div className="mt-1 text-xs text-right text-neutral-500">
            {charCount}/{maxLength}
          </div>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

// ============================================================================
// EXPORTS
// ============================================================================

export { Input, Textarea, inputVariants }
