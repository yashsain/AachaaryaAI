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
  question: QuestionForPDF & { isFirstInPassage?: boolean }
  displayNumber?: number  // Optional display number (different from question_order)
}

export const PDFQuestion: React.FC<PDFQuestionProps> = ({ question, displayNumber }) => {
  const questionNum = displayNumber ?? question.question_order

  return (
    <View style={neetStyles.questionContainer}>
      {/* Passage text (only for first question in passage group) */}
      {question.isFirstInPassage && question.passage_text && (
        <View style={{
          marginBottom: 8,
          padding: 8,
          backgroundColor: '#F8F9FA',
          border: '1pt solid #DDDDDD',
          borderRadius: 4
        }}>
          <Text style={{
            fontSize: 8,
            fontWeight: 'bold',
            marginBottom: 4,
            color: '#495057'
          }}>
            PASSAGE:
          </Text>
          <Text style={{
            fontSize: 8.5,
            lineHeight: 1.4,
            color: '#212529'
          }}>
            {question.passage_text}
          </Text>
        </View>
      )}

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
    </View>
  )
}
