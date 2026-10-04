import React, { useState, useRef } from 'react';
import Modal from '../ui/Modal';
import { useRepository } from '../../context/RepositoryContext';
import { useToast } from '../../context/ToastContext';
import { Upload, File, X, Loader2, CheckCircle2 } from 'lucide-react';

export default function FileUploadModal({ isOpen, onClose, parentPath = '', onFileUploaded }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { uploadFile, currentBranch } = useRepository();
  const { addToast } = useToast();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const incoming = Array.from(e.target.files);
      addIncomingFiles(incoming);
      // Reset input value so re-selecting same files works
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addIncomingFiles = (incoming) => {
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB
    const oversized = incoming.filter((f) => f.size > MAX_SIZE);
    if (oversized.length > 0) {
      addToast({
        title: 'File too large',
        message: `${oversized[0].name} exceeds the 20MB limit.`,
        type: 'error',
      });
    }

    const validFiles = incoming.filter((f) => f.size <= MAX_SIZE);

    setSelectedFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const newFiles = validFiles.filter((f) => !existingNames.has(f.name));
      const combined = [...prev, ...newFiles];
      if (combined.length > 20) {
        addToast({
          title: 'File limit reached',
          message: 'Maximum 20 files can be uploaded at once.',
          type: 'warning',
        });
        return combined.slice(0, 20);
      }
      return combined;
    });
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const incoming = Array.from(e.dataTransfer.files);
      addIncomingFiles(incoming);
    }
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      addToast({
        title: 'No files selected',
        message: 'Please select at least one file to upload.',
        type: 'warning',
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
        formData.append('file', file);
      });

      if (parentPath) {
        formData.append('parentPath', parentPath);
      }
      if (currentBranch) {
        formData.append('branch', currentBranch);
      }

      const uploaded = await uploadFile(formData);

      addToast({
        title: 'Upload complete',
        message:
          selectedFiles.length > 1
            ? `${selectedFiles.length} files were uploaded successfully.`
            : `File "${selectedFiles[0].name}" was uploaded successfully.`,
        type: 'success',
      });

      if (onFileUploaded) {
        onFileUploaded(uploaded);
      }

      setSelectedFiles([]);
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

  const totalBytes = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload files to repository">
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
            multiple
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
              Click to browse or drag & drop multiple files
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Select single or multiple code, config, JSON, Markdown, and text files up to 20MB
            </div>
          </div>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>SELECTED FILES ({selectedFiles.length})</span>
              <span>Total: {(totalBytes / 1024).toFixed(1)} KB</span>
            </div>

            {selectedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                  <File size={15} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: '0.5rem',
                  }}
                  title="Remove file"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' }}>
          <button
            type="button"
            onClick={() => {
              setSelectedFiles([]);
              onClose();
            }}
            className="clb-btn clb-btn-ghost"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="clb-btn clb-btn-primary"
            disabled={selectedFiles.length === 0 || uploading}
          >
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            <span>
              {uploading
                ? 'Uploading...'
                : selectedFiles.length > 1
                ? `Upload ${selectedFiles.length} files`
                : 'Upload file'}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
