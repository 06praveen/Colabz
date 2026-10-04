# COLABZ BACKEND API SPECIFICATION — PHASE 6

## Repository, Files, Folders, Branches & Commits

This document provides the complete API specification for all endpoints introduced in **Phase 6** of the Colabz developer workspace.

---

## Base URL
```text
http://localhost:5000/api
```

## Authentication
All endpoints require a valid JWT token sent in the `Authorization` header:
```text
Authorization: Bearer <jwt_token>
```

---

## 1. Repository Tree & Files

### 1.1 Get Repository Tree
Retrieves the hierarchical file/folder tree and flat file list for a project and branch.

- **Method:** `GET`
- **URL:** `/api/projects/:projectId/repository/tree`
- **Required Role:** Any active member (OWNER, ADMIN, DEVELOPER, DESIGNER, VIEWER)
- **Query Parameters:**
  - `branch` *(optional)*: Branch name or ObjectId (defaults to `main`)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "branch": {
      "id": "64a1f...",
      "name": "main",
      "isDefault": true
    },
    "files": [
      {
        "id": "64a1f...",
        "name": "src",
        "path": "src",
        "isFolder": true,
        "type": "FOLDER",
        "children": [
          {
            "id": "64a1f...",
            "name": "App.jsx",
            "path": "src/App.jsx",
            "isFolder": false,
            "type": "FILE",
            "language": "javascript",
            "size": 340
          }
        ]
      },
      {
        "id": "64a1f...",
        "name": "README.md",
        "path": "README.md",
        "isFolder": false,
        "type": "FILE",
        "language": "markdown",
        "size": 280
      }
    ],
    "flatList": [...]
  }
}
```

---

### 1.2 Get File Content by Path
Retrieves a single file by its normalized path.

- **Method:** `GET`
- **URL:** `/api/projects/:projectId/repository/file?path=src/App.jsx`
- **Required Role:** Any active member
- **Query Parameters:**
  - `path` *(required)*: Relative path of the file
  - `branch` *(optional)*: Branch name or ID
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "file": {
      "id": "64a1f...",
      "name": "App.jsx",
      "path": "src/App.jsx",
      "isFolder": false,
      "type": "FILE",
      "content": "export default function App() {\n  return <div>Hello</div>;\n}\n",
      "language": "javascript",
      "size": 65,
      "updatedAt": "2026-10-03T10:00:00.000Z"
    }
  }
}
```
- **Error Responses:**
  - `400 Bad Request`: `{"success": false, "message": "File path is required"}`
  - `404 Not Found`: `{"success": false, "message": "File not found at path \"src/App.jsx\""}`

---

### 1.3 Get File Content by ID
Retrieves a file document using its MongoDB ObjectId.

- **Method:** `GET`
- **URL:** `/api/projects/:projectId/repository/files/:fileId`
- **Required Role:** Any active member
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "file": {
      "id": "64a1f...",
      "name": "Navbar.jsx",
      "path": "src/components/Navbar.jsx",
      "content": "...",
      "language": "javascript",
      "size": 120
    }
  }
}
```

---

### 1.4 Create File
Creates a new code file in the specified branch and automatically provisions parent folder records.

- **Method:** `POST`
- **URL:** `/api/projects/:projectId/repository/files`
- **Required Role:** OWNER, ADMIN, DEVELOPER
- **Request Body:**
```json
{
  "branch": "main",
  "parentPath": "src/components",
  "fileName": "Button.jsx",
  "content": "export default function Button() { return <button>Click</button>; }"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "File created successfully",
  "data": {
    "file": {
      "id": "64a1f...",
      "name": "Button.jsx",
      "path": "src/components/Button.jsx",
      "isFolder": false,
      "type": "FILE",
      "content": "export default function Button() { return <button>Click</button>; }",
      "language": "javascript",
      "size": 68
    }
  }
}
```
- **Error Responses:**
  - `403 Forbidden`: `{"success": false, "message": "Permission denied: Viewers cannot create files"}`
  - `409 Conflict`: `{"success": false, "message": "A file already exists at path \"src/components/Button.jsx\""}`

---

### 1.5 Update / Edit File
Updates file content, renames the file, or moves it to a new path.

- **Method:** `PATCH`
- **URL:** `/api/projects/:projectId/repository/files/:fileId`
- **Required Role:** OWNER, ADMIN, DEVELOPER
- **Request Body:**
```json
{
  "content": "export default function Button({ label }) { return <button>{label}</button>; }",
  "path": "src/components/PrimaryButton.jsx"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "File updated successfully",
  "data": {
    "file": {
      "id": "64a1f...",
      "name": "PrimaryButton.jsx",
      "path": "src/components/PrimaryButton.jsx",
      "size": 79
    }
  }
}
```

---

### 1.6 Delete File
Deletes a file from the branch's current working directory state.

- **Method:** `DELETE`
- **URL:** `/api/projects/:projectId/repository/files/:fileId`
- **Required Role:** OWNER, ADMIN, DEVELOPER
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": null
}
```

---

### 1.7 Create Folder
Creates a directory marker in the branch tree.

- **Method:** `POST`
- **URL:** `/api/projects/:projectId/repository/folders`
- **Required Role:** OWNER, ADMIN, DEVELOPER
- **Request Body:**
```json
{
  "branch": "main",
  "parentPath": "src",
  "folderName": "hooks"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Folder created successfully",
  "data": {
    "folder": {
      "id": "64a1f...",
      "name": "hooks",
      "path": "src/hooks",
      "isFolder": true,
      "type": "FOLDER"
    }
  }
}
```

