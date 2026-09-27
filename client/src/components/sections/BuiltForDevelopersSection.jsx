import React from 'react';
import { motion } from 'framer-motion';
import Badge from '../ui/Badge';
import { ScrollReveal, SplitTextReveal, ParagraphBlurReveal, ScrollHighlightUnderline, ScrollCountUp } from '../motion/ScrollEffects';

export default function BuiltForDevelopersSection() {
  const stats = [
    { value: '10', suffix: 'x', label: 'Faster Context Switch' },
    { value: '0', suffix: '', label: 'Page Reloads Needed' },
    { value: '100', suffix: '%', label: 'Single Surface SPA' },
    { value: '5', suffix: 'in1', label: 'Unified Developer Tools' },
  ];

  return (
    <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '4.5rem 2rem', textAlign: 'center' }}>
      <ScrollReveal variant="fade-up">
        <h2
          style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.15,
            color: 'var(--text-primary)',
            maxWidth: '900px',
            margin: '0 auto 1.5rem',
          }}
        >
          <SplitTextReveal text="YOUR PROJECT SHOULDN'T LIVE IN" />{' '}
          <ScrollHighlightUnderline color="var(--accent-primary)">
            12 DIFFERENT TABS.
          </ScrollHighlightUnderline>
        </h2>
      </ScrollReveal>

      <ParagraphBlurReveal delay={0.2}>
        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            maxWidth: '680px',
            margin: '0 auto 2.5rem',
          }}
        >
          Colabz brings code, tasks, discussions, and people into one collaborative workspace. 
          No context switching, no lost links, no friction.
        </p>
      </ParagraphBlurReveal>

      {/* 3. SCROLL-LINKED COUNT-UP STATS GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
          backgroundColor: 'rgba(17, 21, 28, 0.5)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem 1.5rem'
        }}
      >
        {stats.map((stat, idx) => (
          <ScrollReveal key={stat.label} variant="scale-up" delay={idx * 0.1}>
            <div>
              <div
                className="font-mono"
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: 'var(--accent-primary)',
                  letterSpacing: '-0.03em'
                }}
              >
                <ScrollCountUp value={stat.value} suffix={stat.suffix} />
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* 1. TARGET AUDIENCE BADGES WITH ROTATE-IN ENTRANCES */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.85rem' }}>
        <ScrollReveal variant="rotate-in" delay={0.1}>
          <Badge variant="neutral">COLLEGE PROJECTS</Badge>
        </ScrollReveal>
        <ScrollReveal variant="rotate-in" delay={0.18}>
          <Badge variant="neutral">HACKATHON TEAMS</Badge>
        </ScrollReveal>
        <ScrollReveal variant="rotate-in" delay={0.26}>
          <Badge variant="neutral">CODING CLUBS</Badge>
        </ScrollReveal>
        <ScrollReveal variant="rotate-in" delay={0.34}>
          <Badge variant="neutral">OPEN-SOURCE TEAMS</Badge>
        </ScrollReveal>
      </div>
    </section>
  );
}
