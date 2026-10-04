import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useMembers } from '../../context/MemberContext';
import Avatar from '../ui/Avatar';
import MemberRoleBadge from '../members/MemberRoleBadge';
import { Users, FileCode, CheckSquare, CircleDot, Link2, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ChatDetailsPanel() {
  const { activeConversation, isDetailsOpen, setIsDetailsOpen } = useChat();
  const { members } = useMembers();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const activeProjectId = projectId || 'proj_1';

  if (!isDetailsOpen || !activeConversation) return null;

  const convMembers = members.filter((m) =>
    (activeConversation.memberIds || []).includes(m.id)
  );

  return (
    <div
      style={{
        width: '280px',
        backgroundColor: 'var(--bg-elevated)',
        borderLeft: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        fontSize: '0.8125rem'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
          Details
        </span>
        <button
          type="button"
          onClick={() => setIsDetailsOpen(false)}
          className="clb-btn clb-btn-ghost"
          style={{ padding: '0.2rem 0.4rem', color: 'var(--text-muted)' }}
          title="Close details panel"
        >
          <X size={15} />
        </button>
      </div>

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* MEMBERS SECTION */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={14} color="var(--accent-primary)" />
              Members ({convMembers.length})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {convMembers.map((m) => (
              <div
                key={m.id}
                onClick={() => navigate(`/app/projects/${activeProjectId}/members/${m.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.35rem 0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                  <Avatar name={m.name} src={m.avatar} size={24} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.name}
                  </span>
                </div>
                <MemberRoleBadge role={m.role} />
              </div>
            ))}
          </div>
        </div>

        {/* WORKSPACE SHORTCUTS */}
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Link2 size={14} color="var(--accent-primary)" />
            Workspace Shortcuts
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => navigate(`/app/projects/${activeProjectId}/tasks`)}
              className="clb-btn clb-btn-ghost"
              style={{ justifyContent: 'flex-start', fontSize: '0.775rem', gap: '0.4rem', padding: '0.35rem 0.5rem' }}
            >
              <CheckSquare size={13} color="var(--accent-primary)" />
              <span>Project Task Board</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/app/projects/${activeProjectId}/issues`)}
              className="clb-btn clb-btn-ghost"
              style={{ justifyContent: 'flex-start', fontSize: '0.775rem', gap: '0.4rem', padding: '0.35rem 0.5rem' }}
            >
              <CircleDot size={13} color="var(--warning, #eab308)" />
              <span>Project Issues</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/app/projects/${activeProjectId}/repository`)}
              className="clb-btn clb-btn-ghost"
              style={{ justifyContent: 'flex-start', fontSize: '0.775rem', gap: '0.4rem', padding: '0.35rem 0.5rem' }}
            >
              <FileCode size={13} color="var(--accent-primary)" />
              <span>Repository Files</span>
            </button>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileCode size={14} color="var(--accent-primary)" />
            Shared Files
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.5rem',
                backgroundColor: 'var(--bg-subtle, rgba(255,255,255,0.02))',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <FileCode size={12} />
              <span>index.css (24 KB)</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.5rem',
                backgroundColor: 'var(--bg-subtle, rgba(255,255,255,0.02))',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <FileCode size={12} />
              <span>App.jsx (18 KB)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
