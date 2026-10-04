# COLABZ BACKEND LEARNING GUIDE — PHASE 6

## Repository Files, Folders, Branches, Commits & Version History

Welcome to Phase 6 of the Colabz developer workspace. In this phase, we implemented a complete Git-like repository system backed by MongoDB. This document explains every concept, data structure, architectural decision, and security rule in clear, beginner-friendly language.

---

## 1. What is a Repository?

In Colabz, a **Repository** is the project's digital filing cabinet and version history archive. It stores:
1. **Directory Tree & Files:** Code files (e.g., `App.jsx`, `server.js`, `README.md`) and structural folders (e.g., `src/`, `components/`).
2. **Branches:** Isolated workspaces where developers can test features or fix bugs without destabilizing the main codebase.
3. **Commits & History:** Immutable snapshots recording *who* changed *what*, *when*, and *why* (via commit messages).

Unlike desktop local files where changes overwrite old content permanently, a repository tracks changes over time so you can inspect diffs and understand project evolution.

---

## 2. What is a Branch?

A **Branch** is an independent timeline of development inside a repository.
- **`main`**: The primary, default branch representing the production/stable state of the project.
- **`feature/login`**: A feature branch branched off `main` where a developer works on user authentication without affecting teammates.
- **`bugfix/api-error`**: A bugfix branch isolated for hotfixes.

```text
main:          ●──────●──────● (stable release)
                \           /
feature/login:   ●────●────● (isolated work)
```

In Colabz:
- Every project begins with a default `main` branch.
- Creating a new branch copies the current file snapshot from the source branch.
- Deleting the `main` branch is strictly prohibited.

---

## 3. What is a Commit?

A **Commit** represents an explicit, permanent checkpoint of your project's files.

The developer workflow is:
```text
1. Working State (Edit/Create/Delete files in MongoDB)
       ↓
2. User clicks "Commit" and enters message
       ↓
3. Backend compares working state against previous commit
       ↓
4. Immutable Commit created with diffs (ADD, MODIFY, DELETE)
       ↓
5. Branch pointer (headCommit) moves forward
```

Editing a file in Colabz updates the *working copy*. Committing records the checkpoint into *version history*.

---

## 4. How MongoDB Stores Repository Files

Colabz organizes repository data with clear relational hierarchy using MongoDB ObjectIds:

```text
Project (_id: 64a1...)
   │
   ├── Branch (_id: 72b3..., name: "main", isDefault: true)
   │      │
   │      ├── RepositoryFile (path: "README.md", type: "FILE")
   │      ├── RepositoryFile (path: "src", type: "FOLDER")
   │      └── RepositoryFile (path: "src/App.jsx", type: "FILE")
   │
   └── Commit (_id: 88c9..., hash: "349ea53", branch: 72b3...)
          ├── author: User ObjectId
          ├── message: "Add App.jsx"
          └── changes: [{ path: "src/App.jsx", changeType: "ADD" }]
```

Each `RepositoryFile` document contains:
- `project`: Project ObjectId reference
- `branch`: Branch ObjectId reference
- `path`: Normalized path string (e.g., `src/components/Navbar.jsx`)
- `type`: `"FILE"` or `"FOLDER"`
- `content`: UTF-8 text string of the file
- `language`: Detected language (e.g., `javascript`, `python`, `markdown`)
- `size`: Byte count in memory

---

## 5. Why Files Use Normalized Paths

Rather than building a complex nested folder document schema in MongoDB, Colabz uses **flat normalized path strings**:

Examples:
- `README.md`
- `package.json`
- `src/App.jsx`
- `src/components/Navbar.jsx`

### Normalization Rules:
1. Strip leading and trailing slashes (`/src/App.jsx/` → `src/App.jsx`)
2. Collapse redundant consecutive slashes (`src//components///Button.jsx` → `src/components/Button.jsx`)
3. Trim surrounding whitespace

