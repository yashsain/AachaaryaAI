'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-neutral-900 text-white hover:bg-neutral-800',
        primary: 'bg-primary-500 text-white hover:bg-primary-600',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        success: 'bg-success-500 text-white hover:bg-success-600',
        warning: 'bg-warning-500 text-white hover:bg-warning-600',
        error: 'bg-error-500 text-white hover:bg-error-600',
        info: 'bg-info-500 text-white hover:bg-info-600',
        outline: 'border-2 border-neutral-300 text-neutral-900 hover:bg-neutral-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
