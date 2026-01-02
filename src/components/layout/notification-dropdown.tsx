'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, FileText, Upload, CheckCircle, Clock, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface Activity {
  id: string
  type: 'created' | 'uploaded' | 'completed' | 'pending'
  title: string
  description: string
  timestamp: string
  icon?: LucideIcon
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

interface NotificationDropdownProps {
  activities?: Activity[]
}

export function NotificationDropdown({
  activities = defaultActivities,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const notificationCount = activities.length

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-lg',
          'hover:bg-neutral-100',
          'transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
        )}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-neutral-600" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute right-0 top-full mt-2 w-96',
              'bg-white rounded-xl shadow-lg border border-neutral-200',
              'z-50 max-h-[480px] flex flex-col'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-neutral-900">
                  Notifications
                </h3>
                <Badge variant="secondary">{notificationCount}</Badge>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-neutral-100 rounded transition-colors"
                aria-label="Close notifications"
              >
                <X className="h-4 w-4 text-neutral-600" />
              </button>
            </div>

            {/* Activity List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500">
                    No notifications yet
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
                        delay: index * 0.05,
                      }}
                      className="flex gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
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
                        <p className="text-xs text-neutral-600 mb-1">
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

            {/* Footer */}
            {activities.length > 0 && (
              <div className="border-t border-neutral-200 px-4 py-3">
                <button className="w-full text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
