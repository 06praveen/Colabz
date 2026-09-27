import React, { useEffect, useRef } from 'react';
import Message from './Message';
import EmptyState from '../ui/EmptyState';
import { MessageSquare } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export default function MessageList({
  messages = [],
  currentUserId = 'usr_1',
  onReply,
  onEditSubmit,
  onDelete,
  onToggleReaction
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <EmptyState
          icon={MessageSquare}
          title="No messages yet"
          description="Start the conversation by sending a message below."
        />
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem'
      }}
    >
      {messages.map((msg, index) => {
        const prevMsg = messages[index - 1];

        // Grouping condition: Same sender and no date separator
        const isGrouped =
          prevMsg &&
          prevMsg.senderId === msg.senderId &&
          !msg.dateSeparator &&
          !msg.replyTo;

        // Find parent message if replying
        const parentMsg = msg.replyTo
          ? messages.find((m) => m.id === msg.replyTo)
          : null;

        return (
          <React.Fragment key={msg.id}>
            {/* Date Separator */}
            {msg.dateSeparator && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '1rem 0 0.5rem'
                }}
              >
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    padding: '0.15rem 0.65rem',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {msg.dateSeparator}
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              </div>
            )}

            {/* Message Item */}
            <Message
              message={msg}
              parentMessage={parentMsg}
              isGrouped={isGrouped}
              isOwner={msg.senderId === currentUserId}
              onReply={onReply}
              onEditSubmit={onEditSubmit}
              onDelete={onDelete}
              onToggleReaction={onToggleReaction}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}
