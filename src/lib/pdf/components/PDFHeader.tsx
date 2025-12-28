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
      {/* Top row: Logo + Institute Branding */}
      <View style={neetStyles.headerTop}>
        {config.instituteLogo && (
          <Image
            src={config.instituteLogo}
            style={neetStyles.logo}
          />
        )}

        <View style={neetStyles.headerBranding}>
          {config.tagline && (
            <Text style={neetStyles.instituteSubtitle}>
              {config.tagline}
            </Text>
          )}
          <Text style={neetStyles.instituteMainTitle}>
            {config.instituteName}
          </Text>
        </View>
      </View>

      {/* Test Metadata Box - Single Row */}
      <View style={neetStyles.metadataBox}>
        <View style={neetStyles.metadataCell}>
          <Text style={neetStyles.metadataLabel}>Max. Marks : </Text>
          <Text style={neetStyles.metadataValue}>{config.maxMarks}</Text>
        </View>

        <View style={neetStyles.metadataCell}>
          <Text style={neetStyles.metadataLabel}>Date : </Text>
          <Text style={neetStyles.metadataValue}>{config.date}</Text>
        </View>

        <View style={neetStyles.metadataCell}>
          <Text style={neetStyles.metadataLabel}>Time : </Text>
          <Text style={neetStyles.metadataValue}>{config.duration}</Text>
        </View>

        <View style={neetStyles.metadataCell}>
          <Text style={neetStyles.metadataLabel}>Test Code : </Text>
          <Text style={neetStyles.metadataValue}>{config.testCode}</Text>
        </View>
      </View>
    </View>
  )
}
