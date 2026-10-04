# Colabz Backend Engineering — Phase 5 Learning Guide

## Tasks, Issues & Project Work Management

Welcome to Phase 5 of Colabz backend engineering. In this phase, we implemented persistent, multi-tenant work tracking for projects: **Tasks** (Kanban board, assignees, priorities, due dates) and **Issues** (threaded discussions, status transitions, bug tracking) backed by MongoDB and protected by RBAC.

---

## 1. CRUD in Work Management

CRUD stands for the four foundational database operations:
- **Create**: Inserting a new task or issue into MongoDB (`POST /api/projects/:projectId/tasks`).
- **Read**: Fetching a list with filtering or reading single items (`GET /api/projects/:projectId/tasks`, `GET .../tasks/:taskId`).
- **Update**: Mutating task status, priority, or assignee (`PATCH /api/projects/:projectId/tasks/:taskId`).
- **Delete**: Removing tasks or closing issues (`DELETE /api/projects/:projectId/tasks/:taskId`).

---

## 2. REST API Design & Nested Routes

### Why Nested Routes Make Architectural Sense
In Colabz, tasks and issues have **no meaning outside the context of a project**.
- A task `COL-1` belongs exclusively to `Project A`.
- Requesting `/api/projects/:projectId/tasks` explicitly establishes the parent-child scoping in the URL.
- Middleware (`requireProjectMember`) immediately loads and authorizes the project workspace before task handlers execute.

```text
HTTP Request
  GET /api/projects/6ac0c9/tasks?status=IN%20PROGRESS
        │
        ├── 1. authMiddleware (Validates JWT -> sets req.user)
        ├── 2. requireProjectMember (Finds project -> checks active membership -> sets req.project & req.membership)
        ├── 3. taskController.getTasks (Queries Task model with { project: req.project._id, status: "IN PROGRESS" })
        └── 4. Formats and sends JSON response
```

---

## 3. Data Relationships

### Task Hierarchy
```text
┌─────────────────┐
│     Project     │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐             ┌─────────────────┐
│      Task       │────────────>│  User (Assignee)│
│                 │             └─────────────────┘
│                 │             ┌─────────────────┐
│                 │────────────>│  User (Reporter)│
└─────────────────┘             └─────────────────┘
```

### Issue & Comment Hierarchy
```text
┌─────────────────┐
│     Project     │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│      Issue      │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐             ┌─────────────────┐
│  IssueComment   │────────────>│  User (Author)  │
└─────────────────┘             └─────────────────┘
```

---

## 4. Query Parameters & Dynamic Filtering

Instead of building separate endpoints for every filter permutation, RESTful APIs accept query strings:

```http
GET /api/projects/:projectId/tasks?status=IN%20PROGRESS&priority=High&assignee=6ac0c9
```

In the service layer:
```javascript
const getTasks = async (projectId, query = {}) => {
  const filter = { project: projectId };

  if (query.status) {
    filter.status = new RegExp(`^${query.status.trim()}$`, "i");
  }
  if (query.priority) {
    filter.priority = new RegExp(`^${query.priority.trim()}$`, "i");
  }
  if (query.assignee && mongoose.Types.ObjectId.isValid(query.assignee)) {
    filter.assignee = query.assignee;
  }

  return await Task.find(filter).sort({ order: 1, createdAt: -1 });
};
```

---

## 5. Authorization & RBAC Rules for Work Items

| Role | Create Task/Issue | Update Status/Details | Delete Task/Issue | Post Comment | Delete Comment |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **OWNER** | ✅ | ✅ | ✅ | ✅ | ✅ (Any) |
| **ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ (Any) |
| **DEVELOPER** | ✅ | ✅ | ✅ (If Reporter) | ✅ | ✅ (Own) |
| **DESIGNER** | ✅ | ✅ | ✅ (If Reporter) | ✅ | ✅ (Own) |
| **VIEWER** | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 6. Optimistic UI & Error Rollback

