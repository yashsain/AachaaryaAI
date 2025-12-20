/**
 * PDF Question Component
 * Renders a single question with options
 * Phase 6: PDF Generation
 */

import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { neetStyles } from '../styles/neetStyles'
import { QuestionForPDF } from '../types'

interface PDFQuestionProps {
  question: QuestionForPDF
  displayNumber?: number  // Optional display number (different from question_order)
}

export const PDFQuestion: React.FC<PDFQuestionProps> = ({ question, displayNumber }) => {
  const questionNum = displayNumber ?? question.question_order

  return (
    <View style={neetStyles.questionContainer}>
      {/* Question header with number and text */}
      <View style={neetStyles.questionHeader}>
        <Text style={neetStyles.questionNumber}>Q{questionNum}.</Text>
        <Text style={neetStyles.questionText}>{question.question_text}</Text>
      </View>

      {/* Options */}
      <View style={neetStyles.optionsContainer}>
        {Object.entries(question.options).map(([key, value]) => (
          <View key={key} style={neetStyles.option}>
            <Text style={neetStyles.optionLabel}>({key})</Text>
            <Text style={neetStyles.optionText}>{value}</Text>
          </View>
        ))}
      </View>

      {/* Chapter label (optional, for reference) */}
      {question.chapter_name && (
        <Text style={neetStyles.chapterLabel}>
          Chapter: {question.chapter_name}
        </Text>
      )}
    </View>
  )
}
