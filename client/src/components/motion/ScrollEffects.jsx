import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform, useInView } from 'framer-motion';

/**
 * 3. SCROLL-LINKED TOP PROGRESS BAR
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 250,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2.5px',
        backgroundColor: '#00e5a3',
        boxShadow: '0 0 10px #00e5a3, 0 0 20px rgba(0, 229, 163, 0.4)',
        originX: 0,
        scaleX,
        zIndex: 99999,
        pointerEvents: 'none'
      }}
    />
  );
}

/**
 * 1. SCROLL-REVEAL ENTRANCES (Fade-Up, Scale-Up, Rotate-In)
 */
export function ScrollReveal({
  children,
  variant = 'fade-up', // fade-up | scale-up | rotate-in | slide-left | slide-right
  delay = 0,
  duration = 0.55,
  staggerChildren = 0.1,
  className = '',
  style = {}
}) {
  const getVariants = () => {
    switch (variant) {
      case 'scale-up':
        return {
          hidden: { opacity: 0, scale: 0.88 },
          visible: { opacity: 1, scale: 1 }
        };
      case 'rotate-in':
        return {
          hidden: { opacity: 0, y: 25, rotate: -4 },
          visible: { opacity: 1, y: 0, rotate: 0 }
        };
      case 'slide-left':
        return {
          hidden: { opacity: 0, x: -35 },
          visible: { opacity: 1, x: 0 }
        };
      case 'slide-right':
        return {
          hidden: { opacity: 0, x: 35 },
          visible: { opacity: 1, x: 0 }
        };
      case 'fade-up':
      default:
        return {
          hidden: { opacity: 0, y: 28 },
          visible: { opacity: 1, y: 0 }
        };
    }
  };

  const variants = getVariants();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      variants={variants}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/**
 * 5. SPLIT-TEXT REVEAL ON SCROLL
 * Animates text word-by-word as it enters the viewport.
 */
export function SplitTextReveal({
  text,
  className = '',
  style = {},
  highlightWord = null,
  highlightColor = 'var(--accent-primary)'
}) {
  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.045,
        delayChildren: 0.05
      }
    }
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={containerVariants}
      className={className}
      style={{ display: 'inline-block', ...style }}
    >
      {words.map((word, i) => {
        const isHighlighted = highlightWord && word.toLowerCase().includes(highlightWord.toLowerCase());
        return (
          <motion.span
            key={i}
            variants={wordVariants}
            style={{
              display: 'inline-block',
              marginRight: '0.28em',
              color: isHighlighted ? highlightColor : 'inherit'
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.span>
  );
}

/**
 * 5. PARAGRAPH BLUR REVEAL ON SCROLL
 */
export function ParagraphBlurReveal({ children, className = '', style = {}, delay = 0.1 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/**
 * 5. SCROLL HIGHLIGHT UNDERLINE
 * Self-drawing gradient line under key terms on scroll into view.
 */
export function ScrollHighlightUnderline({ children, color = '#00e5a3' }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ color }}>{children}</span>
      <motion.svg
        viewBox="0 0 100 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          bottom: '-4px',
          left: 0,
          width: '100%',
          height: '6px',
          overflow: 'visible',
          pointerEvents: 'none'
        }}
      >
        <motion.path
          d="M 0,4 Q 50,8 100,4"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.svg>
    </span>
  );
}

/**
 * 2. PARALLAX DEPTH LAYER
 * Moves background elements slower/faster than foreground on scroll.
 */
export function ParallaxLayer({ children, speed = -30, className = '', style = {} }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], [-speed, speed]);

  return (
    <motion.div ref={ref} style={{ y, ...style }} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * 3. SCROLL COUNT-UP NUMBERS
 * Counts up values when scrolled into view.
 */
export function ScrollCountUp({ value, suffix = '', duration = 1.6, className = '', style = {} }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = parseFloat(value);
    if (isNaN(end)) return;

    const startTime = performance.now();

    const animateCount = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(start + (end - start) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(animateCount);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {displayValue}
      {suffix}
    </span>
  );
}

/**
 * 3. SCROLL-LINKED SVG TIMELINE CONNECTOR LINE
 */
export function ScrollProgressLine({ className = '', style = {} }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 70%', 'end 30%']
  });

  const pathLength = useSpring(scrollYProgress, { stiffness: 200, damping: 25 });

  return (
    <div ref={ref} className={className} style={{ position: 'relative', width: '100%', ...style }}>
      <svg viewBox="0 0 1000 6" fill="none" style={{ width: '100%', height: '6px', overflow: 'visible' }}>
        <path d="M 0,3 L 1000,3" stroke="var(--border-subtle)" strokeWidth="2" strokeDasharray="4 6" />
        <motion.path
          d="M 0,3 L 1000,3"
          stroke="#00e5a3"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ pathLength }}
        />
      </svg>
    </div>
  );
}
