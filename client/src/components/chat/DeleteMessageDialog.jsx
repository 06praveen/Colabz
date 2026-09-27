import React from 'react';
import Modal from '../ui/Modal';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteMessageDialog({ isOpen, onClose, message }) {
  const { deleteMessage } = useChat();
  const { addToast } = useToast();

  if (!message) return null;

  const handleConfirmDelete = async () => {
    try {
      await deleteMessage(message.id);
      addToast({
        title: 'Message deleted',
        message: 'Message was permanently deleted from conversation.',
        type: 'info'
      });
      onClose();
    } catch (err) {
      addToast({
        title: 'Failed to delete',
        message: err.message || 'Could not delete message.',
        type: 'error'
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete message">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
            padding: '0.85rem',
            backgroundColor: 'rgba(255, 92, 112, 0.08)',
            border: '1px solid rgba(255, 92, 112, 0.25)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <AlertTriangle size={20} color="var(--danger)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <div style={{ fontSize: '0.875rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: '0.25rem' }}>
              Delete this message?
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Are you sure you want to delete this message? This action cannot be undone locally.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="clb-btn clb-btn-ghost">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            className="clb-btn"
            style={{ backgroundColor: 'var(--danger)', color: '#ffffff', border: 'none', fontWeight: 600 }}
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
