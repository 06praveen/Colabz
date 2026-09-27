import React from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import { FolderGit2, Users, GitCommit, GitBranch, ArrowRight } from 'lucide-react';
import { useRepository } from '../../context/RepositoryContext';
import { useMembers } from '../../context/MemberContext';
import ReadmeViewer from '../../components/repository/ReadmeViewer';
import ProjectActivity from '../../components/activity/ProjectActivity';

export default function ProjectOverview() {
  const { project } = useOutletContext();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { files, commits, branches, repo } = useRepository();
  const { members } = useMembers();
  const activeId = projectId || 'proj_1';

  const readmeFile = files.find((f) => f.name && f.name.toLowerCase() === 'readme.md');
  const projectMembers = members && members.length > 0 ? members : (repo?.contributors || []);

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
            {commits.length || 24}
          </div>
        </div>

        <div className="clb-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>BRANCHES</span>
            <GitBranch size={15} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {branches.length || 4}
          </div>
        </div>

        <div className="clb-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>CONTRIBUTORS</span>
            <Users size={15} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {projectMembers.length}
          </div>
        </div>
      </div>

      {/* Contributors list */}
      <div className="clb-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Contributors & Team Members
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
          {projectMembers.map((c, idx) => (
            <div
              key={c.id || idx}
              onClick={() => navigate(`/app/projects/${activeId}/members/${c.id || c.username}`)}
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
                transition: 'border-color 0.15s ease'
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
                  fontSize: '0.7rem'
                }}
              >
                {c.initials}
              </div>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Project Activity Widget */}
      <ProjectActivity projectId={activeId} limit={5} />

      {/* README section */}
      {readmeFile && <ReadmeViewer content={readmeFile.content} />}
    </div>
  );
}

