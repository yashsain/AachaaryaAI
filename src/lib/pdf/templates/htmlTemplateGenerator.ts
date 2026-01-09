/**
 * HTML Template Generator for Puppeteer-based PDF Generation
 * Supports perfect Devanagari/Hindi rendering using Google Fonts
 * Phase 6: PDF Generation (Puppeteer Migration)
 */

import { TemplateConfig, PDFSection, QuestionForPDF } from '../types'
import { sanitizeQuestionText } from '@/lib/ai/questionSanitizer'

/**
 * Generates a complete HTML document for PDF generation
 * Uses Google Fonts (Noto Sans Devanagari) for guaranteed Hindi rendering
 */
export function generateHTMLTemplate(config: TemplateConfig): string {
  const {
    instituteLogo,
    instituteName,
    primaryColor = '#8B1A1A',
    tagline,
    contactInfo,
    testTitle,
    testCode,
    date,
    duration,
    maxMarks,
    topics,
    examType,
    hasSections,
    sections,
    questions,
    enableOptionE = false
  } = config

  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${testTitle}</title>

  <!-- Google Fonts: Noto Sans Devanagari for perfect Hindi rendering -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet">

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Noto Sans Devanagari', sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #000;
      background: #fff;
    }

    /* Page setup - Ultra-compact margins for maximum content */
    @page {
      size: A4;
      margin: 8mm 8mm 12mm 8mm; /* Bottom 12mm for footer margin box */

      @bottom-center {
        content: element(footer); /* Display running footer at page bottom */
      }
    }

    /* Ensure content doesn't overflow into footer area */
    .page {
      min-height: calc(100vh - 20mm); /* Adjusted for 8mm+12mm margins */
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
      }

      .page-break {
        page-break-after: always;
      }

      .no-break {
        page-break-inside: avoid;
      }
    }

    /* Header */
    .header {
      border-bottom: 2pt solid #000;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }

    .header-top {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin-bottom: 10px;
    }

    .logo {
      width: 70px;
      height: 70px;
      object-fit: contain;
    }

    .header-branding {
      text-align: center;
    }

    .institute-subtitle {
      font-size: 11pt;
      color: ${primaryColor};
      letter-spacing: 0.3px;
      margin-bottom: 4px;
    }

    .institute-name {
      font-size: 20pt;
      font-weight: bold;
      color: ${primaryColor};
      line-height: 1.2;
    }

    .tagline {
      font-size: 9pt;
      color: #666;
      margin-top: 2px;
    }

    /* Metadata box */
    .metadata-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1pt solid #999;
      padding: 6px;
      margin-top: 8px;
      background: #E8E8E8;
      font-size: 9pt;
    }

    .metadata-label {
      font-weight: bold;
    }

    /* Test title */
    .test-title-section {
      margin: 12px 0;
      padding: 8px;
      background: #D3D3D3;
      border-left: 3pt solid ${primaryColor};
      text-align: center;
    }

    .test-title {
      font-size: 12pt;
      font-weight: bold;
    }

    /* Instructions */
    .instructions-section {
      margin: 10px 0;
      padding: 10px;
      border: 1pt solid #CCC;
      background: #FAFAFA;
    }

    .instructions-title {
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .instruction {
      font-size: 9pt;
      margin-bottom: 3px;
      line-height: 1.4;
      padding-left: 15px;
    }

    /* Paper structure */
    .paper-structure {
      margin: 10px 0;
      padding: 10px;
      border: 1pt solid #CCC;
      background: #FAFAFA;
    }

    .structure-title {
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .section-info {
      font-size: 9pt;
      margin-bottom: 5px;
      line-height: 1.4;
    }

    /* Topics */
    .topics-section {
      margin: 10px 0;
    }

    .topics-title {
      font-size: 10pt;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .topics-list {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .topic-chip {
      font-size: 8pt;
      padding: 3px 8px;
      background: #E8E8E8;
      border-radius: 3px;
    }

    /* Student info */
    .student-info {
      margin: 10px 0;
      padding: 10px;
      border: 1pt solid #000;
    }

    .student-info-title {
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .student-info-row {
      display: flex;
      margin-bottom: 8px;
    }

    .student-info-label {
      font-size: 10pt;
      font-weight: bold;
      width: 30%;
    }

    .student-info-line {
      border-bottom: 1pt solid #000;
      width: 70%;
      height: 15px;
    }

    /* Section header - Compact styling */
    .section-header {
      font-size: 10pt; /* Reduced from 11pt */
      font-weight: bold;
      margin-top: 10px; /* Reduced from 15px */
      margin-bottom: 6px; /* Reduced from 8px */
      padding: 4px 6px; /* Reduced from 5px 8px */
      background: #F0F0F0;
      border-left: 3pt solid #0D9488;
      page-break-after: avoid; /* Keep section header with its questions */
    }

    .section-subject {
      font-size: 8pt; /* Reduced from 9pt */
      font-weight: normal;
      margin-top: 2px;
    }

    .section-marks-info {
      font-size: 8pt; /* Reduced from 9pt */
      color: #666;
      margin-bottom: 6px; /* Reduced from 8px */
      padding-left: 6px; /* Reduced from 8px */
    }

    /* Questions - CSS Multi-Column for vertical flow (fill left column first) */
    .questions-grid {
      column-count: 2;           /* Two columns */
      column-gap: 8px;           /* Space between columns */
      column-fill: auto;         /* Fill left column completely, then right */
      margin-bottom: 10px;       /* Reduced from 15px */
    }

    .question-column {
      /* Not needed with Flexbox, but kept for compatibility */
      min-width: 0;
    }

    .question-container {
      /* No width needed - column-count handles column sizing */
      margin-bottom: 6px; /* Reduced from 12px - 50% tighter */
      padding-bottom: 4px; /* Reduced from 8px - 50% tighter */
      border-bottom: 0.5pt solid #E0E0E0;

      /* Allow questions to split across columns (user preference) */
      /* REMOVED: break-inside: avoid - allows questions to flow naturally */

      /* Proper rendering */
      display: block;
      box-sizing: border-box;

      /* Allow more flexibility for column/page breaks */
      orphans: 2; /* Reduced from 5 - minimum 2 lines at bottom */
      widows: 2;  /* Reduced from 5 - minimum 2 lines at top */
    }

    .question-header {
      margin-bottom: 3px; /* Reduced from 5px for tighter layout */
    }

    .question-number {
      font-weight: bold;
      font-size: 8.5pt; /* Reduced from 10pt - uniform with options */
      display: inline;
      margin-right: 5px;
    }

    .question-text {
      font-size: 8.5pt; /* Reduced from 10pt - SAME AS OPTIONS */
      line-height: 1.3; /* Reduced from 1.5 for tighter spacing */
      display: inline;
    }

    .options {
      margin-top: 3px; /* Reduced from 5px for tighter layout */
      padding-left: 15px;

      /* Allow options to split across columns if needed (user preference) */
      /* REMOVED: break-inside: avoid - allows natural flow */
    }

    .option {
      font-size: 8.5pt; /* Reduced from 9pt - SAME AS QUESTION TEXT */
      margin-bottom: 2px; /* Reduced from 3px for tighter spacing */
      display: flex;
    }

    .option-label {
      font-weight: bold;
      margin-right: 5px;
      min-width: 20px;
    }

    .option-text {
      flex: 1;
    }

    /* Bilingual support - Block structure (English first, then Hindi) */
    .english-block {
      margin-bottom: 4px; /* Space between English and Hindi blocks */
    }

    .hindi-block {
      margin-top: 4px;
    }

    .question-text-en {
      font-size: 8.5pt;
      line-height: 1.3;
      color: #000;
      margin-bottom: 3px;
    }

    .question-text-hi {
      font-size: 8.5pt;
      line-height: 1.3;
      color: #000;
      margin-bottom: 3px;
    }

    /* Options layout - 2 columns for short options, 1 column for long */
    .options-2col {
      display: grid;
      grid-template-columns: 1fr 1fr; /* Two equal columns */
      column-gap: 8px;
      row-gap: 2px;
      padding-left: 15px;
      margin-top: 3px;
    }

    .options-1col {
      padding-left: 15px;
      margin-top: 3px;
    }

    .option-2col,
    .option-1col {
      font-size: 8.5pt;
      margin-bottom: 2px;
      display: flex;
      align-items: flex-start;
    }

    /* Option E spanning both columns in 2-col layout (A B / C D / E) */
    .option-e-span {
      grid-column: 1 / -1; /* Span both columns */
      max-width: 50%; /* Keep it same width as single option */
    }

    /* Passage - Compact styling */
    .passage-container {
      margin-bottom: 6px; /* Reduced from 8px */
      padding: 6px; /* Reduced from 8px */
      background: #F8F9FA;
      border: 0.5pt solid #DDD; /* Reduced from 1pt - thinner border */
      border-radius: 3px; /* Reduced from 4px */

      /* Keep passage with following question */
      break-after: avoid;
      page-break-after: avoid;
    }

    .passage-title {
      font-size: 7pt; /* Reduced from 8pt */
      font-weight: bold;
      margin-bottom: 3px; /* Reduced from 4px */
      color: #495057;
    }

    .passage-text {
      font-size: 7.5pt; /* Reduced from 8.5pt */
      line-height: 1.3; /* Reduced from 1.4 for tighter spacing */
      color: #212529;
    }

    /* Footer - CSS Paged Media running footer (appears on every page) */
    .footer {
      position: running(footer);
      border-top: 0.5pt solid #CCC;
      padding-top: 2mm;
      padding-bottom: 1mm;
      font-size: 6.5pt;
      color: #555;
      text-align: center;
      line-height: 1.0;
      background: #fff;
    }

    /* Question page header (smaller, compact) */
    .question-page-header {
      margin-bottom: 10px;
      margin-top: 0;
      border-bottom: 1pt solid #CCC;
      padding-bottom: 3px;
      text-align: center;
      page-break-after: avoid; /* Keep header with questions */
    }

    .question-page-title {
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 2px;
    }

    .question-page-code {
      font-size: 8pt;
      color: #666;
    }

    /* Match-the-following table - borderless, clean alignment */
    .match-table {
      width: 100%;
      margin: 5px 0;
      font-size: 8.5pt;
      border-collapse: collapse;
    }

    .match-table td {
      padding: 2px 8px;
      vertical-align: top;
      line-height: 1.3;
      border: none;
    }

    .match-table th {
      padding: 3px 8px;
      vertical-align: top;
      line-height: 1.3;
      border: none;
      font-weight: bold;
      text-align: left;
    }

    .match-table td:first-child,
    .match-table th:first-child {
      width: 50%;
    }

    .match-instruction {
      margin: 3px 0;
      font-size: 8.5pt;
      line-height: 1.3;
    }
  </style>
</head>
<body>
  <!-- Page 1: Front Page with Instructions -->
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="header-top">
        ${instituteLogo ? `<img src="${instituteLogo}" alt="Logo" class="logo">` : ''}
        <div class="header-branding">
          <div class="institute-subtitle">Your AI Teaching Assistant</div>
          <div class="institute-name">${instituteName}</div>
          ${tagline ? `<div class="tagline">${tagline}</div>` : ''}
        </div>
      </div>

      <div class="metadata-box">
        <div><span class="metadata-label">Max. Marks :</span> ${maxMarks}</div>
        <div><span class="metadata-label">Date :</span> ${date}</div>
        <div><span class="metadata-label">Time :</span> ${duration}</div>
        <div><span class="metadata-label">Test Code :</span> ${testCode}</div>
      </div>
    </div>

    <!-- Test Title -->
    <div class="test-title-section">
      <div class="test-title">${testTitle}</div>
    </div>

    <!-- General Instructions -->
    <div class="instructions-section no-break">
      <div class="instructions-title">GENERAL INSTRUCTIONS:</div>
      <div class="instruction">1. Fill in the OMR sheet with your name and registration number using a BLUE/BLACK ball point pen.</div>
      <div class="instruction">2. There are multiple-choice questions. Each question carries 4 marks for correct answer and -1 mark for incorrect answer.</div>
      <div class="instruction">3. Choose the correct or most appropriate response for each question.</div>
      <div class="instruction">4. The test is divided into sections. Attempt all questions.</div>
      <div class="instruction">5. Rough work can be done in the space provided at the end of the booklet.</div>
      <div class="instruction">6. Use of calculator, log tables, mobile phones, and any electronic devices is strictly prohibited.</div>
      <div class="instruction">7. Return the OMR sheet to the invigilator at the end of the examination.</div>
    </div>

    ${hasSections && sections ? `
    <!-- Paper Structure -->
    <div class="paper-structure no-break">
      <div class="structure-title">PAPER STRUCTURE:</div>
      ${sections.map((section, index) => {
        const totalMarks = section.questions.reduce((sum, q) => sum + q.marks, 0)
        return `<div class="section-info">
          <span style="font-weight: bold;">Section ${index + 1} - ${section.section_name}:</span>
          ${section.questions.length} questions${section.subject_name ? ` (${section.subject_name})` : ''} • ${totalMarks} marks
        </div>`
      }).join('')}
    </div>
    ` : ''}

    <!-- Topics Covered -->
    <div class="topics-section no-break">
      <div class="topics-title">TOPICS COVERED:</div>
      <div class="topics-list">
        ${topics.map(topic => `<span class="topic-chip">${topic}</span>`).join('')}
      </div>
    </div>

    <!-- Student Information -->
    <div class="student-info no-break">
      <div class="student-info-title">STUDENT INFORMATION</div>
      <div class="student-info-row">
        <div class="student-info-label">Name:</div>
        <div class="student-info-line"></div>
      </div>
      <div class="student-info-row">
        <div class="student-info-label">Registration No:</div>
        <div class="student-info-line"></div>
      </div>
      <div class="student-info-row">
        <div class="student-info-label">Date:</div>
        <div class="student-info-line"></div>
      </div>
    </div>

  </div>

  <!-- Running footer (appears on all pages via CSS Paged Media) -->
  ${contactInfo ? `
  <div class="footer">
    ${[contactInfo.address, contactInfo.city, contactInfo.phone, contactInfo.email].filter(Boolean).join(' • ')}
  </div>
  ` : ''}

  <!-- Questions section (flows naturally after page 1) -->
  <!-- Question page header -->
  <div class="question-page-header" style="page-break-before: always;">
    <div class="question-page-title">${testTitle}</div>
    <div class="question-page-code">${testCode}</div>
  </div>

    ${hasSections && sections ?
      // Multi-section layout
      sections.map((section, sectionIndex) => {
        // Calculate question offset for continuous numbering
        let questionOffset = 0
        for (let i = 0; i < sectionIndex; i++) {
          questionOffset += sections[i].questions.length
        }

        // Sort questions and mark first in passage
        const sortedQuestions = [...section.questions].sort((a, b) => a.question_order - b.question_order)
        const passageGroups = new Map<string, boolean>()
        const questionsWithPassageFlag = sortedQuestions.map(q => {
          if (q.passage_id && q.passage_text) {
            const isFirst = !passageGroups.has(q.passage_id)
            passageGroups.set(q.passage_id, true)
            return { ...q, isFirstInPassage: isFirst }
          }
          return { ...q, isFirstInPassage: false }
        })

        // Render all questions in single container (multi-column will handle split)
        return `
        <div>
          <!-- Section Header -->
          <div class="section-header">
            SECTION ${sectionIndex + 1}: ${section.section_name.toUpperCase()}
            ${section.subject_name ? `<div class="section-subject">(${section.subject_name})</div>` : ''}
          </div>

          ${section.marks_per_question ? `
          <div class="section-marks-info">
            Each question carries ${section.marks_per_question} mark${section.marks_per_question > 1 ? 's' : ''}
          </div>
          ` : ''}

          <!-- Questions Grid (Multi-Column Layout) -->
          <div class="questions-grid">
            ${questionsWithPassageFlag.map((q, idx) => {
              const questionNum = questionOffset + idx + 1
              return renderQuestion(q, questionNum, config)
            }).join('')}
          </div>
        </div>
        `
      }).join('')
      :
      // Single section layout (Multi-Column Layout)
      `<div class="questions-grid">
        ${questions.map((q, idx) => renderQuestion(q, idx + 1, config)).join('')}
      </div>`
    }

</body>
</html>`
}

/**
 * Helper function to determine if options should use 2-column layout
 * Returns true if all options are short enough to fit 2 per row
 */
function shouldUse2ColumnLayout(options: Record<string, string>): boolean {
  const MAX_CHARS_FOR_2COL = 30
  const optionValues = Object.values(options)
  const maxLength = Math.max(...optionValues.map(opt => opt.length))
  return maxLength <= MAX_CHARS_FOR_2COL
}

/**
 * Helper function to render options with smart layout
 */
function renderOptions(
  options: Record<string, string>,
  use2Col: boolean,
  optionELabel: string | null = null
): string {
  const containerClass = use2Col ? 'options-2col' : 'options-1col'
  const optionClass = use2Col ? 'option-2col' : 'option-1col'

  const optionsHtml = Object.entries(options).map(([key, value]) => {
    const normalizedKey = normalizeOptionKey(key)
    return `<div class="${optionClass}"><span class="option-label">(${normalizedKey})</span><span class="option-text">${escapeHtml(value)}</span></div>`
  }).join('')

  // Option E: If 2-col layout and we have 5 options total, make E span both columns
  let optionE = ''
  if (optionELabel) {
    const optionEClass = use2Col ? `${optionClass} option-e-span` : optionClass
    optionE = `<div class="${optionEClass}"><span class="option-label">(E)</span><span class="option-text">${optionELabel}</span></div>`
  }

  return `<div class="${containerClass}">${optionsHtml}${optionE}</div>`
}

/**
 * Helper function to format match-the-column questions as tables
 * Uses database-driven detection (structuralForm === 'matchFollowing')
 * Handles both English and Hindi bilingual formats gracefully
 * Falls back to regular escapeHtml() for non-match questions
 */
function formatMatchText(text: string, structuralForm?: string | null): string {
  // Database-driven detection (authoritative source)
  const isMatchQuestion = structuralForm === 'matchFollowing'

  if (!isMatchQuestion) {
    return escapeHtml(text) // Not a match question, return plain text
  }

  // Split by newlines (keep empty lines for parsing structure)
  const lines = text.split('\n')

  if (lines.length === 0) {
    return escapeHtml(text)
  }

  // Parse sections
  let topInstruction = ''
  let columnHeaders: { col1: string; col2: string } | null = null
  const dataRows: Array<{ col1: string; col2: string }> = []
  let bottomInstruction = ''

  let currentSection: 'top' | 'headers' | 'data' | 'bottom' = 'top'

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines
    if (line.length === 0) continue

    // Detect column headers (contains both Column I/II or सूची I/II on same line)
    const isHeaderLine = /Column\s*I.*Column\s*II|सूची\s*I.*सूची\s*II/i.test(line)

    if (isHeaderLine && currentSection === 'top') {
      // Parse column headers
      // Split by "Column II" or "सूची II"
      const headerMatch = line.match(/(Column\s*I|सूची\s*I)\s*(.+?)\s*(Column\s*II|सूची\s*II)\s*(.+)/i)
      if (headerMatch) {
        columnHeaders = {
          col1: (headerMatch[1] + ' ' + headerMatch[2]).trim(),
          col2: (headerMatch[3] + ' ' + headerMatch[4]).trim()
        }
        currentSection = 'headers'
      }
      continue
    }

    // Detect data rows (start with A., B., C., D. and contain Roman numerals)
    const dataRowMatch = line.match(/^([A-D]\.)\s*(.+?)\s+(I{1,3}V?\.)\s*(.+)$/i)
    if (dataRowMatch && currentSection !== 'bottom') {
      // Extract both columns from same line
      dataRows.push({
        col1: (dataRowMatch[1] + ' ' + dataRowMatch[2]).trim(),
        col2: (dataRowMatch[3] + ' ' + dataRowMatch[4]).trim()
      })
      currentSection = 'data'
      continue
    }

    // Detect bottom instruction (contains "Choose" or "नीचे दिए गए")
    const isBottomInstruction = /Choose.*correct.*answer|नीचे दिए गए.*विकल्पों/i.test(line)
    if (isBottomInstruction || (currentSection === 'data' && !dataRowMatch)) {
      bottomInstruction = line
      currentSection = 'bottom'
      continue
    }

    // Top instruction (before headers)
    if (currentSection === 'top') {
      topInstruction = line
    }
  }

  // Build HTML structure
  let html = ''

  // Top instruction
  if (topInstruction) {
    html += `<div class="match-instruction">${escapeHtml(topInstruction)}</div>`
  }

  // Table with headers and data
  if (columnHeaders || dataRows.length > 0) {
    html += '<table class="match-table">'

    // Column headers
    if (columnHeaders) {
      html += '<tr>'
      html += `<th>${escapeHtml(columnHeaders.col1)}</th>`
      html += `<th>${escapeHtml(columnHeaders.col2)}</th>`
      html += '</tr>'
    }

    // Data rows
    for (const row of dataRows) {
      html += '<tr>'
      html += `<td>${escapeHtml(row.col1)}</td>`
      html += `<td>${escapeHtml(row.col2)}</td>`
      html += '</tr>'
    }

    html += '</table>'
  }

  // Bottom instruction
  if (bottomInstruction) {
    html += `<div class="match-instruction">${escapeHtml(bottomInstruction)}</div>`
  }

  // Fallback: if parsing failed completely, return escaped text
  if (!html) {
    return escapeHtml(text)
  }

  return html
}

/**
 * Helper function to render a single question
 */
function renderQuestion(
  question: QuestionForPDF & { isFirstInPassage?: boolean },
  questionNum: number,
  config: TemplateConfig
): string {
  // Detect language per question for appropriate Option E label
  const optionELabel = config.enableOptionE
    ? detectQuestionLanguage(question.question_text)
    : null

  // Check if question is bilingual
  const isBilingual = question.language === 'bilingual' &&
                      question.question_text_en &&
                      question.options_en

  // Passage rendering
  const passageHtml = question.isFirstInPassage && question.passage_text ? `
    <div class="passage-container">
      <div class="passage-title">PASSAGE:</div>
      <div class="passage-text">
        ${isBilingual && question.passage_en ? `
          <div class="passage-text-en">${escapeHtml(question.passage_en)}</div>
          <div class="passage-text-hi">${escapeHtml(question.passage_text)}</div>
        ` : escapeHtml(question.passage_text)}
      </div>
    </div>
  ` : ''

  if (isBilingual) {
    // Bilingual: English block first, then Hindi block
    const useEnglish2Col = shouldUse2ColumnLayout(question.options_en!)
    const useHindi2Col = shouldUse2ColumnLayout(question.options)

    // Option E labels for bilingual
    const optionELabelEn = config.enableOptionE ? 'Question not attempted' : null
    const optionELabelHi = config.enableOptionE ? 'अनुत्तरित प्रश्न' : null

    return `
    <div class="question-container">
      ${passageHtml}

      <!-- English Block -->
      <div class="english-block">
        <div class="question-text-en"><span class="question-number">Q${questionNum}.</span> ${formatMatchText(question.question_text_en!, question.structural_form)}</div>
        ${renderOptions(question.options_en!, useEnglish2Col, optionELabelEn)}
      </div>

      <!-- Hindi Block -->
      <div class="hindi-block">
        <div class="question-text-hi">${formatMatchText(question.question_text, question.structural_form)}</div>
        ${renderOptions(question.options, useHindi2Col, optionELabelHi)}
      </div>
    </div>
    `
  } else {
    // Non-bilingual: existing structure
    const use2Col = shouldUse2ColumnLayout(question.options)

    return `
    <div class="question-container">
      ${passageHtml}

      <div class="question-header">
        <span class="question-number">Q${questionNum}.</span>
        <span class="question-text">${formatMatchText(question.question_text, question.structural_form)}</span>
      </div>

      ${renderOptions(question.options, use2Col, optionELabel)}
    </div>
    `
  }
}

/**
 * Detect question language and return appropriate Option E label
 * Detects Devanagari script (Hindi) vs English
 *
 * @param questionText - The question text to analyze
 * @returns "अनुत्तरित प्रश्न" for Hindi, "Question not attempted" for English
 */
function detectQuestionLanguage(questionText: string): string {
  // Regex to detect Devanagari Unicode range (U+0900 to U+097F)
  const devanagariRegex = /[\u0900-\u097F]/

  // If question contains Devanagari script → Hindi
  if (devanagariRegex.test(questionText)) {
    return 'अनुत्तरित प्रश्न'
  }

  // Otherwise → English
  return 'Question not attempted'
}

/**
 * Normalize option keys to ensure consistent (A), (B), (C), (D) format
 * FINAL LINE OF DEFENSE: Fixes bad data from database
 *
 * Handles all these cases:
 * - "A" → "A" → renders as (A) ✅
 * - "(A)" → "A" → renders as (A) ✅
 * - "((A))" → "A" → renders as (A) ✅
 * - "(((A)))" → "A" → renders as (A) ✅
 * - "1" → "A" → renders as (A) ✅
 * - "(1)" → "A" → renders as (A) ✅
 * - "2" → "B" → renders as (B) ✅
 */
function normalizeOptionKey(key: string): string {
  // Strip all parentheses
  const stripped = key.replace(/[()]/g, '').trim()

  // Convert numeric keys to letters
  const numericToLetter: Record<string, string> = {
    '1': 'A',
    '2': 'B',
    '3': 'C',
    '4': 'D'
  }

  // If it's a number, convert it
  if (numericToLetter[stripped]) {
    return numericToLetter[stripped]
  }

  // Otherwise, return the letter as-is (should be A/B/C/D)
  return stripped.toUpperCase()
}

/**
 * Escape HTML special characters AND sanitize editorial notes
 * CRITICAL: Removes editorial notes like "(नोट: ...)" before HTML escaping
 */
function escapeHtml(text: string): string {
  // FIRST: Strip editorial notes and commentary
  const sanitized = sanitizeQuestionText(text)

  // THEN: Escape HTML special characters
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return sanitized.replace(/[&<>"']/g, m => map[m])
}
