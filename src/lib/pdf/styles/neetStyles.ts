/**
 * React-PDF StyleSheet for NEET Papers
 * Phase 6: PDF Generation
 */

import { StyleSheet } from '@react-pdf/renderer'

export const neetStyles = StyleSheet.create({
  // Page layout
  page: {
    padding: '15mm',
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },

  // Header section
  header: {
    marginBottom: 15,
    borderBottom: '2pt solid #000000',
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: 'contain',
  },
  instituteName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  tagline: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'center',
    marginTop: 2,
  },

  // Metadata box
  metadataBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    border: '1pt solid #000000',
    padding: 8,
    marginVertical: 10,
    backgroundColor: '#F5F5F5',
  },
  metadataItem: {
    fontSize: 9,
  },
  metadataLabel: {
    fontWeight: 'bold',
  },

  // Instructions section
  instructionsSection: {
    marginVertical: 10,
    padding: 10,
    border: '1pt solid #CCCCCC',
    backgroundColor: '#FAFAFA',
  },
  instructionsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  instructionsList: {
    paddingLeft: 15,
  },
  instruction: {
    fontSize: 9,
    marginBottom: 3,
    lineHeight: 1.4,
  },

  // Topics section
  topicsSection: {
    marginVertical: 10,
  },
  topicsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  topicsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  topicChip: {
    fontSize: 8,
    padding: '3pt 8pt',
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    marginRight: 5,
    marginBottom: 5,
  },

  // Student info section
  studentInfoSection: {
    marginVertical: 10,
    padding: 10,
    border: '1pt solid #000000',
  },
  studentInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  studentInfoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    width: '30%',
  },
  studentInfoUnderline: {
    borderBottom: '1pt solid #000000',
    width: '70%',
    height: 15,
  },

  // Question grid (two columns)
  questionGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  questionColumn: {
    width: '48%',
  },

  // Individual question
  questionContainer: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '0.5pt solid #E0E0E0',
  },
  questionHeader: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  questionNumber: {
    fontWeight: 'bold',
    fontSize: 10,
    marginRight: 5,
  },
  questionText: {
    fontSize: 10,
    lineHeight: 1.5,
    flex: 1,
  },
  optionsContainer: {
    marginTop: 5,
    paddingLeft: 15,
  },
  option: {
    fontSize: 9,
    marginBottom: 3,
    flexDirection: 'row',
  },
  optionLabel: {
    fontWeight: 'bold',
    marginRight: 5,
    width: 20,
  },
  optionText: {
    flex: 1,
  },

  // Chapter label
  chapterLabel: {
    fontSize: 8,
    color: '#666666',
    marginTop: 3,
    fontStyle: 'italic',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1pt solid #CCCCCC',
    paddingTop: 5,
  },
  footerContact: {
    fontSize: 8,
    color: '#333333',
  },
  pageNumber: {
    fontSize: 8,
    color: '#666666',
  },

  // Section header (for Biology, Chemistry, Physics)
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    padding: 5,
    backgroundColor: '#F0F0F0',
    borderLeft: '3pt solid #F7931E',
    paddingLeft: 8,
  },
})
