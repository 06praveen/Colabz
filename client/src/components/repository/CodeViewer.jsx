import React, { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function CodeViewer({ file }) {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  const codeContent = file?.content || '// File is empty';
  const lines = codeContent.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    addToast({
      title: 'Copied to clipboard',
      message: `${file?.name || 'File'} contents copied.`,
      type: 'success'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Code Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1rem',
          backgroundColor: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-default)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <FileCode size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {file?.name || 'Untitled'}
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-muted)',
              padding: '0.1rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              textTransform: 'uppercase'
            }}
          >
            {file?.language || 'text'}
          </span>
          {file?.size && (
            <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              ({file.size})
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="clb-btn clb-btn-secondary"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
        >
          {copied ? <Check size={14} color="var(--accent-primary)" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Code Body Container with Line Numbers */}
      <div
        style={{
          overflowX: 'auto',
          fontSize: '0.8125rem',
          fontFamily: 'var(--font-mono)',
          lineHeight: 1.6,
          display: 'flex',
          backgroundColor: '#0A0C0F'
        }}
      >
        {/* Line Numbers Column */}
        <div
          style={{
            userSelect: 'none',
            padding: '0.85rem 0.75rem 0.85rem 0.5rem',
            textAlign: 'right',
            color: 'var(--text-muted)',
            borderRight: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(0,0,0,0.15)',
            minWidth: '45px'
          }}
        >
          {lines.map((_, idx) => (
            <div key={idx + 1}>{idx + 1}</div>
          ))}
        </div>

        {/* Code Lines Container */}
        <div style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)', whiteSpace: 'pre', flex: 1 }}>
          {lines.map((line, idx) => (
            <div key={idx}>{line || ' '}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
