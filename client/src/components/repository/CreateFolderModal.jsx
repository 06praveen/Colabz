import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useRepository } from '../../context/RepositoryContext';
import { useToast } from '../../context/ToastContext';
import { FolderPlus } from 'lucide-react';

export default function CreateFolderModal({ isOpen, onClose, parentPath = '', onFolderCreated }) {
  const [folderName, setFolderName] = useState('');
  const { createFolder } = useRepository();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    const created = await createFolder(parentPath, folderName.trim());
    addToast({
      title: 'Folder created',
      message: `Folder "${folderName}" has been created.`,
      type: 'success'
    });

    if (onFolderCreated) onFolderCreated(created);
    setFolderName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create folder">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        <div className="clb-input-group">
          <label className="clb-label">Folder name *</label>
          <input
            type="text"
            className="clb-input"
            placeholder="e.g. components"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="clb-btn clb-btn-ghost">
            Cancel
          </button>
          <button type="submit" className="clb-btn clb-btn-primary">
            <FolderPlus size={15} />
            Create folder
          </button>
        </div>
      </form>
    </Modal>
  );
}
