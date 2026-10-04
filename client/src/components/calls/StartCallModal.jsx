import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import { useCalls } from '../../context/CallContext';
import { useMembers } from '../../context/MemberContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Video, Mic, Plus, User } from 'lucide-react';

export default function StartCallModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('video'); // 'video' | 'voice'
  const [selectedReceiverId, setSelectedReceiverId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { startNewCall } = useCalls();
  const { members } = useMembers();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const activeProjectId = projectId || 'proj_1';

  const myId = user ? (user._id ? user._id.toString() : user.id) : null;
  const availableMembers = members.filter((m) => {
    const memberId = m.userId || m.id || m._id;
    return memberId && memberId.toString() !== myId;
  });

  useEffect(() => {
    if (availableMembers.length > 0 && !selectedReceiverId) {
      const firstId = availableMembers[0].userId || availableMembers[0].id || availableMembers[0]._id;
      setSelectedReceiverId(firstId);
    }
  }, [availableMembers, selectedReceiverId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReceiverId) {
      addToast({
        title: 'Select a teammate',
        message: 'Please choose a team member to call.',
        type: 'warning',
      });
      return;
    }

    try {
      setSubmitting(true);
      const newCall = await startNewCall({
        receiverId: selectedReceiverId,
        type,
        title,
      });

      onClose();
      navigate(`/app/projects/${activeProjectId}/calls/${newCall.id || newCall._id}`);
    } catch (err) {
      console.error('Failed to start call from modal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start 1-on-1 Call">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          Direct peer-to-peer audio/video call with an active teammate.
        </p>

        {/* Teammate Selection */}
        <div className="clb-input-group">
          <label className="clb-label">Select Teammate</label>
          {availableMembers.length === 0 ? (
            <div
              style={{
                padding: '0.85rem',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px dashed var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
              }}
            >
              No other active members found in this project. Invite members to start calling.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
              {availableMembers.map((m) => {
                const memberId = m.userId || m.id || m._id;
                const isSelected = selectedReceiverId === memberId;
                return (
                  <div
                    key={memberId}
                    onClick={() => setSelectedReceiverId(memberId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected ? 'rgba(0, 229, 163, 0.12)' : 'var(--bg-elevated)',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Avatar name={m.name} src={m.avatar} size={28} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {m.name}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          {m.email || m.role}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--accent-primary)',
                        }}
                      >
                        SELECTED
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Call Type Selection Buttons */}
        <div className="clb-input-group">
          <label className="clb-label">Call Mode</label>
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
                cursor: 'pointer',
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
                border: type === 'voice' ? '1px solid var(--accent-purple, #8b7cff)' : '1px solid var(--border-default)',
                backgroundColor: type === 'voice' ? 'rgba(139, 124, 255, 0.1)' : 'var(--bg-elevated)',
                color: type === 'voice' ? 'var(--accent-purple, #8b7cff)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              <Mic size={16} />
              <span>Voice Call</span>
            </button>
          </div>
        </div>

        {/* Call Title Input */}
        <div className="clb-input-group">
          <label className="clb-label">Call Subject (optional)</label>
          <input
            type="text"
            className="clb-input"
            placeholder="e.g. Code Review or Sync"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="clb-btn clb-btn-ghost" disabled={submitting}>
            Cancel
          </button>
          <button
            type="submit"
            className="clb-btn clb-btn-primary"
            disabled={submitting || availableMembers.length === 0}
          >
            <Plus size={15} />
            {submitting ? 'Connecting...' : 'Start Call'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
