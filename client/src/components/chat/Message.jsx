import React, { useState } from 'react';
import Avatar from '../ui/Avatar';
import MessageActions from './MessageActions';
import AttachmentPreview from './AttachmentPreview';
import { useMembers } from '../../context/MemberContext';

export default function Message({
  message,
  parentMessage,
  isGrouped,
  isOwner,
  onReply,
  onEditSubmit,
  onDelete,
  onToggleReaction
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const { members } = useMembers();

  const sender = members.find((m) => m.id === message.senderId) || {
    name: message.senderId === 'usr_1' ? 'Praveen Tiwari' : 'Teammate',
    initials: 'PR',
    avatar: null
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editContent.trim()) {
      onEditSubmit(message.id, editContent.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
        padding: isGrouped ? '0.2rem 1rem' : '0.65rem 1rem 0.2rem',
        backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
        transition: 'background-color 0.12s ease'
      }}
    >
      {/* Avatar or Grouped Spacing */}
      <div style={{ width: '36px', flexShrink: 0 }}>
        {!isGrouped ? (
          <Avatar name={sender.name} src={sender.avatar} size={36} />
        ) : (
          <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', visibility: isHovered ? 'visible' : 'hidden', display: 'block', textAlign: 'center', marginTop: '0.2rem' }}>
            {message.createdAt}
          </span>
        )}
      </div>

      {/* Message Content & Info Container */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header (Only shown when not grouped) */}
        {!isGrouped && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {sender.name}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {message.createdAt}
            </span>
            {message.editedAt && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                ({message.editedAt})
              </span>
            )}
          </div>
        )}

        {/* Reply Quote Preview */}
        {parentMessage && (
          <div
            style={{
              padding: '0.35rem 0.65rem',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderLeft: '2px solid var(--accent-primary)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '0.35rem',
              fontSize: '0.775rem',
              color: 'var(--text-muted)'
            }}
          >
            <strong style={{ color: 'var(--text-secondary)' }}>Replying to parent message:</strong>{' '}
            {parentMessage.content}
          </div>
        )}

        {/* Inline Editing vs Normal Content */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
            <textarea
              className="clb-input"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={2}
              style={{ fontSize: '0.875rem' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(message.content);
                }}
                className="clb-btn clb-btn-ghost"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="clb-btn clb-btn-primary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <div
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              lineHeight: 1.55,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          >
            {message.content}
          </div>
        )}

        {/* Attachments & References */}
        {message.attachments && message.attachments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {message.attachments.map((att, idx) => (
              <AttachmentPreview key={idx} attachment={att} />
            ))}
          </div>
        )}

        {/* Reaction Badges */}
        {message.reactions && message.reactions.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
            {message.reactions.map((rx, idx) => {
              const hasReacted = rx.users?.includes('usr_1');
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onToggleReaction(message.id, rx.emoji)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-pill)',
                    border: hasReacted ? '1px solid rgba(0, 229, 163, 0.4)' : '1px solid var(--border-default)',
                    backgroundColor: hasReacted ? 'rgba(0, 229, 163, 0.12)' : 'var(--bg-elevated)',
                    color: hasReacted ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <span>{rx.emoji}</span>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{rx.count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Hover Action Bar */}
      {isHovered && !isEditing && (
        <div style={{ position: 'absolute', right: '1rem', top: '-10px', zIndex: 5 }}>
          <MessageActions
            isOwner={isOwner}
            onReact={(emoji) => onToggleReaction(message.id, emoji)}
            onReply={() => onReply(message)}
            onEdit={() => setIsEditing(true)}
            onDelete={() => onDelete(message)}
          />
        </div>
      )}
    </div>
  );
}
