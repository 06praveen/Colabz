import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FolderGit2, Plus, ArrowRight, Clock, Activity as ActivityIcon } from 'lucide-react';
import { mockProjects } from '../mock/projects';
import { mockActivity } from '../mock/activity';
import { mockMembers } from '../mock/members';
import { mockUser } from '../mock/user';

export default function Dashboard() {
  const { openCreateProject } = useOutletContext();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Simple Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
            {getGreeting()}, {mockUser.name.split(' ')[0]}.
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
            Your workspace overview and team activity.
          </p>
        </div>

        <button onClick={openCreateProject} className="clb-btn clb-btn-primary">
          <Plus size={15} />
          Create project
        </button>
      </div>

      {/* Projects Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Projects
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
              Your active workspace repositories.
            </p>
          </div>

          <button
            onClick={() => navigate('/app/projects')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            View all projects <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {mockProjects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => navigate(`/app/projects/${proj.id}/repository`)}
              className="clb-card clb-card-interactive"
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FolderGit2 size={18} color="var(--accent-primary)" />
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {proj.name}
                  </span>
                </div>
                <span className={`clb-badge ${proj.visibility === 'PUBLIC' ? 'clb-badge-neutral' : 'clb-badge-success'}`}>
                  {proj.visibility.toLowerCase()}
                </span>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                {proj.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', marginTop: '0.2rem' }}>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {proj.techStack.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      style={{
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        color: 'var(--text-secondary)',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {proj.branch}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Activity Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Recent activity
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
              Updates across your team and repositories.
            </p>
          </div>

          <button
            onClick={() => navigate('/app/activity')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            View Activity Center <ArrowRight size={14} />
          </button>
        </div>

        <div className="clb-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
          {mockActivity.map((act) => {
            const actor = mockMembers.find((m) => m.id === act.actorId) || {
              name: act.user || 'Team Member',
              initials: act.avatarInitials || 'TM',
              color: '#6366f1'
            };
            const project = mockProjects.find((p) => p.id === act.projectId) || { name: act.project || 'campus-connect' };
            const titleText = act.title || `${actor.name} ${act.action || 'performed an action'}`;
            const timeText = act.timeAgo || act.timestamp || 'Just now';

            return (
              <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: actor.color || 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {actor.initials || actor.name.slice(0, 2).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 600 }}>{titleText}</span> in{' '}
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 500 }}>
                      {project.name}
                    </span>
                  </div>

                  {act.detail && (
                    <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginTop: '0.15rem', fontFamily: 'var(--font-mono)' }}>
                      {act.detail}
                    </div>
                  )}

                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={12} />
                    <span>{timeText}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

