import React, { useState, useRef } from 'react';
import Modal from '../ui/Modal';
import { useRepository } from '../../context/RepositoryContext';
import { useToast } from '../../context/ToastContext';
import { Upload, File, X, Loader2 } from 'lucide-react';

export default function FileUploadModal({ isOpen, onClose, parentPath = '', onFileUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { uploadFile, currentBranch } = useRepository();
  const { addToast } = useToast();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      addToast({
        title: 'No file selected',
        message: 'Please select a file to upload.',
        type: 'warning',
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (parentPath) {
        formData.append('parentPath', parentPath);
      }
      if (currentBranch) {
        formData.append('branch', currentBranch);
      }

      const uploaded = await uploadFile(formData);

      addToast({
        title: 'File uploaded',
        message: `File "${selectedFile.name}" was uploaded successfully.`,
        type: 'success',
      });

      if (onFileUploaded) {
        onFileUploaded(uploaded);
      }

      setSelectedFile(null);
      onClose();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || 'File upload failed. Please try again.';
      addToast({
        title: 'Upload failed',
        message: errorMsg,
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload file to repository">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {parentPath && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Uploading to: <span style={{ color: 'var(--accent-primary)' }}>/{parentPath}</span>
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-md)',
            backgroundColor: isDragging ? 'rgba(0, 229, 163, 0.06)' : 'var(--bg-card)',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 229, 163, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}
          >
            <Upload size={22} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Click to browse or drag & drop file
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Supports code files, config, JSON, Markdown, and text files up to 15MB
            </div>
          </div>
        </div>

        {/* Selected File Badge */}
        {selectedFile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <File size={16} color="var(--accent-primary)" />
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedFile.name}
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' }}>
          <button type="button" onClick={onClose} className="clb-btn clb-btn-ghost" disabled={uploading}>
            Cancel
          </button>
          <button type="submit" className="clb-btn clb-btn-primary" disabled={!selectedFile || uploading}>
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            <span>{uploading ? 'Uploading...' : 'Upload file'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
