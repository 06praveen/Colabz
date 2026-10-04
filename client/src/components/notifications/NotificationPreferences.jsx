import React from 'react';
import { Sliders, BellOff, BellRing, Volume2, VolumeX } from 'lucide-react';
import { useNotificationContext } from '../../context/NotificationContext';
import { useProjects } from '../../context/ProjectContext';

export default function NotificationPreferences() {
  const { preferences, togglePreference, mutedProjects, toggleMuteProject } = useNotificationContext();
  const { projects } = useProjects();

  const prefKeys = [
    { key: 'assignment', label: 'Task Assignments', desc: 'Notify when assigned to a task or issue' },
    { key: 'mention', label: 'Direct Mentions', desc: 'Notify when @mentioned in chat or comments' },
    { key: 'issue', label: 'Issue Updates', desc: 'Notify when issues are opened or status changes' },
    { key: 'repository', label: 'Repository Activity', desc: 'Notify on PRs, commits, and branch creation' },
    { key: 'chat', label: 'Chat Activity', desc: 'Notify on new channel activity' },
    { key: 'call', label: 'Call Room Alerts', desc: 'Notify when team calls or syncs start' }
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        marginTop: '1.5rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Sliders size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Notification Preferences
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* Event Type Switches */}
        <div>
          <h4
            style={{
              margin: '0 0 0.85rem 0',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Event Notifications
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {prefKeys.map(({ key, label, desc }) => {
              const isOn = preferences[key] !== false;
              return (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</div>
                  </div>
                  <button
                    onClick={() => togglePreference(key)}
                    aria-label={`Toggle ${label}`}
                    style={{
                      width: '40px',
                      height: '22px',
                      borderRadius: '999px',
                      backgroundColor: isOn ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background-color 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        position: 'absolute',
                        top: '3px',
                        left: isOn ? '21px' : '3px',
                        transition: 'left 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                      }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Level Muting */}
        <div>
          <h4
            style={{
              margin: '0 0 0.85rem 0',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Project Mute Controls
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {projects.length === 0 ? (
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                No active projects found to configure muting.
              </div>
            ) : (
              projects.map((proj) => {
                const pId = proj._id || proj.id || proj.slug;
                const isMuted = mutedProjects[pId];
                return (
                  <div
                    key={pId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.85rem',
                      backgroundColor: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isMuted ? (
                        <VolumeX size={16} color="var(--warning)" />
                      ) : (
                        <Volume2 size={16} color="var(--success)" />
                      )}
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {proj.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {isMuted ? 'Muted (No sound/bell alerts)' : 'Active (All notifications allowed)'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleMuteProject(pId)}
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-default)',
                        backgroundColor: isMuted ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.05)',
                        color: isMuted ? 'var(--warning)' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isMuted ? 'Unmute' : 'Mute'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
