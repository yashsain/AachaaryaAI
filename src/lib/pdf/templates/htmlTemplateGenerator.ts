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

    /* Page setup with automatic page numbering */
    @page {
      size: A4;
      margin: 15mm 15mm 30mm 15mm; /* Increased bottom margin for footer + Option E */

      @bottom-center {
        content: "Page " counter(page);
        font-size: 8pt;
        color: #666;
      }
    }

    /* Ensure content doesn't overflow into footer area */
    .page {
      min-height: calc(100vh - 35mm);
      padding-bottom: 20mm; /* Increased padding to prevent question cut-off */
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

    /* Section header */
    .section-header {
      font-size: 11pt;
      font-weight: bold;
      margin-top: 15px;
      margin-bottom: 8px;
      padding: 5px 8px;
      background: #F0F0F0;
      border-left: 3pt solid #0D9488;
      page-break-after: avoid; /* Keep section header with its questions */
    }

    .section-subject {
      font-size: 9pt;
      font-weight: normal;
      margin-top: 2px;
    }

    .section-marks-info {
      font-size: 9pt;
      color: #666;
      margin-bottom: 8px;
      padding-left: 8px;
    }

    /* Questions */
    .questions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 15px;
    }

    .question-column {
      min-width: 0;
    }

    .question-container {
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 0.5pt solid #E0E0E0;
      page-break-inside: avoid; /* Keep entire question together */
      orphans: 3; /* Minimum 3 lines at bottom of page */
      widows: 3; /* Minimum 3 lines at top of page */
    }

    .question-header {
      margin-bottom: 5px;
    }

    .question-number {
      font-weight: bold;
      font-size: 10pt;
      display: inline;
      margin-right: 5px;
    }

    .question-text {
      font-size: 10pt;
      line-height: 1.5;
      display: inline;
    }

    .options {
      margin-top: 5px;
      padding-left: 15px;
    }

    .option {
      font-size: 9pt;
      margin-bottom: 3px;
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

    /* Passage */
    .passage-container {
      margin-bottom: 8px;
      padding: 8px;
      background: #F8F9FA;
      border: 1pt solid #DDD;
      border-radius: 4px;
    }

    .passage-title {
      font-size: 8pt;
      font-weight: bold;
      margin-bottom: 4px;
      color: #495057;
    }

    .passage-text {
      font-size: 8.5pt;
      line-height: 1.4;
      color: #212529;
    }

    /* Footer (contact info only - page numbers handled by @page counter) */
    .footer {
      position: running(footer);
      display: flex;
      justify-content: center;
      align-items: center;
      border-top: 1pt solid #CCC;
      padding-top: 5px;
      font-size: 8pt;
      color: #333;
      text-align: center;
    }

    /* Alternative footer positioning for compatibility */
    .footer-fixed {
      position: fixed;
      bottom: 5mm; /* Raised slightly to prevent overlap */
      left: 0;
      right: 0;
      padding: 5px 15mm;
      border-top: 1pt solid #CCC;
      background: #fff;
      font-size: 8pt;
      color: #333;
      text-align: center;
      z-index: 1000; /* Ensure footer stays on top */
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

    <!-- Footer (contact info only - page numbers handled by CSS @page counter) -->
    ${contactInfo ? `
    <div class="footer-fixed">
      ${[contactInfo.address, contactInfo.city, contactInfo.phone, contactInfo.email].filter(Boolean).join(' • ')}
    </div>
    ` : ''}
  </div>

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

        // Split into two columns
        const midpoint = Math.ceil(questionsWithPassageFlag.length / 2)
        const leftColumn = questionsWithPassageFlag.slice(0, midpoint)
        const rightColumn = questionsWithPassageFlag.slice(midpoint)

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

          <!-- Questions Grid -->
          <div class="questions-grid">
            <!-- Left Column -->
            <div class="question-column">
              ${leftColumn.map((q, idx) => {
                const questionNum = questionOffset + idx + 1
                return renderQuestion(q, questionNum, config)
              }).join('')}
            </div>

            <!-- Right Column -->
            <div class="question-column">
              ${rightColumn.map((q, idx) => {
                const questionNum = questionOffset + midpoint + idx + 1
                return renderQuestion(q, questionNum, config)
              }).join('')}
            </div>
          </div>
        </div>
        `
      }).join('')
      :
      // Single section layout
      `<div class="questions-grid">
        <div class="question-column">
          ${questions.filter((_, idx) => idx < Math.ceil(questions.length / 2))
            .map((q, idx) => renderQuestion(q, idx + 1, config)).join('')}
        </div>
        <div class="question-column">
          ${questions.filter((_, idx) => idx >= Math.ceil(questions.length / 2))
            .map((q, idx) => renderQuestion(q, Math.ceil(questions.length / 2) + idx + 1, config)).join('')}
        </div>
      </div>`
    }

  <!-- Footer (contact info only - page numbers handled by CSS @page counter) -->
  ${contactInfo ? `
  <div class="footer-fixed">
    ${[contactInfo.address, contactInfo.city, contactInfo.phone, contactInfo.email].filter(Boolean).join(' • ')}
  </div>
  ` : ''}
</body>
</html>`
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

  return `
    <div class="question-container">
      ${question.isFirstInPassage && question.passage_text ? `
        <div class="passage-container">
          <div class="passage-title">PASSAGE:</div>
          <div class="passage-text">${escapeHtml(question.passage_text)}</div>
        </div>
      ` : ''}

      <div class="question-header">
        <span class="question-number">Q${questionNum}.</span>
        <span class="question-text">${escapeHtml(question.question_text)}</span>
      </div>

      <div class="options">
        ${Object.entries(question.options).map(([key, value]) => `
          <div class="option">
            <span class="option-label">(${normalizeOptionKey(key)})</span>
            <span class="option-text">${escapeHtml(value)}</span>
          </div>
        `).join('')}
        ${optionELabel ? `
          <div class="option">
            <span class="option-label">(E)</span>
            <span class="option-text">${optionELabel}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `
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
