import React from 'react';
import EmptyState from '../components/ui/EmptyState';
import { MessageSquare } from 'lucide-react';

export default function Messages() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
          Messages
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
          Direct 1-on-1 messaging and team chat channels.
        </p>
      </div>

      <EmptyState
        icon={MessageSquare}
        title="No messages yet"
        description="Direct chat channels will open when team collaboration begins."
        actionLabel="New message"
        onAction={() => alert('Direct messaging will be available in Phase 12.')}
      />
    </div>
  );
}
