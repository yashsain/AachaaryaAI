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
    watermarkText,
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
    enableOptionE = true
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

    /* Font size variables - easily adjustable */
    :root {
      /* Questions & Options */
      --font-question-number: 12pt;
      --font-question-text: 12pt;
      --font-option-text: 12pt;
      --font-passage-title: 10pt;
      --font-passage-text: 12pt;

      /* Headers & Titles */
      --font-institute-name: 18pt;
      --font-title-large: 14pt;
      --font-title-medium: 11pt;
      --font-subtitle: 10pt;

      /* Body & Instructions */
      --font-body-text: 9pt;
      --font-small-text: 8pt;
      --font-tiny-text: 7.5pt;

      /* Footer */
      --font-footer: 6.5pt;
    }

    /* Watermark - diagonal across all pages except title page */
    ${watermarkText ? `
    body::before {
      content: "${watermarkText}";
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120pt;
      font-weight: bold;
      color: #000;
      opacity: 0.18;
      z-index: -1;
      pointer-events: none;
      white-space: nowrap;
    }

    /* Hide watermark on title page */
    .page:first-child {
      position: relative;
    }

    .page:first-child::before {
      content: "";
      display: none;
    }
    ` : ''}

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
      padding-bottom: 6px;
      margin-bottom: 8px;
    }

    .header-top {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;
    }

    .logo {
      width: 60px;
      height: 60px;
      object-fit: contain;
    }

    .header-branding {
      text-align: center;
    }

    .institute-subtitle {
      font-size: var(--font-title-medium);
      color: ${primaryColor};
      letter-spacing: 0.3px;
      margin-bottom: 4px;
    }

    .institute-name {
      font-size: var(--font-institute-name);
      font-weight: bold;
      color: ${primaryColor};
      line-height: 1.2;
    }

    .tagline {
      font-size: var(--font-body-text);
      color: #666;
      margin-top: 2px;
    }

    /* Metadata box */
    .metadata-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1pt solid #999;
      padding: 4px;
      margin-top: 5px;
      background: #E8E8E8;
      font-size: var(--font-body-text);
    }

    .metadata-label {
      font-weight: bold;
    }

    /* Test title */
    .test-title-section {
      margin: 8px 0;
      padding: 6px;
      background: #D3D3D3;
      border-left: 3pt solid ${primaryColor};
      text-align: center;
    }

    .test-title {
      font-size: var(--font-title-medium);
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
      font-size: var(--font-title-medium);
      font-weight: bold;
      margin-bottom: 5px;
    }

    .instruction {
      font-size: var(--font-body-text);
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
      font-size: var(--font-title-medium);
      font-weight: bold;
      margin-bottom: 8px;
    }

    .section-info {
      font-size: var(--font-body-text);
      margin-bottom: 5px;
      line-height: 1.4;
    }

    /* Topics */
    .topics-section {
      margin: 10px 0;
    }

    .topics-title {
      font-size: var(--font-subtitle);
      font-weight: bold;
      margin-bottom: 5px;
    }

    .topics-list {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .topic-chip {
      font-size: var(--font-small-text);
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
      font-size: var(--font-title-medium);
      font-weight: bold;
      margin-bottom: 10px;
    }

    .student-info-row {
      display: flex;
      margin-bottom: 8px;
    }

    .student-info-label {
      font-size: var(--font-subtitle);
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
      font-size: var(--font-subtitle);
      font-weight: bold;
      margin-top: 10px; /* Reduced from 15px */
      margin-bottom: 6px; /* Reduced from 8px */
      padding: 4px 6px; /* Reduced from 5px 8px */
      background: #F0F0F0;
      border-left: 3pt solid #0D9488;
      page-break-after: avoid; /* Keep section header with its questions */
    }

    .section-subject {
      font-size: var(--font-small-text);
      font-weight: normal;
      margin-top: 2px;
    }

    .section-marks-info {
      font-size: var(--font-small-text);
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
      border-bottom: 0.5pt solid transparent; /* Line exists but invisible */

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
      font-size: var(--font-question-number);
      display: inline;
      margin-right: 5px;
    }

    .question-text {
      font-size: var(--font-question-text);
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
      font-size: var(--font-option-text);
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
      font-size: var(--font-option-text);
    }

    /* Bilingual support - Two-column page layout (Hindi left column, English right column) */
    .bilingual-page-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      column-gap: 10px;
    }

    .hindi-questions-column {
      /* Left column for all Hindi questions */
    }

    .english-questions-column {
      /* Right column for all English questions */
    }

    .english-block {
      /* Styling for English question blocks */
    }

    .hindi-block {
      /* Styling for Hindi question blocks */
    }

    .question-text-en {
      font-size: var(--font-question-text);
      line-height: 1.3;
      color: #000;
      margin-bottom: 3px;
    }

    .question-text-hi {
      font-size: var(--font-question-text);
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
      font-size: var(--font-option-text);
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
      font-size: var(--font-passage-title);
      font-weight: bold;
      margin-bottom: 3px; /* Reduced from 4px */
      color: #495057;
    }

    .passage-text {
      font-size: var(--font-passage-text);
      line-height: 1.3; /* Reduced from 1.4 for tighter spacing */
      color: #212529;
    }

    /* Footer - CSS Paged Media running footer (appears on every page) */
    .footer {
      position: running(footer);
      border-top: 0.5pt solid #CCC;
      padding-top: 2mm;
      padding-bottom: 1mm;
      font-size: var(--font-footer);
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
      font-size: var(--font-title-medium);
      font-weight: bold;
      margin-bottom: 2px;
    }

    .question-page-code {
      font-size: var(--font-small-text);
      color: #666;
    }

    /* Match-the-following table - borderless, clean alignment */
    .match-table {
      width: 100%;
      margin: 5px 0;
      font-size: var(--font-option-text);
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
      font-size: var(--font-option-text);
      line-height: 1.3;
    }

    /* Bilingual Cover Page Styles */
    .bilingual-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 6px 0;
      font-size: var(--font-subtitle);
      font-weight: bold;
    }

    .bilingual-header-center {
      font-size: var(--font-title-large);
      font-weight: bold;
      text-align: center;
      flex: 1;
    }

    .bilingual-header-side {
      flex: 0 0 auto;
      text-align: left;
    }

    .bilingual-header-side.right {
      text-align: right;
    }

    .red-warning-box {
      border: 2pt solid #DC143C;
      padding: 6px;
      margin: 6px 0;
      background: #FFF5F5;
      font-size: var(--font-small-text);
      line-height: 1.3;
    }

    .instructions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin: 6px 0;
    }

    .instruction-box {
      border: 1pt solid #000;
      padding: 6px;
      background: #FFF;
    }

    .instruction-box-title {
      font-size: var(--font-body-text);
      font-weight: bold;
      text-align: center;
      margin-bottom: 5px;
      border-bottom: 1pt solid #000;
      padding-bottom: 3px;
    }

    .instruction-item {
      font-size: var(--font-tiny-text);
      margin-bottom: 3px;
      line-height: 1.2;
    }

    .bottom-warning {
      border: 1pt solid #DC143C;
      background: #DC143C;
      color: #FFF;
      padding: 6px;
      margin: 10px 0;
      font-size: var(--font-tiny-text);
      text-align: center;
      line-height: 1.3;
      font-weight: bold;
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
          <div class="institute-name">${instituteName}</div>
          ${tagline ? `<div class="tagline">${tagline}</div>` : ''}
        </div>
      </div>
    </div>

    <!-- Bilingual Header Bar -->
    <div class="bilingual-header">
      <div class="bilingual-header-side">
        समय : ${duration}<br>
        Time : ${duration}
      </div>
      <div class="bilingual-header-center">
        ${testTitle}
      </div>
      <div class="bilingual-header-side right">
        अधिकतम अंक : ${maxMarks}<br>
        Maximum Marks : ${maxMarks}
      </div>
    </div>

    <!-- Red Warning Box -->
    <div class="red-warning-box no-break">
      <strong>प्रश्न–पुस्तिका के पेपर की सील/पॉलीथीन बैग को खोलने पर प्रश्न–पत्र हल करने से पूर्व परीक्षार्थी यह सुनिश्चित कर लें कि :</strong><br>
      • प्रश्न-पुस्तिका संख्या तथा ओ.एम.आर. उत्तर-पत्रक पर अंकित बारकोड संख्या समान है।<br>
      • प्रश्न–पुस्तिका एवं ओ.एम.आर. उत्तर–पत्रक के सभी पृष्ठ व सभी प्रश्न मुद्रित हैं। समस्त प्रश्न, जैसा कि ऊपर वर्णित है, उपलब्ध हैं तथा कोई भी पृष्ठ नहीं/मुद्रण त्रुटि नहीं है।<br><br>
      किसी भी प्रकार की विसंगति या दोषपूर्ण होने पर परीक्षार्थी दूसरा प्रश्न-पत्र प्राप्त कर लें। यह सुनिश्चित करने की जिम्मेदारी अभ्यर्थी की होगी। परीक्षा प्रारम्भ होने के 5 मिनट पश्चात् ऐसी किसी दावे/आपत्ति पर कोई विचार नहीं किया जायेगा।<br><br>
      <strong>On opening the paper seal/polythene bag of the Question Booklet before attempting the question paper the candidate should ensure that :</strong><br>
      • Question Booklet Number and Barcode Number of OMR Answer Sheet are same.<br>
      • All pages & Questions of Question Booklet and OMR answer sheet are properly printed. All questions as mentioned above are available and no page is missing/misprinted.<br><br>
      If there is any discrepancy/defect, candidate must obtain another Question Booklet from Invigilator. Candidate himself shall be responsible for ensuring this. No claim/objection in this regard will be entertained after five minutes of start of examination.
    </div>

    <!-- Side-by-side Bilingual Instructions -->
    <div class="instructions-grid no-break">
      <!-- Hindi Instructions (Left) -->
      <div class="instruction-box">
        <div class="instruction-box-title">अनुदेश</div>
        <div class="instruction-item">1. प्रश्न पत्र को हल करने से पहले, कृपया अपनी प्रश्न पुस्तिका और ओ.एम.आर. उत्तर-पत्रक को जाँच करें और सुनिश्चित करें कि :<br><br>
* प्रश्न पुस्तिका और ओ.एम.आर. उत्तर-पत्रक की क्रम संख्या समान है।<br>
* प्रश्न पुस्तिका के सभी पृष्ठ ठीक से मुद्रित है और सभी पृष्ठों पर सारे प्रश्न मुद्रित है।<br><br>
किसी भी विसंगति/दोष के मामले में, अभ्यर्थी को प्रश्न पुस्तिका और ओ.एम.आर. उत्तर-पत्रक को बदलने के लिए तुरंत अभिक्षक को मामले की सूचना देनी चाहिए। परीक्षा प्रारम्भ होने के पाँच मिनट बाद इस संबंध में किसी भी दावा/आपत्ति पर विचार नहीं किया जाएगा। इसके लिए अभ्यर्थी उत्तरदायी होगा।</div>
        <div class="instruction-item">2. ओ.एम.आर. उत्तर-पत्रक के पीछे दिए गए सभी निर्देश पढ़ें।</div>
        <div class="instruction-item">3. ओ.एम.आर. उत्तर-पत्रक पर केवल नीले बॉल प्वाइंट पेन का प्रयोग करें। कृपया, ओ.एम.आर. उत्तर-पत्रक में अपना रोल नंबर और अन्य जानकारी सही ढंग से भरें।</div>
        <div class="instruction-item">4. सभी प्रश्नों के अंक समान हैं। प्रत्येक गलत उत्तर के लिए प्रश्न का 1/3 अंक काटे जाएंगे।</div>
        <div class="instruction-item">5. यदि किसी प्रश्न के लिए एक से अधिक उत्तर अंकित किये जाते हैं तो उसे भी गलत उत्तर माना जायेगा।</div>
        <div class="instruction-item">6. प्रत्येक प्रश्न में पाँच विकल्प/गोले हैं। पहले चार विकल्प/गोले A, B, C और D उपयुक्त उत्तर से संबंधित हैं और पाँचवाँ विकल्प/गोला 'E' 'अनुत्तरित प्रश्न' से संबंधित है।</div>
        <div class="instruction-item">7. सही उत्तर दर्शाने के लिए अभ्यर्थी को ओ.एम.आर. उत्तर-पत्रक पर संबंधित प्रश्न संख्या के पहले चार विकल्प A, B, C या D में से केवल एक विकल्प/गोले को नीले बॉल प्वाइंट पेन से भरना होगा। यदि अभ्यर्थी किसी प्रश्न का उत्तर नहीं देना चाहता है तो पाँचवें विकल्प/गोले 'E' को गहरा करना होगा।</div>
        <div class="instruction-item">8. यदि पाँच विकल्पों में से कोई भी विकल्प/गोला गहरा नहीं किया गया तो प्रश्न का 1/3 भाग अंक काट लिया जायेगा।</div>
        <div class="instruction-item">9. 10 प्रतिशत से अधिक प्रश्नों में किसी भी विकल्प/गोले को अभ्यर्थी द्वारा गहरा नहीं किया गया तो उसे परीक्षा के लिए अयोग्य घोषित कर दिया जाएगा।</div>
        <div class="instruction-item">10. अभ्यर्थी को प्रत्येक प्रश्न के लिए कोई एक विकल्प/गोला भरा है या नहीं यह सुनिश्चित करने के लिए 10 मिनट अतिरिक्त दिए जाएंगे।</div>
        <div class="instruction-item">11. यदि प्रश्न के हिन्दी या अंग्रेजी संस्करण में मुद्रण या तथ्यात्मक प्रकृति की किसी प्रकार की अस्पष्ट/गलती है, तो अंग्रेजी संस्करण को अंतिम माना जाएगा।</div>
        <div class="instruction-item">12. परीक्षा हॉल में मोबाइल फोन/ब्लूटूथ डिवाइस या किसी अन्य इलेक्ट्रॉनिक गैजेट का उपयोग सख्त वर्जित है। यदि किसी अभ्यर्थी के पास ऐसी कोई प्रतिबंधित सामग्री पाई गई तो उसके विरुद्ध नियमानुसार सख्त कार्यवाही की जाएगी।</div>
      </div>

      <!-- English Instructions (Right) -->
      <div class="instruction-box">
        <div class="instruction-box-title">INSTRUCTIONS</div>
        <div class="instruction-item">1. Before attempting the question paper, kindly check your Question Booklet (QB) and O.M.R. Answer Sheet and ensure that :<br><br>
* Serial number of Question Booklet (QB) and O.M.R. Answer Sheet is same.<br>
* All pages and all questions are properly printed.<br><br>
In case of any discrepancy/defect, the candidate should immediately report the matter to the Invigilator for replacement of Question Booklet (QB) and O.M.R. Answer Sheet. No claim/objection in this regard will be entertained after five minutes of start of examination, candidate will be liable for the same.</div>
        <div class="instruction-item">2. Read all instructions on the reverse of O.M.R. Answer Sheet.</div>
        <div class="instruction-item">3. On O.M.R. Answer Sheet, use blue ball point pen only. Please, fill your Roll No. and other information correctly in O.M.R. Answer Sheet.</div>
        <div class="instruction-item">4. All questions carry equal marks. For each wrong answer 1/3 mark of the question will be deducted.</div>
        <div class="instruction-item">5. If more than one response is marked for a question, it would also be treated as wrong answer.</div>
        <div class="instruction-item">6. Each question has five options/circles. First four options/circles A, B, C and D are related to appropriate answer and fifth option/circle 'E' is related to 'Question not attempted'.</div>
        <div class="instruction-item">7. To indicate the correct answer, the candidate has to fill in only one option/circle A, B, C or D with blue ball point pen for respective question number on the OMR Answer Sheet. If the candidate does not want to answer any question then the fifth option/circle 'E' should be darkened.</div>
        <div class="instruction-item">8. 1/3 part of the marks will be deducted for the questions, if none of the option/circle options are darkened.</div>
        <div class="instruction-item">9. If a candidate leaves more than 10 percent questions or does not darken any of the five options, he/she will be disqualified for the exam.</div>
        <div class="instruction-item">10. Candidate will be given 10 minutes extra to make sure, if he/she has filled up any one option/circle for each questions.</div>
        <div class="instruction-item">11. If there is any sort of ambiguity/mistake either of printing or factual in nature in Hindi or English version of questions, then the English Version will be treated as final.</div>
        <div class="instruction-item">12. Use of Mobile Phone/Bluetooth Device or any other electronic gadget in the examination hall is strictly prohibited. If any such prohibited material is found with any candidate, strict action will be taken against him/her as per rules.</div>
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
      // Multi-section layout - FLATTEN all sections into ONE continuous grid
      (() => {
        // Step 1: Flatten all questions from all sections into single array
        const allQuestions: Array<QuestionForPDF & { questionNumber: number }> = []
        let questionCounter = 0

        for (const section of sections) {
          const sortedQuestions = [...section.questions].sort((a, b) => a.question_order - b.question_order)
          for (const q of sortedQuestions) {
            questionCounter++
            allQuestions.push({ ...q, questionNumber: questionCounter })
          }
        }

        // Step 2: Handle passage grouping globally across ALL questions
        const passageGroups = new Map<string, boolean>()
        const questionsWithPassageFlag = allQuestions.map(q => {
          if (q.passage_id && q.passage_text) {
            const isFirst = !passageGroups.has(q.passage_id)
            passageGroups.set(q.passage_id, true)
            return { ...q, isFirstInPassage: isFirst }
          }
          return { ...q, isFirstInPassage: false }
        })

        // Step 3: Check if this is a bilingual paper
        const isBilingualPaper = questionsWithPassageFlag.length > 0 &&
          questionsWithPassageFlag[0].language === 'bilingual' &&
          questionsWithPassageFlag[0].question_text_en &&
          questionsWithPassageFlag[0].options_en

        if (isBilingualPaper) {
          // BILINGUAL LAYOUT: Two columns - Each row has Hindi (left) and English (right)
          // Grid auto-flows: Q1-Hindi, Q1-English (row 1), Q2-Hindi, Q2-English (row 2), etc.
          return `
    <div class="bilingual-page-grid">
      ${questionsWithPassageFlag.map(q => {
        // Render Hindi version (goes to left cell) then English version (goes to right cell)
        return renderQuestionHindiOnly(q, q.questionNumber, config) +
               renderQuestionEnglishOnly(q, q.questionNumber, config)
      }).join('')}
    </div>
          `
        } else {
          // NON-BILINGUAL LAYOUT: Single 2-column grid
          return `
    <div class="questions-grid">
      ${questionsWithPassageFlag.map(q => {
        return renderQuestion(q, q.questionNumber, config)
      }).join('')}
    </div>
          `
        }
      })()
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
    // Bilingual: Side-by-side grid (Hindi left, English right)
    const useEnglish2Col = shouldUse2ColumnLayout(question.options_en!)
    const useHindi2Col = shouldUse2ColumnLayout(question.options)

    // Option E labels for bilingual
    const optionELabelEn = config.enableOptionE ? 'Question not attempted' : null
    const optionELabelHi = config.enableOptionE ? 'अनुत्तरित प्रश्न' : null

    return `
    <div class="question-container">
      ${passageHtml}

      <!-- Side-by-side bilingual grid: Hindi left, English right -->
      <div class="bilingual-question-grid">
        <!-- Hindi Block (Left Column) -->
        <div class="hindi-block">
          <div class="question-text-hi"><span class="question-number">Q${questionNum}.</span> ${formatMatchText(question.question_text, question.structural_form)}</div>
          ${renderOptions(question.options, useHindi2Col, optionELabelHi)}
        </div>

        <!-- English Block (Right Column) -->
        <div class="english-block">
          <div class="question-text-en"><span class="question-number">Q${questionNum}.</span> ${formatMatchText(question.question_text_en!, question.structural_form)}</div>
          ${renderOptions(question.options_en!, useEnglish2Col, optionELabelEn)}
        </div>
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
 * Render Hindi-only version of a bilingual question
 */
function renderQuestionHindiOnly(
  question: QuestionForPDF & { isFirstInPassage?: boolean },
  questionNum: number,
  config: TemplateConfig
): string {
  const useHindi2Col = shouldUse2ColumnLayout(question.options)
  const optionELabelHi = config.enableOptionE ? 'अनुत्तरित प्रश्न' : null

  // Passage rendering for Hindi
  const passageHtml = question.isFirstInPassage && question.passage_text ? `
    <div class="passage-container">
      <div class="passage-title">PASSAGE:</div>
      <div class="passage-text">${escapeHtml(question.passage_text)}</div>
    </div>
  ` : ''

  return `
    <div class="question-container">
      ${passageHtml}
      <div class="hindi-block">
        <div class="question-text-hi"><span class="question-number">Q${questionNum}.</span> ${formatMatchText(question.question_text, question.structural_form)}</div>
        ${renderOptions(question.options, useHindi2Col, optionELabelHi)}
      </div>
    </div>
  `
}

/**
 * Render English-only version of a bilingual question
 */
function renderQuestionEnglishOnly(
  question: QuestionForPDF & { isFirstInPassage?: boolean },
  questionNum: number,
  config: TemplateConfig
): string {
  const useEnglish2Col = shouldUse2ColumnLayout(question.options_en!)
  const optionELabelEn = config.enableOptionE ? 'Question not attempted' : null

  // Passage rendering for English
  const passageHtml = question.isFirstInPassage && question.passage_en ? `
    <div class="passage-container">
      <div class="passage-title">PASSAGE:</div>
      <div class="passage-text">${escapeHtml(question.passage_en)}</div>
    </div>
  ` : ''

  return `
    <div class="question-container">
      ${passageHtml}
      <div class="english-block">
        <div class="question-text-en"><span class="question-number">Q${questionNum}.</span> ${formatMatchText(question.question_text_en!, question.structural_form)}</div>
        ${renderOptions(question.options_en!, useEnglish2Col, optionELabelEn)}
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
  const escaped = sanitized.replace(/[&<>"']/g, m => map[m])

  // FINALLY: Convert newlines to HTML line breaks for proper formatting in PDF
  return escaped.replace(/\n/g, '<br>')
}
