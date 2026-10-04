import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import Input from '../ui/Input';
import PasswordInput from './PasswordInput';
import MotionButton from '../motion/MotionButton';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm({ onSwitchToSignup, onInputFocus, onInputBlur }) {
  const { login, updateUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Check URL params for GitHub OAuth callback response
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');
    const err = params.get('error');

    if (err) {
      setErrors({ form: decodeURIComponent(err) });
    } else if (token) {
      localStorage.setItem('colabz_token', token);
      if (userParam) {
        try {
          const parsedUser = JSON.parse(decodeURIComponent(userParam));
          localStorage.setItem('colabz_user', JSON.stringify(parsedUser));
          if (updateUser) updateUser(parsedUser);
        } catch {
          // ignore
        }
      }
      setMessage('GitHub authentication verified! Connecting to workspace...');
      setTimeout(() => {
        window.location.href = '/app/dashboard';
      }, 300);
    }
  }, [updateUser]);

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email address or username is required';

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
    setErrors({});

    try {
      const res = await login(email, password);
      if (res.success) {
        setMessage('Access Granted! Connecting to workspace...');
        navigate('/app/dashboard', { replace: true });
      }
    } catch (err) {
      setErrors({ form: err.message || 'Invalid credentials. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const rawAuthUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').trim();
  const authBaseUrl = rawAuthUrl ? rawAuthUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '') : '';
  const githubAuthUrl = `${authBaseUrl}/api/auth/github`;

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
          label="Email Address or Username"
          placeholder="developer@colabz.com or @username"
          type="text"
          autoComplete="username"
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

        <MotionButton
          variant="primary"
          size="lg"
          icon={ArrowRight}
          type="submit"
          disabled={submitting}
          fullWidth
          style={{ marginTop: '0.25rem' }}
        >
          {submitting ? 'AUTHENTICATING...' : 'SIGN IN'}
        </MotionButton>

        {/* OR Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            or
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
        </div>

        {/* GitHub OAuth Button */}
        <a
          href={githubAuthUrl}
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
