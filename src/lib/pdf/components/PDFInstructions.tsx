/**
 * PDF Instructions Component
 * Standard NEET exam instructions section
 * Phase 6: PDF Generation
 */

import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { neetStyles } from '../styles/neetStyles'

export const PDFInstructions: React.FC = () => {
  const instructions = [
    'Fill in the OMR sheet with your name and registration number using a BLUE/BLACK ball point pen.',
    'There are multiple-choice questions. Each question carries 4 marks for correct answer and -1 mark for incorrect answer.',
    'Choose the correct or most appropriate response for each question.',
    'The test is divided into sections. Attempt all questions.',
    'Rough work can be done in the space provided at the end of the booklet.',
    'Use of calculator, log tables, mobile phones, and any electronic devices is strictly prohibited.',
    'Return the OMR sheet to the invigilator at the end of the examination.',
  ]

  return (
    <View style={neetStyles.instructionsSection}>
      <Text style={neetStyles.instructionsTitle}>GENERAL INSTRUCTIONS:</Text>
      <View style={neetStyles.instructionsList}>
        {instructions.map((instruction, index) => (
          <Text key={index} style={neetStyles.instruction}>
            {index + 1}. {instruction}
          </Text>
        ))}
      </View>
    </View>
  )
}
