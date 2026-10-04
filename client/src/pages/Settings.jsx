import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import { User, AtSign, Save, Loader2, LogOut, Shield } from 'lucide-react';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Full name is required');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    if (!cleanUsername) {
      setErrorMsg('Username is required');
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
      setErrorMsg('Username must be 3-30 characters (letters, numbers, underscores)');
      return;
    }

    setSaving(true);
    try {
      const updated = await userService.updateMyProfile({
        name: name.trim(),
        username: cleanUsername,
        bio: bio.trim(),
      });

      if (updated) {
        updateUser(updated);
        addToast({
          title: 'Settings saved',
          message: 'Your profile and username have been updated successfully.',
          type: 'success',
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      setErrorMsg(msg);
      addToast({
        title: 'Update failed',
        message: msg,
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    addToast({
      title: 'Logged out',
      message: 'You have been signed out of your Colabz session.',
      type: 'info',
    });
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
          Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
          Manage your account profile, unique username, and workspace preferences.
        </p>
      </div>

      <div className="clb-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
          <User size={18} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Profile details
          </h2>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: 'rgba(255, 92, 112, 0.1)',
              border: '1px solid rgba(255, 92, 112, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger)',
              fontSize: '0.8125rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.15rem' }}>
            <div className="clb-input-group">
              <label className="clb-label">Full name *</label>
              <input
                type="text"
                className="clb-input"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMsg('');
                }}
                required
              />
            </div>

            <div className="clb-input-group">
              <label className="clb-label">Unique username *</label>
              <div style={{ position: 'relative' }}>
                <AtSign
                  size={15}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  className="clb-input"
                  style={{ paddingLeft: '2.1rem' }}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''));
                    setErrorMsg('');
                  }}
                  required
                />
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Used to mention and invite you to projects.
              </span>
            </div>
          </div>

          <div className="clb-input-group">
            <label className="clb-label">Email address</label>
            <input
              type="email"
              className="clb-input"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>

          <div className="clb-input-group">
            <label className="clb-label">Bio</label>
            <textarea
              className="clb-input"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell teammates about your skills and role..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button type="submit" className="clb-btn clb-btn-primary" disabled={saving}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Session & Security Card */}
      <div className="clb-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
          <Shield size={18} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Session & Security
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Log out of Colabz
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Sign out from this device. You will need to log in again to access workspaces.
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="clb-btn clb-btn-secondary"
            style={{ color: 'var(--danger)', borderColor: 'rgba(255, 92, 112, 0.3)' }}
          >
            <LogOut size={15} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