In Kanban boards (e.g. dragging a task from `TODO` to `IN PROGRESS`):
1. **Optimistic Update**: The UI immediately moves the card to the new column without waiting for the network round-trip.
2. **Background Sync**: The frontend issues `PATCH /api/projects/:projectId/tasks/:taskId` with `{ status: 'IN PROGRESS' }`.
3. **Rollback on Failure**: If the backend responds with `403 Forbidden` (e.g., user is a Viewer) or `500 Server Error`, the frontend catches the rejection and resets the task card back to `TODO`, displaying a Toast error notification.

---

## 7. Database Indexes for Work Items

```javascript
// Compound indexes for rapid filtering within a project
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ project: 1, assignee: 1 });
taskSchema.index({ project: 1, priority: 1 });
taskSchema.index({ project: 1, order: 1 });

issueSchema.index({ project: 1, number: 1 });
issueSchema.index({ project: 1, status: 1 });

issueCommentSchema.index({ issue: 1, createdAt: 1 });
```

### Why Index by `{ project: 1, status: 1 }`?
- Every query is scoped to a specific project.
- Filtering by column (e.g. `status: "TODO"`) avoids scanning all tasks across all projects, executing in `O(log N)` index scan time.

---

## 8. Practice Exercises

### 1. Build a Task CRUD API from scratch
- Create model, controller, service, and routes supporting `POST`, `GET`, `PATCH`, `DELETE`.

### 2. Explain Nested Routes
- URL hierarchies like `/api/projects/:id/tasks` reflect resource ownership and facilitate scoped security middleware.

### 3. Explain Query Parameters
- Key-value pairs appended to the URL (`?status=Open&limit=10`) used for filtering, pagination, and sorting without altering resource endpoints.

### 4. How do you validate MongoDB ObjectIds?
- Use `mongoose.Types.ObjectId.isValid(id)` before passing to Mongoose queries to prevent CastErrors from crashing the request.

### 5. How do you ensure an assignee belongs to a project?
- Query `ProjectMembership.findOne({ project: projectId, user: assigneeId, status: 'ACTIVE' })`. If not found, reject with `400 Bad Request`.

### 6. What is Optimistic UI?
- Updating the client interface state before receiving server confirmation to deliver instant perceived responsiveness.

### 7. How does a Kanban board persist status?
- When a card is dropped into a column, a `PATCH` request updates the task's `status` and `order` fields in MongoDB.

### 8. Design an Issue schema
- Includes `project`, `number`, `title`, `description`, `status`, `priority`, `reporter`, `assignee`, and `labels`.

### 9. Why use a separate collection for comments instead of an embedded array?
- Comments grow unboundedly over time. Storing them in a separate collection prevents exceeding MongoDB's 16MB document size limit and simplifies pagination.

### 10. Distinguish 400, 401, 403, and 404
- **400 Bad Request**: Invalid payload or missing required fields.
- **401 Unauthorized**: Missing or invalid authentication token.
- **403 Forbidden**: Authenticated user lacks permission.
- **404 Not Found**: Resource does not exist.

---

## 9. Interview Questions & Answers

#### Q1: How would you prevent a user from modifying another project's task?
> **Answer:** Always query by both `_id: taskId` AND `project: projectId`, where `projectId` has been validated by `requireProjectMember` middleware.

#### Q2: What is the advantage of using a Service layer in Express?
> **Answer:** Decouples business logic from HTTP transport concerns (req/res), makes code reusable across controllers, and allows isolated unit testing.

#### Q3: How do you handle sequential issue numbers per project (e.g. #1, #2)?
> **Answer:** Calculate the count of documents within the project scope (`countDocuments({ project: projectId }) + 1`) or use an atomic counter collection.

#### Q4: Why should the `reporter` field never be accepted directly from the client body?
> **Answer:** Accepting `reporter` from the client allows malicious users to impersonate others. It must always be derived securely from `req.user._id`.

#### Q5: How do you handle rollback after a failed optimistic UI update?
> **Answer:** Maintain previous state snapshot in React component/context. In the `catch` block of the API call, reset the state to the snapshot and display an error alert.

---

*Colabz Backend Engineering — Real-time Work Tracking & Robust Collaboration.*
