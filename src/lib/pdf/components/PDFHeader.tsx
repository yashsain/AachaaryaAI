/**
 * PDF Header Component
 * Displays institute branding and test metadata
 * Phase 6: PDF Generation
 */

import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { neetStyles } from '../styles/neetStyles'
import { TemplateConfig } from '../types'

interface PDFHeaderProps {
  config: TemplateConfig
}

export const PDFHeader: React.FC<PDFHeaderProps> = ({ config }) => {
  return (
    <View style={neetStyles.header}>
      {/* Top row: Logo + Institute Name */}
      <View style={neetStyles.headerTop}>
        {config.instituteLogo && (
          <Image
            src={config.instituteLogo}
            style={neetStyles.logo}
          />
        )}

        <View style={{ flex: 1, textAlign: 'center' }}>
          <Text style={neetStyles.instituteName}>
            {config.instituteName}
          </Text>
          {config.tagline && (
            <Text style={neetStyles.tagline}>
              {config.tagline}
            </Text>
          )}
        </View>
      </View>

      {/* Test Metadata Box */}
      <View style={neetStyles.metadataBox}>
        <View style={neetStyles.metadataItem}>
          <Text>
            <Text style={neetStyles.metadataLabel}>Test: </Text>
            {config.testTitle}
          </Text>
        </View>

        <View style={neetStyles.metadataItem}>
          <Text>
            <Text style={neetStyles.metadataLabel}>Code: </Text>
            {config.testCode}
          </Text>
        </View>

        <View style={neetStyles.metadataItem}>
          <Text>
            <Text style={neetStyles.metadataLabel}>Date: </Text>
            {config.date}
          </Text>
        </View>

        <View style={neetStyles.metadataItem}>
          <Text>
            <Text style={neetStyles.metadataLabel}>Time: </Text>
            {config.duration}
          </Text>
        </View>

        <View style={neetStyles.metadataItem}>
          <Text>
            <Text style={neetStyles.metadataLabel}>Max Marks: </Text>
            {config.maxMarks}
          </Text>
        </View>
      </View>
    </View>
  )
}
