'use client'

/**
 * Institute Header Component
 *
 * Professional dashboard header with institute branding
 * Displays institute logo, name, and personalized welcome message
 */

import * as React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import type { Institute } from '@/types/database'

interface InstituteHeaderProps {
  institute: Institute | null
  teacherName: string
}

export function InstituteHeader({ institute, teacherName }: InstituteHeaderProps) {
  const firstName = teacherName.split(' ')[0]
  const [logoError, setLogoError] = React.useState(false)

  // Determine which logo to show
  const shouldShowInstituteLogo = institute?.logo_url && !logoError
  const logoSrc = shouldShowInstituteLogo ? (institute.logo_url ?? '/logo.png') : '/logo.png'
  const logoAlt = shouldShowInstituteLogo
    ? `${institute.name} Logo`
    : 'aachaaryAI Logo'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-6"
    >
      {/* Institute Branding Bar */}
      <div className="flex items-center gap-4 pb-6 border-b border-neutral-200">
        {/* Institute Logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 border-2 border-neutral-200 shadow-sm flex items-center justify-center overflow-hidden">
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={48}
              height={48}
              className="object-contain"
              onError={() => setLogoError(true)}
            />
          </div>
          {/* Verified Badge */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center border-2 border-white shadow-md">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Institute Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-bold text-neutral-900 leading-tight">
            {institute?.name || 'aachaaryAI'}
          </h2>
          {institute?.tagline && (
            <p className="text-sm text-neutral-500 mt-1 truncate">
              {institute.tagline}
            </p>
          )}
          {!institute?.tagline && (
            <p className="text-sm text-neutral-500 mt-1">
              AI-Powered Test Paper Generation
            </p>
          )}
        </div>

        {/* Institute Badge */}
        {institute && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200/50">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">
              {institute.city || 'Active'}
            </span>
          </div>
        )}
      </div>

      {/* Welcome Message */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2 leading-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-base text-neutral-600">
          Here's your dashboard overview for today
        </p>
      </div>
    </motion.div>
  )
}
