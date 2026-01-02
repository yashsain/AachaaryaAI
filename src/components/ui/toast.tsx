'use client'

import * as React from 'react'
import { Toaster as Sonner, toast as sonnerToast, type ExternalToast } from 'sonner'
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  Loader2,
} from 'lucide-react'

import { cn } from '@/lib/utils'

interface ToasterProps {
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
  visibleToasts?: number
  closeButton?: boolean
  richColors?: boolean
  expand?: boolean
  className?: string
}

export function Toaster({
  position = 'bottom-right',
  visibleToasts = 3,
  closeButton = true,
  richColors = true,
  expand = false,
  className,
  ...props
}: ToasterProps) {
  return (
    <Sonner
      position={position}
      visibleToasts={visibleToasts}
      closeButton={closeButton}
      richColors={richColors}
      expand={expand}
      className={cn('toaster', className)}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            'group toast bg-white border-2 border-neutral-200 shadow-lg rounded-lg overflow-hidden',
          title: 'text-sm font-medium text-neutral-900',
          description: 'text-sm text-neutral-600',
          actionButton: 'bg-primary-500 text-white hover:bg-primary-600',
          cancelButton: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
          closeButton:
            'bg-neutral-100 border-neutral-200 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900',
          success:
            'border-success-500 bg-success-50 [&>[data-icon]]:text-success-600',
          error: 'border-error-500 bg-error-50 [&>[data-icon]]:text-error-600',
          warning:
            'border-warning-500 bg-warning-50 [&>[data-icon]]:text-warning-600',
          info: 'border-info-500 bg-info-50 [&>[data-icon]]:text-info-600',
          loading:
            'border-neutral-300 bg-neutral-50 [&>[data-icon]]:text-neutral-600',
        },
      }}
      {...props}
    />
  )
}

const toastIcons = {
  success: <CheckCircle2 className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
  loading: <Loader2 className="h-5 w-5 animate-spin" />,
}

interface ToastAction {
  label: string
  onClick: () => void
}

interface CustomToastOptions extends ExternalToast {
  action?: ToastAction
  icon?: React.ReactNode
}

const toast = {
  success: (message: string, options?: CustomToastOptions) => {
    return sonnerToast.success(message, {
      icon: options?.icon || toastIcons.success,
      ...options,
    })
  },

  error: (message: string, options?: CustomToastOptions) => {
    return sonnerToast.error(message, {
      icon: options?.icon || toastIcons.error,
      ...options,
    })
  },

  warning: (message: string, options?: CustomToastOptions) => {
    return sonnerToast.warning(message, {
      icon: options?.icon || toastIcons.warning,
      ...options,
    })
  },

  info: (message: string, options?: CustomToastOptions) => {
    return sonnerToast.info(message, {
      icon: options?.icon || toastIcons.info,
      ...options,
    })
  },

  loading: (message: string, options?: CustomToastOptions) => {
    return sonnerToast.loading(message, {
      icon: options?.icon || toastIcons.loading,
      ...options,
    })
  },

  message: (message: string, options?: CustomToastOptions) => {
    return sonnerToast(message, options)
  },

  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: options.loading,
      success: (data) => {
        return typeof options.success === 'function'
          ? options.success(data)
          : options.success
      },
      error: (error) => {
        return typeof options.error === 'function'
          ? options.error(error)
          : options.error
      },
    })
  },

  custom: (component: (id: string | number) => React.ReactElement, options?: ExternalToast) => {
    return sonnerToast.custom(component, options)
  },

  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId)
  },
} as const

export const commonToasts = {
  loginSuccess: () => toast.success('Welcome back!'),
  loginError: () => toast.error('Invalid email or password'),
  logoutSuccess: () => toast.success('Logged out successfully'),
  sessionExpired: () =>
    toast.warning('Your session has expired. Please log in again.'),

  createSuccess: (item: string) => toast.success(`${item} created successfully`),
  createError: (item: string) => toast.error(`Failed to create ${item}`),
  updateSuccess: (item: string) => toast.success(`${item} updated successfully`),
  updateError: (item: string) => toast.error(`Failed to update ${item}`),
  deleteSuccess: (item: string) => toast.success(`${item} deleted successfully`),
  deleteError: (item: string) => toast.error(`Failed to delete ${item}`),

  uploadSuccess: () => toast.success('File uploaded successfully'),
  uploadError: () => toast.error('Failed to upload file'),
  downloadSuccess: () => toast.success('File downloaded'),
  downloadError: () => toast.error('Failed to download file'),

  fillRequiredFields: () => toast.warning('Please fill in all required fields'),
  invalidInput: (field: string) => toast.error(`Invalid ${field}`),

  networkError: () =>
    toast.error('Network error. Please check your connection.'),
  serverError: () =>
    toast.error('Server error. Please try again later.'),

  copiedToClipboard: () => toast.success('Copied to clipboard'),
  somethingWentWrong: () => toast.error('Something went wrong. Please try again.'),
}

export { toast, toastIcons, type ToasterProps, type CustomToastOptions }
