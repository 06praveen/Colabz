import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, AtSign, Mail, ArrowRight } from 'lucide-react';
import Input from '../ui/Input';
import PasswordInput from './PasswordInput';
import MotionButton from '../motion/MotionButton';
import { useAuth } from '../../context/AuthContext';

export default function SignupForm({ onSwitchToLogin, onInputFocus, onInputBlur }) {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required';

    if (!username.trim()) {
      errs.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
      errs.username = 'Username must be 3-30 chars (letters, numbers, underscores)';
    }

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
    setErrors({});

    try {
      const res = await signup(name.trim(), username.trim().toLowerCase(), email.trim(), password);
      if (res.success) {
        setMessage('Workspace Created! Redirecting...');
        setTimeout(() => {
          navigate('/app/dashboard');
        }, 300);
      }
    } catch (err) {
      setErrors({ form: err.message || 'Failed to create workspace account.' });
    } finally {
      setSubmitting(false);
    }
  };

  const rawAuthUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
  const authBaseUrl = rawAuthUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

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
          label="Unique Username"
          placeholder="praveen_dev"
          icon={AtSign}
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''))}
          error={errors.username}
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
          style={{ marginTop: '0.25rem' }}
        >
          {submitting ? 'CREATING WORKSPACE...' : 'CREATE ACCOUNT'}
        </MotionButton>

        {/* OR Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '0.35rem 0', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            or
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
        </div>

        {/* GitHub OAuth Button */}
        <a
          href={`${authBaseUrl}/api/auth/github`}
          className="clb-btn clb-btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            width: '100%',
            padding: '0.75rem',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span>Continue with GitHub</span>
        </a>
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
