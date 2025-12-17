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
        // aachaaryAI brand colors
        primary: '#6366F1',      // Indigo - education, wisdom
        secondary: '#8B5CF6',    // Purple - coaching, mentorship
        success: '#10B981',      // Green - progress, achievement
        warning: '#F59E0B',      // Orange - attention needed
        danger: '#EF4444',       // Red - errors, urgent
        neutral: '#6B7280',      // Gray - text, backgrounds
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