### Benefits:
- Simple, ultra-fast queries: `RepositoryFile.findOne({ project, branch, path })`
- Subdirectory queries using regex prefixes: `path: /^src\/components\//`
- Frontend can easily build a hierarchical tree structure on demand.

---

## 6. How Branch Creation Works in Colabz

Real Git uses a directed acyclic graph (DAG) of compressed blob and tree hashes. For Colabz (a web application and learning project), we use a simplified, highly reliable model:

1. Look up the source branch (e.g., `main`).
2. Create a new `Branch` record (`isDefault: false`, `createdBy: user._id`).
3. Set the new branch's `headCommit` to the source branch's current `headCommit`.
4. Duplicate all `RepositoryFile` documents from the source branch into the new branch.
5. Future edits and commits on the new branch will only affect documents with the new branch's ObjectId, keeping `main` completely untouched!

---

## 7. How Commits and Diffs Work

When a user submits `POST /api/projects/:projectId/commits`:

```text
[Current Branch Files] vs [Parent Commit Snapshot]
           │
           ├── File exists now, but not in parent  ==> ADD
           ├── File exists in both, content changed ==> MODIFY
           └── File in parent, missing now         ==> DELETE
```

1. If no changes exist compared to the parent commit, the commit is rejected with `400 Bad Request ("There are no changes to commit.")`.
2. A 7-character hexadecimal hash is generated for quick referencing (e.g., `349ea53`).
3. The commit document records all changes with `oldContent` and `newContent`.
4. The branch's `headCommit` pointer is updated to point to the new commit.

---

## 8. What is a Diff?

A **Diff** illustrates the line-by-line differences between two versions of text:

- `+` (Green): Line added in the new version
- `-` (Red): Line removed from the old version
- ` ` (Neutral): Unchanged context line

Colabz computes line diffs on the server so the frontend `DiffViewer` component can immediately render clean syntax-highlighted code comparisons.

---

## 9. Mongoose References and Population

Mongoose schemas use `ObjectId` references to build relationships across collections:

```javascript
const RepositoryFileSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});
```

Using `.populate('author', 'name email avatar')`, MongoDB automatically joins user profile information into commit history without requiring duplicate stored user data.

---

## 10. Compound Unique Indexes

To prevent duplicate files from existing at the same location within the same branch, Colabz defines a **compound unique index**:

```javascript
RepositoryFileSchema.index({ project: 1, branch: 1, path: 1 }, { unique: true });
```

### Why Uniqueness Matters:
- Two projects can have `src/App.jsx`.
- Two branches in the same project can each have `src/App.jsx`.
- But inside **one single branch** of **one single project**, there can ONLY be one `src/App.jsx`.
- The database enforces this at the engine level, preventing race conditions.

Similarly, branch names are unique per project:
```javascript
BranchSchema.index({ project: 1, name: 1 }, { unique: true });
```

---

## 11. Backend Role-Based Access Control (RBAC)

> **Critical Rule:** Never rely on UI button hiding as security! Anyone with Postman or browser DevTools can dispatch HTTP requests directly to your API.

### Phase 6 Permission Matrix:

| Role | Read Tree / Files | Create/Edit/Delete Files | Create/Delete Folders | Create/Delete Branches | Create Commits |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **OWNER** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **DEVELOPER**| ✅ | ✅ | ✅ | ✅ (non-main) | ✅ |
| **DESIGNER** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **VIEWER** | ✅ | ❌ | ❌ | ❌ | ❌ |

All permission checks are enforced strictly in backend middleware and service functions, throwing `403 Forbidden` if unauthorized roles attempt mutations.

---

