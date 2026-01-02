/**
 * Animation Constants for Framer Motion
 *
 * Reusable animation variants and configuration for consistent motion design
 * across the application.
 */

import { Variants, Transition } from 'framer-motion'

// ============================================================================
// TRANSITION PRESETS
// ============================================================================

export const transitions = {
  // Spring physics (natural, bouncy feel)
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 25,
  } as Transition,

  springBouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 20,
  } as Transition,

  springGentle: {
    type: 'spring',
    stiffness: 200,
    damping: 30,
  } as Transition,

  // Easing presets
  fast: {
    duration: 0.15,
    ease: 'easeOut',
  } as Transition,

  base: {
    duration: 0.2,
    ease: 'easeOut',
  } as Transition,

  moderate: {
    duration: 0.3,
    ease: 'easeInOut',
  } as Transition,

  slow: {
    duration: 0.4,
    ease: 'easeInOut',
  } as Transition,
} as const

// ============================================================================
// FADE ANIMATIONS
// ============================================================================

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

// ============================================================================
// SLIDE ANIMATIONS
// ============================================================================

export const slideUpVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 },
}

export const slideDownVariants: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
}

export const slideLeftVariants: Variants = {
  hidden: { x: 20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
}

export const slideRightVariants: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
}

// ============================================================================
// SCALE ANIMATIONS
// ============================================================================

export const scaleVariants: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
}

export const scaleBounceVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: transitions.springBouncy,
  },
  exit: { scale: 0, opacity: 0 },
}

// ============================================================================
// MODAL/DIALOG ANIMATIONS
// ============================================================================

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

export const modalContentVariants: Variants = {
  hidden: {
    scale: 0.95,
    opacity: 0,
    y: 20,
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    y: 20,
    transition: transitions.fast,
  },
}

// ============================================================================
// TOAST/NOTIFICATION ANIMATIONS
// ============================================================================

export const toastVariants: Variants = {
  hidden: { x: 400, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.spring,
  },
  exit: {
    x: 400,
    opacity: 0,
    transition: transitions.fast,
  },
}

// ============================================================================
// LIST/STAGGER ANIMATIONS
// ============================================================================

export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // 50ms delay between items
    },
  },
}

export const listItemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.base,
  },
}

// ============================================================================
// HOVER/TAP ANIMATIONS (for interactive elements)
// ============================================================================

export const buttonTapAnimation = {
  scale: 0.95,
  transition: { duration: 0.1 },
}

export const buttonHoverAnimation = {
  scale: 1.02,
  transition: transitions.fast,
}

export const cardHoverAnimation = {
  y: -4,
  transition: transitions.base,
}

export const iconHoverAnimation = {
  scale: 1.1,
  rotate: 5,
  transition: transitions.spring,
}

// ============================================================================
// PAGE TRANSITION ANIMATIONS
// ============================================================================

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.moderate,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: transitions.fast,
  },
}

// ============================================================================
// LOADING/SKELETON ANIMATIONS
// ============================================================================

export const skeletonPulseVariants: Variants = {
  start: {
    opacity: 0.6,
  },
  end: {
    opacity: 1,
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
}

export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// ============================================================================
// SUCCESS/ERROR ANIMATIONS
// ============================================================================

export const successCheckmarkVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: transitions.springBouncy,
  },
}

export const shakeVariants: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a stagger delay for list items
 * @param index - Item index in the list
 * @param baseDelay - Base delay in seconds (default: 0.05)
 */
export const getStaggerDelay = (index: number, baseDelay: number = 0.05) => ({
  delay: index * baseDelay,
})

/**
 * Checks if user prefers reduced motion
 */
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Returns either the animated variant or static variant based on user preference
 */
export const getMotionVariant = <T>(
  animatedVariant: T,
  staticVariant: T
): T => {
  return shouldReduceMotion() ? staticVariant : animatedVariant
}

// ============================================================================
// REDUCED MOTION SUPPORT
// ============================================================================

/**
 * No-motion variants for accessibility (prefers-reduced-motion)
 */
export const noMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Wraps transition with reduced motion check
 */
export const withReducedMotion = (transition: Transition): Transition => {
  if (shouldReduceMotion()) {
    return { duration: 0.01 }
  }
  return transition
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const animations = {
  // Transitions
  transitions,

  // Variants
  fadeVariants,
  slideUpVariants,
  slideDownVariants,
  slideLeftVariants,
  slideRightVariants,
  scaleVariants,
  scaleBounceVariants,
  modalBackdropVariants,
  modalContentVariants,
  toastVariants,
  listContainerVariants,
  listItemVariants,
  pageVariants,
  skeletonPulseVariants,
  spinnerVariants,
  successCheckmarkVariants,
  shakeVariants,
  noMotionVariants,

  // Interactive
  buttonTapAnimation,
  buttonHoverAnimation,
  cardHoverAnimation,
  iconHoverAnimation,

  // Utilities
  getStaggerDelay,
  shouldReduceMotion,
  getMotionVariant,
  withReducedMotion,
} as const

export default animations
