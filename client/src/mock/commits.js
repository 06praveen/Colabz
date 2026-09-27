export const mockCommits = {
  proj_1: [
    {
      id: '9f4a8b1',
      hash: '9f4a8b1',
      fullHash: '9f4a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
      message: 'Update routes for Phase 6 repository workspace',
      author: 'Praveen Tiwari',
      authorInitials: 'PR',
      time: '10 minutes ago',
      branch: 'main',
      filesChangedCount: 3,
      diffs: [
        {
          file: 'client/src/App.jsx',
          type: 'modified',
          additions: 12,
          deletions: 4,
          lines: [
            { type: 'context', line: ' import AuthenticatedLayout from "./layouts/AuthenticatedLayout";' },
            { type: 'deletion', line: '-import RepositoryPlaceholder from "./pages/RepositoryPlaceholder";' },
            { type: 'addition', line: '+import RepositoryPage from "./pages/repository/RepositoryPage";' },
            { type: 'addition', line: '+import RepositoryCommitsPage from "./pages/repository/RepositoryCommitsPage";' },
            { type: 'context', line: ' function App() {' }
          ]
        },
        {
          file: 'client/src/components/repository/RepositoryHeader.jsx',
          type: 'added',
          additions: 45,
          deletions: 0,
          lines: [
            { type: 'addition', line: '+export default function RepositoryHeader({ currentBranch }) {' },
            { type: 'addition', line: '+  return (' },
            { type: 'addition', line: '+    <div className="repo-header">...' },
            { type: 'addition', line: '+  );' },
            { type: 'addition', line: '+}' }
          ]
        }
      ]
    },
    {
      id: '7bd91aa',
      hash: '7bd91aa',
      fullHash: '7bd91aa89c0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
      message: 'Clean design system styles and CSS variables',
      author: 'Rahul Sharma',
      authorInitials: 'RS',
      time: '1 hour ago',
      branch: 'main',
      filesChangedCount: 1,
      diffs: [
        {
          file: 'client/src/index.css',
          type: 'modified',
          additions: 8,
          deletions: 15,
          lines: [
            { type: 'deletion', line: '-  box-shadow: 0 0 25px rgba(139, 124, 255, 0.35);' },
            { type: 'addition', line: '+  border: 1px solid var(--border-default);' }
          ]
        }
      ]
    },
    {
      id: '2ac18fd',
      hash: '2ac18fd',
      fullHash: '2ac18fd12a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d',
      message: 'Initial project setup and repository structure',
      author: 'Amit Kumar',
      authorInitials: 'AK',
      time: '2 days ago',
      branch: 'main',
      filesChangedCount: 5,
      diffs: [
        {
          file: 'README.md',
          type: 'added',
          additions: 30,
          deletions: 0,
          lines: [
            { type: 'addition', line: '+# Campus Connect' },
            { type: 'addition', line: '+Real-time workspace for developers.' }
          ]
        }
      ]
    }
  ]
};
