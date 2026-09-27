import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Smile, AtSign, X, CheckSquare, CircleDot, FileCode, Paperclip } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useMembers } from '../../context/MemberContext';
import { mockTasks } from '../../mock/tasks';
import { mockIssues } from '../../mock/issues';
import Avatar from '../ui/Avatar';

export default function MessageComposer() {
  const [content, setContent] = useState('');
  const [showEmojiPopover, setShowEmojiPopover] = useState(false);
  const [showMentionPopover, setShowMentionPopover] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState([]);

  const textareaRef = useRef(null);
  const { sendMessage, replyingToMessage, setReplyingToMessage, activeConversation } = useChat();
  const { members } = useMembers();

  const emojis = ['👍', '❤️', '😂', '🚀', '👀', '🔥', '🎉', '💡', '✅', '🙌'];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeConversation?.id, replyingToMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed && selectedAttachments.length === 0) return;

    await sendMessage({
      content: trimmed,
      replyTo: replyingToMessage ? replyingToMessage.id : null,
      attachments: selectedAttachments
    });

    setContent('');
    setSelectedAttachments([]);
    setShowEmojiPopover(false);
    setShowMentionPopover(false);
    setShowAttachMenu(false);
  };

  const handleInsertEmoji = (emoji) => {
    setContent((prev) => prev + emoji);
    setShowEmojiPopover(false);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleInsertMention = (member) => {
    setContent((prev) => `${prev}@${member.username} `);
    setShowMentionPopover(false);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleAttachTask = () => {
    const task = mockTasks[0];
    if (task) {
      setSelectedAttachments((prev) => [
        ...prev,
        {
          type: 'task',
          taskId: task.id,
          identifier: task.identifier,
          title: task.title,
          status: task.status,
          priority: task.priority
        }
      ]);
    }
    setShowAttachMenu(false);
  };

  const handleAttachIssue = () => {
    const issue = mockIssues[0];
    if (issue) {
      setSelectedAttachments((prev) => [
        ...prev,
        {
          type: 'issue',
          issueId: issue.id,
          number: issue.number,
          title: issue.title,
          status: issue.status,
          priority: issue.priority
        }
      ]);
    }
    setShowAttachMenu(false);
  };

  const handleAttachFile = () => {
    setSelectedAttachments((prev) => [
      ...prev,
      {
        type: 'file',
        name: 'App.jsx',
        size: '18 KB',
        path: 'client/src/App.jsx'
      }
    ]);
    setShowAttachMenu(false);
  };

  return (
    <div
      style={{
        padding: '0.85rem 1rem',
        borderTop: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-elevated)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        position: 'relative'
      }}
    >
      {/* Reply Preview Banner */}
      {replyingToMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.4rem 0.75rem',
            backgroundColor: 'rgba(0, 229, 163, 0.08)',
            border: '1px solid rgba(0, 229, 163, 0.25)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.775rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
            <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Replying:</span>
            <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {replyingToMessage.content}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setReplyingToMessage(null)}
            className="clb-btn clb-btn-ghost"
            style={{ padding: '0.15rem 0.35rem', color: 'var(--text-muted)' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Selected Attachments Chips */}
      {selectedAttachments.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {selectedAttachments.map((att, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                color: 'var(--text-primary)'
              }}
            >
              <Paperclip size={12} color="var(--accent-primary)" />
              <span>{att.name || att.identifier || `#${att.number}` || 'Attachment'}</span>
              <button
                type="button"
                onClick={() => setSelectedAttachments((prev) => prev.filter((_, i) => i !== idx))}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Composer Box */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 0.85rem',
          transition: 'border-color 0.15s ease'
        }}
        onFocus={() => {
          if (textareaRef.current) textareaRef.current.parentElement.style.borderColor = 'var(--border-focus)';
        }}
        onBlur={() => {
          if (textareaRef.current) textareaRef.current.parentElement.style.borderColor = 'var(--border-default)';
        }}
      >
        <textarea
          ref={textareaRef}
          className="clb-composer-textarea"
          placeholder={
            activeConversation
              ? `Message #${activeConversation.name}...`
              : 'Write a message...'
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-sans)',
            resize: 'none',
            lineHeight: 1.5
          }}
        />

        {/* Toolbar & Send Button Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)', marginTop: '0.35rem' }}>
          {/* Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', position: 'relative' }}>
            {/* Attachment Toggle */}
            <button
              type="button"
              onClick={() => {
                setShowAttachMenu(!showAttachMenu);
                setShowEmojiPopover(false);
                setShowMentionPopover(false);
              }}
              className="clb-btn clb-btn-ghost"
              style={{ padding: '0.3rem', color: showAttachMenu ? 'var(--accent-primary)' : 'var(--text-muted)' }}
              title="Attach item or file"
            >
              <Plus size={16} />
            </button>

            {/* Emoji Toggle */}
            <button
              type="button"
              onClick={() => {
                setShowEmojiPopover(!showEmojiPopover);
                setShowAttachMenu(false);
                setShowMentionPopover(false);
              }}
              className="clb-btn clb-btn-ghost"
              style={{ padding: '0.3rem', color: showEmojiPopover ? 'var(--accent-primary)' : 'var(--text-muted)' }}
              title="Insert emoji"
            >
              <Smile size={16} />
            </button>

            {/* Mention Toggle */}
            <button
              type="button"
              onClick={() => {
                setShowMentionPopover(!showMentionPopover);
                setShowAttachMenu(false);
                setShowEmojiPopover(false);
              }}
              className="clb-btn clb-btn-ghost"
              style={{ padding: '0.3rem', color: showMentionPopover ? 'var(--accent-primary)' : 'var(--text-muted)' }}
              title="Mention team member"
            >
              <AtSign size={16} />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!content.trim() && selectedAttachments.length === 0}
            className="clb-btn clb-btn-primary"
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.8125rem',
              opacity: content.trim() || selectedAttachments.length > 0 ? 1 : 0.5,
              cursor: content.trim() || selectedAttachments.length > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            <span>Send</span>
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* Emoji Popover */}
      {showEmojiPopover && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '1rem',
            marginBottom: '0.5rem',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0.35rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 20
          }}
        >
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleInsertEmoji(emoji)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Mention Popover */}
      {showMentionPopover && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '3.5rem',
            marginBottom: '0.5rem',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '0.4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            maxHeight: '180px',
            overflowY: 'auto',
            width: '200px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 20
          }}
        >
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '0.2rem 0.4rem', fontWeight: 600 }}>
            MENTION TEAMMATE
          </div>
          {members.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => handleInsertMention(member)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Avatar name={member.name} src={member.avatar} size={20} />
              <span>{member.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Attachment Menu Popover */}
      {showAttachMenu && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '1rem',
            marginBottom: '0.5rem',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '0.4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            width: '200px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 20
          }}
        >
          <button
            type="button"
            onClick={handleAttachTask}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              cursor: 'pointer'
            }}
          >
            <CheckSquare size={14} color="var(--accent-primary)" />
            <span>Attach task (COL-2)</span>
          </button>

          <button
            type="button"
            onClick={handleAttachIssue}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              cursor: 'pointer'
            }}
          >
            <CircleDot size={14} color="var(--warning, #eab308)" />
            <span>Attach issue (#24)</span>
          </button>

          <button
            type="button"
            onClick={handleAttachFile}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              cursor: 'pointer'
            }}
          >
            <FileCode size={14} color="var(--accent-primary)" />
            <span>Attach file (App.jsx)</span>
          </button>
        </div>
      )}
    </div>
  );
}
