import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Folder, FileCode, FileText, FileJson, FileType, File } from 'lucide-react';

const getFileIcon = (fileName, isFolder) => {
  if (isFolder) return <Folder size={16} color="var(--accent-primary)" />;
  const ext = fileName.split('.').pop().toLowerCase();
  if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) return <FileCode size={16} color="#00E5A3" />;
  if (['json'].includes(ext)) return <FileJson size={16} color="#FFB800" />;
  if (['css', 'html'].includes(ext)) return <FileType size={16} color="#06B6D4" />;
  if (['md'].includes(ext)) return <FileText size={16} color="#8B7CFF" />;
  return <File size={16} color="var(--text-secondary)" />;
};

export default function RepositoryFileRow({ node }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const activeProjectId = projectId || 'proj_1';

  const handleClick = () => {
    if (node.isFolder) {
      navigate(`/app/projects/${activeProjectId}/repository/tree/${node.path}`);
    } else {
      navigate(`/app/projects/${activeProjectId}/repository/tree/${node.path}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(200px, 1.5fr) minmax(180px, 2fr) minmax(100px, 0.8fr)',
        alignItems: 'center',
        padding: '0.6rem 0.85rem',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '0.8125rem',
        fontFamily: 'var(--font-mono)',
        transition: 'background-color 0.12s ease'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* File / Folder Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
        {getFileIcon(node.name, node.isFolder)}
        <span
          style={{
            fontWeight: node.isFolder ? 600 : 400,
            color: node.isFolder ? 'var(--text-primary)' : 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {node.name}
        </span>
      </div>

      {/* Commit Message */}
      <div
        style={{
          color: 'var(--text-muted)',
          fontSize: '0.785rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          paddingRight: '0.5rem'
        }}
      >
        {node.commitMessage || 'initial commit'}
      </div>

      {/* Updated Time */}
      <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
        {node.updatedAt || 'recently'}
      </div>
    </div>
  );
}
