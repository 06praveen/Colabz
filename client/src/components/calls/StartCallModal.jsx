import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useCalls } from '../../context/CallContext';
import { useToast } from '../../context/ToastContext';
import { Video, Mic, Plus } from 'lucide-react';

export default function StartCallModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('video'); // 'video' | 'voice'
  const { startNewCall } = useCalls();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newCall = await startNewCall({ title, type });
    addToast({
      title: 'Call created',
      message: `Created ${type === 'video' ? 'video' : 'voice'} call "${newCall.title}". Enters pre-call lobby.`,
      type: 'success'
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start a call">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          Meet your team directly inside the project workspace.
        </p>

        {/* Call Type Selection Buttons */}
        <div className="clb-input-group">
          <label className="clb-label">Call Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setType('video')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: type === 'video' ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                backgroundColor: type === 'video' ? 'rgba(0, 229, 163, 0.1)' : 'var(--bg-elevated)',
                color: type === 'video' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer'
              }}
            >
              <Video size={16} />
              <span>Video Call</span>
            </button>

            <button
              type="button"
              onClick={() => setType('voice')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: type === 'voice' ? '1px solid var(--accent-purple)' : '1px solid var(--border-default)',
                backgroundColor: type === 'voice' ? 'rgba(139, 124, 255, 0.1)' : 'var(--bg-elevated)',
                color: type === 'voice' ? 'var(--accent-purple)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer'
              }}
            >
              <Mic size={16} />
              <span>Voice Call</span>
            </button>
          </div>
        </div>

        {/* Call Title Input */}
        <div className="clb-input-group">
          <label className="clb-label">Call Name (optional)</label>
          <input
            type="text"
            className="clb-input"
            placeholder="e.g. Development sync or Design review"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="clb-btn clb-btn-ghost">
            Cancel
          </button>
          <button type="submit" className="clb-btn clb-btn-primary">
            <Plus size={15} />
            Start call
          </button>
        </div>
      </form>
    </Modal>
  );
}
