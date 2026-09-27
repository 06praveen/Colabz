import React from 'react';
import { BookOpen } from 'lucide-react';

export default function ReadmeViewer({ content = '' }) {
  // Simple markdown parsing to render headings, lists, code blocks, and paragraphs cleanly
  const renderFormattedMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem', margin: '1rem 0 0.5rem' }}>{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', margin: '1.25rem 0 0.5rem' }}>{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '1rem 0 0.4rem' }}>{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={idx} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginLeft: '1.25rem', marginBottom: '0.25rem' }}>{line.replace('- ', '')}</li>;
      }
      if (line.startsWith('```')) {
        return null; // Handle code block start/end boundaries cleanly
      }
      if (line.trim() === '') {
        return <div key={idx} style={{ height: '0.5rem' }} />;
      }
      return <p key={idx} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0.35rem 0' }}>{line}</p>;
    });
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        marginTop: '1.25rem'
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.65rem 1rem',
          backgroundColor: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-default)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-primary)'
        }}
      >
        <BookOpen size={16} color="var(--accent-primary)" />
        <span>README.md</span>
      </div>

      {/* Formatted Content */}
      <div style={{ padding: '1.5rem', color: 'var(--text-primary)' }}>
        {renderFormattedMarkdown(content)}
      </div>
    </div>
  );
}
