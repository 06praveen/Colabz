import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckSquare, CircleDot, GitCommit, FileCode, ExternalLink } from 'lucide-react';

export default function AttachmentPreview({ attachment }) {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const activeProjectId = projectId || 'proj_1';

  if (!attachment) return null;

  // Task Attachment
  if (attachment.type === 'task') {
    const taskObj = attachment;
    return (
      <div
        onClick={() => navigate(`/app/projects/${activeProjectId}/tasks/${taskObj.taskId || taskObj.id || taskObj.identifier}`)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 0.85rem',
          backgroundColor: 'rgba(0, 229, 163, 0.06)',
          border: '1px solid rgba(0, 229, 163, 0.25)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          marginTop: '0.5rem',
          maxWidth: '480px',
          transition: 'all 0.15s ease'
        }}
        className="clb-card-interactive"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <CheckSquare size={16} color="var(--accent-primary)" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
                {taskObj.identifier || 'COL-Task'}
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {taskObj.title}
              </span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Status: {taskObj.status || 'IN_PROGRESS'} • Priority: {taskObj.priority || 'Medium'}
            </div>
          </div>
        </div>
        <ExternalLink size={14} color="var(--text-muted)" />
      </div>
    );
  }

  // Issue Attachment
  if (attachment.type === 'issue') {
    const issueObj = attachment;
    return (
      <div
        onClick={() => navigate(`/app/projects/${activeProjectId}/issues/${issueObj.issueId || issueObj.id || issueObj.number}`)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 0.85rem',
          backgroundColor: 'rgba(234, 179, 8, 0.06)',
          border: '1px solid rgba(234, 179, 8, 0.25)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          marginTop: '0.5rem',
          maxWidth: '480px',
          transition: 'all 0.15s ease'
        }}
        className="clb-card-interactive"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <CircleDot size={16} color="var(--warning, #eab308)" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--warning, #eab308)' }}>
                #{issueObj.number || 24}
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {issueObj.title}
              </span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Status: {issueObj.status || 'Open'} • Priority: {issueObj.priority || 'High'}
            </div>
          </div>
        </div>
        <ExternalLink size={14} color="var(--text-muted)" />
      </div>
    );
  }

  // Commit Attachment
  if (attachment.type === 'commit') {
    return (
      <div
        onClick={() => navigate(`/app/projects/${activeProjectId}/repository/commits/${attachment.commitHash || '9f4a8b1'}`)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 0.85rem',
          backgroundColor: 'rgba(139, 124, 255, 0.08)',
          border: '1px solid rgba(139, 124, 255, 0.25)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          marginTop: '0.5rem',
          maxWidth: '480px',
          transition: 'all 0.15s ease'
        }}
        className="clb-card-interactive"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <GitCommit size={16} color="var(--accent-purple, #8b7cff)" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)' }}>
                {attachment.commitHash || '9f4a8b1'}
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {attachment.message || 'Commit updates'}
              </span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Author: {attachment.author || 'Praveen Tiwari'}
            </div>
          </div>
        </div>
        <ExternalLink size={14} color="var(--text-muted)" />
      </div>
    );
  }

  // Generic File Attachment
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.55rem 0.75rem',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        marginTop: '0.5rem',
        maxWidth: '360px',
        fontSize: '0.8125rem'
      }}
    >
      <FileCode size={16} color="var(--accent-primary)" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {attachment.name || 'attached_file.txt'}
        </div>
        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
          {attachment.size || '12 KB'}
        </div>
      </div>
    </div>
  );
}
