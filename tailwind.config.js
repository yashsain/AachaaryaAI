/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // aachaaryAI brand colors (extracted from logo)
        brand: {
          saffron: '#F7931E',    // Primary saffron (Aachaarya wisdom)
          'saffron-light': '#FFB347',  // Light saffron accent
          'saffron-dark': '#E67E00',   // Dark saffron for hover states
          blue: '#0066CC',       // Primary blue (AI technology)
          'blue-light': '#4A90E2',     // Light blue accent
          'blue-dark': '#004C99',      // Dark blue for depth
        },
        primary: '#F7931E',      // Main saffron for primary actions
        secondary: '#0066CC',    // Main blue for secondary actions
        accent: {
          warm: '#FFB347',       // Warm accent (saffron light)
          cool: '#4A90E2',       // Cool accent (blue light)
        },
        success: '#10B981',      // Green - progress, achievement
        warning: '#F59E0B',      // Amber - attention needed
        danger: '#EF4444',       // Red - errors, urgent
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
