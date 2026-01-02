'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { FileText, Upload, CheckCircle, Clock, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Activity {
  id: string
  type: 'created' | 'uploaded' | 'completed' | 'pending'
  title: string
  description: string
  timestamp: string
  icon?: LucideIcon
}

interface ActivityFeedProps {
  activities?: Activity[]
  className?: string
  delay?: number
}

const activityIcons: Record<string, LucideIcon> = {
  created: FileText,
  uploaded: Upload,
  completed: CheckCircle,
  pending: Clock,
}

const activityColors: Record<
  string,
  { bg: string; text: string; icon: string }
> = {
  created: {
    bg: 'bg-primary-50',
    text: 'text-primary-700',
    icon: 'text-primary-600',
  },
  uploaded: {
    bg: 'bg-info-50',
    text: 'text-info-700',
    icon: 'text-info-600',
  },
  completed: {
    bg: 'bg-success-50',
    text: 'text-success-700',
    icon: 'text-success-600',
  },
  pending: {
    bg: 'bg-warning-50',
    text: 'text-warning-700',
    icon: 'text-warning-600',
  },
}

const defaultActivities: Activity[] = [
  {
    id: '1',
    type: 'created',
    title: 'Welcome to aachaaryAI!',
    description: 'Your dashboard is ready. Start creating test papers.',
    timestamp: 'Just now',
  },
]

export function ActivityFeed({
  activities = defaultActivities,
  className,
  delay = 0,
}: ActivityFeedProps) {
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
      <Card variant="default" padding="md" className={cn('h-full', className)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">
            Recent Activity
          </h3>
          <Badge variant="secondary">{activities.length}</Badge>
        </div>

        {/* Activity List */}
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm text-neutral-500">
                No recent activity yet
              </p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const Icon = activity.icon || activityIcons[activity.type]
              const colors = activityColors[activity.type]

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: delay + index * 0.1,
                  }}
                  className="flex gap-3 pb-4 border-b border-neutral-200 last:border-0 last:pb-0"
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                      colors.bg
                    )}
                  >
                    <Icon className={cn('h-5 w-5', colors.icon)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 mb-1">
                      {activity.title}
                    </p>
                    <p className="text-xs text-neutral-600 mb-2">
                      {activity.description}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {activity.timestamp}
                    </p>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </Card>
    </motion.div>
  )
}
