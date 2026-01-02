/**
 * Design Tokens - Single Source of Truth
 *
 * Centralized design system for AachaaryaAI
 * Updated: January 2026
 *
 * Philosophy: Professional minimalism with modern energy
 * - Clean, sophisticated base
 * - Vibrant accents for energy
 * - Glassmorphism and soft shadows
 * - 8-point grid system
 */

// ============================================================================
// COLOR SYSTEM
// ============================================================================

export const colors = {
  // Primary - Deep Blue-Green (Modern, Trustworthy, 2026 trend)
  primary: {
    50: '#ECFDF7',
    100: '#D1FAEE',
    200: '#A7F3D8',
    300: '#6EEDC1',
    400: '#34D9A4',
    500: '#0D9488', // Main primary
    600: '#0A7E8C',
    700: '#06636F',
    800: '#054F5A',
    900: '#043F48',
    950: '#022B31',
  },

  // Accent - Warm Coral (Energy, CTAs, Highlights)
  accent: {
    50: '#FFF1F1',
    100: '#FFDEDE',
    200: '#FFC2C2',
    300: '#FF9898',
    400: '#FF6B6B', // Main accent
    500: '#FF4545',
    600: '#ED2020',
    700: '#C81515',
    800: '#A51414',
    900: '#881818',
    950: '#4B0707',
  },

  // Semantic Colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Main success
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main warning
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Main error
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Main info
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Neutrals - Warm Grays (Modern, not cold)
  neutral: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
    950: '#0C0A09',
  },

  // Backgrounds
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAF9', // neutral-50
    tertiary: '#F5F5F4', // neutral-100
    elevated: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text
  text: {
    primary: '#1C1917', // neutral-900
    secondary: '#57534E', // neutral-600
    tertiary: '#A8A29E', // neutral-400
    disabled: '#D6D3D1', // neutral-300
    inverse: '#FFFFFF',
    link: '#0D9488', // primary-500
    linkHover: '#0A7E8C', // primary-600
  },

  // Borders
  border: {
    default: '#E7E5E4', // neutral-200
    strong: '#D6D3D1', // neutral-300
    subtle: '#F5F5F4', // neutral-100
    interactive: '#0D9488', // primary-500
    error: '#EF4444', // error-500
  },
} as const

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const typography = {
  // Font Families
  fontFamily: {
    sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
    mono: ['var(--font-geist-mono)', 'monospace'],
  },

  // Font Sizes with Line Heights (using clamp for fluid typography)
  fontSize: {
    xs: {
      size: '0.75rem', // 12px
      lineHeight: '1.5', // 18px
      letterSpacing: '0.01em',
    },
    sm: {
      size: '0.875rem', // 14px
      lineHeight: '1.5', // 21px
      letterSpacing: '0',
    },
    base: {
      size: '1rem', // 16px
      lineHeight: '1.5', // 24px
      letterSpacing: '0',
    },
    lg: {
      size: '1.125rem', // 18px
      lineHeight: '1.4', // 25.2px
      letterSpacing: '-0.01em',
    },
    xl: {
      size: '1.25rem', // 20px
      lineHeight: '1.4', // 28px
      letterSpacing: '-0.01em',
    },
    '2xl': {
      size: '1.5rem', // 24px
      lineHeight: '1.3', // 31.2px
      letterSpacing: '-0.02em',
    },
    '3xl': {
      size: '1.875rem', // 30px
      lineHeight: '1.2', // 36px
      letterSpacing: '-0.02em',
    },
    '4xl': {
      size: '2.25rem', // 36px
      lineHeight: '1.2', // 43.2px
      letterSpacing: '-0.03em',
    },
    '5xl': {
      size: '3rem', // 48px
      lineHeight: '1.1', // 52.8px
      letterSpacing: '-0.03em',
    },
    '6xl': {
      size: '3.75rem', // 60px
      lineHeight: '1.1', // 66px
      letterSpacing: '-0.04em',
    },
  },

  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
} as const

// ============================================================================
// SPACING SYSTEM (8-Point Grid)
// ============================================================================

export const spacing = {
  0: '0px',
  1: '4px',    // 0.5 step
  2: '8px',    // Base unit
  3: '12px',   // 1.5x
  4: '16px',   // 2x
  5: '20px',   // 2.5x
  6: '24px',   // 3x
  8: '32px',   // 4x
  10: '40px',  // 5x
  12: '48px',  // 6x
  14: '56px',  // 7x
  16: '64px',  // 8x
  20: '80px',  // 10x
  24: '96px',  // 12x
  32: '128px', // 16x
  40: '160px', // 20x
  48: '192px', // 24x
  56: '224px', // 28x
  64: '256px', // 32x
} as const

// ============================================================================
// ELEVATION SYSTEM (Shadows)
// ============================================================================

export const shadows = {
  // Soft shadows (modern, not harsh)
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

  // Colored shadows (for interactive elements)
  primaryGlow: '0 0 20px rgba(13, 148, 136, 0.3)',
  accentGlow: '0 0 20px rgba(255, 107, 107, 0.3)',

  // Glass effect
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
} as const

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0px',
  sm: '0.25rem',   // 4px
  DEFAULT: '0.5rem', // 8px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem',   // 32px
  full: '9999px',
} as const

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const

// ============================================================================
// TRANSITION TIMINGS
// ============================================================================

export const transitions = {
  duration: {
    instant: '100ms',
    fast: '150ms',
    base: '200ms',
    moderate: '300ms',
    slow: '400ms',
    slower: '500ms',
  },

  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy spring
  },
} as const

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const components = {
  button: {
    height: {
      sm: '32px',
      md: '40px',
      lg: '48px',
    },
    padding: {
      sm: '0 12px',
      md: '0 16px',
      lg: '0 24px',
    },
  },

  input: {
    height: {
      sm: '36px',
      md: '44px',
      lg: '52px',
    },
  },

  modal: {
    maxWidth: {
      sm: '400px',
      md: '600px',
      lg: '800px',
      xl: '1000px',
      full: '100%',
    },
  },

  card: {
    padding: {
      sm: '16px',
      md: '24px',
      lg: '32px',
    },
  },
} as const

// ============================================================================
// GLASS EFFECT
// ============================================================================

export const glass = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropBlur: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  medium: {
    background: 'rgba(255, 255, 255, 0.6)',
    backdropBlur: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  dark: {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropBlur: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
} as const

// ============================================================================
// EXPORT ALL
// ============================================================================

export const designTokens = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  zIndex,
  transitions,
  breakpoints,
  components,
  glass,
} as const

export default designTokens
