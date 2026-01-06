/**
 * NEET Template - Main PDF Template
 * Generic template for NEET test papers with institute branding
 * Phase 6: PDF Generation
 */

import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { neetStyles } from '../styles/neetStyles'
import { TemplateConfig } from '../types'
import { PDFHeader } from '../components/PDFHeader'
import { PDFInstructions } from '../components/PDFInstructions'
import { PDFQuestionGrid } from '../components/PDFQuestionGrid'
import { PDFFooter } from '../components/PDFFooter'

interface NEETTemplateProps {
  config: TemplateConfig
}

export const NEETTemplate: React.FC<NEETTemplateProps> = ({ config }) => {
  return (
    <Document
      title={config.testTitle}
      author={config.instituteName}
      subject="NEET Practice Test"
      creator="Aachaarya AI"
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

      {/* Page 2+: Questions */}
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

        {/* Questions Grid (Two Columns) */}
        <PDFQuestionGrid questions={config.questions} />

        {/* Footer */}
        <PDFFooter contactInfo={config.contactInfo} pageNumber={2} />
      </Page>
    </Document>
  )
}
