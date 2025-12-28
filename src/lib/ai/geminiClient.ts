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
// Using gemini-3-pro-preview for testing (most expensive model - worst case scenario)
// Cost: $2.00 input / $12.00 output per 1M tokens
// All other models will be cheaper than this
export const GEMINI_MODEL = "gemini-3-pro-preview"

// Generation config for all exam questions
// Uses JSON response format - applicable to all protocols
export const GENERATION_CONFIG = {
  temperature: 0.7,
  responseMimeType: "application/json"
}

// Legacy export for backward compatibility (will be removed in future)
export const NEET_GENERATION_CONFIG = GENERATION_CONFIG
