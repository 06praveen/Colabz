import React, { useState } from 'react';
import { useIssues } from '../../context/IssueContext';
import { MessageSquare, Send } from 'lucide-react';

export default function IssueComments({ issueId, comments = [] }) {
  const [text, setText] = useState('');
  const { addComment } = useIssues();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    await addComment(issueId, text.trim());
    setText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <MessageSquare size={16} color="var(--accent-primary)" />
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Activity & Comments ({comments.length})
        </h3>
      </div>

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {comments.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.825rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
            No comments yet. Be the first to leave a comment.
          </div>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="clb-card"
              style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', padding: '0.85rem 1rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 229, 163, 0.15)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '0.685rem'
                    }}
                  >
                    {c.initials || 'PR'}
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {c.author}
                  </span>
                </div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{c.time}</span>
              </div>

              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {c.text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Post Comment Input */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
        <textarea
          className="clb-input"
          rows={3}
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ resize: 'vertical' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="clb-btn clb-btn-primary"
            disabled={!text.trim()}
            style={{ opacity: !text.trim() ? 0.6 : 1, padding: '0.45rem 0.85rem', fontSize: '0.8125rem' }}
          >
            <Send size={14} />
            Post comment
          </button>
        </div>
      </form>
    </div>
  );
}
