import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Plus, FolderGit2, Sparkles, Terminal } from 'lucide-react';
import Logo from '../ui/Logo';

export default function ProjectSwitcher({
  projects = [],
  currentProject,
  onSelectProject,
  onCreateProject,
  isCollapsed = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeProj = currentProject || (projects.length > 0 ? projects[0] : null);

  if (isCollapsed) {
    return (
      <div style={{ padding: '0.85rem 0', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={activeProj ? activeProj.displayName : 'Colabz Workspace'}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
            cursor: 'pointer'
          }}
        >
          <Terminal size={18} />
        </button>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6rem 0.75rem',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'var(--border-default)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
          <Logo size={22} showText={false} />
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: 0 }}>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                color: 'var(--text-muted)'
              }}
            >
              Colabz
            </span>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {activeProj ? activeProj.name : 'Select Project'}
            </span>
          </div>
        </div>

        <ChevronDown
          size={14}
          color="var(--text-muted)"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0
          }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 100,
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
              padding: '0.4rem',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                fontSize: '0.725rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                padding: '0.35rem 0.6rem'
              }}
            >
              Your projects
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '200px', overflowY: 'auto' }}>
              {projects.map((proj) => {
                const pId = proj._id || proj.id || proj.slug;
                const isSelected = activeProj && (activeProj._id === pId || activeProj.id === pId || activeProj.slug === pId);
                return (
                  <button
                    key={pId}
                    onClick={() => {
                      onSelectProject(proj);
                      setIsOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: isSelected ? 'rgba(139, 124, 255, 0.12)' : 'transparent',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                      fontSize: '0.8125rem',
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                      <FolderGit2 size={15} color={proj.accent || 'var(--accent-primary)'} />
                      <span style={{ fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {proj.name}
                      </span>
                    </div>
                    {isSelected && <Check size={14} color="var(--accent-primary)" />}
                  </button>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.35rem 0 0.2rem' }} />

            <button
              onClick={() => {
                setIsOpen(false);
                if (onCreateProject) onCreateProject();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.color = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <Plus size={15} />
              <span>Create project</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
