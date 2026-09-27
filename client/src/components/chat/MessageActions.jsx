import React, { useState } from 'react';
import { Smile, Reply, Edit3, Trash2 } from 'lucide-react';

export default function MessageActions({
  isOwner,
  onReact,
  onReply,
  onEdit,
  onDelete
}) {
  const [showReactionsPopover, setShowReactionsPopover] = useState(false);
  const emojis = ['👍', '❤️', '😂', '🚀', '👀'];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.2rem',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-pill)',
        padding: '0.15rem 0.35rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        position: 'relative'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Reactions Popover */}
      {showReactionsPopover && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: '0.35rem',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-pill)',
            padding: '0.25rem 0.5rem',
            display: 'flex',
            gap: '0.35rem',
            boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
            zIndex: 10
          }}
        >
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onReact(emoji);
                setShowReactionsPopover(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1rem',
                cursor: 'pointer',
                padding: '0.15rem 0.25rem',
                borderRadius: 'var(--radius-sm)',
                transition: 'transform 0.1s ease'
              }}
              className="emoji-hover"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Reaction Toggle Button */}
      <button
        type="button"
        onClick={() => setShowReactionsPopover(!showReactionsPopover)}
        className="clb-btn clb-btn-ghost"
        style={{ padding: '0.25rem', height: 'auto', borderRadius: '50%', color: 'var(--text-muted)' }}
        title="Add reaction"
      >
        <Smile size={14} />
      </button>

      {/* Reply Button */}
      <button
        type="button"
        onClick={onReply}
        className="clb-btn clb-btn-ghost"
        style={{ padding: '0.25rem', height: 'auto', borderRadius: '50%', color: 'var(--text-muted)' }}
        title="Reply to message"
      >
        <Reply size={14} />
      </button>

      {/* Edit Button (if sender is owner) */}
      {isOwner && (
        <button
          type="button"
          onClick={onEdit}
          className="clb-btn clb-btn-ghost"
          style={{ padding: '0.25rem', height: 'auto', borderRadius: '50%', color: 'var(--text-muted)' }}
          title="Edit message"
        >
          <Edit3 size={14} />
        </button>
      )}

      {/* Delete Button (if sender is owner) */}
      {isOwner && (
        <button
          type="button"
          onClick={onDelete}
          className="clb-btn clb-btn-ghost"
          style={{ padding: '0.25rem', height: 'auto', borderRadius: '50%', color: 'var(--danger)' }}
          title="Delete message"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
