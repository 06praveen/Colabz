import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useToast } from '../../context/ToastContext';
import { FolderGit2, Lock, Globe } from 'lucide-react';

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [techStack, setTechStack] = useState('React, Node.js, MongoDB');
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProject = {
      id: `proj_${Date.now()}`,
      name: name.toLowerCase().replace(/\s+/g, '-'),
      displayName: name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: description || 'Workspace repository.',
      techStack: techStack.split(',').map((t) => t.trim()),
      visibility,
      branch: 'main',
      lastCommit: '1a2b3c4',
      commitMessage: 'initial commit',
      updatedAt: 'Just now',
      membersCount: 1,
      openIssues: 0,
      pendingTasks: 0,
      starred: false,
      accent: '#00E5A3',
      status: 'Active'
    };

    addToast({
      title: 'Project created',
      message: `Project "${newProject.name}" has been created.`,
      type: 'success'
    });

    if (onProjectCreated) onProjectCreated(newProject);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create new project">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        <div className="clb-input-group">
          <label className="clb-label">Project name *</label>
          <input
            type="text"
            className="clb-input"
            placeholder="e.g. campus-connect"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="clb-input-group">
          <label className="clb-label">Description</label>
          <textarea
            className="clb-input"
            rows={3}
            placeholder="Brief description of the project..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="clb-input-group">
          <label className="clb-label">Tech stack (comma separated)</label>
          <input
            type="text"
            className="clb-input"
            placeholder="React, Node.js, MongoDB"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
          />
        </div>

        <div className="clb-input-group">
          <label className="clb-label">Visibility</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setVisibility('PUBLIC')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: visibility === 'PUBLIC' ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                backgroundColor: visibility === 'PUBLIC' ? 'rgba(0, 229, 163, 0.08)' : 'var(--bg-input)',
                color: visibility === 'PUBLIC' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Globe size={18} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Public</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Anyone can view</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setVisibility('PRIVATE')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: visibility === 'PRIVATE' ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                backgroundColor: visibility === 'PRIVATE' ? 'rgba(0, 229, 163, 0.08)' : 'var(--bg-input)',
                color: visibility === 'PRIVATE' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Lock size={18} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Private</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Members only</div>
              </div>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="clb-btn clb-btn-ghost">
            Cancel
          </button>
          <button type="submit" className="clb-btn clb-btn-primary">
            <FolderGit2 size={15} />
            Create project
          </button>
        </div>
      </form>
    </Modal>
  );
}
