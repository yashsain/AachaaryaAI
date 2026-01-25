/**
 * Unified Material Analyzer
 *
 * Single analyzer for both material types:
 * 1. Notes/Theory → Extract topics, concepts, depth (scope_analysis)
 * 2. Sample Papers → Extract top 10-15 best/difficult/unique questions (style_examples)
 *
 * NO separate files. NO overcomplicated analysis.
 * Part of: PDF Analysis Caching System
 */

import { ai } from './geminiClient'
import { uploadPDFToGemini } from './pdfUploader'
import type { ScopeAnalysisJSON, StyleExamplesJSON, ExtractedQuestion } from './types/chapterKnowledge'

const GEMINI_MODEL = 'gemini-2.0-flash-exp'

// ============================================================================
// NOTES ANALYSIS (Scope)
// ============================================================================

/**
 * Analyze theory notes/study materials to extract scope
 *
 * @param fileUrl - Public URL of the PDF (Supabase storage)
 * @param materialTitle - Name of the material
 * @param chapterName - Name of the chapter
 * @param officialSyllabus - Official syllabus from protocol (for boundaries)
 * @returns ScopeAnalysisJSON with topics, subtopics, depth
 */
export async function analyzeNotes(
  fileUrl: string,
  materialTitle: string,
  chapterName: string,
  officialSyllabus: string
): Promise<ScopeAnalysisJSON> {
  console.log(`[MATERIAL_ANALYZER] Analyzing notes: ${materialTitle}`)

  const prompt = `You are analyzing study materials for the chapter "${chapterName}".

OFFICIAL SYLLABUS (Scope Boundary):
${officialSyllabus}

TASK: Extract the following from the uploaded PDF:
1. Main topics covered
2. Subtopics under each main topic (with depth level and keywords)
3. Depth indicators for each topic (basic/intermediate/advanced)
4. Terminology mappings (if material uses different terms than syllabus)

Return ONLY valid JSON in this exact format:
{
  "topics": ["Topic 1", "Topic 2", ...],
  "subtopics": {
    "Topic 1": [
      { "name": "Subtopic A", "depth": "intermediate", "keywords": ["keyword1", "keyword2"] }
    ]
  },
  "depth_indicators": {
    "Topic 1": "intermediate",
    "Topic 2": "basic"
  },
  "terminology_mappings": {
    "material_term": "official_term"
  },
  "extracted_from_materials": ["${materialTitle}"],
  "last_updated": "${new Date().toISOString()}"
}

Rules:
- Only extract topics that are within the official syllabus
- Depth: "basic" = introductory, "intermediate" = board exam level, "advanced" = competitive exam level
- If material uses Hindi/regional terms, map them to English syllabus terms
- Be comprehensive but stay within scope`

  try {
    // Upload PDF to Gemini using the PDF uploader utility
    console.log(`[MATERIAL_ANALYZER] Uploading PDF: ${fileUrl}`)
    const uploadedFile = await uploadPDFToGemini(fileUrl, materialTitle)

    console.log(`[MATERIAL_ANALYZER] File uploaded: ${uploadedFile.fileName}`)

    // Generate analysis
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          fileData: {
            fileUri: uploadedFile.fileUri,
            mimeType: uploadedFile.mimeType
          },
        },
        { text: prompt },
      ],
      config: {
        temperature: 0.1, // Low temperature for consistent extraction
        responseMimeType: 'application/json',
      },
    })

    const responseText = response.text
    if (!responseText) {
      throw new Error('No response from Gemini')
    }

    console.log(`[MATERIAL_ANALYZER] Analysis complete for ${materialTitle}`)

    const analysis = JSON.parse(responseText) as ScopeAnalysisJSON
    return analysis
  } catch (error) {
    console.error(`[MATERIAL_ANALYZER] Failed to analyze notes:`, error)
    throw new Error(`Failed to analyze "${materialTitle}": ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ============================================================================
// PAPER ANALYSIS (Style Examples)
// ============================================================================

/**
 * Extract top 10-15 best/difficult/unique questions from sample paper
 *
 * @param fileUrl - Public URL of the PDF (Supabase storage)
 * @param materialId - UUID of the material
 * @param materialTitle - Name of the material
 * @param chapterName - Name of the chapter
 * @returns StyleExamplesJSON with raw questions
 */
export async function analyzePaper(
  fileUrl: string,
  materialId: string,
  materialTitle: string,
  chapterName: string
): Promise<StyleExamplesJSON> {
  console.log(`[MATERIAL_ANALYZER] Analyzing paper: ${materialTitle}`)

  const prompt = `You are extracting sample questions from a practice paper for the chapter "${chapterName}".

TASK: Extract the TOP 10-15 BEST/MOST DIFFICULT/MOST UNIQUE questions from this paper.

Selection Criteria:
- Choose questions that are well-structured and high-quality
- Prefer difficult or unique questions over simple recall
- Include a mix of question types (if available)
- Must be relevant to chapter "${chapterName}"

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "text": "Full question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Correct answer here",
      "explanation": "Solution/explanation if available (optional)",
      "source_material_id": "${materialId}",
      "source_material_title": "${materialTitle}"
    }
  ],
  "extracted_from_materials": ["${materialTitle}"]
}

Rules:
- Extract EXACTLY the question text as written (don't rephrase)
- Include all options if it's an MCQ
- Include explanation only if explicitly provided in the paper
- Extract 10-15 questions maximum (best quality over quantity)
- If paper has < 10 questions, extract all of them
- NO analysis, NO difficulty estimates, just RAW questions`

  try {
    // Upload PDF to Gemini using the PDF uploader utility
    console.log(`[MATERIAL_ANALYZER] Uploading PDF: ${fileUrl}`)
    const uploadedFile = await uploadPDFToGemini(fileUrl, materialTitle)

    console.log(`[MATERIAL_ANALYZER] File uploaded: ${uploadedFile.fileName}`)

    // Generate analysis
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          fileData: {
            fileUri: uploadedFile.fileUri,
            mimeType: uploadedFile.mimeType
          },
        },
        { text: prompt },
      ],
      config: {
        temperature: 0.1, // Low temperature for accurate extraction
        responseMimeType: 'application/json',
      },
    })

    const responseText = response.text
    if (!responseText) {
      throw new Error('No response from Gemini')
    }

    console.log(`[MATERIAL_ANALYZER] Analysis complete for ${materialTitle}`)

    const styleExamples = JSON.parse(responseText) as StyleExamplesJSON
    return styleExamples
  } catch (error) {
    console.error(`[MATERIAL_ANALYZER] Failed to analyze paper:`, error)
    throw new Error(`Failed to analyze "${materialTitle}": ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
