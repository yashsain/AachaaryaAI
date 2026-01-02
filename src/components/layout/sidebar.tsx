'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from '@/hooks/useSession'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Test Papers',
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

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const pathname = usePathname()
  const { teacher, signOut } = useSession()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <motion.aside
      animate={{
        width: isCollapsed ? '80px' : '260px',
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={cn(
        'relative flex flex-col h-screen border-r border-neutral-200',
        'bg-white/80 backdrop-blur-xl',
        'shadow-glass',
        className
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-200">
        <AnimatePresence mode="wait">
          {isCollapsed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="mx-auto"
            >
              <Image
                src="/logo.png"
                alt="aachaaryAI Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <Image
                src="/logo.png"
                alt="aachaaryAI Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-semibold text-lg text-neutral-900">
                aachaaryAI
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'p-2 rounded-lg hover:bg-neutral-100 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            isCollapsed && 'mx-auto'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-neutral-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-neutral-600" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'hover:bg-neutral-100',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                active && [
                  'bg-gradient-to-r from-primary-50 to-primary-100/50',
                  'text-primary-700',
                  'shadow-sm',
                ],
                !active && 'text-neutral-700',
                isCollapsed && 'justify-center'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  active ? 'text-primary-600' : 'text-neutral-500'
                )}
              />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="font-medium text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!isCollapsed && item.badge && (
                <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-100 text-primary-700">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-neutral-200">
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg',
            'hover:bg-neutral-100 transition-colors cursor-pointer',
            isCollapsed && 'justify-center'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-white" />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {teacher?.name || 'Teacher'}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {teacher?.email || 'teacher@school.edu'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => signOut?.()}
          className={cn(
            'w-full mt-2 flex items-center gap-3 px-3 py-2.5 rounded-lg',
            'text-error-600 hover:bg-error-50 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
