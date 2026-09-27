// Colabz Design System — Motion System & Framer Motion Presets

export const transitions = {
  default: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  smooth: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  spring: { type: 'spring', stiffness: 300, damping: 25 },
};

export const motionVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: transitions.default }
  },

  slideUp: {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: transitions.smooth }
  },

  slideRight: {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: transitions.smooth }
  },

  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: transitions.default }
  },

  pageTransition: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  }
};
