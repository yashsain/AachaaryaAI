/**
 * PDF Question Grid Component
 * Two-column layout for questions (1-15 left, 16-30 right)
 * Phase 6: PDF Generation
 */

import React from 'react'
import { View } from '@react-pdf/renderer'
import { neetStyles } from '../styles/neetStyles'
import { QuestionForPDF } from '../types'
import { PDFQuestion } from './PDFQuestion'

interface PDFQuestionGridProps {
  questions: QuestionForPDF[]
}

export const PDFQuestionGrid: React.FC<PDFQuestionGridProps> = ({ questions }) => {
  // Sort questions by question_order
  const sortedQuestions = [...questions].sort((a, b) => a.question_order - b.question_order)

  // Split into two columns (first half and second half)
  const midpoint = Math.ceil(sortedQuestions.length / 2)
  const leftColumn = sortedQuestions.slice(0, midpoint)
  const rightColumn = sortedQuestions.slice(midpoint)

  return (
    <View style={neetStyles.questionGrid}>
      {/* Left column */}
      <View style={neetStyles.questionColumn}>
        {leftColumn.map((question, index) => (
          <PDFQuestion
            key={question.id}
            question={question}
            displayNumber={index + 1}
          />
        ))}
      </View>

      {/* Right column */}
      <View style={neetStyles.questionColumn}>
        {rightColumn.map((question, index) => (
          <PDFQuestion
            key={question.id}
            question={question}
            displayNumber={midpoint + index + 1}
          />
        ))}
      </View>
    </View>
  )
}
