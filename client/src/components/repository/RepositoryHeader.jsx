import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, FilePlus, FolderPlus, Upload } from 'lucide-react';
import BranchSelector from './BranchSelector';
import RepositorySearch from './RepositorySearch';
import { useToast } from '../../context/ToastContext';
import MotionButton from '../motion/MotionButton';
import ColabzOctopus from '../motion/ColabzOctopus';

export default function RepositoryHeader({
  searchQuery,
  onSearchChange,
  onClearSearch,
  onOpenCreateFile,
  onOpenCreateFolder,
  onOpenUpload,
}) {
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsNewMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUploadClick = () => {
    setIsNewMenuOpen(false);
    if (onOpenUpload) {
      onOpenUpload();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem',
        marginBottom: '1rem'
      }}
    >
      {/* Left: Branch selector & Code Arm mascot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <BranchSelector />
        <div className="desktop-only-sidebar" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.85 }}>
          <ColabzOctopus mode="code-arm" width={48} height={40} />
          <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
            code-arm
          </span>
        </div>
      </div>

      {/* Right: Search & New actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'flex-end' }}>
        <RepositorySearch value={searchQuery} onChange={onSearchChange} onClear={onClearSearch} />

        {/* + New Dropdown Button */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <MotionButton
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            variant="primary"
            size="sm"
            icon={Plus}
          >
            <span>New</span>
            <ChevronDown size={13} />
          </MotionButton>

          {isNewMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                zIndex: 100,
                width: '160px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                padding: '0.35rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              <button
                onClick={() => {
                  setIsNewMenuOpen(false);
                  onOpenCreateFile();
                }}
                className="clb-btn-ghost"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '0.45rem 0.6rem',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <FilePlus size={14} color="var(--accent-primary)" />
                <span>New file</span>
              </button>

              <button
                onClick={() => {
                  setIsNewMenuOpen(false);
                  onOpenCreateFolder();
                }}
                className="clb-btn-ghost"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '0.45rem 0.6rem',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <FolderPlus size={14} color="var(--accent-primary)" />
                <span>New folder</span>
              </button>

              <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.2rem 0' }} />

              <button
                onClick={handleUploadClick}
                className="clb-btn-ghost"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '0.45rem 0.6rem',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <Upload size={14} color="var(--text-secondary)" />
                <span>Upload files</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
