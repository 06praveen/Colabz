import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Logo from '../ui/Logo';
import MotionButton from '../motion/MotionButton';

/**
 * LandingNavbar — Scroll-Aware Header
 * - Glassmorphic backdrop-blur & border transition on scroll
 * - Auto-hides on scroll down, reappears immediately on scroll up
 */
export default function LandingNavbar({ onStartBuilding, onSignIn }) {
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // 6. SCROLL-BASED THEME SHIFT
      if (currentY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // 7. MICRO-INTERACTION ON SCROLL DIRECTION (Auto-hide on scroll-down, show on scroll-up)
      if (currentY > 140 && currentY > lastScrollYRef.current + 5) {
        setIsVisible(false);
      } else if (currentY < lastScrollYRef.current - 5) {
        setIsVisible(true);
      }

      lastScrollYRef.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      animate={{
        y: isVisible ? 0 : -80,
        opacity: isVisible ? 1 : 0
      }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        backgroundColor: scrolled ? 'rgba(7, 8, 10, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-default)' : '1px solid transparent',
        boxShadow: scrolled ? '0 10px 30px rgba(0, 0, 0, 0.5)' : 'none',
        transition: 'background-color 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Brand Logo */}
      <div style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <Logo size={36} />
      </div>

      {/* Center Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <button
          onClick={() => scrollToSection('how-it-works')}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s ease' }}
          onMouseEnter={(e) => (e.target.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}
        >
          How it Works
        </button>
        <button
          onClick={() => scrollToSection('features')}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s ease' }}
          onMouseEnter={(e) => (e.target.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}
        >
          Product
        </button>
        <button
          onClick={() => scrollToSection('features')}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s ease' }}
          onMouseEnter={(e) => (e.target.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}
        >
          Features
        </button>
      </nav>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <MotionButton variant="secondary" size="sm" onClick={onSignIn}>
          Sign in
        </MotionButton>
        <MotionButton variant="primary" size="sm" icon={ArrowRight} onClick={onStartBuilding}>
          Start Building
        </MotionButton>
      </div>
    </motion.header>
  );
}
