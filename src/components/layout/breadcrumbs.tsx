'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  className?: string
  customLabels?: Record<string, string>
}

export function Breadcrumbs({ className, customLabels = {} }: BreadcrumbsProps) {
  const pathname = usePathname()

  const breadcrumbs = React.useMemo(() => {
    // Split pathname into segments
    const segments = pathname.split('/').filter(Boolean)

    // Build breadcrumb items
    const items: BreadcrumbItem[] = []
    let currentPath = ''

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`

      // Generate label - check custom labels first, then format segment
      const label = customLabels[currentPath] ||
        segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

      items.push({
        label,
        href: currentPath,
      })
    })

    return items
  }, [pathname, customLabels])

  // Don't show breadcrumbs on home page
  if (pathname === '/' || pathname === '/dashboard') {
    return null
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1 text-sm', className)}
    >
      {/* Home */}
      <Link
        href="/dashboard"
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl',
          'text-neutral-600 hover:text-primary-600 font-medium',
          'hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100/50',
          'transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2'
        )}
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {/* Breadcrumb Items */}
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1

        return (
          <React.Fragment key={item.href}>
            {/* Separator */}
            <ChevronRight className="h-4 w-4 text-neutral-300" />

            {/* Breadcrumb Item */}
            {isLast ? (
              <span
                className="px-3 py-2 rounded-xl font-bold text-neutral-900 bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200/50"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-xl font-medium',
                  'text-neutral-600 hover:text-primary-600',
                  'hover:bg-gradient-to-br hover:from-neutral-50 hover:to-neutral-100/50',
                  'transition-all duration-300',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2'
                )}
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
