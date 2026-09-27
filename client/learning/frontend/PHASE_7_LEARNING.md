# Phase 7 — Tasks & Issues Workspace: Complete Frontend Guide

Welcome to the **Phase 7 Learning Guide** for Colabz / CodeTogether!

In this phase, we built a developer-focused **Tasks & Issues Workspace** ("Plan It. Track It. Ship It.") — featuring Kanban board and list views, status and priority tracking, label systems, local search/filtering/sorting, task/issue detail views, comments threads, and accessible modal forms for full CRUD operations.

---

## Table of Contents

1. [What We Built](#1-what-we-built)
2. [Core React Concepts](#2-core-react-concepts)
3. [CRUD Operations in Frontend Workspaces](#3-crud-operations-in-frontend-workspaces)
4. [Search and Multi-Filter Logic](#4-search-and-multi-filter-logic)
5. [Task Sorting Architecture](#5-task-sorting-architecture)
6. [Modal Architecture & Form Validation](#6-modal-architecture--form-validation)
7. [Dynamic Routing for Tasks & Issues](#7-dynamic-routing-for-tasks--issues)
8. [Context API (TaskContext & IssueContext)](#8-context-api-taskcontext--issuecontext)
9. [Mock Services Pattern](#9-mock-services-pattern)
10. [Board View vs List View Architecture](#10-board-view-vs-list-view-architecture)
11. [Local State vs Backend Persistence](#11-local-state-vs-backend-persistence)
12. [Forms & Controlled Input Validation](#12-forms--controlled-input-validation)
13. [Reusable Component Architecture](#13-reusable-component-architecture)
14. [Responsive Layout & Mobile Adaptation](#14-responsive-layout--mobile-adaptation)
15. [Accessibility (a11y) & Focus Trapping](#15-accessibility-a11y--focus-trapping)
16. [Common Debugging Scenarios](#16-common-debugging-scenarios)
17. [Interview & Viva Questions](#17-interview--viva-questions)
18. [Practical Exercises](#18-practical-exercises)

---

## 1. What We Built

Inside every project shell, Phase 7 activates:
- **Tasks Workspace (`/app/projects/:projectId/tasks`)**:
  - Dual View modes: **List View** (structured tabular layout) and **Board View** (4 Kanban columns: `TODO`, `IN PROGRESS`, `IN REVIEW`, `DONE`).
  - Task cards with identifiers (`COL-1`, `COL-24`), titles, descriptions, priorities, labels, due dates, assignees.
  - Search, Multi-criteria filter (Status, Priority, Assignee), and Sort menu (`Recently Updated`, `Priority`, `Due Date`, `Created Date`).
  - Task Detail view (`/tasks/:taskId`), Edit Modal, and Delete Modal with confirmation dialog.

- **Issues Workspace (`/app/projects/:projectId/issues`)**:
  - Issue list with status badges (`Open`, `Closed`), issue numbers (`#24`), author info, priority badges, labels, and comment counters.
  - Sub-tab switcher (`Open` vs `Closed` issues).
  - Issue Detail view (`/issues/:issueId`) with status toggle (`Close Issue` / `Reopen Issue`), activity log, and interactive comments thread (`IssueComments.jsx`).

---

## 2. Core React Concepts

### Components & Props
Components break UI into independent, reusable pieces. Props pass read-only data from parent components down to child components.

```jsx
// TaskCard receives a task prop
<TaskCard task={taskData} />
```

### State & Derived State
- **State (`useState`)**: Data that changes over time and triggers re-renders when updated.
- **Derived State**: Data computed on-the-fly during rendering from state/props, without storing it in extra state variables.

```jsx
// Derived State Example in Tasks.jsx:
// filteredTasks is derived during render from tasks + searchQuery + filters
const filteredTasks = tasks.filter(t => t.status === filters.status);
```

### Controlled Inputs
Controlled inputs bind an `<input>` element's value to React state via `value` and `onChange`.

```jsx
const [title, setTitle] = useState('');

<input
  type="text"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>
```

---

## 3. CRUD Operations in Frontend Workspaces

CRUD represents the 4 basic persistent data functions:

| Operation | Action | React / Service Implementation |
| :--- | :--- | :--- |
| **Create** | Adding a new task/issue | `createTask(taskData)` → Appends to `localTasksStore` array |
| **Read** | Displaying task lists & details | `getTasks(projectId)`, `getTaskById(projectId, id)` |
| **Update** | Editing task title, status, or assignee | `updateTask(taskId, updates)` → Immutably replaces target object |
| **Delete** | Removing a task/issue | `deleteTask(taskId)` → Filters out target ID from array |

---

## 4. Search and Multi-Filter Logic

Multi-filtering applies multiple condition predicates sequentially using JavaScript's `.filter()`:

```javascript
const filtered = tasks.filter((t) => {
  // 1. Status Filter
  if (filters.status && t.status !== filters.status) return false;

  // 2. Priority Filter
  if (filters.priority && t.priority !== filters.priority) return false;

  // 3. Search Query Filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    const matchTitle = t.title.toLowerCase().includes(q);
    const matchId = t.identifier.toLowerCase().includes(q);
    if (!matchTitle && !matchId) return false;
  }

  return true;
});
```

---

## 5. Task Sorting Architecture

Task arrays are sorted using JavaScript's `.sort()` method with custom comparator functions:

```javascript
const sorted = [...filteredTasks].sort((a, b) => {
  if (sortOption === 'priority') {
    const weight = { urgent: 4, high: 3, medium: 2, low: 1 };
    return weight[b.priority.toLowerCase()] - weight[a.priority.toLowerCase()];
  }
  if (sortOption === 'dueDate') {
    return (a.dueDate || '').localeCompare(b.dueDate || '');
  }
  return (b.updatedAt || '').localeCompare(a.updatedAt || '');
});
```

---

## 6. Modal Architecture & Form Validation

Accessible custom modals (`CreateTaskModal`, `EditTaskModal`, `DeleteTaskModal`) use React Portals or backdrop overlays.

### Validation Rules:
- Title must be non-empty (`title.trim() !== ''`).
- Status and Priority must have valid fallback values.
- Error messages render inline without blocking browser popups or native `window.alert()` / `window.confirm()`.

```jsx
const handleSubmit = (e) => {
  e.preventDefault();
  if (!title.trim()) {
    setErrorMsg('Task title is required.');
    return;
  }
  // Proceed with creation...
};
```

---

## 7. Dynamic Routing for Tasks & Issues

React Router handles task and issue parameter matching using `:taskId` and `:issueId`.

```jsx
<Route path="tasks" element={<Tasks />} />
<Route path="tasks/:taskId" element={<TaskDetail />} />
<Route path="issues" element={<Issues />} />
<Route path="issues/:issueId" element={<IssueDetail />} />
```

Inside `TaskDetail.jsx`:
```jsx
const { projectId, taskId } = useParams();
// Resolves: projectId = "proj_1", taskId = "task_1" or "COL-24"
```

---

## 8. Context API (TaskContext & IssueContext)

Context provides global state access to child components without prop-drilling down multiple tree levels.

```jsx
const TaskContext = createContext(null);

export function TaskProvider({ projectId, children }) {
  const [tasks, setTasks] = useState([]);
  // Shared state and actions...
  return (
    <TaskContext.Provider value={{ tasks, createTask, updateTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => useContext(TaskContext);
```

---

## 9. Mock Services Pattern

`mockTaskService.js` and `mockIssueService.js` abstract data access methods behind async functions:

```javascript
export const mockTaskService = {
  async getTasks(projectId) {
    return localTasksStore.filter(t => t.projectId === projectId);
  },
  async createTask(projectId, taskData) { ... }
};
```

This ensures UI components (`Tasks.jsx`, `TaskCard.jsx`) call `mockTaskService.getTasks()` rather than directly manipulating raw array variables.

---

## 10. Board View vs List View Architecture

The same data array (`sortedTasks`) powers both visual presentations:
- **`TaskList`**: Renders rows inside a single grid table container.
- **`TaskBoard`**: Groups items into 4 column arrays (`TODO`, `IN PROGRESS`, `IN REVIEW`, `DONE`) and renders cards inside status columns.

```jsx
{viewMode === 'board' ? <TaskBoard tasks={sortedTasks} /> : <TaskList tasks={sortedTasks} />}
```

---

## 11. Local State vs Backend Persistence

| Feature | Current Frontend Phase | Future Backend Integration |
| :--- | :--- | :--- |
| **Data Source** | `mockTasks.js` array | MongoDB `tasks` collection |
| **Service Layer** | `mockTaskService.js` | Express REST API (`axios.get('/api/tasks')`) |
| **State Scope** | React memory / session state | Database persistence across users |

---

## 12. Forms & Controlled Input Validation

1. Always set `required` or validate in `handleSubmit`.
2. Clear error state when user modifies invalid input.
3. Provide visual focus rings and clear error alerts.

---

## 13. Reusable Component Architecture

Component modularity prevents code duplication:
- **`TaskCard`**: Reused across Board view columns and search result lists.
- **`TaskPriorityBadge` & `TaskStatusBadge`**: Reused across List rows, Board headers, Task Details, and Issue lists.
- **`IssueListItem`**: Reused across Open and Closed issue tabs.

---

## 14. Responsive Layout & Mobile Adaptation

- **Board View**: Horizontally scrollable container on mobile (`overflowX: 'auto'`) with touch scroll support.
- **Task List**: Grid columns collapse gracefully on small viewports.
- **Task Detail**: Metadata grid wraps cleanly (`repeat(auto-fit, minmax(180px, 1fr))`).

---

## 15. Accessibility (a11y) & Focus Trapping

1. **Dialog Accessibility**: Modals close on `Escape` keypress and feature `aria-modal="true"`.
2. **Interactive Elements**: Custom buttons have distinct visible focus states (`:focus-visible`).
3. **Contrast Ratios**: Status and priority badges satisfy WCAG AAA/AA contrast standards.

---

## 16. Common Debugging Scenarios

1. **Task Detail Not Found**: Check if `useParams()` key matches `:taskId` or `:identifier`.
2. **State Rerender Glitches**: Ensure array updates use immutable patterns (`[...oldArray, newItem]`) rather than `.push()`.
3. **Modal Form State Bleed**: Reset form inputs when modal opens or closes.

---

## 17. Interview & Viva Questions

### Q1: What is CRUD?
**Answer**: CRUD stands for Create, Read, Update, Delete — the four basic functions of persistent data storage and manipulation.

### Q2: Why use Context API for Tasks and Issues?
**Answer**: To centralize task/issue state and CRUD actions so pages, filters, modals, and header badges access consistent data without prop-drilling.

### Q3: What is derived state?
**Answer**: Derived state is any value calculated on-the-fly during rendering from existing props or state (e.g., filtering `tasks` by `searchQuery` during render).

### Q4: How does multi-filtering work in JavaScript?
**Answer**: By chaining logical AND conditions inside `.filter()`, ensuring an item must satisfy all active filter criteria to remain in the result set.

### Q5: What are controlled inputs in React?
**Answer**: Form elements whose values are controlled by React state via `value` props and `onChange` event handlers.

### Q6: What is a dynamic route parameter?
**Answer**: A route token prefixed with a colon (e.g. `:taskId`) that acts as a placeholder for variable values in the URL path, accessible via `useParams()`.

### Q7: Why separate mock services from UI components?
**Answer**: To decouple data retrieval logic from rendering logic. Later, replacing mock services with real API calls requires zero changes to UI components.

### Q8: What is the difference between frontend local state and backend persistence?
**Answer**: Local state exists in browser memory during the session, whereas backend persistence saves data into a database like MongoDB across devices and sessions.

### Q9: How will this connect to Express later?
**Answer**: Service functions like `getTasks()` will send HTTP requests (`fetch('/api/projects/:id/tasks')`) to Express route handlers.

### Q10: How would MongoDB store tasks and issues?
**Answer**: As documents inside `tasks` and `issues` collections, referencing projects via ObjectId (`projectId: ObjectId(...)`).

---

## 18. Practical Exercises

1. **Task Drag-and-Drop**: Add HTML5 drag-and-drop support to `TaskBoard` columns to change status by dragging task cards.
2. **Due Date Warning**: Add a red "Overdue" badge to task cards when `dueDate` is before today's date.
3. **Issue Reaction Counter**: Add simple thumbs-up / heart emoji reaction buttons to comments in `IssueComments.jsx`.
