'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, BookOpen, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navigationItems: NavItem[] = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Papers',
    href: '/dashboard/test-papers',
    icon: FileText,
  },
  {
    label: 'Materials',
    href: '/dashboard/materials',
    icon: BookOpen,
  },
  {
    label: 'Admin',
    href: '/dashboard/admin',
    icon: Users,
  },
]

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav
      className={cn(
        // Only show on mobile/tablet
        'md:hidden',
        // Fixed bottom positioning
        'fixed bottom-0 left-0 right-0 z-50',
        // Glass effect background
        'bg-white/80 backdrop-blur-xl',
        'border-t border-neutral-200',
        'shadow-glass',
        // Safe area padding for iOS
        'pb-safe',
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center',
                'flex-1 gap-1 py-2 px-3 rounded-lg',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                active && [
                  'text-primary-600',
                ],
                !active && 'text-neutral-600'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg',
                  'transition-all duration-200',
                  active && [
                    'bg-gradient-to-r from-primary-50 to-primary-100/50',
                    'shadow-sm',
                  ]
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    active ? 'text-primary-600' : 'text-neutral-500'
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-xs font-medium transition-colors',
                  active ? 'text-primary-700' : 'text-neutral-600'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
