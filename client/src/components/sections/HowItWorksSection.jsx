import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderPlus, Users, CheckSquare, MessageSquare, Rocket } from 'lucide-react';
import Card from '../ui/Card';
import { ScrollReveal, SplitTextReveal, ParagraphBlurReveal, ScrollProgressLine } from '../motion/ScrollEffects';

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'CREATE',
      icon: FolderPlus,
      color: '#8b7cff',
      summary: 'Start a project and define the workspace.',
      desc: 'Initialize your repository with a single click. Configure visibility, tech tags, and custom settings.'
    },
    {
      num: '02',
      title: 'COLLABORATE',
      icon: Users,
      color: '#3ddb82',
      summary: 'Invite teammates and build together.',
      desc: 'Assign granular roles (Owner, Admin, Member, Viewer) and invite collaborators with instant access.'
    },
    {
      num: '03',
      title: 'ORGANIZE',
      icon: CheckSquare,
      color: '#ffb800',
      summary: 'Track tasks, issues, and project progress.',
      desc: 'Manage tasks via Kanban boards and solve GitHub-style issues with label tags and comment threads.'
    },
    {
      num: '04',
      title: 'COMMUNICATE',
      icon: MessageSquare,
      color: '#5ea1ff',
      summary: 'Chat and jump into voice/video instantly.',
      desc: 'Exchange real-time messages in project rooms or switch to low-latency WebRTC 1-on-1 audio/video calls.'
    },
    {
      num: '05',
      title: 'SHIP',
      icon: Rocket,
      color: '#a855f7',
      summary: 'Turn collaboration into something real.',
      desc: 'Converge code, discussions, and task completions into a production-ready application deployment.'
    },
  ];

  return (
    <section id="how-it-works" style={{ maxWidth: '1280px', margin: '0 auto', padding: '4.5rem 2rem' }}>
      <ScrollReveal variant="fade-up">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            <SplitTextReveal text="HOW COLABZ WORKS" />
          </h2>
          <ParagraphBlurReveal delay={0.2}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem' }}>
              From initial idea to final deployment — seamless movement across 5 key steps.
            </p>
          </ParagraphBlurReveal>
        </div>
      </ScrollReveal>

      {/* 3. SCROLL-LINKED DRAWING PROGRESS LINE */}
      <div style={{ marginBottom: '1.5rem', padding: '0 1rem' }}>
        <ScrollProgressLine />
      </div>

      {/* 1. STEP TABS GRID WITH STAGGERED ENTRANCES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStep === idx;
          return (
            <ScrollReveal key={step.num} variant="scale-up" delay={idx * 0.08}>
              <div
                onClick={() => setActiveStep(idx)}
                style={{
                  background: isActive ? 'var(--bg-surface)' : 'transparent',
                  border: isActive ? `1px solid ${step.color}` : '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: isActive ? `0 0 24px rgba(139, 124, 255, 0.18)` : 'none',
                  transform: isActive ? 'translateY(-2px)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="font-mono" style={{ fontSize: '0.85rem', color: step.color, fontWeight: 700 }}>
                    {step.num}
                  </span>
                  <Icon size={20} color={step.color} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.4 }}>
                  {step.summary}
                </p>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Detailed Step Active Feature Panel */}
      <ScrollReveal variant="fade-up" delay={0.3}>
        <Card style={{ position: 'relative', overflow: 'hidden', padding: '2.5rem', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.75rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-md)',
                background: `rgba(255, 255, 255, 0.05)`,
                border: `1px solid ${steps[activeStep].color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {React.createElement(steps[activeStep].icon, { size: 28, color: steps[activeStep].color })}
            </div>

            <div>
              <div className="font-mono" style={{ fontSize: '0.75rem', color: steps[activeStep].color, fontWeight: 600 }}>
                STEP {steps[activeStep].num} OF 05
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0 0.5rem' }}>
                {steps[activeStep].title} — {steps[activeStep].summary}
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '750px' }}>
                {steps[activeStep].desc}
              </p>
            </div>
          </div>
        </Card>
      </ScrollReveal>
    </section>
  );
}
