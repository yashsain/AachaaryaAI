'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { cardHoverAnimation } from '@/styles/animations'

const cardVariants = cva(
  'rounded-xl transition-all duration-200',
  {
    variants: {
      variant: {
        default: [
          'bg-white',
          'border-2 border-neutral-200',
          'shadow-sm',
        ],
        elevated: [
          'bg-white',
          'shadow-md hover:shadow-lg',
        ],
        glass: [
          'bg-white/70',
          'backdrop-blur-lg',
          'border border-white/30',
          'shadow-glass',
        ],
        interactive: [
          'bg-white',
          'border-2 border-neutral-200',
          'shadow-sm hover:shadow-lg',
          'cursor-pointer',
        ],
        stat: [
          'bg-gradient-to-br from-white to-neutral-50',
          'border-2 border-neutral-200',
          'shadow-sm',
        ],
        info: [
          'bg-blue-50',
          'border border-blue-200',
          'shadow-sm',
        ],
        error: [
          'bg-error/10',
          'border border-error/30',
          'shadow-sm',
        ],
        warning: [
          'bg-yellow-50',
          'border border-yellow-200',
          'shadow-sm',
        ],
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
)

interface CardProps
  extends Omit<HTMLMotionProps<'div'>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, asChild = false, children, ...props }, ref) => {
    const shouldAnimate = variant === 'interactive' || variant === 'elevated'

    return (
      <motion.div
        ref={ref}
        className={cn(cardVariants({ variant, padding }), className)}
        whileHover={shouldAnimate ? cardHoverAnimation : undefined}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight text-neutral-900',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-neutral-600', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