## 12. REST APIs in Phase 6

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects/:projectId/repository/tree` | Fetch repository folder & file tree | Any active member |
| `GET` | `/api/projects/:projectId/repository/file?path=...` | Retrieve single file content by path | Any active member |
| `GET` | `/api/projects/:projectId/repository/files/:fileId` | Retrieve file content by ObjectId | Any active member |
| `POST` | `/api/projects/:projectId/repository/files` | Create a new code file | OWNER, ADMIN, DEVELOPER |
| `PATCH`| `/api/projects/:projectId/repository/files/:fileId` | Update file content or rename | OWNER, ADMIN, DEVELOPER |
| `DELETE`| `/api/projects/:projectId/repository/files/:fileId` | Delete a file | OWNER, ADMIN, DEVELOPER |
| `POST` | `/api/projects/:projectId/repository/folders` | Create a folder node | OWNER, ADMIN, DEVELOPER |
| `DELETE`| `/api/projects/:projectId/repository/folders` | Delete folder and recursive children | OWNER, ADMIN, DEVELOPER |
| `GET` | `/api/projects/:projectId/branches` | List all branches in project | Any active member |
| `POST` | `/api/projects/:projectId/branches` | Create a branch from source | OWNER, ADMIN, DEVELOPER |
| `PATCH`| `/api/projects/:projectId/branches/:branchId` | Rename a branch | OWNER, ADMIN, DEVELOPER |
| `DELETE`| `/api/projects/:projectId/branches/:branchId` | Delete a non-default branch | OWNER, ADMIN |
| `GET` | `/api/projects/:projectId/commits` | Get commit log (supports `branchId`, pagination) | Any active member |
| `GET` | `/api/projects/:projectId/commits/:commitId` | Get commit details with line diffs | Any active member |
| `POST` | `/api/projects/:projectId/commits` | Commit working changes to branch | OWNER, ADMIN, DEVELOPER |
| `GET` | `/api/projects/:projectId/repository/files/:fileId/history` | Get commits modifying a specific file | Any active member |

---

## 13. End-to-End Request Lifecycle

```text
React Component (e.g. RepositoryTree / CodeViewer)
       │
       ▼
Axios Client (client/src/services/repositoryService.js)
       │ (Attaches Bearer JWT in headers)
       ▼
Express Router (routes/repositoryRoutes.js)
       │
       ▼
Auth Middleware (protect) -> Decodes JWT, sets req.user
       │
       ▼
Membership Middleware (requireProjectMember) -> Verifies membership, sets req.project & req.membership
       │
       ▼
Controller (controllers/repositoryController.js) -> Validates input, passes to service
       │
       ▼
Service Layer (services/repositoryService.js) -> Checks business logic & RBAC permissions
       │
       ▼
Mongoose Model (models/RepositoryFile.js) -> Runs schema validation & indexes
       │
       ▼
MongoDB Database -> Reads/Writes documents in collections
       │
       ▼
JSON Response -> { success: true, message: "...", data: { ... } }
```

---

## 14. 20 Technical Interview Questions & Answers

### 1. What is version control?
**Answer:** Version control is a system that records changes to files over time so specific versions can be recalled, audited, compared, and merged collaboratively.

### 2. What is a Git repository?
**Answer:** A repository is a directory tracked by a version control system that contains all project files alongside their historical changes and branch metadata.

### 3. What is a branch in a repository?
**Answer:** A branch is an isolated line of development allowing engineers to build features or bugfixes in parallel without altering the main codebase until ready.

### 4. What is a commit?
**Answer:** A commit is an immutable snapshot of project files at a specific point in time, accompanied by a descriptive message, author metadata, and change diffs.

### 5. What is a code diff?
**Answer:** A diff is a visual line-by-line comparison between two versions of text showing added (`+`), removed (`-`), and unchanged lines.

### 6. Why do projects use a default branch like `main`?
**Answer:** The default branch serves as the single source of truth for stable, deployable code from which feature branches originate.

### 7. What is the purpose of MongoDB ObjectIds?
**Answer:** An ObjectId is a 12-byte unique identifier generated by MongoDB containing a timestamp, machine identifier, process ID, and incrementing counter to ensure global uniqueness.

### 8. What is a Mongoose reference (`ref`)?
**Answer:** A Mongoose reference specifies which collection an `ObjectId` links to, enabling relational joins via Mongoose's `.populate()` method.

### 9. How does Mongoose `.populate()` work?
**Answer:** `.populate()` performs a second query behind the scenes to replace reference ObjectIds with the full referenced document from the target collection.

### 10. What is a compound unique index in MongoDB?
**Answer:** A compound unique index indexes multiple fields simultaneously (e.g. `project`, `branch`, `path`) and guarantees that no two documents in the collection share the exact same combination of those values.

### 11. Why is path normalization essential?
**Answer:** Normalization prevents duplicate paths caused by leading slashes (`/src/App.js` vs `src/App.js`) or multiple slashes (`src//App.js`), ensuring clean index lookups.

