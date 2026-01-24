'use client'

/**
 * MathText Component
 *
 * Renders text with inline and block LaTeX/KaTeX math notation
 * Supports both $...$ (inline) and $$...$$ (block) delimiters
 */

import { useEffect, useRef } from 'react'
import katex from 'katex'

interface MathTextProps {
  children: string
  className?: string
  displayMode?: boolean // Force display mode (block) for entire content
}

export function MathText({ children, className = '', displayMode = false }: MathTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!containerRef.current || !children) return

    try {
      // CRITICAL FIX: Handle escape sequences ONLY in text regions, NOT in math regions!
      //
      // Problem: Database stores literal "\n" (backslash+n) instead of actual newlines
      // But we must preserve ALL backslashes inside math expressions $...$
      //
      // Solution:
      // 1. First extract all math regions (between $ and $$)
      // 2. Convert \n, \r, \t to actual characters ONLY in text regions
      // 3. Keep math regions completely untouched
      // 4. Reassemble and proceed with rendering

      let processedText = children

      // If displayMode is true, treat entire content as math (no escape conversion)
      if (displayMode) {
        const html = katex.renderToString(processedText, {
          displayMode: true,
          throwOnError: false,
          output: 'html',
          trust: false,
        })
        containerRef.current.innerHTML = html
        return
      }

      // Step 1: Extract math regions and replace with placeholders
      const mathRegions: string[] = []
      let mathPlaceholderIndex = 0

      // Replace $$...$$ first (block math)
      processedText = processedText.replace(/\$\$([\s\S]+?)\$\$/g, (match, content) => {
        mathRegions.push(match)
        return `__MATH_PLACEHOLDER_${mathPlaceholderIndex++}__`
      })

      // Replace $...$ (inline math)
      processedText = processedText.replace(/\$(.+?)\$/g, (match, content) => {
        mathRegions.push(match)
        return `__MATH_PLACEHOLDER_${mathPlaceholderIndex++}__`
      })

      // Step 2: Now convert escape sequences ONLY in text regions (math is protected)
      processedText = processedText
        .replace(/\\n/g, '\n')  // Convert \n to actual newline (only affects text, not math)
        .replace(/\\r/g, '\r')  // Convert \r to carriage return
        .replace(/\\t/g, '\t')  // Convert \t to tab

      // Step 3: Restore math regions
      mathPlaceholderIndex = 0
      processedText = processedText.replace(/__MATH_PLACEHOLDER_(\d+)__/g, () => {
        return mathRegions[mathPlaceholderIndex++]
      })

      // Parse inline and block math in text
      const parts: Array<{ type: 'text' | 'inline-math' | 'block-math', content: string }> = []
      let currentPos = 0
      let text = processedText

      // Find all math delimiters ($$...$$  and $...$)
      const regex = /\$\$([\s\S]+?)\$\$|\$(.+?)\$/g
      let match: RegExpExecArray | null

      while ((match = regex.exec(text)) !== null) {
        // Add text before math
        if (match.index > currentPos) {
          parts.push({
            type: 'text',
            content: text.substring(currentPos, match.index)
          })
        }

        // Add math content
        if (match[1] !== undefined) {
          // Block math ($$...$$)
          parts.push({
            type: 'block-math',
            content: match[1]
          })
        } else if (match[2] !== undefined) {
          // Inline math ($...$)
          parts.push({
            type: 'inline-math',
            content: match[2]
          })
        }

        currentPos = regex.lastIndex
      }

      // Add remaining text
      if (currentPos < text.length) {
        parts.push({
          type: 'text',
          content: text.substring(currentPos)
        })
      }

      // If no math found, just render as text with newlines preserved
      if (parts.length === 0) {
        containerRef.current.innerHTML = children
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br/>')
        return
      }

      // Render all parts
      const html = parts.map(part => {
        if (part.type === 'text') {
          // Escape HTML in text portions and preserve newlines
          return part.content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br/>')
        } else {
          // Render math using KaTeX
          try {
            return katex.renderToString(part.content, {
              displayMode: part.type === 'block-math',
              throwOnError: false,
              output: 'html',
              trust: false,
            })
          } catch (err) {
            console.error('[KATEX_RENDER_ERROR]', err)
            // Fallback: show raw LaTeX
            return part.type === 'block-math'
              ? `<div class="text-error-600">$$${part.content}$$</div>`
              : `<span class="text-error-600">$${part.content}$</span>`
          }
        }
      }).join('')

      containerRef.current.innerHTML = html
    } catch (error) {
      console.error('[MATH_TEXT_ERROR]', error)
      // Fallback: render as plain text with newlines preserved
      if (containerRef.current) {
        containerRef.current.innerHTML = children
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br/>')
      }
    }
  }, [children, displayMode])

  return (
    <span
      ref={containerRef}
      className={className}
      style={{ display: displayMode ? 'block' : 'inline' }}
    />
  )
}
