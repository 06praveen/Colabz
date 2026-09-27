import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderGit2, CheckSquare, MessageSquare, PhoneCall, 
  GitBranch, Users, Activity, Eye, ShieldCheck, Terminal, ArrowRight
} from 'lucide-react';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import { useNavigation } from '../../context/NavigationContext';

export default function ProductPreviewSection() {
  const [activeTab, setActiveTab] = useState('Overview');
  const { navigateTo } = useNavigation();

  const tabs = ['Overview', 'Repository', 'Tasks', 'Issues', 'Members', 'Chat', 'Calls'];

  const activityFeed = [
    { id: 1, user: 'PR', name: 'Praveen', action: 'pushed 3 commits to main', time: '2m ago', color: '#8b7cff' },
    { id: 2, user: 'RH', name: 'Rahul', action: 'opened Issue #24: Auth Middleware Fix', time: '12m ago', color: '#3ddb82' },
    { id: 3, user: 'AM', name: 'Amit', action: 'moved Task "API Docs" → IN PROGRESS', time: '24m ago', color: '#ffb800' },
    { id: 4, user: 'PT', name: 'Praveen', action: 'started voice call in #general', time: '1h ago', color: '#5ea1ff' },
  ];

  const handleLaunchWorkspace = (tabName) => {
    const validTab = (tabName || activeTab).toLowerCase();
    navigateTo('workspace', { tab: validTab === 'overview' ? 'overview' : validTab, project: 'proj_1' });
  };

  return (
    <section id="product-preview" style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Badge variant="primary" style={{ marginBottom: '1rem' }}>
          REAL-TIME WORKSPACE PREVIEW
        </Badge>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
          THE UNIFIED DEVELOPER WORKSPACE
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem' }}>
          Code, tasks, issues, team members, and live calls inside a single integrated flow.
        </p>
      </div>

      {/* Main Workspace Frame */}
      <Card style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}>
        {/* Workspace Title Header Bar */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-base)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5c70' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffb800' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3ddb82' }} />
            <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginLeft: '0.5rem' }}>
              colabz / campus-connect
            </span>
            <Badge variant="success" dot>PUBLIC</Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><GitBranch size={13} /> main</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={13} /> 4 contributors</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.25rem', padding: '0 1rem', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.85rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Dynamic Workspace Content */}
        <div style={{ padding: '2rem', minHeight: '320px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'Overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.75rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                      About Campus Connect
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                      Collaborative campus student platform for repository management, real-time developer communication, 
                      and automated task assignment.
                    </p>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      <Badge variant="neutral">React</Badge>
                      <Badge variant="neutral">Node.js</Badge>
                      <Badge variant="neutral">MongoDB</Badge>
                      <Badge variant="neutral">Socket.IO</Badge>
                      <Badge variant="neutral">WebRTC</Badge>
                    </div>

                    <div style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', marginBottom: '1.5rem' }}>
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>README.md</span>
                      <p className="font-mono" style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                        # Campus Connect Architecture
                        <br />
                        `npm run dev` to launch local client & server instances.
                      </p>
                    </div>

                    <button
                      onClick={() => handleLaunchWorkspace('overview')}
                      className="clb-btn clb-btn-primary"
                      style={{ gap: '0.4rem', fontSize: '0.85rem' }}
                    >
                      Open Campus Connect Workspace <ArrowRight size={15} />
                    </button>
                  </div>

                  {/* Live Animated Activity Stream */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Activity size={14} color="var(--accent-primary)" /> Live Team Stream
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {activityFeed.map((act) => (
                        <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', padding: '0.65rem', background: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: act.color, color: '#07080a', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {act.user}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                              <strong>{act.name}</strong> {act.action}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{act.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab !== 'Overview' && (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <Terminal size={32} color="var(--accent-primary)" style={{ marginBottom: '0.75rem' }} />
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {activeTab} Workspace Module
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '460px', margin: '0.35rem auto 1.5rem' }}>
                    Interactive live view of Colabz {activeTab.toLowerCase()} system for real-time collaboration.
                  </p>
                  <button
                    onClick={() => handleLaunchWorkspace(activeTab)}
                    className="clb-btn clb-btn-primary"
                    style={{ gap: '0.4rem', fontSize: '0.85rem' }}
                  >
                    Open {activeTab} in Workspace <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>
    </section>
  );
}

