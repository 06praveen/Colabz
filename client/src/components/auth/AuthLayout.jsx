import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../ui/Logo';
import AuthScene from './AuthScene';
import AuthPanel from './AuthPanel';
import PageTransition from '../ui/PageTransition';

export default function AuthLayout({ mode = 'login' }) {
  const navigate = useNavigate();
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleSwitchMode = (newMode) => {
    navigate(`/auth/${newMode}`);
  };

  return (
    <PageTransition>
      <div
        className="bg-tech-grid"
        style={{
          position: 'relative',
          minHeight: '100vh',
          width: '100%',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0b0d10',
        }}
      >
        {/* Top Header */}
        <header
          style={{
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'relative',
            zIndex: 30,
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(11, 13, 16, 0.9)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Logo size={36} />
          </div>

          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}
          >
            <ArrowLeft size={16} /> Back to Landing Page
          </button>
        </header>

        {/* High-End Split Screen Grid Container */}
        <main
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            minHeight: 'calc(100vh - 70px)',
            width: '100%',
            position: 'relative',
            zIndex: 10
          }}
        >
          {/* Left Column — Centered 3D Rotating Orb & Visual Brand Showcase */}
          <div
            className="desktop-only-sidebar"
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem 2rem',
              borderRight: '1px solid var(--border-subtle)',
              backgroundColor: '#080a0d',
              overflow: 'hidden',
              minHeight: '520px'
            }}
          >
            {/* 3D WebGL Rotating Wireframe Orb Scene */}
            <AuthScene mode={mode} isInputFocused={isInputFocused} />

            {/* Clean Minimal Auth Branding Overlay */}
            <div
              style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                maxWidth: '440px',
                marginTop: 'auto',
                marginBottom: '2.5rem'
              }}
            >
              <div
                className="font-mono"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase'
                }}
              >
                // DEVELOPER WORKSPACE
              </div>

              <h2
                style={{
                  fontSize: '2.25rem',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  color: 'var(--text-primary)',
                  margin: '0 0 0.75rem 0',
                  lineHeight: 1.15
                }}
              >
                SEE. TALK. BUILD. SHIP.
              </h2>

              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  margin: 0
                }}
              >
                Accelerate your team’s engineering cycle with integrated workspaces.
              </p>
            </div>
          </div>

          {/* Right Column — Auth Form Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2.5rem 1.5rem',
              width: '100%',
              backgroundColor: 'rgba(11, 13, 16, 0.6)'
            }}
          >
            <AuthPanel
              mode={mode}
              onSwitchMode={handleSwitchMode}
              onInputFocus={() => setIsInputFocused(true)}
              onInputBlur={() => setIsInputFocused(false)}
            />
          </div>
        </main>
      </div>
    </PageTransition>
  );
}

