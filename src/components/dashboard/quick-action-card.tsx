'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LucideIcon, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface QuickActionCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  variant?: 'default' | 'primary' | 'success' | 'warning'
  badge?: string
  delay?: number
  className?: string
}

const gradients = {
  default: 'from-neutral-500 to-neutral-700',
  primary: 'from-primary-500 to-primary-600',
  success: 'from-success-500 to-success-600',
  warning: 'from-warning-500 to-warning-600',
}

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  variant = 'default',
  badge,
  delay = 0,
  className,
}: QuickActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <Link href={href} className="block h-full">
        <Card
          variant="interactive"
          padding="md"
          className={cn('h-full group relative overflow-hidden', className)}
        >
          {/* Gradient Background (subtle) */}
          <div
            className={cn(
              'absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300',
              'bg-gradient-to-br',
              gradients[variant]
            )}
          />

          {/* Content */}
          <div className="relative">
            {/* Icon */}
            <div
              className={cn(
                'inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4',
                'bg-gradient-to-br',
                gradients[variant],
                'shadow-lg'
              )}
            >
              <Icon className="h-7 w-7 text-white" />
            </div>

            {/* Badge */}
            {badge && (
              <span className="absolute top-0 right-0 px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-700">
                {badge}
              </span>
            )}

            {/* Title */}
            <h3 className="text-xl font-semibold text-neutral-900 mb-2 group-hover:text-primary-700 transition-colors">
              {title}
            </h3>

            {/* Description */}
            <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
              {description}
            </p>

            {/* Action */}
            <div className="flex items-center gap-2 text-primary-600 font-medium text-sm group-hover:gap-3 transition-all">
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}
