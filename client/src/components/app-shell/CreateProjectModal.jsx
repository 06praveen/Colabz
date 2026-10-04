import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useToast } from '../../context/ToastContext';
import { useProjects } from '../../context/ProjectContext';
import { FolderGit2, Lock, Globe } from 'lucide-react';

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [techStack, setTechStack] = useState('React, Node.js, MongoDB');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const { addToast } = useToast();
  const { createProject } = useProjects();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setFormError('');

    try {
      const createdProject = await createProject({
        name: name.trim(),
        description: description ? description.trim() : '',
        visibility: visibility.toLowerCase(),
        technologies: techStack.split(',').map((t) => t.trim()).filter(Boolean),
      });

      addToast({
        title: 'Project created',
        message: `Project "${createdProject.name}" has been created successfully.`,
        type: 'success',
      });

      if (onProjectCreated) onProjectCreated(createdProject);
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to create project.');
      addToast({
        title: 'Creation failed',
        message: err.message || 'Could not create project. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create new project">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        {formError && (
          <div
            style={{
              padding: '0.65rem',
              background: 'var(--danger-bg)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255, 92, 112, 0.3)',
              color: 'var(--danger)',
              fontSize: '0.8rem',
            }}
          >
            {formError}
          </div>
        )}

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
              onClick={() => setVisibility('public')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: visibility.toLowerCase() === 'public' ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                backgroundColor: visibility.toLowerCase() === 'public' ? 'rgba(0, 229, 163, 0.08)' : 'var(--bg-input)',
                color: visibility.toLowerCase() === 'public' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
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
              onClick={() => setVisibility('private')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: visibility.toLowerCase() === 'private' ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                backgroundColor: visibility.toLowerCase() === 'private' ? 'rgba(0, 229, 163, 0.08)' : 'var(--bg-input)',
                color: visibility.toLowerCase() === 'private' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
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
          <button type="button" onClick={onClose} disabled={isSubmitting} className="clb-btn clb-btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="clb-btn clb-btn-primary">
            <FolderGit2 size={15} />
            {isSubmitting ? 'Creating...' : 'Create project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
