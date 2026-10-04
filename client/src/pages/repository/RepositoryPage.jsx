import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRepository } from '../../context/RepositoryContext';
import RepositoryTabs from '../../components/repository/RepositoryTabs';
import RepositoryHeader from '../../components/repository/RepositoryHeader';
import Breadcrumbs from '../../components/repository/Breadcrumbs';
import RepositoryTree from '../../components/repository/RepositoryTree';
import CodeViewer from '../../components/repository/CodeViewer';
import ReadmeViewer from '../../components/repository/ReadmeViewer';
import CreateFileModal from '../../components/repository/CreateFileModal';
import CreateFolderModal from '../../components/repository/CreateFolderModal';
import FileUploadModal from '../../components/repository/FileUploadModal';
import { ArrowLeft, AlertCircle, FilePlus, RefreshCw, FolderGit2, Upload } from 'lucide-react';
import { repositoryService } from '../../services/repositoryService';

export default function RepositoryPage() {
  const { projectId, '*': splat } = useParams();
  const navigate = useNavigate();
  const { files, repo, commits, branches, loading, reload } = useRepository();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentNode, setCurrentNode] = useState(null);
  const [nodeLoading, setNodeLoading] = useState(false);
  const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const currentPath = splat || '';
  const activeProjectId = projectId || 'proj_1';

  useEffect(() => {
    async function fetchNode() {
      if (!currentPath) {
        setCurrentNode(null);
        setNodeLoading(false);
        return;
      }
      setNodeLoading(true);
      try {
        const node = await repositoryService.getFileByPath(activeProjectId, currentPath);
        setCurrentNode(node);
      } catch (err) {
        console.error('Failed to get file by path:', err);
      } finally {
        setNodeLoading(false);
      }
    }
    fetchNode();
  }, [activeProjectId, currentPath]);

  const isFilePreview = currentNode && !currentNode.isFolder;
  const isFileNotFound = Boolean(currentPath && !nodeLoading && !currentNode);

  // Filter nodes for search query or tree rendering
  const getVisibleNodes = () => {
    let sourceNodes = files;
    if (currentNode && currentNode.isFolder && currentNode.children) {
      sourceNodes = currentNode.children;
    }

    if (!searchQuery.trim()) return sourceNodes;

    const query = searchQuery.toLowerCase();
    const filterRecursive = (nodes) => {
      let results = [];
      for (const node of nodes) {
        if (node.name.toLowerCase().includes(query) || node.path.toLowerCase().includes(query)) {
          results.push(node);
        }
        if (node.isFolder && node.children) {
          results = results.concat(filterRecursive(node.children));
        }
      }
      return results;
    };

    return filterRecursive(files);
  };

  const visibleNodes = getVisibleNodes();

  // Check for README.md in current directory or root
  const readmeNode = !isFilePreview && (
    visibleNodes.find((n) => n.name && n.name.toLowerCase() === 'readme.md') ||
    files.find((f) => f.name && f.name.toLowerCase() === 'readme.md')
  );

  // 1. Loading State (Requirement #32)
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <RepositoryTabs commitsCount={commits.length} branchesCount={branches.length} />
        <div className="clb-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <RefreshCw size={24} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Loading repository data...
          </span>
        </div>
      </div>
    );
  }

  // 2. Empty Repository State (Requirement #31 & #32)
  if (!files || files.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <RepositoryTabs commitsCount={0} branchesCount={1} />
        <div
          className="clb-card"
          style={{
            padding: '4rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}
          >
            <FolderGit2 size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              No files yet.
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0' }}>
              Start your repository by creating your first file.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => setIsCreateFileOpen(true)}
              className="clb-btn clb-btn-primary"
            >
              <FilePlus size={15} />
              Create file
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="clb-btn clb-btn-secondary"
            >
              <Upload size={15} />
              Upload file
            </button>
          </div>

          <CreateFileModal
            isOpen={isCreateFileOpen}
            onClose={() => setIsCreateFileOpen(false)}
            parentPath=""
            onFileCreated={(newFile) => {
              navigate(`/app/projects/${activeProjectId}/repository/tree/${newFile.path}`);
            }}
          />

          <FileUploadModal
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            parentPath=""
            onFileUploaded={(uploadedFile) => {
              if (uploadedFile && uploadedFile.path) {
                navigate(`/app/projects/${activeProjectId}/repository/tree/${uploadedFile.path}`);
              }
            }}
          />
        </div>
      </div>
    );
  }

  // 3. File Not Found State (Requirement #32)
  if (isFileNotFound) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <RepositoryTabs commitsCount={commits.length} branchesCount={branches.length} />
        <div
          className="clb-card"
          style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <AlertCircle size={32} color="var(--danger)" />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              This file doesn't exist.
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.35rem 0 0', fontFamily: 'var(--font-mono)' }}>
              Path "{currentPath}" could not be found in repository branch "{repo?.defaultBranch || 'main'}".
            </p>
          </div>
          <button
            onClick={() => navigate(`/app/projects/${activeProjectId}/repository`)}
            className="clb-btn clb-btn-secondary"
          >
            <ArrowLeft size={14} />
            Back to repository
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Sub-Tabs: Files / Commits / Branches */}
      <RepositoryTabs commitsCount={commits.length} branchesCount={branches.length} />

      {/* Header Bar: Branch selector, search & + New actions */}
      <RepositoryHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
        onOpenCreateFile={() => setIsCreateFileOpen(true)}
        onOpenCreateFolder={() => setIsCreateFolderOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Mobile Back Button when inspecting file */}
      {isFilePreview && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => {
              const parentPath = currentPath.split('/').slice(0, -1).join('/');
              if (parentPath) {
                navigate(`/app/projects/${activeProjectId}/repository/tree/${parentPath}`);
              } else {
                navigate(`/app/projects/${activeProjectId}/repository`);
              }
            }}
            className="clb-btn clb-btn-ghost"
            style={{ alignSelf: 'flex-start', padding: '0.35rem 0.6rem', fontSize: '0.8125rem' }}
          >
            <ArrowLeft size={14} />
            Back to files
          </button>
        </div>
      )}

      {/* Interactive Path Breadcrumbs */}
      <Breadcrumbs currentPath={currentPath} isFile={isFilePreview} />

      {/* Main Code Workspace Layout */}
      {isFilePreview ? (
        /* Desktop Code Workspace (Requirement #25): Tree Sidebar + Code Viewer side by side on wide screens */
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) 1fr', gap: '1.25rem', alignItems: 'flex-start' }} className="clb-repo-workspace">
          {/* Sidebar File Tree */}
          <div className="clb-repo-sidebar-desktop">
            <RepositoryTree nodes={files} mode="sidebar" currentPath={currentPath} />
          </div>

          {/* Main Code Viewer */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <CodeViewer file={currentNode} />
          </div>
        </div>
      ) : (
        /* Directory Explorer View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <RepositoryTree nodes={visibleNodes} mode="table" currentPath={currentPath} />
          {readmeNode && !searchQuery && (
            <ReadmeViewer content={readmeNode.content} />
          )}
        </div>
      )}

      {/* Create File Modal */}
      <CreateFileModal
        isOpen={isCreateFileOpen}
        onClose={() => setIsCreateFileOpen(false)}
        parentPath={currentNode && currentNode.isFolder ? currentNode.path : ''}
        onFileCreated={(newFile) => {
          navigate(`/app/projects/${activeProjectId}/repository/tree/${newFile.path}`);
        }}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        parentPath={currentNode && currentNode.isFolder ? currentNode.path : ''}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        parentPath={currentNode && currentNode.isFolder ? currentNode.path : ''}
        onFileUploaded={(uploadedFile) => {
          if (uploadedFile && uploadedFile.path) {
            navigate(`/app/projects/${activeProjectId}/repository/tree/${uploadedFile.path}`);
          }
        }}
      />
    </div>
  );
}
