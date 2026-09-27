import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FolderGit2, Plus, GitBranch, GitCommit, Users, Lock, Globe, Sparkles } from 'lucide-react';
import { mockProjects } from '../mock/projects';
import MotionButton from '../components/motion/MotionButton';
import ColabzOctopus from '../components/motion/ColabzOctopus';

export default function Projects() {
  const outletContext = useOutletContext() || {};
  const openCreateProject = outletContext.openCreateProject || (() => {});
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Visual Assembly Hero Banner */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '580px', zIndex: 2 }}>
          <div
            style={{
              fontSize: '0.725rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-primary)',
              letterSpacing: '0.05em',
              marginBottom: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Sparkles size={13} />
            <span>BUILD SOMETHING TOGETHER</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: '0 0 0.4rem 0' }}>
            Projects & Workspaces
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Centralized development workspaces. Manage codebase repositories, task boards, issue threads, and team voice/video calls.
          </p>
        </div>

        {/* Assembly Mascot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 2 }}>
          <ColabzOctopus mode="assembly" width={180} height={140} />
          <MotionButton variant="primary" icon={Plus} onClick={openCreateProject}>
            Create project
          </MotionButton>
        </div>
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.15rem' }}>
        {mockProjects.map((proj) => (
          <div
            key={proj.id}
            onClick={() => navigate(`/app/projects/${proj.id}/repository`)}
            className="clb-card clb-card-interactive"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <FolderGit2 size={18} color="var(--accent-primary)" />
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', margin: 0 }}>
                    {proj.name}
                  </h3>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Updated {proj.updatedAt}</span>
                </div>
              </div>

              <span className={`clb-badge ${proj.visibility === 'PUBLIC' ? 'clb-badge-neutral' : 'clb-badge-success'}`}>
                {proj.visibility === 'PUBLIC' ? <Globe size={11} /> : <Lock size={11} />}
                {proj.visibility.toLowerCase()}
              </span>
            </div>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0, flex: 1 }}>
              {proj.description}
            </p>

            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {proj.techStack.map((tech) => (
                <span
                  key={tech}
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-pill)'
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.65rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <GitCommit size={13} color="var(--accent-primary)" /> {proj.stats?.commits || 14}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <GitBranch size={13} color="var(--accent-primary)" /> {proj.stats?.branches || 3}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Users size={13} color="var(--text-secondary)" /> {proj.stats?.members || 4} members
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