### 12. Why should commit history be immutable?
**Answer:** Immutability guarantees an accurate, trustworthy audit trail of software changes and prevents history corruption.

### 13. What is Role-Based Access Control (RBAC)?
**Answer:** RBAC is a security model where user actions and resource access are determined by assigned roles (e.g., OWNER, DEVELOPER, VIEWER).

### 14. Why must permissions be enforced on the backend?
**Answer:** Client-side checks only control UI visibility. Any user can bypass frontend logic and send HTTP requests directly to backend endpoints using tools like curl or Postman.

### 15. What is REST architecture?
**Answer:** REST (Representational State Transfer) is a stateless software architecture where client-server communications use standard HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`) on distinct resource URIs.

### 16. What is the difference between `PUT` and `PATCH`?
**Answer:** `PUT` replaces the entire resource document, whereas `PATCH` applies partial updates to specific fields of a resource.

### 17. How does the frontend communicate authentication to Express?
**Answer:** The frontend sends a JSON Web Token (JWT) in the `Authorization` header using the `Bearer <token>` format.

### 18. How does Express connect to MongoDB?
**Answer:** Express uses the Mongoose ODM driver to establish a pooled TCP connection to the MongoDB server using a connection string URI.

### 19. Why does Colabz disallow deleting the default `main` branch?
**Answer:** Without a default branch, the repository would enter an orphaned state where new clones, commits, and tree renderings have no baseline origin.

### 20. How does Colabz detect file programming languages?
**Answer:** Colabz analyzes the file extension (e.g., `.jsx` → `javascript`, `.py` → `python`, `.md` → `markdown`) to provide syntax highlighting in the code viewer.

---

## 15. Practical Step-by-Step Exercises

### Exercise 1: Create a file via Postman / Curl
Send a `POST` request to `/api/projects/<projectId>/repository/files`:
```json
{
  "parentPath": "src/utils",
  "fileName": "formatters.js",
  "content": "export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);"
}
```

### Exercise 2: Create a Feature Branch
Create a new branch `feature/profile-card` originating from `main`:
```json
{
  "name": "feature/profile-card",
  "sourceBranchName": "main"
}
```

### Exercise 3: Edit a File
Modify `src/utils/formatters.js` to add an additional helper function, and observe the updated `size` and `updatedAt` properties.

### Exercise 4: Commit Changes
Commit your modifications on `feature/profile-card`:
```json
{
  "branchName": "feature/profile-card",
  "message": "Add capitalize helper to formatters"
}
```

### Exercise 5: Inspect Commit Diffs
Call `GET /api/projects/<projectId>/commits/<commitId>` and verify that `diffs` contains the added code lines.

### Exercise 6: Test RBAC Security
Authenticate as a `VIEWER` member and attempt to delete a file. Verify the server returns a `403 Forbidden` response.

### Exercise 7: Try Deleting the Default Branch
Attempt `DELETE /api/projects/<projectId>/branches/<mainBranchId>` and verify the server blocks the action with `400 Bad Request`.
