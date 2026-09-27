import React from 'react';
import { Search, X } from 'lucide-react';

export default function RepositorySearch({ value, onChange, onClear }) {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
      <Search
        size={14}
        color="var(--text-muted)"
        style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }}
      />
      <input
        type="text"
        placeholder="Filter files..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '0.45rem 1.8rem 0.45rem 2rem',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)',
          fontSize: '0.8125rem',
          fontFamily: 'var(--font-sans)',
          outline: 'none',
          transition: 'border-color 0.15s ease'
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
      />
      {value && (
        <button
          onClick={onClear}
          style={{
            position: 'absolute',
            right: '0.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
