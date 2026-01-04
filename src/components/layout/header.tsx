'use client'

import * as React from 'react'
import { Search, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { NotificationDropdown } from './notification-dropdown'
import { useSession } from '@/hooks/useSession'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)
  const { teacher, signOut } = useSession()
  const userMenuRef = React.useRef<HTMLDivElement>(null)

  // Global search keyboard shortcut (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full',
          'border-b border-neutral-200/60',
          'bg-white/95 backdrop-blur-2xl',
          'shadow-[0_1px_3px_rgba(0,0,0,0.05)]',
          className
        )}
      >
        <div className="flex items-center justify-between h-20 px-8">
          {/* Left Section - Search */}
          <div className="flex-1 max-w-lg">
            <button
              onClick={() => setIsSearchOpen(true)}
              className={cn(
                'w-full flex items-center gap-3 px-5 py-3 rounded-2xl',
                'bg-gradient-to-br from-neutral-50 to-neutral-100/80',
                'border border-neutral-200/80 hover:border-neutral-300',
                'transition-all duration-300 ease-out',
                'hover:shadow-md hover:shadow-primary-500/5',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2',
                'group'
              )}
            >
              <Search className="h-5 w-5 text-neutral-400 group-hover:text-primary-500 transition-colors duration-300" />
              <span className="text-sm text-neutral-500 group-hover:text-neutral-700 flex-1 text-left font-medium transition-colors">
                Search everything...
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono bg-white/90 border border-neutral-200/80 rounded-lg shadow-sm">
                <span className="text-neutral-400">⌘</span>
                <span className="text-neutral-600 font-semibold">K</span>
              </kbd>
            </button>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <NotificationDropdown />

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-2xl',
                  'hover:bg-gradient-to-br hover:from-neutral-50 hover:to-neutral-100/80',
                  'border border-transparent hover:border-neutral-200/80',
                  'transition-all duration-300',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2'
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold text-neutral-900">
                    {teacher?.name || 'Teacher'}
                  </span>
                  <span className="text-xs text-neutral-500 capitalize font-medium">
                    {teacher?.role || 'Teacher'}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-neutral-400 transition-transform duration-300 hidden md:block',
                    isUserMenuOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className={cn(
                      'absolute right-0 top-full mt-3 w-72',
                      'bg-white rounded-2xl shadow-2xl shadow-neutral-900/10',
                      'border border-neutral-200/60',
                      'py-3 z-50',
                      'backdrop-blur-xl bg-white/95'
                    )}
                  >
                      {/* Profile Info */}
                      <div className="px-5 py-4 border-b border-neutral-100">
                        <p className="text-base font-bold text-neutral-900">
                          {teacher?.name || 'Teacher'}
                        </p>
                        <p className="text-sm text-neutral-500 mt-1 font-medium">
                          {teacher?.email || 'teacher@school.edu'}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          className={cn(
                            'w-full flex items-center gap-3 px-5 py-3',
                            'text-sm font-medium text-neutral-700',
                            'hover:bg-gradient-to-br hover:from-neutral-50 hover:to-neutral-100/50',
                            'transition-all duration-200'
                          )}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                            <User className="h-4 w-4 text-primary-600" />
                          </div>
                          <span>Profile</span>
                        </button>
                        <button
                          className={cn(
                            'w-full flex items-center gap-3 px-5 py-3',
                            'text-sm font-medium text-neutral-700',
                            'hover:bg-gradient-to-br hover:from-neutral-50 hover:to-neutral-100/50',
                            'transition-all duration-200'
                          )}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg flex items-center justify-center">
                            <Settings className="h-4 w-4 text-neutral-600" />
                          </div>
                          <span>Settings</span>
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-neutral-100 pt-2">
                        <button
                          onClick={() => signOut?.()}
                          className={cn(
                            'w-full flex items-center gap-3 px-5 py-3',
                            'text-sm font-semibold text-error-600',
                            'hover:bg-gradient-to-br hover:from-error-50 hover:to-error-100/50',
                            'transition-all duration-200'
                          )}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-error-100 to-error-200 rounded-lg flex items-center justify-center">
                            <LogOut className="h-4 w-4 text-error-600" />
                          </div>
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Search Everything</DialogTitle>
            <DialogDescription className="text-base">
              Find test papers, materials, students, and more
            </DialogDescription>
          </DialogHeader>
          <div className="relative mt-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Start typing to search..."
              autoFocus
              className={cn(
                'w-full pl-14 pr-6 py-4 rounded-2xl text-base',
                'border-2 border-neutral-200 bg-gradient-to-br from-neutral-50 to-white',
                'focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20',
                'outline-none transition-all duration-300',
                'placeholder:text-neutral-400'
              )}
            />
          </div>
          <div className="mt-6 p-6 bg-gradient-to-br from-neutral-50 to-blue-50/30 border border-neutral-200 rounded-2xl">
            <p className="text-sm text-neutral-600 text-center font-medium">
              Press <kbd className="px-2 py-1 bg-white border border-neutral-200 rounded-lg text-xs font-mono">Esc</kbd> to close
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
