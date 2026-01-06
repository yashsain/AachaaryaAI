/**
 * Meta-Reference Detector
 *
 * Detects and flags questions that inappropriately reference source materials
 * or contain editorial notes/commentary
 *
 * CRITICAL: Detects both English and Hindi editorial notes like "(नोट: ...)"
 */

export function detectMetaReferences(questionText: string): string[] {
  const errors: string[] = []
  const lowerText = questionText.toLowerCase()

  const metaPatterns = [
    // ===== ENGLISH META-REFERENCES =====
    { pattern: /according to (ncert|the study material|the provided material|the material|the notes|who)/i, message: 'Contains meta-reference "according to..."' },
    { pattern: /as per (ncert|the study material|the provided material|the material|the notes)/i, message: 'Contains meta-reference "as per..."' },
    { pattern: /as mentioned in (ncert|the study material|the provided material|the material|the notes)/i, message: 'Contains meta-reference "as mentioned in..."' },
    { pattern: /the study material (says|states|mentions|defines)/i, message: 'References "the study material" directly' },
    { pattern: /the provided material/i, message: 'References "the provided material"' },
    { pattern: /what does (ncert|the material|the study material) say/i, message: 'Asks "what does the material say"' },
    { pattern: /in the (given|provided) (material|notes)/i, message: 'References "in the given/provided material"' },
    { pattern: /from the (study material|provided notes)/i, message: 'References "from the study material"' },

    // ===== HINDI EDITORIAL NOTES =====
    { pattern: /\(नोट:.*?\)/g, message: 'Contains Hindi editorial note "(नोट: ...)" - STRICTLY PROHIBITED' },
    { pattern: /\(टिप्पणी:.*?\)/g, message: 'Contains Hindi commentary "(टिप्पणी: ...)" - STRICTLY PROHIBITED' },
    { pattern: /\(ध्यान दें:.*?\)/g, message: 'Contains Hindi note "(ध्यान दें: ...)" - STRICTLY PROHIBITED' },
    { pattern: /\(सूचना:.*?\)/g, message: 'Contains Hindi information note "(सूचना: ...)" - STRICTLY PROHIBITED' },
    { pattern: /\(व्याख्या:.*?\)/g, message: 'Contains Hindi explanation "(व्याख्या: ...)" - STRICTLY PROHIBITED' },
    { pattern: /\(जानकारी:.*?\)/g, message: 'Contains Hindi information "(जानकारी: ...)" - STRICTLY PROHIBITED' },
    { pattern: /\(संकेत:.*?\)/g, message: 'Contains Hindi hint "(संकेत: ...)" - STRICTLY PROHIBITED' },

    // ===== ENGLISH EDITORIAL NOTES =====
    { pattern: /\(\s*note:\s*.*?\)/gi, message: 'Contains English editorial note "(Note: ...)" - STRICTLY PROHIBITED' },
    { pattern: /\(\s*commentary:\s*.*?\)/gi, message: 'Contains commentary "(Commentary: ...)" - STRICTLY PROHIBITED' },
    { pattern: /\(\s*editorial.*?\)/gi, message: 'Contains editorial note "(Editorial...)" - STRICTLY PROHIBITED' },
    { pattern: /\(\s*explanation:\s*.*?\)/gi, message: 'Contains explanation in parentheses "(Explanation: ...)" - STRICTLY PROHIBITED' },
    { pattern: /\(\s*hint:\s*.*?\)/gi, message: 'Contains hint "(Hint: ...)" - STRICTLY PROHIBITED' },
    { pattern: /\(\s*remark:\s*.*?\)/gi, message: 'Contains remark "(Remark: ...)" - STRICTLY PROHIBITED' },
    { pattern: /\(\s*comment:\s*.*?\)/gi, message: 'Contains comment "(Comment: ...)" - STRICTLY PROHIBITED' },
    { pattern: /\(\s*info:\s*.*?\)/gi, message: 'Contains info note "(Info: ...)" - STRICTLY PROHIBITED' },

    // ===== META-REFERENCES IN PARENTHESES =====
    { pattern: /\(\s*according to.*?\)/gi, message: 'Contains meta-reference "(According to...)" - STRICTLY PROHIBITED' },
    { pattern: /\(\s*as per.*?\)/gi, message: 'Contains meta-reference "(As per...)" - STRICTLY PROHIBITED' },
    { pattern: /\(\s*based on.*?\)/gi, message: 'Contains meta-reference "(Based on...)" - STRICTLY PROHIBITED' },
    { pattern: /\(\s*source:.*?\)/gi, message: 'Contains source reference "(Source: ...)" - STRICTLY PROHIBITED' },
    { pattern: /\(\s*reference:.*?\)/gi, message: 'Contains reference "(Reference: ...)" - STRICTLY PROHIBITED' },

    // ===== MIXED LANGUAGE NOTES (Hindi keyword + English text) =====
    { pattern: /\(\s*नोट\s*:.*?\)/gi, message: 'Contains mixed Hindi/English note - STRICTLY PROHIBITED' },
    { pattern: /\(\s*note\s*:.*?\)/gi, message: 'Contains note with mixed case - STRICTLY PROHIBITED' }
  ]

  for (const { pattern, message } of metaPatterns) {
    if (pattern.test(questionText)) {
      errors.push(message)
    }
  }

  return errors
}
