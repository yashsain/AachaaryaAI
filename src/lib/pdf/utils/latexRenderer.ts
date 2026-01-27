/**
 * LaTeX Renderer for PDF Generation
 *
 * Converts LaTeX math expressions to HTML using KaTeX server-side rendering.
 * Supports both inline ($...$) and display ($$...$$) math.
 */

import katex from 'katex'

interface RenderOptions {
  displayMode?: boolean
  throwOnError?: boolean
}

/**
 * Escapes HTML special characters for safe rendering
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

/**
 * Renders LaTeX math to HTML using KaTeX
 */
function renderMath(latex: string, displayMode: boolean = false): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: 'html',
      strict: false,
      trust: false,
      macros: {
        // Common macros can be added here
        '\\R': '\\mathbb{R}',
        '\\N': '\\mathbb{N}',
        '\\Z': '\\mathbb{Z}',
        '\\Q': '\\mathbb{Q}',
      }
    })
  } catch (error) {
    console.error('[LATEX_RENDER_ERROR]', error)
    // Return original text wrapped in error styling if rendering fails
    return `<span class="katex-error" style="color: red;">${escapeHtml(latex)}</span>`
  }
}

/**
 * Parse and render LaTeX math in text
 *
 * Supports:
 * - Display math: $$...$$
 * - Inline math: $...$
 *
 * @param text - Text containing LaTeX expressions
 * @returns HTML string with rendered math
 */
export function renderLatexInText(text: string): string {
  if (!text) return ''

  let result = text
  const parts: Array<{ type: 'text' | 'math', content: string, displayMode: boolean }> = []
  let currentIndex = 0

  // First pass: Find all math expressions
  // We need to handle $$...$$ before $...$ to avoid matching $$ as two inline delimiters

  // Pattern to match both display ($$...$$) and inline ($...$) math
  // $$...$$ must come first to avoid matching it as two separate $...$
  // For inline: match anything except $ (to avoid crossing boundaries)
  const mathPattern = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g
  let match: RegExpExecArray | null

  while ((match = mathPattern.exec(text)) !== null) {
    const matchedText = match[0]
    const matchIndex = match.index

    // Add text before this match
    if (matchIndex > currentIndex) {
      parts.push({
        type: 'text',
        content: text.substring(currentIndex, matchIndex),
        displayMode: false
      })
    }

    // Determine if display or inline math
    const isDisplayMath = matchedText.startsWith('$$') && matchedText.endsWith('$$')

    if (isDisplayMath) {
      // Display math: $$...$$
      const latex = matchedText.slice(2, -2).trim()
      parts.push({
        type: 'math',
        content: latex,
        displayMode: true
      })
    } else {
      // Inline math: $...$
      const latex = matchedText.slice(1, -1).trim()
      parts.push({
        type: 'math',
        content: latex,
        displayMode: false
      })
    }

    currentIndex = matchIndex + matchedText.length
  }

  // Add remaining text after last match
  if (currentIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(currentIndex),
      displayMode: false
    })
  }

  // If no math found, just escape and return
  if (parts.length === 0) {
    return escapeHtml(text).replace(/\n/g, '<br>')
  }

  // Second pass: Render each part
  result = parts.map(part => {
    if (part.type === 'text') {
      // Escape HTML and convert newlines
      return escapeHtml(part.content).replace(/\n/g, '<br>')
    } else {
      // Render math
      return renderMath(part.content, part.displayMode)
    }
  }).join('')

  return result
}

/**
 * Get KaTeX CSS for inline embedding in HTML
 * This should be called once and the result cached/inlined in the HTML template
 */
export function getKatexCSS(): string {
  // Import KaTeX CSS as a string
  // In production, this should be read from node_modules/katex/dist/katex.min.css
  // and inlined directly into the HTML template for better performance

  // For now, we'll return a CDN link comment that should be replaced with inline CSS
  return `
    <!-- KaTeX CSS should be inlined here -->
    <!-- Import from: node_modules/katex/dist/katex.min.css -->
  `.trim()
}

/**
 * Sanitize text before rendering (removes excessive whitespace, etc.)
 */
export function sanitizeForPDF(text: string): string {
  if (!text) return ''

  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')   // Handle old Mac line endings
    .trim()
}

/**
 * Convenience function that sanitizes and renders LaTeX
 */
export function renderLatexForPDF(text: string): string {
  const sanitized = sanitizeForPDF(text)
  return renderLatexInText(sanitized)
}