---

### 1.8 Delete Folder
Deletes a folder and all recursive child files and subdirectories.

- **Method:** `DELETE`
- **URL:** `/api/projects/:projectId/repository/folders`
- **Required Role:** OWNER, ADMIN, DEVELOPER
- **Request Body:**
```json
{
  "path": "src/hooks",
  "branchId": "64a1f..."
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Folder deleted successfully",
  "data": {
    "deletedCount": 4
  }
}
```

---

## 2. Branches

### 2.1 Get All Branches
- **Method:** `GET`
- **URL:** `/api/projects/:projectId/branches`
- **Required Role:** Any active member
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "count": 2,
    "branches": [
      {
        "id": "64a1f...",
        "name": "main",
        "isDefault": true,
        "lastCommitMessage": "Initial commit",
        "createdAt": "2026-10-03T09:00:00.000Z"
      },
      {
        "id": "64a2g...",
        "name": "feature/sidebar",
        "isDefault": false,
        "lastCommitMessage": "Add sidebar layout",
        "createdAt": "2026-10-03T10:30:00.000Z"
      }
    ]
  }
}
```

---

### 2.2 Create Branch
Creates a new branch and duplicates working files from the source branch.

- **Method:** `POST`
- **URL:** `/api/projects/:projectId/branches`
- **Required Role:** OWNER, ADMIN, DEVELOPER
- **Request Body:**
```json
{
  "name": "feature/auth-pages",
  "sourceBranchName": "main"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Branch created successfully",
  "data": {
    "branch": {
      "id": "64a3h...",
      "name": "feature/auth-pages",
      "isDefault": false,
      "createdAt": "2026-10-03T11:00:00.000Z"
    }
  }
}
```
- **Error Responses:**
  - `409 Conflict`: `{"success": false, "message": "Branch \"feature/auth-pages\" already exists in this project"}`

---

### 2.3 Rename Branch
- **Method:** `PATCH`
- **URL:** `/api/projects/:projectId/branches/:branchId`
- **Required Role:** OWNER, ADMIN, DEVELOPER
- **Request Body:**
```json
{
  "name": "feature/authentication"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Branch renamed successfully",
  "data": {
    "branch": {
      "id": "64a3h...",
      "name": "feature/authentication"
    }
  }
}
```

---

### 2.4 Delete Branch
Deletes a branch and its associated file working tree.

- **Method:** `DELETE`
- **URL:** `/api/projects/:projectId/branches/:branchId`
- **Required Role:** OWNER, ADMIN
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Branch deleted successfully",
  "data": null
}
```
- **Error Responses:**
  - `400 Bad Request`: `{"success": false, "message": "The default branch cannot be deleted."}`

---

## 3. Commits & Version History

### 3.1 Get Commit History
- **Method:** `GET`
- **URL:** `/api/projects/:projectId/commits`
- **Required Role:** Any active member
- **Query Parameters:**
  - `branchId` *(optional)*: Filter commits by branch
  - `page` *(optional, default 1)*: Page number
  - `limit` *(optional, default 30)*: Commits per page
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "count": 2,
    "commits": [
      {
        "id": "64a4i...",
        "hash": "349ea53",
        "message": "Add Navbar component",
        "author": "Praveen R",
        "authorInitials": "PR",
        "time": "Oct 3",
        "filesChangedCount": 2
      }
    ]
  }
}
```

---

### 3.2 Get Commit Details & Diffs
- **Method:** `GET`
- **URL:** `/api/projects/:projectId/commits/:commitId`
- **Required Role:** Any active member
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "commit": {
      "id": "64a4i...",
      "hash": "349ea53",
      "message": "Add Navbar component",
      "author": "Praveen R",
      "authorInitials": "PR",
      "time": "Oct 3",
      "filesChangedCount": 1,
      "diffs": [
        {
          "file": "src/components/Navbar.jsx",
          "changeType": "MODIFY",
          "additions": 1,
          "deletions": 1,
          "lines": [
            { "type": "deletion", "line": "- export default function Navbar() { return <nav>Old</nav>; }" },
            { "type": "addition", "line": "+ export default function Navbar() { return <nav className=\"hdr\">New</nav>; }" }
          ]
        }
      ]
    }
  }
}
```

---

### 3.3 Create Commit
Compares working directory state with the previous commit, computes file diffs, and advances the branch head commit.

- **Method:** `POST`
- **URL:** `/api/projects/:projectId/commits`
- **Required Role:** OWNER, ADMIN, DEVELOPER
- **Request Body:**
```json
{
  "branchName": "main",
  "message": "Add responsive navigation header"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Commit created successfully",
  "data": {
    "commit": {
      "id": "64a5j...",
      "hash": "a1b2c3d",
      "message": "Add responsive navigation header",
      "author": "Praveen R",
      "filesChangedCount": 1
    }
  }
}
```
- **Error Responses:**
  - `400 Bad Request`: `{"success": false, "message": "There are no changes to commit."}`
  - `403 Forbidden`: `{"success": false, "message": "Permission denied: Viewers cannot create commits"}`

---

### 3.4 Get File Commit History
Retrieves all historical commits that created or modified a specific file.

- **Method:** `GET`
- **URL:** `/api/projects/:projectId/repository/files/:fileId/history`
- **Required Role:** Any active member
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "count": 1,
    "commits": [
      {
        "id": "64a4i...",
        "hash": "349ea53",
        "message": "Add Navbar component",
        "author": "Praveen R",
        "time": "Oct 3"
      }
    ]
  }
}
```
