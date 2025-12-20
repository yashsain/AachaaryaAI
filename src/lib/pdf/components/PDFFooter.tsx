/**
 * PDF Footer Component
 * Displays contact info and page numbers
 * Phase 6: PDF Generation
 */

import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { neetStyles } from '../styles/neetStyles'
import { ContactInfo } from '../types'

interface PDFFooterProps {
  contactInfo: ContactInfo
  pageNumber?: number
  totalPages?: number
}

export const PDFFooter: React.FC<PDFFooterProps> = ({ contactInfo, pageNumber, totalPages }) => {
  // Build contact string
  const contactParts: string[] = []

  if (contactInfo.address) {
    contactParts.push(contactInfo.address)
  }

  if (contactInfo.city) {
    contactParts.push(contactInfo.city)
  }

  if (contactInfo.phone) {
    contactParts.push(`☎ ${contactInfo.phone}`)
  }

  if (contactInfo.email) {
    contactParts.push(contactInfo.email)
  }

  const contactString = contactParts.join(' • ')

  return (
    <View style={neetStyles.footer} fixed>
      <Text style={neetStyles.footerContact}>
        {contactString || 'Contact information not available'}
      </Text>

      {pageNumber && (
        <Text style={neetStyles.pageNumber}>
          Page {pageNumber}{totalPages ? ` of ${totalPages}` : ''}
        </Text>
      )}
    </View>
  )
}
