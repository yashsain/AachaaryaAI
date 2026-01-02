'use client'

import * as React from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface StatsCardProps {
  title: string
  value: number
  unit?: string
  icon: LucideIcon
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  className?: string
  delay?: number
}

export function StatsCard({
  title,
  value,
  unit = '',
  icon: Icon,
  trend,
  className,
  delay = 0,
}: StatsCardProps) {
  const [hasAnimated, setHasAnimated] = React.useState(false)

  // Animated counter
  const springValue = useSpring(0, {
    bounce: 0.25,
    duration: 2000,
  })

  const displayValue = useTransform(springValue, (latest) =>
    Math.round(latest).toLocaleString()
  )

  React.useEffect(() => {
    if (!hasAnimated) {
      springValue.set(value)
      setHasAnimated(true)
    }
  }, [value, springValue, hasAnimated])

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
      <Card
        variant="stat"
        padding="md"
        className={cn('relative overflow-hidden', className)}
      >
        {/* Background Icon */}
        <div className="absolute top-4 right-4 opacity-10">
          <Icon className="h-20 w-20 text-neutral-900" />
        </div>

        {/* Content */}
        <div className="relative">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-linear-to-br from-primary-500 to-primary-600 mb-4">
            <Icon className="h-6 w-6 text-white" />
          </div>

          {/* Value */}
          <div className="flex items-baseline gap-2 mb-2">
            <motion.span className="text-4xl font-bold text-neutral-900">
              {displayValue}
            </motion.span>
            {unit && (
              <span className="text-2xl font-medium text-neutral-600">
                {unit}
              </span>
            )}
          </div>

          {/* Title */}
          <p className="text-sm font-medium text-neutral-600 mb-3">{title}</p>

          {/* Trend */}
          {trend && (
            <div
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
                trend.direction === 'up' &&
                  'bg-success-50 text-success-700',
                trend.direction === 'down' &&
                  'bg-error-50 text-error-700'
              )}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
