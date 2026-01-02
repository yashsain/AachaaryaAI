'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { Breadcrumbs } from './breadcrumbs'
import { MobileNav } from './mobile-nav'

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Sidebar - Desktop Only */}
      <Sidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto">
          <div className={cn('container mx-auto px-4 py-6', className)}>
            {/* Breadcrumbs */}
            <Breadcrumbs className="mb-6" />

            {/* Page Content */}
            {children}
          </div>

          {/* Bottom padding for mobile nav */}
          <div className="h-20 md:hidden" aria-hidden="true" />
        </main>
      </div>

      {/* Mobile Navigation - Mobile Only */}
      <MobileNav />
    </div>
  )
}
