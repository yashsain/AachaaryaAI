/**
 * Puppeteer PDF Generator
 * Handles PDF generation with perfect Devanagari/Hindi support
 * Supports both local and serverless environments
 * Phase 6: PDF Generation (Puppeteer Migration)
 */

import puppeteer, { Browser, Page } from 'puppeteer'
import chromium from '@sparticuz/chromium'

/**
 * Determines if we're running in a serverless environment
 */
function isServerless(): boolean {
  return !!(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.FUNCTION_NAME
  )
}

/**
 * Launches Puppeteer browser with appropriate configuration
 * Handles both local development and serverless deployment
 */
export async function launchBrowser(): Promise<Browser> {
  console.log('[PUPPETEER] Launching browser...')

  const serverless = isServerless()
  console.log('[PUPPETEER] Environment:', serverless ? 'Serverless' : 'Local')

  if (serverless) {
    // Serverless configuration (Vercel, AWS Lambda, etc.)
    console.log('[PUPPETEER] Using @sparticuz/chromium for serverless')

    // For Vercel, we need to use the chromium binary
    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
        '--font-render-hinting=none', // Better for Devanagari
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })

    console.log('[PUPPETEER] Browser launched (serverless mode)')
    return browser
  } else {
    // Local development configuration
    console.log('[PUPPETEER] Using local Puppeteer')

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none', // Better for Devanagari
      ],
    })

    console.log('[PUPPETEER] Browser launched (local mode)')
    return browser
  }
}

/**
 * Generates a PDF from HTML content using Puppeteer
 * @param htmlContent - Complete HTML document as string
 * @param options - PDF generation options
 * @returns Buffer containing the PDF
 */
export async function generatePDFFromHTML(
  htmlContent: string,
  options?: {
    format?: 'A4' | 'Letter'
    printBackground?: boolean
    margin?: {
      top?: string
      right?: string
      bottom?: string
      left?: string
    }
  }
): Promise<Buffer> {
  const startTime = Date.now()
  let browser: Browser | null = null
  let page: Page | null = null

  try {
    // Launch browser
    browser = await launchBrowser()
    console.log(`[PUPPETEER] Browser launched in ${Date.now() - startTime}ms`)

    // Create new page
    page = await browser.newPage()
    console.log('[PUPPETEER] New page created')

    // Set viewport for consistency
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2, // Higher resolution for better text rendering
    })

    // Set content and wait for network to be idle (ensures fonts are loaded)
    console.log('[PUPPETEER] Setting page content...')
    const contentStartTime = Date.now()

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0', // Wait for Google Fonts to load
      timeout: 30000, // 30 second timeout
    })

    console.log(`[PUPPETEER] Content loaded in ${Date.now() - contentStartTime}ms`)

    // Additional wait to ensure fonts are fully rendered
    await page.evaluateHandle('document.fonts.ready')
    console.log('[PUPPETEER] Fonts ready')

    // Generate PDF
    console.log('[PUPPETEER] Generating PDF...')
    const pdfStartTime = Date.now()

    const pdfBuffer = await page.pdf({
      format: options?.format || 'A4',
      printBackground: options?.printBackground !== false, // Default to true
      margin: options?.margin || {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
      preferCSSPageSize: false, // Use format parameter instead
    })

    console.log(`[PUPPETEER] PDF generated in ${Date.now() - pdfStartTime}ms`)
    console.log(`[PUPPETEER] Total time: ${Date.now() - startTime}ms`)
    console.log(`[PUPPETEER] PDF size: ${pdfBuffer.length} bytes (${(pdfBuffer.length / 1024).toFixed(2)} KB)`)

    return pdfBuffer
  } catch (error) {
    console.error('[PUPPETEER_ERROR] Failed to generate PDF:', error)

    // Log page errors if page exists
    if (page) {
      try {
        const pageErrors = await page.evaluate(() => {
          // @ts-ignore
          return window.__errors || []
        })
        if (pageErrors.length > 0) {
          console.error('[PUPPETEER_ERROR] Page errors:', pageErrors)
        }
      } catch (e) {
        // Ignore evaluation errors
      }
    }

    throw new Error(
      `PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  } finally {
    // Clean up
    if (page) {
      await page.close().catch((e) => console.error('[PUPPETEER] Error closing page:', e))
    }

    if (browser) {
      await browser.close().catch((e) => console.error('[PUPPETEER] Error closing browser:', e))
    }

    console.log('[PUPPETEER] Cleanup completed')
  }
}

/**
 * Test function to verify Puppeteer setup and Hindi font rendering
 */
export async function testHindiRendering(): Promise<Buffer> {
  const testHTML = `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Noto Sans Devanagari', sans-serif;
      padding: 20mm;
      font-size: 14pt;
      line-height: 1.6;
    }
    h1 { color: #8B1A1A; margin-bottom: 20px; }
    .test-text { margin: 10px 0; }
    .bold { font-weight: bold; }
  </style>
</head>
<body>
  <h1>देवनागरी फॉन्ट परीक्षण</h1>

  <div class="test-text">
    <div class="bold">प्रश्न 1:</div>
    भारतीय संविधान के किस अनुच्छेद में यह प्रावधान है कि 'प्रत्येक राज्य के लिए एक राज्यपाल होगा'?
  </div>

  <div class="test-text">
    <div class="bold">विकल्प:</div>
    ((A)) अनुच्छेद 152<br>
    ((B)) अनुच्छेद 153<br>
    ((C)) अनुच्छेद 154<br>
    ((D)) अनुच्छेद 155
  </div>

  <div class="test-text">
    <div class="bold">संयुक्ताक्षर परीक्षण:</div>
    राज्य, राज्यपाल, व्यक्ति, प्रत्येक, संविधान, सिंह, गई, है
  </div>

  <div class="test-text">
    <div class="bold">मात्राएँ:</div>
    किसने, महाभियोग, विधायिका, कार्यपालिका, न्यायपालिका
  </div>
</body>
</html>
  `

  return await generatePDFFromHTML(testHTML)
}
