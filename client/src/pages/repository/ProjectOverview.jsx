import React from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import { FolderGit2, Users, GitCommit, GitBranch, Shield, Calendar, Code } from 'lucide-react';
import { useRepository } from '../../context/RepositoryContext';
import ReadmeViewer from '../../components/repository/ReadmeViewer';

export default function ProjectOverview() {
  const outletContext = useOutletContext() || {};
  const project = outletContext.project;
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { files, commits, branches } = useRepository();

  const activeId = projectId || project?._id || project?.id || 'workspace';

  const readmeFile = files.find((f) => f.name && f.name.toLowerCase() === 'readme.md');

  // Real contributors from project owner & members
  const owner = project?.owner;
  const members = project?.members || [];
  const contributors = [];

  if (owner) {
    contributors.push({
      id: owner._id || owner.id || 'owner',
      name: owner.name || 'Project Owner',
      initials: owner.name
        ? owner.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
        : 'OW',
      role: 'Owner',
    });
  }

  members.forEach((m) => {
    const mId = m._id || m.id;
    if (!contributors.some((c) => c.id === mId)) {
      contributors.push({
        id: mId,
        name: m.name || 'Member',
        initials: m.name
          ? m.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
          : 'MB',
        role: 'Member',
      });
    }
  });

  const techStack = project?.technologies || project?.techStack || ['React', 'Node.js', 'MongoDB'];
  const commitsCount = commits?.length || 0;
  const branchesCount = branches?.length || 1;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Quick Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="clb-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>COMMITS</span>
            <GitCommit size={15} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {commitsCount}
          </div>
        </div>

        <div className="clb-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>BRANCHES</span>
            <GitBranch size={15} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {branchesCount}
          </div>
        </div>

        <div className="clb-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>CONTRIBUTORS</span>
            <Users size={15} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {contributors.length || 1}
          </div>
        </div>
      </div>

      {/* Project Metadata Card */}
      <div className="clb-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Project Metadata & Stack
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={13} /> Created {formatDate(project?.createdAt)}
          </span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          {project?.description || 'No description provided for this workspace.'}
        </p>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {techStack.map((tech) => (
            <span
              key={tech}
              style={{
                fontSize: '0.725rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Contributors list */}
      <div className="clb-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Contributors & Workspace Members
          </h3>
          <button
            onClick={() => navigate(`/app/projects/${activeId}/members`)}
            className="clb-btn clb-btn-ghost"
            style={{ fontSize: '0.775rem', padding: '0.2rem 0.5rem' }}
          >
            View all members
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
          {contributors.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/app/projects/${activeId}/members`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                padding: '0.35rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
            >
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
                  fontSize: '0.7rem',
                }}
              >
                {c.initials}
              </div>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>({c.role})</span>
            </div>
          ))}
        </div>
      </div>

      {/* README section */}
      {readmeFile && <ReadmeViewer content={readmeFile.content} />}
    </div>
  );
}
