import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useCalls } from '../../context/CallContext';
import MessageList from '../chat/MessageList';
import MessageComposer from '../chat/MessageComposer';
import { MessageSquare, X } from 'lucide-react';

export default function CallChatPanel() {
  const { messages, currentUserId, toggleReaction, editMessage, setReplyingToMessage } = useChat();
  const { toggleChat } = useCalls();

  return (
    <div
      style={{
        width: '320px',
        backgroundColor: 'var(--bg-elevated)',
        borderLeft: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MessageSquare size={16} color="var(--accent-primary)" />
          Call Chat
        </span>
        <button
          type="button"
          onClick={toggleChat}
          className="clb-btn clb-btn-ghost"
          style={{ padding: '0.2rem 0.4rem', color: 'var(--text-muted)' }}
        >
          <X size={15} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          onReply={(msg) => setReplyingToMessage(msg)}
          onEditSubmit={(id, text) => editMessage(id, text)}
          onDelete={() => {}}
          onToggleReaction={(id, emoji) => toggleReaction(id, emoji)}
        />
      </div>

      <MessageComposer />
    </div>
  );
}
