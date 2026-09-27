import React from 'react';
import Logo from '../ui/Logo';

export default function LandingFooter() {
  return (
    <footer style={{ borderTop: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)', padding: '3.5rem 2rem 2.5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <Logo size={32} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <a href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none' }}>How it Works</a>
            <a href="#product-preview" style={{ color: 'inherit', textDecoration: 'none' }}>Product</a>
            <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Features</a>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '1rem' }}>
          <p>© {new Date().getFullYear()} Colabz Platform. Build in Motion.</p>
          <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
            GEIST SANS & GEIST MONO DESIGN SYSTEM
          </div>
        </div>
      </div>
    </footer>
  );
}
