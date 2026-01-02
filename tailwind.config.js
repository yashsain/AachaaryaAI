/**
 * Tailwind CSS v4 Configuration
 *
 * NOTE: Tailwind v4 uses CSS-first configuration via @theme in globals.css
 * This file is minimal - most theme customization is done in src/app/globals.css
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Colors are defined in @theme in globals.css (Tailwind v4 style)

      // ============================================================================
      // ANIMATIONS - Modern Micro-interactions
      // ============================================================================
      keyframes: {
        // Fade in
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },

        // Slide in from directions
        'slide-in-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },

        // Scale in
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },

        // Shimmer effect (for skeletons)
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },

        // Pulse (subtle)
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },

        // Bounce (for success states)
        'bounce-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },

        // Shake (for errors)
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },

        // Spin (loading)
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },

      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-in-up': 'slide-in-up 300ms ease-out',
        'slide-in-down': 'slide-in-down 300ms ease-out',
        'slide-in-left': 'slide-in-left 300ms ease-out',
        'slide-in-right': 'slide-in-right 300ms ease-out',
        'scale-in': 'scale-in 200ms ease-out',
        shimmer: 'shimmer 2s infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'bounce-in': 'bounce-in 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        shake: 'shake 400ms ease-in-out',
        spin: 'spin 1s linear infinite',
      },

      // ============================================================================
      // BACKDROP FILTERS (for glassmorphism)
      // ============================================================================
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },

      // ============================================================================
      // Z-INDEX
      // ============================================================================
      zIndex: {
        0: 0,
        10: 10,
        20: 20,
        30: 30,
        40: 40,
        50: 50,
        dropdown: 1000,
        sticky: 1020,
        fixed: 1030,
        'modal-backdrop': 1040,
        modal: 1050,
        popover: 1060,
        tooltip: 1070,
        toast: 1080,
      },

      // ============================================================================
      // CONTAINER
      // ============================================================================
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '2.5rem',
          '2xl': '3rem',
        },
      },

      // ============================================================================
      // SCREENS (explicit breakpoints)
      // ============================================================================
      screens: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
