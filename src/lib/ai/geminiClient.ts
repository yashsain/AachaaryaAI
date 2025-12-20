/**
 * Gemini AI Client
 *
 * Initializes and exports the Google Generative AI client
 * for question generation using Gemini 2.5 Flash
 */

import { GoogleGenAI } from "@google/genai"

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables')
}

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

// Model configuration
export const GEMINI_MODEL = "gemini-2.5-flash"

// Generation config for NEET questions
export const NEET_GENERATION_CONFIG = {
  temperature: 0.7,
  responseMimeType: "application/json"
}
