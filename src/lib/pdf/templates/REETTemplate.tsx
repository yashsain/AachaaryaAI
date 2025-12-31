/**
 * REET Template - Multi-Section PDF Template
 * Template for REET and other multi-section test papers with institute branding
 * Supports multiple sections with different subjects (e.g., Hindi, Social Studies, Teaching Methods)
 * Phase 6: PDF Generation
 */

import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { neetStyles } from '../styles/neetStyles'
import { TemplateConfig } from '../types'
import { PDFHeader } from '../components/PDFHeader'
import { PDFInstructions } from '../components/PDFInstructions'
import { PDFFooter } from '../components/PDFFooter'
import { PDFQuestion } from '../components/PDFQuestion'

interface REETTemplateProps {
  config: TemplateConfig
}

/**
 * Helper to mark first question in each passage group
 * This allows PDFQuestion component to render passage text before the first question
 */
function markFirstQuestionInPassageGroups(questions: any[]) {
  const passageGroups = new Map<string, boolean>()

  return questions.map((q) => {
    if (q.passage_id && q.passage_text) {
      const isFirst = !passageGroups.has(q.passage_id)
      passageGroups.set(q.passage_id, true)
      return { ...q, isFirstInPassage: isFirst }
    }
    return { ...q, isFirstInPassage: false }
  })
}

export const REETTemplate: React.FC<REETTemplateProps> = ({ config }) => {
  // Ensure sections exist
  if (!config.hasSections || !config.sections || config.sections.length === 0) {
    throw new Error('REET Template requires sections to be defined')
  }

  // Sort sections by section_order
  const sortedSections = [...config.sections].sort((a, b) => a.section_order - b.section_order)

  return (
    <Document
      title={config.testTitle}
      author={config.instituteName}
      subject={config.examType || 'Practice Test'}
      creator={config.instituteName}
    >
      {/* Page 1: Front Page with Instructions */}
      <Page size="A4" style={neetStyles.page}>
        {/* Header with branding */}
        <PDFHeader config={config} />

        {/* Test Title Section */}
        <View style={neetStyles.testTitleSection}>
          <Text style={neetStyles.testTitle}>{config.testTitle}</Text>
        </View>

        {/* Instructions */}
        <PDFInstructions />

        {/* Sections Overview */}
        <View style={{ marginVertical: 10, padding: 10, border: '1pt solid #CCCCCC', backgroundColor: '#FAFAFA' }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8 }}>
            PAPER STRUCTURE:
          </Text>
          {sortedSections.map((section, index) => {
            const totalMarks = section.questions.reduce((sum, q) => sum + q.marks, 0)
            return (
              <View key={section.section_id} style={{ marginBottom: 5 }}>
                <Text style={{ fontSize: 9, lineHeight: 1.4 }}>
                  <Text style={{ fontWeight: 'bold' }}>Section {index + 1} - {section.section_name}:</Text>
                  {' '}
                  {section.questions.length} questions
                  {section.subject_name && ` (${section.subject_name})`}
                  {' '}• {totalMarks} marks
                </Text>
              </View>
            )
          })}
        </View>

        {/* Topics Section */}
        <View style={neetStyles.topicsSection}>
          <Text style={neetStyles.topicsTitle}>TOPICS COVERED:</Text>
          <View style={neetStyles.topicsList}>
            {config.topics.map((topic, index) => (
              <Text key={index} style={neetStyles.topicChip}>
                {topic}
              </Text>
            ))}
          </View>
        </View>

        {/* Student Information Section */}
        <View style={neetStyles.studentInfoSection}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 10 }}>
            STUDENT INFORMATION
          </Text>

          <View style={neetStyles.studentInfoRow}>
            <Text style={neetStyles.studentInfoLabel}>Name:</Text>
            <View style={neetStyles.studentInfoUnderline} />
          </View>

          <View style={neetStyles.studentInfoRow}>
            <Text style={neetStyles.studentInfoLabel}>Registration No:</Text>
            <View style={neetStyles.studentInfoUnderline} />
          </View>

          <View style={neetStyles.studentInfoRow}>
            <Text style={neetStyles.studentInfoLabel}>Date:</Text>
            <View style={neetStyles.studentInfoUnderline} />
          </View>
        </View>

        {/* Footer */}
        <PDFFooter contactInfo={config.contactInfo} pageNumber={1} />
      </Page>

      {/* Page 2+: Questions organized by sections */}
      <Page size="A4" style={neetStyles.page}>
        {/* Header (smaller version for question pages) */}
        <View style={{ marginBottom: 15, borderBottom: '1pt solid #CCCCCC', paddingBottom: 5 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>
            {config.testTitle}
          </Text>
          <Text style={{ fontSize: 9, textAlign: 'center', color: '#666666' }}>
            {config.testCode}
          </Text>
        </View>

        {/* Sections with Questions */}
        <View>
          {sortedSections.map((section, sectionIndex) => {
            // Sort questions within each section by question_order and mark first questions in passage groups
            const sortedQuestions = markFirstQuestionInPassageGroups(
              [...section.questions].sort((a, b) => a.question_order - b.question_order)
            )

            // Calculate question number offset (cumulative from previous sections)
            let questionOffset = 0
            for (let i = 0; i < sectionIndex; i++) {
              questionOffset += sortedSections[i].questions.length
            }

            return (
              <View key={section.section_id} style={{ marginBottom: 15 }}>
                {/* Section Header */}
                <View style={neetStyles.sectionHeader}>
                  <Text>
                    SECTION {sectionIndex + 1}: {section.section_name.toUpperCase()}
                  </Text>
                  {section.subject_name && (
                    <Text style={{ fontSize: 9, fontWeight: 'normal', marginTop: 2 }}>
                      ({section.subject_name})
                    </Text>
                  )}
                </View>

                {/* Section Instructions (if marks per question is uniform) */}
                {section.marks_per_question && (
                  <View style={{ marginBottom: 8, paddingLeft: 8 }}>
                    <Text style={{ fontSize: 9, color: '#666666' }}>
                      Each question carries {section.marks_per_question} mark{section.marks_per_question > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}

                {/* Questions in two-column layout */}
                <View style={neetStyles.questionGrid}>
                  {/* Left column */}
                  <View style={neetStyles.questionColumn}>
                    {sortedQuestions
                      .filter((_, idx) => idx < Math.ceil(sortedQuestions.length / 2))
                      .map((question, idx) => (
                        <PDFQuestion
                          key={question.id}
                          question={question}
                          displayNumber={questionOffset + idx + 1}
                        />
                      ))}
                  </View>

                  {/* Right column */}
                  <View style={neetStyles.questionColumn}>
                    {sortedQuestions
                      .filter((_, idx) => idx >= Math.ceil(sortedQuestions.length / 2))
                      .map((question, idx) => {
                        const midpoint = Math.ceil(sortedQuestions.length / 2)
                        return (
                          <PDFQuestion
                            key={question.id}
                            question={question}
                            displayNumber={questionOffset + midpoint + idx + 1}
                          />
                        )
                      })}
                  </View>
                </View>
              </View>
            )
          })}
        </View>

        {/* Footer */}
        <PDFFooter contactInfo={config.contactInfo} pageNumber={2} />
      </Page>
    </Document>
  )
}
