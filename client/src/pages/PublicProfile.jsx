import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Avatar from '../components/ui/Avatar';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { FolderGit2, Star, GitBranch, Calendar, ArrowLeft, Globe, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';

export default function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [publicProjects, setPublicProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const cleanUser = (username || '').replace(/^@/, '');
        const res = await api.get(`/users/profile/${cleanUser}`);
        if (isMounted) {
          if (res.data?.success && res.data.data) {
            setProfile(res.data.data.user);
            setPublicProjects(res.data.data.publicProjects || res.data.data.publicRepositories || []);
          } else {
            setError('User profile not found.');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load public user profile:', err);
          setError(err.response?.data?.message || 'Unable to find user profile.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
    return () => {
      isMounted = false;
    };
  }, [username]);

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="36px" width="120px" />
        <Skeleton height="160px" width="100%" borderRadius="12px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <Skeleton height="140px" borderRadius="10px" />
          <Skeleton height="140px" borderRadius="10px" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ maxWidth: '700px', margin: '4rem auto', padding: '1.5rem', textAlign: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          className="clb-btn clb-btn-ghost"
          style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          Go back
        </button>
        <EmptyState
          icon={ShieldAlert}
          title="Profile Not Found"
          description={error || `We could not find any public profile matching "@${username}".`}
          actionLabel="Back to Safety"
          onAction={() => navigate('/app/dashboard')}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
      }}
    >
      {/* Navigation & Back Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate(-1)}
          className="clb-btn clb-btn-ghost"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          <Globe size={13} color="var(--accent-primary)" />
          <span>PUBLIC PROFILE</span>
        </div>
      </div>

      {/* User Header Profile Card */}
      <div
        className="clb-card"
        style={{
          padding: '1.75rem',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
          <Avatar
            name={profile.name}
            src={profile.avatar}
            size={72}
            style={{ border: `2px solid ${profile.avatarColor || 'var(--accent-primary)'}` }}
          />

          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {profile.name}
              </h1>
              <span
                style={{
                  fontSize: '0.825rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-primary)',
                  backgroundColor: 'rgba(0, 229, 163, 0.1)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 600,
                }}
              >
                @{profile.username}
              </span>
            </div>

            {profile.bio ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.6rem 0 0', lineHeight: 1.5 }}>
                {profile.bio}
              </p>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.4rem 0 0', fontStyle: 'italic' }}>
                No public bio provided.
              </p>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
                {profile.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.725rem',
                      fontFamily: 'var(--font-mono)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Public Repositories Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderGit2 size={18} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Public Repositories ({publicProjects.length})
            </h2>
          </div>
        </div>

        {publicProjects.length === 0 ? (
          <div
            className="clb-card"
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px dashed var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
            }}
          >
            <Sparkles size={24} style={{ margin: '0 auto 0.5rem', color: 'var(--text-muted)' }} />
            <div>@{profile.username} has not published any public repositories yet.</div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '1rem',
            }}
          >
            {publicProjects.map((proj) => {
              const projId = proj._id || proj.id || proj.slug;
              return (
                <div
                  key={projId}
                  onClick={() => navigate(`/app/projects/${projId}/repository`)}
                  className="clb-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.25rem',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    gap: '0.85rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FolderGit2 size={16} color="var(--accent-primary)" />
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {proj.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          backgroundColor: 'rgba(0, 229, 163, 0.12)',
                          color: 'var(--accent-primary)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        PUBLIC
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--text-muted)',
                        margin: '0.5rem 0 0',
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {proj.description || 'No description provided.'}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      paddingTop: '0.65rem',
                      borderTop: '1px solid var(--border-subtle)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-primary)',
                          display: 'inline-block',
                        }}
                      />
                      <span>{proj.language || 'JavaScript'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                      <GitBranch size={12} />
                      <span>{proj.defaultBranch || 'main'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
