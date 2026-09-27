import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function PasswordInput({
  label = 'Password',
  value = '',
  onChange,
  error,
  showStrength = false,
  autoComplete = 'current-password',
  onFocus,
  onBlur,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  // Simple strength check calculation
  const getStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 33, label: 'Weak', color: 'var(--danger)' };
    if (score <= 3) return { score: 66, label: 'Good', color: 'var(--warning)' };
    return { score: 100, label: 'Strong', color: 'var(--success)' };
  };

  const strength = getStrength(value);

  return (
    <div className="clb-input-group">
      {label && <label className="clb-label">{label}</label>}
      <div style={{ position: 'relative', width: '100%' }}>
        <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
          <Lock size={16} />
        </div>
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`clb-input ${error ? 'error' : ''}`}
          style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {showStrength && value && (
        <div style={{ marginTop: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            <span>STRENGTH</span>
            <span style={{ color: strength.color, fontWeight: 600 }}>{strength.label}</span>
          </div>
          <div style={{ width: '100%', height: '3px', background: 'var(--bg-input)', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${strength.score}%`,
                height: '100%',
                backgroundColor: strength.color,
                transition: 'width 0.3s ease, background-color 0.3s ease'
              }}
            />
          </div>
        </div>
      )}

      {error && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '2px' }}>{error}</span>}
    </div>
  );
}
