import React from 'react';
import { Search, Bell, Plus, Code2 } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

export default function Navbar({ onOpenSearch, onOpenNewProject }) {
  return (
    <header
      style={{
        height: '64px',
        borderBottom: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-sidebar)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Search trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '380px' }}>
        <button
          onClick={onOpenSearch}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            padding: '0.45rem 0.85rem',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            fontSize: '0.8125rem',
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={15} color="var(--text-muted)" />
            <span>Search repositories, tasks, or users...</span>
          </span>
          <kbd
            style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-default)',
              borderRadius: '4px',
              padding: '0.1rem 0.4rem',
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
            }}
          >
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button variant="primary" icon={Plus} onClick={onOpenNewProject}>
          New Project
        </Button>

        {/* Notifications Icon */}
        <button
          style={{
            position: 'relative',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <Bell size={17} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '7px',
              height: '7px',
              backgroundColor: 'var(--primary-500)',
              borderRadius: '50%',
            }}
          />
        </button>

        {/* User Profile Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
          <Avatar name="Praveen Tiwari" online size={34} />
        </div>
      </div>
    </header>
  );
}
