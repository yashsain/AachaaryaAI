'use client'

import { useState, useRef, useEffect } from 'react'

export interface MultiSelectOption {
  id: string
  name: string
  meta?: string // Optional metadata to display (e.g., stream name for subjects)
}

interface MultiSelectProps {
  label: string
  options: MultiSelectOption[]
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
  placeholder?: string
  required?: boolean
  error?: string
  disabled?: boolean
}

export function MultiSelect({
  label,
  options,
  selectedIds,
  onChange,
  placeholder = 'Select options...',
  required = false,
  error,
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOptions = options.filter(opt => selectedIds.includes(opt.id))
  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(selectedId => selectedId !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  const removeOption = (id: string) => {
    onChange(selectedIds.filter(selectedId => selectedId !== id))
  }

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Selected items as badges */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedOptions.map(option => (
            <span
              key={option.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-900 text-white text-sm rounded-md"
            >
              {option.name}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  className="hover:bg-gray-700 rounded p-0.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg text-left
          flex items-center justify-between
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error
            ? 'border-red-500'
            : isOpen
              ? 'border-gray-900 ring-2 ring-gray-900'
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <span className={selectedOptions.length === 0 ? 'text-gray-400' : 'text-gray-900'}>
          {selectedOptions.length === 0
            ? placeholder
            : `${selectedOptions.length} selected`}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleOption(option.id)}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-gray-100
                    flex items-center justify-between
                    ${selectedIds.includes(option.id) ? 'bg-gray-50' : ''}
                  `}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{option.name}</span>
                    {option.meta && (
                      <span className="text-xs text-gray-500">{option.meta}</span>
                    )}
                  </div>
                  {selectedIds.includes(option.id) && (
                    <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
