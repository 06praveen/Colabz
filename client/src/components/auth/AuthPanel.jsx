import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

export default function AuthPanel({ mode = 'login', onSwitchMode, onInputFocus, onInputBlur }) {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'rgba(17, 21, 28, 0.92)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.25rem 2rem',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        margin: 'auto'
      }}
    >
      <AnimatePresence mode="wait">
        {mode === 'login' ? (
          <LoginForm
            key="login"
            onSwitchToSignup={() => onSwitchMode('signup')}
            onInputFocus={onInputFocus}
            onInputBlur={onInputBlur}
          />
        ) : (
          <SignupForm
            key="signup"
            onSwitchToLogin={() => onSwitchMode('login')}
            onInputFocus={onInputFocus}
            onInputBlur={onInputBlur}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
