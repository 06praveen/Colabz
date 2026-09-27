import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Compass } from 'lucide-react';
import MagneticButton from '../buttons/MagneticButton';
import { ScrollReveal, SplitTextReveal, ParagraphBlurReveal, ScrollHighlightUnderline, ParallaxLayer } from '../motion/ScrollEffects';

export default function FinalCtaSection({ onStartBuilding, onExplore }) {
  return (
    <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '5rem 2rem 4rem', textAlign: 'center', position: 'relative' }}>
      {/* 2. PARALLAX DEPTH BACKGROUND AURA */}
      <ParallaxLayer speed={35} style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
        <div
          style={{
            width: '700px',
            height: '350px',
            background: 'radial-gradient(ellipse, rgba(139, 124, 255, 0.15) 0%, rgba(0, 229, 163, 0.08) 45%, transparent 75%)',
            filter: 'blur(70px)',
            borderRadius: '50%'
          }}
        />
      </ParallaxLayer>

      <ScrollReveal variant="scale-up">
        <div
          style={{
            background: 'radial-gradient(circle at center, rgba(139, 124, 255, 0.12) 0%, rgba(11, 13, 16, 0.95) 75%)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '4.5rem 2rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              color: 'var(--text-primary)',
              maxWidth: '850px',
              margin: '0 auto 1.25rem',
            }}
          >
            <SplitTextReveal text="BUILD SOMETHING" />{' '}
            <ScrollHighlightUnderline color="var(--accent-primary)">
              WORTH SHIPPING.
            </ScrollHighlightUnderline>
          </h2>

          <ParagraphBlurReveal delay={0.2}>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto 2.5rem' }}>
              Your next project starts with a team. Jump into Colabz and ship together.
            </p>
          </ParagraphBlurReveal>

          <ScrollReveal variant="fade-up" delay={0.3}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
              <MagneticButton variant="primary" icon={ArrowRight} onClick={onStartBuilding}>
                START BUILDING
              </MagneticButton>
              <MagneticButton variant="secondary" icon={Compass} onClick={onExplore}>
                EXPLORE THE WORKSPACE
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </ScrollReveal>
    </section>
  );
}
