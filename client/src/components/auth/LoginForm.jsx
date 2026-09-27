import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, KeyRound } from 'lucide-react';
import Input from '../ui/Input';
import PasswordInput from './PasswordInput';
import MotionButton from '../motion/MotionButton';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm({ onSwitchToSignup, onInputFocus, onInputBlur }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address';

    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setMessage('');

    try {
      const res = await login(email, password);
      if (res.success) {
        setMessage('Access Granted! Connecting to workspace...');
      }
    } catch (err) {
      setErrors({ form: 'Invalid credentials. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={{ marginBottom: '1.75rem' }}>
        <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
          COLABZ AUTH
        </div>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
          WELCOME BACK
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          Enter your workspace credentials.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Input
          label="Email Address"
          placeholder="developer@colabz.com"
          type="email"
          autoComplete="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
        />

        <PasswordInput
          label="Password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
        />

        {errors.form && (
          <div style={{ padding: '0.65rem', background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 92, 112, 0.3)', color: 'var(--danger)', fontSize: '0.8rem' }}>
            {errors.form}
          </div>
        )}

        {message && (
          <div style={{ padding: '0.65rem', background: 'var(--success-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(61, 219, 130, 0.3)', color: 'var(--success)', fontSize: '0.8rem' }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
            Forgot password?
          </span>
        </div>

        <MotionButton
          variant="primary"
          size="lg"
          icon={ArrowRight}
          type="submit"
          disabled={submitting}
          fullWidth
          style={{ marginTop: '0.5rem' }}
        >
          {submitting ? 'AUTHENTICATING...' : 'SIGN IN'}
        </MotionButton>
      </form>

      <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Don't have an account?{' '}
        <button
          onClick={onSwitchToSignup}
          style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
        >
          Create account
        </button>
      </div>
    </motion.div>
  );
}
