export const mockFiles = {
  proj_1: [
    {
      id: 'f_client',
      name: 'client',
      path: 'client',
      isFolder: true,
      commitMessage: 'Update client navigation and dashboard layout',
      updatedAt: '2 hours ago',
      children: [
        {
          id: 'f_client_src',
          name: 'src',
          path: 'client/src',
          isFolder: true,
          commitMessage: 'Refactor App.jsx and add authentication hooks',
          updatedAt: '3 hours ago',
          children: [
            {
              id: 'f_app_jsx',
              name: 'App.jsx',
              path: 'client/src/App.jsx',
              isFolder: false,
              commitMessage: 'Update routes for Phase 6 repository workspace',
              updatedAt: '10 mins ago',
              size: '1.2 KB',
              language: 'jsx',
              content: `import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import RepositoryPage from './pages/repository/RepositoryPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/app" element={<AuthenticatedLayout />}>
              <Route path="projects/:projectId/repository/*" element={<RepositoryPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;`
            },
            {
              id: 'f_main_jsx',
              name: 'main.jsx',
              path: 'client/src/main.jsx',
              isFolder: false,
              commitMessage: 'Initial Vite entrypoint setup',
              updatedAt: '1 day ago',
              size: '420 B',
              language: 'jsx',
              content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
            },
            {
              id: 'f_index_css',
              name: 'index.css',
              path: 'client/src/index.css',
              isFolder: false,
              commitMessage: 'Clean design system styles and CSS variables',
              updatedAt: '1 hour ago',
              size: '2.4 KB',
              language: 'css',
              content: `:root {
  --bg-base: #07080A;
  --bg-surface: #0B0D10;
  --bg-elevated: #111318;
  --border-default: #1C2027;
  --accent-primary: #00E5A3;
  --text-primary: #F5F5F3;
}

body {
  font-family: 'Geist', sans-serif;
  background-color: var(--bg-base);
  color: var(--text-primary);
}`
            }
          ]
        },
        {
          id: 'f_package_json',
          name: 'package.json',
          path: 'client/package.json',
          isFolder: false,
          commitMessage: 'Add dependencies for React Router and Framer Motion',
          updatedAt: '2 days ago',
          size: '850 B',
          language: 'json',
          content: `{
  "name": "campus-connect-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.344.0"
  }
}`
        }
      ]
    },
    {
      id: 'f_server',
      name: 'server',
      path: 'server',
      isFolder: true,
      commitMessage: 'Add authentication middleware and Express router',
      updatedAt: '4 hours ago',
      children: [
        {
          id: 'f_server_js',
          name: 'server.js',
          path: 'server/server.js',
          isFolder: false,
          commitMessage: 'Configure Socket.IO server and HTTP port 5000',
          updatedAt: '5 hours ago',
          size: '1.5 KB',
          language: 'javascript',
          content: `const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`Colabz backend server running on port \${PORT}\`);
});`
        }
      ]
    },
    {
      id: 'f_readme_md',
      name: 'README.md',
      path: 'README.md',
      isFolder: false,
      commitMessage: 'Update workspace documentation and quick start guide',
      updatedAt: '1 hour ago',
      size: '1.8 KB',
      language: 'markdown',
      content: `# Campus Connect

A real-time collaborative workspace for university developers and tech societies.

## Features

- **Code Workspace**: Browse repositories, view file histories, and track branch states.
- **Task Kanban**: Organize sprint tasks, assignees, and issue priorities.
- **Real-Time Communication**: Chat channels, direct developer messages, and WebRTC calls.

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development workspace
npm run dev
\`\`\`

## Tech Stack

- **Frontend**: React, Vite, Framer Motion, Geist Typography
- **Backend**: Node.js, Express, Socket.IO
- **Database**: MongoDB & Mongoose`
    },
    {
      id: 'f_gitignore',
      name: '.gitignore',
      path: '.gitignore',
      isFolder: false,
      commitMessage: 'Initial gitignore configuration',
      updatedAt: '3 days ago',
      size: '120 B',
      language: 'plaintext',
      content: `node_modules/
dist/
.env
.DS_Store`
    }
  ]
};
