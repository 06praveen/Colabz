import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FolderGit2, Plus, ArrowRight, Clock, Inbox, Mail } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useNotificationContext } from '../context/NotificationContext';
import { memberService } from '../services/memberService';

export default function Dashboard() {
  const { openCreateProject } = useOutletContext();
  const navigate = useNavigate();
  const { projects = [], loading } = useProjects();
  const { user } = useAuth();
  const { activity = [] } = useNotificationContext();
  const [pendingInvites, setPendingInvites] = useState([]);

  useEffect(() => {
    memberService
      .getMyPendingInvitations()
      .then((invs) => setPendingInvites(invs || []))
      .catch(() => {});
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.name ? user.name.split(' ')[0] : 'Developer';

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Pending Invitations Alert Banner */}
      {pendingInvites.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(0, 229, 163, 0.08)',
            border: '1px solid var(--accent-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Inbox size={22} color="var(--accent-primary)" />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                You have {pendingInvites.length} pending project invitation{pendingInvites.length > 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Review and accept invitations to start collaborating.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/app/inbox')}
            className="clb-btn clb-btn-primary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.8125rem' }}
          >
            <span>View Inbox</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
            {getGreeting()}, {userName}.
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

          {projects.length > 0 && (
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
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              View all projects <ArrowRight size={14} />
            </button>
          )}
        </div>

        {loading && projects.length === 0 ? (
          <div className="clb-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            LOADING WORKSPACES...
          </div>
        ) : projects.length === 0 ? (
          /* Required Empty State */
          <div
            className="clb-card"
            style={{
              padding: '3rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '1rem',
              backgroundColor: 'rgba(17, 21, 28, 0.6)',
              border: '1px dashed var(--border-default)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 229, 163, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
              }}
            >
              <FolderGit2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem 0', fontFamily: 'var(--font-mono)' }}>
                NO PROJECTS YET
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                Start your first workspace.
              </p>
            </div>
            <button onClick={openCreateProject} className="clb-btn clb-btn-primary" style={{ marginTop: '0.5rem' }}>
              <Plus size={15} />
              CREATE PROJECT
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {projects.map((proj) => {
              const projectId = proj._id || proj.id || proj.slug;
              const visibility = (proj.visibility || 'private').toUpperCase();
              const techList = proj.technologies || proj.techStack || [];
              const branch = proj.defaultBranch || proj.branch || 'main';

              return (
                <div
                  key={projectId}
                  onClick={() => navigate(`/app/projects/${projectId}/repository`)}
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
                    <span className={`clb-badge ${visibility === 'PUBLIC' ? 'clb-badge-neutral' : 'clb-badge-success'}`}>
                      {visibility.toLowerCase()}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    {proj.description || 'Workspace repository.'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', marginTop: '0.2rem' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {techList.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          style={{
                            fontSize: '0.7rem',
                            fontFamily: 'var(--font-mono)',
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            color: 'var(--text-secondary)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {branch}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
              gap: '0.3rem',
            }}
          >
            View Activity Center <ArrowRight size={14} />
          </button>
        </div>

        <div className="clb-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
          {activity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No recent activity recorded yet in your workspace.
            </div>
          ) : (
            activity.slice(0, 5).map((act) => {
              const actor = (act.actor && typeof act.actor === 'object')
                ? {
                    name: act.actor.name || 'Team Member',
                    initials: (act.actor.name || 'TM').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
                    color: act.actor.avatarColor || '#6366f1',
                  }
                : {
                    name: act.user || 'Team Member',
                    initials: act.avatarInitials || 'TM',
                    color: '#6366f1',
                  };
              const projName = (act.project && typeof act.project === 'object')
                ? act.project.name
                : act.projectName || projects[0]?.name || 'Workspace';
              const titleText = act.title || `${actor.name} performed an update`;
              const timeText = act.timeAgo || act.timestamp || 'Recently';

              return (
                <div key={act.id || act._id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
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
                      flexShrink: 0,
                    }}
                  >
                    {actor.initials}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 600 }}>{titleText}</span> in{' '}
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 500 }}>
                        {projName}
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
            })
          )}
        </div>
      </section>
    </div>
  );
}
