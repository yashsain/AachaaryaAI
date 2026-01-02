/**
 * Modern Button Component
 *
 * Professional, accessible button with 7 variants, 3 sizes, and smooth animations.
 * Built with class-variance-authority for type-safe variant management.
 *
 * Features:
 * - 7 variants: primary, secondary, ghost, destructive, soft, ai, icon
 * - 3 sizes: sm (32px), md (40px), lg (48px)
 * - Loading state with spinner
 * - Disabled state
 * - Smooth hover/press animations (Framer Motion)
 * - Full keyboard accessibility
 *
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click Me
 * </Button>
 *
 * @example
 * <Button variant="destructive" isLoading>
 *   Deleting...
 * </Button>
 */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { buttonTapAnimation, buttonHoverAnimation } from '@/styles/animations'

// ============================================================================
// BUTTON VARIANTS
// ============================================================================

const buttonVariants = cva(
  // Base styles (applied to all buttons)
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-lg font-medium',
    'transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'whitespace-nowrap',
  ],
  {
    variants: {
      // ======================================================================
      // VARIANT - 7 button styles
      // ======================================================================
      variant: {
        // Primary: Bold gradient button (main CTAs)
        primary: [
          'bg-gradient-to-r from-primary-500 to-primary-600',
          'text-white shadow-md',
          'hover:from-primary-600 hover:to-primary-700 hover:shadow-lg',
          'focus-visible:ring-primary-500',
        ],

        // Secondary: Outlined button (secondary actions)
        secondary: [
          'border-2 border-primary-500',
          'bg-white text-primary-900',
          'hover:bg-primary-50 hover:border-primary-600 hover:text-primary-900',
          'focus-visible:ring-primary-500',
          'active:bg-primary-100',
        ],

        // Ghost: Minimal button (tertiary actions, navs)
        ghost: [
          'bg-white text-neutral-800',
          'hover:bg-neutral-200 hover:text-neutral-900',
          'focus-visible:ring-neutral-400',
          'active:bg-neutral-300',
        ],

        // Destructive: Warning/delete actions
        destructive: [
          'bg-gradient-to-r from-error-500 to-error-600',
          'text-white shadow-md',
          'hover:from-error-600 hover:to-error-700 hover:shadow-lg',
          'focus-visible:ring-error-500',
        ],

        // Soft: Subtle colored background (info, non-critical actions)
        soft: [
          'bg-primary-50 text-primary-700',
          'hover:bg-primary-100',
          'focus-visible:ring-primary-400',
          'active:bg-primary-200',
        ],

        // AI: Purple gradient for AI-related actions
        ai: [
          'bg-gradient-to-r from-ai-500 to-ai-600',
          'text-white shadow-md',
          'hover:from-ai-600 hover:to-ai-700 hover:shadow-lg',
          'focus-visible:ring-ai-500',
        ],

        // Icon: Minimal icon-only button
        icon: [
          'bg-white text-neutral-800',
          'hover:bg-neutral-200 hover:text-neutral-900',
          'focus-visible:ring-neutral-400',
          'active:bg-neutral-300',
          'rounded-md', // Override to square corners for icons
        ],
      },

      // ======================================================================
      // SIZE - 3 button sizes
      // ======================================================================
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },

      // ======================================================================
      // FULL WIDTH - Expands to container
      // ======================================================================
      fullWidth: {
        true: 'w-full',
      },
    },

    // Default variant and size
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

// ============================================================================
// COMPONENT TYPES
// ============================================================================

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'>,
    VariantProps<typeof buttonVariants> {
  /**
   * Renders as child component (for composition with Next.js Link, etc.)
   * @see https://www.radix-ui.com/primitives/docs/utilities/slot
   */
  asChild?: boolean

  /**
   * Show loading spinner and disable interaction
   */
  isLoading?: boolean

  /**
   * Loading text (replaces children when loading)
   */
  loadingText?: string

  /**
   * Icon to show before text
   */
  leftIcon?: React.ReactNode

  /**
   * Icon to show after text
   */
  rightIcon?: React.ReactNode
}

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Determine button content based on loading state
    const buttonContent = React.useMemo(() => {
      if (isLoading) {
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText || children}
          </>
        )
      }

      return (
        <>
          {leftIcon && <span className="inline-flex">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="inline-flex">{rightIcon}</span>}
        </>
      )
    }, [isLoading, loadingText, children, leftIcon, rightIcon])

    const baseClassName = cn(buttonVariants({ variant, size, fullWidth, className }))

    if (asChild) {
      return (
        <Slot
          className={baseClassName}
          ref={ref}
          {...(props as any)}
        >
          {buttonContent}
        </Slot>
      )
    }

    return (
      <motion.button
        className={baseClassName}
        ref={ref}
        disabled={disabled || isLoading}
        whileHover={!disabled && !isLoading ? buttonHoverAnimation : undefined}
        whileTap={!disabled && !isLoading ? buttonTapAnimation : undefined}
        {...props}
      >
        {buttonContent}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

// ============================================================================
// ICON BUTTON VARIANT (specialized for icon-only buttons)
// ============================================================================

export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  /**
   * Icon element (required)
   */
  icon: React.ReactNode

  /**
   * Accessible label (required for screen readers)
   */
  'aria-label': string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', ...props }, ref) => {
    const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20

    return (
      <Button ref={ref} variant="icon" size={size} {...props}>
        <span className="inline-flex" style={{ width: iconSize, height: iconSize }}>
          {icon}
        </span>
      </Button>
    )
  }
)

IconButton.displayName = 'IconButton'

// ============================================================================
// EXPORTS
// ============================================================================

export { Button, IconButton, buttonVariants }
