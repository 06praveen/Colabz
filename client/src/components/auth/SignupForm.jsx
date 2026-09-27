import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, ArrowRight } from 'lucide-react';
import Input from '../ui/Input';
import PasswordInput from './PasswordInput';
import MotionButton from '../motion/MotionButton';
import { useAuth } from '../../context/AuthContext';

export default function SignupForm({ onSwitchToLogin, onInputFocus, onInputBlur }) {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required';
    
    if (!email) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address';

    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';

    if (confirmPassword !== password) errs.confirmPassword = 'Passwords do not match';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setMessage('');

    try {
      const res = await signup(name, email, password);
      if (res.success) {
        setMessage('Workspace Created! Redirecting...');
      }
    } catch (err) {
      setErrors({ form: 'Failed to create workspace account.' });
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
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
          NEW DEVELOPER REGISTRATION
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
          CREATE YOUR WORKSPACE
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          Start building with your team.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <Input
          label="Full Name"
          placeholder="Praveen Tiwari"
          icon={User}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
        />

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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          showStrength
          onFocus={onInputFocus}
          onBlur={onInputBlur}
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
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

        <MotionButton
          variant="primary"
          size="lg"
          icon={ArrowRight}
          type="submit"
          disabled={submitting}
          fullWidth
          style={{ marginTop: '0.5rem' }}
        >
          {submitting ? 'CREATING WORKSPACE...' : 'CREATE ACCOUNT'}
        </MotionButton>
      </form>

      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
        >
          Sign in
        </button>
      </div>
    </motion.div>
  );
}
