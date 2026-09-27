import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Save } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState(user?.name || 'Praveen Tiwari');
  const [email, setEmail] = useState(user?.email || 'praveen@colabz.dev');
  const [bio, setBio] = useState('Full-stack software developer.');

  const handleSave = (e) => {
    e.preventDefault();
    addToast({
      title: 'Settings saved',
      message: 'Your profile preferences have been updated.',
      type: 'success'
    });
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
          Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
          Manage your account profile and workspace preferences.
        </p>
      </div>

      <div className="clb-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
          <User size={18} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Profile details
          </h2>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.15rem' }}>
            <div className="clb-input-group">
              <label className="clb-label">Full name</label>
              <input
                type="text"
                className="clb-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="clb-input-group">
              <label className="clb-label">Email address</label>
              <input
                type="email"
                className="clb-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="clb-input-group">
            <label className="clb-label">Bio</label>
            <textarea
              className="clb-input"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button type="submit" className="clb-btn clb-btn-primary">
              <Save size={15} />
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
