import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Code2, FolderGit2, CheckSquare, PhoneCall, MessageSquare, Bell } from 'lucide-react';
import MotionButton from '../motion/MotionButton';
import ColabzOctopus from '../motion/ColabzOctopus';
import { SplitTextReveal, ParagraphBlurReveal, ScrollHighlightUnderline, ParallaxLayer, ScrollReveal } from '../motion/ScrollEffects';

export default function HeroSection({ onStartBuilding, onExplore }) {
  return (
    <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '3.5rem 1.5rem 4rem', textAlign: 'center', position: 'relative' }}>
      {/* 2. PARALLAX DEPTH BACKGROUND SHAPE */}
      <ParallaxLayer speed={-25} style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 0 }}>
        <div
          style={{
            width: '600px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(0, 229, 163, 0.08) 0%, rgba(139, 124, 255, 0.04) 50%, transparent 80%)',
            filter: 'blur(60px)',
            borderRadius: '50%'
          }}
        />
      </ParallaxLayer>

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* 5. SPLIT-TEXT REVEAL & HIGHLIGHT UNDERLINE HEADLINE */}
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.08,
            color: 'var(--text-primary)',
            maxWidth: '920px',
            margin: '0 auto 1.25rem',
          }}
        >
          <SplitTextReveal text="BUILD WITH PEOPLE." /><br />
          <ScrollHighlightUnderline color="var(--accent-primary)">
            SHIP WITH COLABZ.
          </ScrollHighlightUnderline>
        </h1>

        {/* 5. PARAGRAPH BLUR REVEAL ON SCROLL */}
        <ParagraphBlurReveal delay={0.25}>
          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '660px',
              margin: '0 auto 2rem',
            }}
          >
            A calm, developer-first collaboration room. Code, tasks, issues, calls, 
            and chat unified under one responsive workspace.
          </p>
        </ParagraphBlurReveal>

        {/* 1. SCROLL REVEAL ACTION BUTTONS */}
        <ScrollReveal variant="fade-up" delay={0.35}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '3.5rem' }}>
            <MotionButton variant="primary" size="lg" icon={ArrowRight} onClick={onStartBuilding}>
              START BUILDING
            </MotionButton>
            <MotionButton variant="secondary" size="lg" icon={Compass} onClick={onExplore}>
              EXPLORE COLABZ
            </MotionButton>
          </div>
        </ScrollReveal>

        {/* 1 & 2. SCROLL REVEAL & PARALLAX SCALE-IN MASCOT CONTAINER */}
        <ScrollReveal variant="scale-up" delay={0.45}>
          <div
            style={{
              position: 'relative',
              maxWidth: '840px',
              margin: '0 auto',
              backgroundColor: 'rgba(17, 21, 28, 0.6)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem 1.5rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              overflow: 'hidden'
            }}
          >
            {/* Background Grid Accent Pattern */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(var(--border-subtle) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                opacity: 0.3,
                pointerEvents: 'none'
              }}
            />

            {/* Central Colabz Mascot ("The Radial Workspace Hub") */}
            <ColabzOctopus mode="radial-hub" width={640} height={500} />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
