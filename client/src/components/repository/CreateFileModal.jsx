import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useRepository } from '../../context/RepositoryContext';
import { useToast } from '../../context/ToastContext';
import { FileCode } from 'lucide-react';

export default function CreateFileModal({ isOpen, onClose, parentPath = '', onFileCreated }) {
  const [fileName, setFileName] = useState('');
  const [content, setContent] = useState('');
  const { createFile } = useRepository();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    const created = await createFile(parentPath, fileName.trim(), content);
    addToast({
      title: 'File created',
      message: `File "${fileName}" has been created.`,
      type: 'success'
    });

    if (onFileCreated) onFileCreated(created);
    setFileName('');
    setContent('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create new file">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        <div className="clb-input-group">
          <label className="clb-label">File name *</label>
          <input
            type="text"
            className="clb-input"
            placeholder="e.g. index.js or src/components/Card.jsx"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="clb-input-group">
          <label className="clb-label">Initial content (optional)</label>
          <textarea
            className="clb-input"
            rows={5}
            placeholder="// Add code snippet..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="clb-btn clb-btn-ghost">
            Cancel
          </button>
          <button type="submit" className="clb-btn clb-btn-primary">
            <FileCode size={15} />
            Create file
          </button>
        </div>
      </form>
    </Modal>
  );
}
