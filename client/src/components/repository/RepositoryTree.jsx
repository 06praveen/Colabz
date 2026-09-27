import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Folder, FolderOpen, FileCode, FileText, FileJson, FileType, File, ChevronRight, ChevronDown } from 'lucide-react';
import RepositoryFileRow from './RepositoryFileRow';

const getFileIcon = (fileName, isFolder, isOpen) => {
  if (isFolder) {
    return isOpen ? (
      <FolderOpen size={16} color="var(--accent-primary)" />
    ) : (
      <Folder size={16} color="var(--accent-primary)" />
    );
  }
  const ext = fileName.split('.').pop().toLowerCase();
  if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) return <FileCode size={16} color="#00E5A3" />;
  if (['json'].includes(ext)) return <FileJson size={16} color="#FFB800" />;
  if (['css', 'html'].includes(ext)) return <FileType size={16} color="#06B6D4" />;
  if (['md'].includes(ext)) return <FileText size={16} color="#8B7CFF" />;
  return <File size={16} color="var(--text-secondary)" />;
};

function SidebarTreeNode({ node, depth = 0, currentPath = '' }) {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { projectId } = useParams();
  const activeProjectId = projectId || 'proj_1';

  const isSelected = currentPath === node.path;

  const handleToggle = (e) => {
    e.stopPropagation();
    if (node.isFolder) {
      setIsOpen(!isOpen);
    } else {
      navigate(`/app/projects/${activeProjectId}/repository/tree/${node.path}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.4rem 0.65rem',
          paddingLeft: `${depth * 14 + 10}px`,
          borderRadius: 'var(--radius-sm)',
          backgroundColor: isSelected ? 'rgba(0, 229, 163, 0.12)' : 'transparent',
          color: isSelected ? 'var(--accent-primary)' : node.isFolder ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontWeight: isSelected || node.isFolder ? 600 : 400,
          fontSize: '0.8125rem',
          fontFamily: 'var(--font-mono)',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.12s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
        }}
        onMouseLeave={(e) => {
          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {node.isFolder ? (
          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
            {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
        ) : (
          <span style={{ width: '13px' }} />
        )}

        {getFileIcon(node.name, node.isFolder, isOpen)}

        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {node.name}
        </span>
      </div>

      {node.isFolder && isOpen && node.children && node.children.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {node.children.map((child) => (
            <SidebarTreeNode
              key={child.id || child.path}
              node={child}
              depth={depth + 1}
              currentPath={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RepositoryTree({ nodes = [], mode = 'table', currentPath = '' }) {
  if (!nodes || nodes.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Directory is empty.
      </div>
    );
  }

  // Sort folders first, then files alphabetically
  const sortedNodes = [...nodes].sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    return a.name.localeCompare(b.name);
  });

  if (mode === 'sidebar') {
    return (
      <div
        className="clb-card"
        style={{
          padding: '0.5rem 0.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          maxHeight: '700px',
          overflowY: 'auto'
        }}
      >
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            padding: '0.35rem 0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Files
        </div>
        {sortedNodes.map((node) => (
          <SidebarTreeNode key={node.id || node.path} node={node} depth={0} currentPath={currentPath} />
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden'
      }}
    >
      {/* Table Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 1.5fr) minmax(180px, 2fr) minmax(100px, 0.8fr)',
          padding: '0.55rem 0.85rem',
          backgroundColor: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-default)',
          fontSize: '0.725rem',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        <div>Name</div>
        <div>Last commit</div>
        <div style={{ textAlign: 'right' }}>Updated</div>
      </div>

      {/* Rows */}
      {sortedNodes.map((node) => (
        <RepositoryFileRow key={node.id || node.path} node={node} />
      ))}
    </div>
  );
}
