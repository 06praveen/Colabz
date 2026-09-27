# Phase 6 — Repository & Code Workspace: Complete Frontend Guide

Welcome to the **Phase 6 Learning Guide** for Colabz / CodeTogether!

In this phase, we built a modern **Repository & Code Workspace** interface — combining GitHub-like file browsing, branch selection, commit histories, and line-by-line diff views with the collaborative context of Colabz.

---

## Table of Contents

1. [Dynamic Routes](#1-dynamic-routes)
2. [Nested Routes](#2-nested-routes)
3. [URL Parameters](#3-url-parameters)
4. [Repository UI Architecture](#4-repository-ui-architecture)
5. [File-Tree Architecture](#5-file-tree-architecture)
6. [Recursive React Components](#6-recursive-react-components)
7. [Managing Nested Data](#7-managing-nested-data)
8. [Context API in Repository Workspaces](#8-context-api-in-repository-workspaces)
9. [Local State vs Global State](#9-local-state-vs-global-state)
10. [Mock Services Pattern](#10-mock-services-pattern)
11. [Separating UI from Data](#11-separating-ui-from-data)
12. [Syntax Highlighting & Code Display](#12-syntax-highlighting--code-display)
13. [Markdown Rendering](#13-markdown-rendering)
14. [Search & Real-time Filtering](#14-search--real-time-filtering)
15. [Interactive Breadcrumbs](#15-interactive-breadcrumbs)
16. [Branch State & Switcher](#16-branch-state--switcher)
17. [Commit History UI](#17-commit-history-ui)
18. [Diff Viewer UI](#18-diff-viewer-ui)
19. [Responsive Code Interfaces (Desktop vs Mobile)](#19-responsive-code-interfaces-desktop-vs-mobile)
20. [Performance Considerations for Large Trees](#20-performance-considerations-for-large-trees)
21. [Accessibility (a11y) in Tree Controls](#21-accessibility-a11y-in-tree-controls)
22. [Common React Mistakes & Avoidance](#22-common-react-mistakes--avoidance)
23. [Debugging Techniques](#23-debugging-techniques)
24. [Frontend Interview Questions](#24-frontend-interview-questions)
25. [Viva & Academic Questions](#25-viva--academic-questions)
26. [Practical Exercises](#26-practical-exercises)

---

## 1. Dynamic Routes

### What are Dynamic Routes?
Dynamic routes allow a single route definition to match multiple URL patterns using placeholders (parameter tokens). In React Router v6/v7, dynamic routes use a colon prefix (e.g. `:projectId`).

### Example in Colabz:
```jsx
<Route path="projects/:projectId" element={<ProjectLayout />}>
  <Route path="repository" element={<RepositoryPage />} />
  <Route path="repository/tree/*" element={<RepositoryPage />} />
</Route>
```

When a user visits `/app/projects/proj_1/repository`, `projectId` resolves to `"proj_1"`. When visiting `/app/projects/proj_2/repository`, `projectId` resolves to `"proj_2"`.

---

## 2. Nested Routes

### What are Nested Routes?
Nested routes render child components inside parent component layouts using the `<Outlet />` component from React Router.

### Structure in Phase 6:
```text
App Layout (AuthenticatedLayout)
  └── Project Shell (ProjectLayout)
        ├── ProjectHeader + RepositoryTabs
        └── <Outlet />
              ├── RepositoryPage (/repository or /repository/tree/*)
              ├── RepositoryCommitsPage (/repository/commits)
              └── RepositoryBranchesPage (/repository/branches)
```

### Parent Layout Example:
```jsx
export default function ProjectLayout() {
  const { projectId } = useParams();
  
  return (
    <RepositoryProvider projectId={projectId}>
      <ProjectHeader />
      <main>
        <Outlet /> {/* Child route component renders here */}
      </main>
    </RepositoryProvider>
  );
}
```

---

## 3. URL Parameters

### `useParams` Hook
`useParams` retrieves key-value pairs of dynamic parameters from the current URL.

```jsx
import { useParams } from 'react-router-dom';

export default function RepositoryPage() {
  const { projectId, '*': splat } = useParams();
  // projectId = "proj_1"
  // splat = "client/src/App.jsx" (matches wildcard *)
}
```

### Wildcard (`*` Splat) Parameters
Using `tree/*` catches multi-level file paths like `client/src/components/Header.jsx` in a single parameter string.

---

## 4. Repository UI Architecture

The repository workspace follows a component hierarchy:

```text
ProjectLayout (Provider Container)
 ├── ProjectHeader (Metadata & Section Navigation)
 └── RepositoryPage
      ├── RepositoryTabs (Sub-tabs: Files | Commits | Branches)
      ├── RepositoryHeader (Branch selector + Search bar + +New menu)
      ├── Breadcrumbs (Clickable path segments)
      └── Workspace View:
           ├── Directory Mode: RepositoryTree (Table) + ReadmeViewer
           └── File Mode: RepositoryTree (Sidebar) + CodeViewer
```

---

## 5. File-Tree Architecture

A file system is a hierarchical graph. Nodes are categorized into two types:
1. **Folders (Directories)**: Contain an array of child nodes (`children: [...]`).
2. **Files (Leaves)**: Contain file metadata (`size`, `language`, `updatedAt`) and content text.

```json
{
  "id": "f_client",
  "name": "client",
  "path": "client",
  "isFolder": true,
  "children": [
    {
      "id": "f_app",
      "name": "App.jsx",
      "path": "client/App.jsx",
      "isFolder": false,
      "language": "jsx",
      "content": "export default function App() { ... }"
    }
  ]
}
```

---

## 6. Recursive React Components

### Concept
A recursive component calls itself inside its own JSX body to render arbitrary depth tree structures.

### Implementation in `RepositoryTree.jsx`:
```jsx
function SidebarTreeNode({ node, depth = 0 }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <div onClick={() => setIsOpen(!isOpen)} style={{ paddingLeft: depth * 14 }}>
        {node.name}
      </div>

      {node.isFolder && isOpen && node.children?.map((child) => (
        <SidebarTreeNode key={child.path} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}
```

---

## 7. Managing Nested Data

### Immutability when inserting files/folders:
When adding a new file into a deeply nested folder, we update state immutably:

```jsx
const addNodeRecursive = (nodes, targetParentPath, newNode) => {
  return nodes.map((node) => {
    if (node.path === targetParentPath && node.isFolder) {
      return {
        ...node,
        children: [newNode, ...(node.children || [])]
      };
    }
    if (node.isFolder && node.children) {
      return {
        ...node,
        children: addNodeRecursive(node.children, targetParentPath, newNode)
      };
    }
    return node;
  });
};
```

---

## 8. Context API in Repository Workspaces

`RepositoryContext` centralizes state across the workspace without prop drilling.

```jsx
const RepositoryContext = createContext(null);

export function RepositoryProvider({ projectId, children }) {
  const [currentBranch, setCurrentBranch] = useState('main');
  const [files, setFiles] = useState([]);

  return (
    <RepositoryContext.Provider value={{ projectId, files, currentBranch, selectBranch: setCurrentBranch }}>
      {children}
    </RepositoryContext.Provider>
  );
}

export const useRepository = () => useContext(RepositoryContext);
```

---

## 9. Local State vs Global State

| State Type | Scope | Example in Phase 6 |
| :--- | :--- | :--- |
| **Global (Context)** | Shared across tabs/components | `currentBranch`, `files`, `commits`, `projectId` |
| **Local (`useState`)** | Isolated to single component | `searchQuery` in header, `copied` state in `CodeViewer`, `isOpen` in dropdowns |

---

## 10. Mock Services Pattern

The service layer abstracts data retrieval behind an async interface. This enables seamless future API migration.

```javascript
// repositoryService.js
export const repositoryService = {
  async getFiles(projectId) {
    // Current: Return local mock data
    return mockFiles[projectId] || [];
    
    // Future Migration:
    // const res = await fetch(`/api/projects/${projectId}/files`);
    // return res.json();
  }
};
```

---

## 11. Separating UI from Data

- **UI Components** (`CodeViewer`, `DiffViewer`, `BranchList`): Focus exclusively on rendering layout, handling hover effects, and firing callback props.
- **Service & Context** (`repositoryService`, `RepositoryContext`): Focus on data manipulation, state persistence, and filtering algorithms.

---

## 12. Syntax Highlighting & Code Display

Code viewing requires monospace typography (`Geist Mono`), explicit line numbering, horizontal scrollbars, and line wrapping preservation.

```jsx
<div style={{ display: 'flex', fontFamily: 'var(--font-mono)' }}>
  {/* Line numbers column */}
  <div style={{ userSelect: 'none', minWidth: '45px' }}>
    {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
  </div>

  {/* Code contents column */}
  <div style={{ whiteSpace: 'pre', overflowX: 'auto' }}>
    {lines.map((line, i) => <div key={i}>{line}</div>)}
  </div>
</div>
```

---

## 13. Markdown Rendering

`README.md` files are parsed into semantic React elements:
- `# Title` → `<h1>`
- `## Subtitle` → `<h2>`
- `- Bullet` → `<li>`
- `` ```code ``` `` → Monospace code container

This prevents raw Markdown text leakage and provides clear visual structure.

---

## 14. Search & Real-time Filtering

Local repository search recursively scans nodes matching the search query string:

```javascript
const filterRecursive = (nodes, query) => {
  let results = [];
  for (const node of nodes) {
    if (node.name.toLowerCase().includes(query)) {
      results.push(node);
    }
    if (node.isFolder && node.children) {
      results = results.concat(filterRecursive(node.children, query));
    }
  }
  return results;
};
```

---

## 15. Interactive Breadcrumbs

Breadcrumbs map path strings (`client/src/App.jsx`) into interactive button tokens (`root / client / src / App.jsx`).

Each segment calculates its cumulative path up to that index:
```javascript
const cumulativePath = segments.slice(0, idx + 1).join('/');
// Navigates to: /app/projects/:id/repository/tree/client/src
```

---

## 16. Branch State & Switcher

The `BranchSelector` component lets developers switch repository context. Selecting a branch updates `currentBranch` in `RepositoryContext`, refreshing file headers and branch status badges across the application.

---

## 17. Commit History UI

Commits display:
- **Author Initials Badge**: Distinct initials badge (e.g. `PR`, `RS`)
- **Commit Message**: Short summary line
- **Short Hash**: First 7 characters of commit hash (`9f4a8b1`)
- **Timestamp**: Relative time string (`2 hours ago`)

---

## 18. Diff Viewer UI

Line-by-line diffs use semantic background highlights:
- **Additions (`+`)**: Light green background tint (`rgba(0, 229, 163, 0.08)`) with green accent border.
- **Deletions (`-`)**: Light red background tint (`rgba(255, 92, 112, 0.08)`) with red accent border.
- **Context**: Neutral secondary text color.

---

## 19. Responsive Code Interfaces (Desktop vs Mobile)

### Desktop Experience
Side-by-side 2-column layout:
- Left Column: Expandable File Tree Sidebar.
- Right Column: Full Code Viewer / Readme View.

### Mobile Experience
Single column layout:
- When viewing directory: Full-width tree table.
- When inspecting a file: Hides tree, displays dedicated Code Viewer with an interactive `← Back to files` navigation button.

---

## 20. Performance Considerations for Large Trees

1. **Lazy Folder Expansion**: Render folder children only when expanded (`isOpen === true`).
2. **Keying Strategy**: Always pass unique keys (`id` or complete `path`) rather than index keys to prevent DOM rerender thrashing.
3. **Memoization**: Wrap heavy tree calculation logic in `useMemo`.

---

## 21. Accessibility (a11y) in Tree Controls

- **Keyboard Traversal**: Add `tabIndex={0}` and `onKeyDown` handlers listening for `Enter` and `Space` key actions.
- **ARIA Attributes**: Mark expanders with `aria-expanded={isOpen}` and roles like `role="button"`.
- **Focus Rings**: Ensure visible focus outlines on interactive nodes.

---

## 22. Common React Mistakes & Avoidance

1. **Mutating State Directly**:
   - *Wrong*: `files.push(newFile)`
   - *Correct*: `setFiles([...files, newFile])`
2. **Infinite Loops in `useEffect`**:
   - *Wrong*: Omitting dependency array or updating state unconditionally inside `useEffect`.
3. **Monospace Overuse**:
   - Keep monospace font restricted to code content, hashes, and language tags. Keep main UI in readable sans-serif typography (`Geist`).

---

## 23. Debugging Techniques

- **React DevTools**: Inspect context provider values and component state trees.
- **Console Tracing**: Log path resolution errors inside `getFileByPath`.
- **Network Tab**: Inspect Vite module loading and bundle sizes.

---

## 24. Frontend Interview Questions

### Q1: How do you handle deep nested routing in React Router?
**Answer**: Use nested route configurations with `<Outlet />` for layout inheritance, dynamic URL parameters (`:id`), and wildcard splats (`*`) for variable path structures.

### Q2: How do recursive React components prevent stack overflows?
**Answer**: By bounding recursion with conditional rendering (e.g. `node.isFolder && isOpen && children.length > 0`) so recursion halts at leaf nodes.

---

## 25. Viva & Academic Questions

### Q1: What is the benefit of the service layer pattern in single-page applications?
**Answer**: It decouples the UI components from the underlying data fetching logic. Switching from local mock data to REST or GraphQL APIs requires updating only the service file without altering UI components.

### Q2: How does virtualized rendering improve file tree performance?
**Answer**: Virtualization renders only the DOM nodes currently visible inside the viewport scroll window, keeping memory usage constant even for repositories containing thousands of files.

---

## 26. Practical Exercises

1. **Add File Extension Filtering**: Implement a dropdown filter to show only `.jsx` or `.css` files in the current tree view.
2. **Line Highlight**: Add click-to-highlight line functionality in `CodeViewer.jsx` using line anchor parameters (e.g. `#L15`).
3. **Download File Action**: Add a download button to `CodeViewer` that creates a Blob and triggers a local file download.
