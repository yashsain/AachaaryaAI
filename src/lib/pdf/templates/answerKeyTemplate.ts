/**
 * Answer Key Template Generator for PDF Generation
 * Displays questions with correct answers highlighted and explanations
 */

interface AnswerKeyQuestion {
  question_number: number
  question_text: string
  question_text_en?: string
  options: Record<string, string>
  options_en?: Record<string, string>
  correct_answer: string
  explanation?: string
  explanation_en?: string
  marks: number
  is_bilingual: boolean
}

interface AnswerKeySection {
  section_name: string
  subject_name?: string
  questions: AnswerKeyQuestion[]
}

export interface AnswerKeyConfig {
  instituteLogo?: string
  instituteName: string
  primaryColor?: string
  tagline?: string
  contactInfo?: {
    phone?: string
    email?: string
    address?: string
  }
  testTitle: string
  testCode?: string
  date?: string
  examType?: string
  hasSections: boolean
  sections?: AnswerKeySection[]
  questions?: AnswerKeyQuestion[]
}

/**
 * Generates a complete HTML document for Answer Key PDF
 */
export function generateAnswerKeyHTML(config: AnswerKeyConfig): string {
  const {
    instituteLogo,
    instituteName,
    primaryColor = '#8B1A1A',
    tagline,
    contactInfo,
    testTitle,
    testCode,
    date,
    examType,
    hasSections,
    sections,
    questions
  } = config

  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${testTitle} - Answer Key</title>

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

    /* Font size variables - easily adjustable */
    :root {
      --font-question: 11pt;      /* Was 10pt */
      --font-option: 10.5pt;      /* Was 9.5pt */
      --font-explanation: 10pt;   /* Was 9pt */
    }

    body {
      font-family: 'Noto Sans Devanagari', sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #000;
      background: #fff;
    }

    @page {
      size: A4;
      margin: 15mm;
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
      margin-bottom: 8px;
      gap: 15px;
    }

    .institute-logo {
      width: 60px;
      height: 60px;
      object-fit: contain;
    }

    .institute-info {
      text-align: center;
      flex: 1;
    }

    .institute-name {
      font-size: 18pt;
      font-weight: bold;
      color: ${primaryColor};
      margin-bottom: 3px;
    }

    .institute-tagline {
      font-size: 10pt;
      color: #666;
    }

    .test-info {
      text-align: center;
      margin-top: 8px;
    }

    .test-title {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .answer-key-label {
      font-size: 12pt;
      font-weight: bold;
      color: ${primaryColor};
      margin-bottom: 5px;
      text-transform: uppercase;
    }

    .test-meta {
      font-size: 9pt;
      color: #666;
    }

    .contact-info {
      text-align: center;
      font-size: 8pt;
      color: #666;
      margin-top: 5px;
    }

    /* Section header */
    .section-header {
      font-size: 11pt;
      font-weight: bold;
      margin-top: 15px;
      margin-bottom: 10px;
      padding: 5px 8px;
      background: #F0F0F0;
      border-left: 3pt solid #0D9488;
      page-break-after: avoid;
    }

    .section-subject {
      font-size: 9pt;
      font-weight: normal;
      margin-top: 2px;
      color: #666;
    }

    /* Question container */
    .question-container {
      margin-bottom: 15px;
      padding: 10px;
      border: 1pt solid #E0E0E0;
      border-radius: 5px;
      background: #FAFAFA;
      break-inside: avoid;
    }

    .question-header {
      margin-bottom: 8px;
    }

    .question-number {
      font-weight: bold;
      font-size: 10pt;
      color: ${primaryColor};
      margin-right: 5px;
    }

    .question-text {
      font-size: var(--font-question);
      line-height: 1.4;
    }

    .question-text-en {
      font-size: 9.5pt;
      color: #333;
      margin-top: 5px;
      font-style: italic;
    }

    .marks-info {
      font-size: 8pt;
      color: #666;
      margin-top: 3px;
    }

    /* Options */
    .options {
      margin: 10px 0;
      padding-left: 5px;
    }

    .option {
      font-size: var(--font-option);
      margin-bottom: 5px;
      padding: 5px 8px;
      border-radius: 3px;
      display: flex;
      align-items: flex-start;
    }

    .option-label {
      font-weight: bold;
      margin-right: 8px;
      min-width: 25px;
    }

    .option-text {
      flex: 1;
    }

    /* Correct answer styling */
    .option.correct {
      background: #D1FAE5;
      border: 1.5pt solid #10B981;
      font-weight: 600;
    }

    .option.correct .option-label {
      color: #059669;
    }

    .correct-indicator {
      margin-left: auto;
      color: #059669;
      font-weight: bold;
      font-size: 8pt;
      padding-left: 10px;
    }

    /* Bilingual options */
    .bilingual-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 10px 0;
    }

    .hindi-options, .english-options {
      padding: 5px;
    }

    .options-label {
      font-size: 8pt;
      font-weight: bold;
      color: #666;
      margin-bottom: 5px;
    }

    /* Explanation */
    .explanation {
      margin-top: 10px;
      padding: 8px;
      background: #FEF3C7;
      border-left: 3pt solid #F59E0B;
      border-radius: 3px;
    }

    .explanation-title {
      font-size: 9pt;
      font-weight: bold;
      color: #92400E;
      margin-bottom: 5px;
    }

    .explanation-text {
      font-size: var(--font-explanation);
      line-height: 1.4;
      color: #78350F;
    }

    .explanation-text-en {
      font-size: 8.5pt;
      color: #78350F;
      margin-top: 5px;
      font-style: italic;
    }

    /* Footer */
    .footer {
      position: running(footer);
      text-align: center;
      font-size: 8pt;
      color: #666;
      padding-top: 5px;
      border-top: 0.5pt solid #DDD;
    }

    @page {
      @bottom-center {
        content: element(footer);
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="header-top">
      ${instituteLogo ? `<img src="${instituteLogo}" alt="${instituteName} Logo" class="institute-logo">` : ''}
      <div class="institute-info">
        <div class="institute-name">${escapeHtml(instituteName)}</div>
        ${tagline ? `<div class="institute-tagline">${escapeHtml(tagline)}</div>` : ''}
      </div>
    </div>

    <div class="test-info">
      <div class="test-title">${escapeHtml(testTitle)}</div>
      <div class="answer-key-label">उत्तर कुंजी / Answer Key</div>
      <div class="test-meta">
        ${testCode ? `Test Code: ${escapeHtml(testCode)}` : ''}
        ${date ? ` | Date: ${escapeHtml(date)}` : ''}
        ${examType ? ` | ${escapeHtml(examType)}` : ''}
      </div>
    </div>

    ${contactInfo ? `
    <div class="contact-info">
      ${contactInfo.phone ? `Phone: ${escapeHtml(contactInfo.phone)}` : ''}
      ${contactInfo.email ? ` | Email: ${escapeHtml(contactInfo.email)}` : ''}
      ${contactInfo.address ? ` | ${escapeHtml(contactInfo.address)}` : ''}
    </div>
    ` : ''}
  </div>

  <!-- Content -->
  ${hasSections && sections ?
    // Multi-section layout
    sections.map(section => `
      <div class="section-header">
        ${escapeHtml(section.section_name)}
        ${section.subject_name ? `<div class="section-subject">${escapeHtml(section.subject_name)}</div>` : ''}
      </div>

      ${section.questions.map(q => renderAnswerKeyQuestion(q)).join('')}
    `).join('')
    :
    // Single section layout
    questions ? questions.map(q => renderAnswerKeyQuestion(q)).join('') : ''
  }

  <!-- Footer -->
  <div class="footer">
    ${instituteName} - Answer Key
  </div>

</body>
</html>`
}

/**
 * Renders a single question with correct answer highlighted
 */
function renderAnswerKeyQuestion(question: AnswerKeyQuestion): string {
  const {
    question_number,
    question_text,
    question_text_en,
    options,
    options_en,
    correct_answer,
    explanation,
    explanation_en,
    marks,
    is_bilingual
  } = question

  if (is_bilingual && question_text_en && options_en) {
    // Bilingual layout
    return `
    <div class="question-container">
      <div class="question-header">
        <span class="question-number">Q${question_number}.</span>
        <span class="question-text">${escapeHtml(question_text)}</span>
        <div class="question-text-en">${escapeHtml(question_text_en)}</div>
        <div class="marks-info">[${marks} Mark${marks > 1 ? 's' : ''}]</div>
      </div>

      <div class="bilingual-options">
        <div class="hindi-options">
          <div class="options-label">Options (Hindi):</div>
          ${renderOptionsWithCorrect(options, correct_answer, false)}
        </div>
        <div class="english-options">
          <div class="options-label">Options (English):</div>
          ${renderOptionsWithCorrect(options_en, correct_answer, false)}
        </div>
      </div>

      ${explanation || explanation_en ? `
      <div class="explanation">
        <div class="explanation-title">व्याख्या / Explanation:</div>
        ${explanation ? `<div class="explanation-text">${escapeHtml(explanation)}</div>` : ''}
        ${explanation_en ? `<div class="explanation-text-en">${escapeHtml(explanation_en)}</div>` : ''}
      </div>
      ` : ''}
    </div>
    `
  } else {
    // Non-bilingual layout
    return `
    <div class="question-container">
      <div class="question-header">
        <span class="question-number">Q${question_number}.</span>
        <span class="question-text">${escapeHtml(question_text)}</span>
        <div class="marks-info">[${marks} Mark${marks > 1 ? 's' : ''}]</div>
      </div>

      ${renderOptionsWithCorrect(options, correct_answer, true)}

      ${explanation ? `
      <div class="explanation">
        <div class="explanation-title">व्याख्या / Explanation:</div>
        <div class="explanation-text">${escapeHtml(explanation)}</div>
      </div>
      ` : ''}
    </div>
    `
  }
}

/**
 * Renders options with correct answer highlighted
 */
function renderOptionsWithCorrect(
  options: Record<string, string>,
  correctAnswer: string,
  showContainer: boolean
): string {
  const optionsHtml = Object.entries(options).map(([key, value]) => {
    const normalizedKey = normalizeOptionKey(key)
    const isCorrect = normalizedKey === normalizeOptionKey(correctAnswer)
    const correctClass = isCorrect ? ' correct' : ''

    return `
    <div class="option${correctClass}">
      <span class="option-label">(${normalizedKey})</span>
      <span class="option-text">${escapeHtml(value)}</span>
      ${isCorrect ? '<span class="correct-indicator">✓ CORRECT</span>' : ''}
    </div>
    `
  }).join('')

  return showContainer ? `<div class="options">${optionsHtml}</div>` : optionsHtml
}

/**
 * Normalize option keys to handle different formats (1, "1", A, "A", etc.)
 */
function normalizeOptionKey(key: string): string {
  return key.toString().trim().toUpperCase()
}

/**
 * Escape HTML to prevent injection
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}
