import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useChat } from '../../context/ChatContext';
import { useMembers } from '../../context/MemberContext';
import { Search, MessageSquare, Hash } from 'lucide-react';
import Avatar from '../ui/Avatar';

export default function MessageSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const { messages, conversations, selectConversation } = useChat();
  const { members } = useMembers();

  const results = query.trim()
    ? messages.filter((m) => m.content.toLowerCase().includes(query.toLowerCase().trim()))
    : [];

  const handleSelectResult = (msg) => {
    selectConversation(msg.conversationId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Search messages">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="clb-input"
            placeholder="Search keywords, tasks (COL-24), issues (#24)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '2.3rem' }}
            autoFocus
          />
        </div>

        {/* Results Container */}
        <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {!query.trim() ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Type a keyword or reference to search messages.
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No matching messages found for "{query}".
            </div>
          ) : (
            results.map((msg) => {
              const sender = members.find((m) => m.id === msg.senderId) || { name: 'Praveen Tiwari' };
              const conv = conversations.find((c) => c.id === msg.conversationId);

              return (
                <div
                  key={msg.id}
                  onClick={() => handleSelectResult(msg)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="clb-card-interactive"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      <Hash size={12} />
                      <span>{conv?.name || 'development'}</span>
                      <span style={{ color: 'var(--text-muted)' }}>• {sender.name}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{msg.createdAt}</span>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    "{msg.content}"
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
