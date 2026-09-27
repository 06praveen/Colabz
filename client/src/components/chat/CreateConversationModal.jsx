import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useChat } from '../../context/ChatContext';
import { useMembers } from '../../context/MemberContext';
import { useToast } from '../../context/ToastContext';
import { MessageSquare, Hash, Users, Plus } from 'lucide-react';
import Avatar from '../ui/Avatar';

export default function CreateConversationModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('channel'); // 'channel' | 'direct'
  const [selectedMemberIds, setSelectedMemberIds] = useState(['usr_1']);
  const [errorMsg, setErrorMsg] = useState('');

  const { createConversation } = useChat();
  const { members } = useMembers();
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setName('');
      setType('channel');
      setSelectedMemberIds(['usr_1']);
      setErrorMsg('');
    }
  }, [isOpen]);

  const toggleMember = (id) => {
    if (selectedMemberIds.includes(id)) {
      if (selectedMemberIds.length > 1) {
        setSelectedMemberIds(selectedMemberIds.filter((mId) => mId !== id));
      }
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() && type === 'channel') {
      setErrorMsg('Channel name is required.');
      return;
    }

    try {
      const conv = await createConversation({
        name: type === 'channel' ? name.trim() : 'Direct Conversation',
        type,
        memberIds: selectedMemberIds
      });

      addToast({
        title: 'Conversation created',
        message: `Created conversation ${type === 'channel' ? '#' + conv.name : ''}.`,
        type: 'success'
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create conversation.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New conversation">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {errorMsg && (
          <div
            style={{
              padding: '0.55rem 0.85rem',
              backgroundColor: 'rgba(255, 92, 112, 0.1)',
              border: '1px solid rgba(255, 92, 112, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger)',
              fontSize: '0.8125rem'
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Type Selector */}
        <div className="clb-input-group">
          <label className="clb-label">Conversation Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setType('channel')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: type === 'channel' ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                backgroundColor: type === 'channel' ? 'rgba(0, 229, 163, 0.1)' : 'var(--bg-elevated)',
                color: type === 'channel' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer'
              }}
            >
              <Hash size={16} />
              <span>Project Channel</span>
            </button>

            <button
              type="button"
              onClick={() => setType('direct')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: type === 'direct' ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                backgroundColor: type === 'direct' ? 'rgba(0, 229, 163, 0.1)' : 'var(--bg-elevated)',
                color: type === 'direct' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer'
              }}
            >
              <Users size={16} />
              <span>Direct Message</span>
            </button>
          </div>
        </div>

        {/* Channel Name Input */}
        {type === 'channel' && (
          <div className="clb-input-group">
            <label className="clb-label">Channel Name *</label>
            <input
              type="text"
              className="clb-input"
              placeholder="e.g. backend-discussion or release-v2"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setErrorMsg('');
              }}
              autoFocus
              required
            />
          </div>
        )}

        {/* Member Selector Checkboxes */}
        <div className="clb-input-group">
          <label className="clb-label">Select Members</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '160px', overflowY: 'auto' }}>
            {members.map((m) => {
              const isChecked = selectedMemberIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isChecked ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Avatar name={m.name} src={m.avatar} size={24} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{m.name}</span>
                  </div>

                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="clb-btn clb-btn-ghost">
            Cancel
          </button>
          <button type="submit" className="clb-btn clb-btn-primary">
            <Plus size={15} />
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
}
