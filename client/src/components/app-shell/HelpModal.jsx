import React from 'react';
import Modal from '../ui/Modal';
import { Keyboard } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  const isMac = typeof window !== 'undefined' && window.navigator?.platform?.toUpperCase().indexOf('MAC') >= 0;

  const shortcuts = [
    { key: isMac ? '⌘ + K' : 'Ctrl + K', description: 'Open command search' },
    { key: 'Esc', description: 'Close modals and dropdowns' },
    { key: 'G → P', description: 'Go to Projects' },
    { key: 'G → M', description: 'Go to Messages' },
    { key: 'G → N', description: 'Go to Notifications' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard shortcuts">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{s.description}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text-primary)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)'
                }}
              >
                {s.key}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
          <button onClick={onClose} className="clb-btn clb-btn-primary">
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
