# Colabz — Phase 3 Projects & Repositories Learning Guide

Welcome to the **Phase 3 Learning Guide** for Colabz! This guide explains how real project and repository data is designed, persisted in MongoDB, protected via backend ownership authorization, and served through clean RESTful controllers.

---

## 1. MongoDB Relationships & Data Modeling

### The User ➔ Project Relationship
In modern applications, entities rarely exist in isolation. A **Project** in Colabz belongs to an **Owner** (a User) and can include **Members** (Users).

```text
[ User Document ]                  [ Project Document ]
_id: ObjectId("66f4c1...") ◄────── owner: ObjectId("66f4c1...")
name: "Praveen Tiwari"             name: "Campus Connect"
email: "praveen@colabz.io"         slug: "campus-connect"
                                   members: [ ObjectId("66f4c1..."), ... ]
```

### ObjectId References (`ref`)
Instead of embedding full user profiles inside every project (which would make profile updates like changing a name difficult to synchronize), Mongoose stores lightweight **12-byte ObjectIds**:
```javascript
owner: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
  index: true,
}
```

### Mongoose `populate()`
When retrieving projects, Mongoose replaces the stored ObjectId with the actual referenced document:
```javascript
const project = await Project.findById(projectId)
  .populate("owner", "name email avatar avatarColor")
  .populate("members", "name email avatar avatarColor isOnline");
```

---

## 2. REST API Design & CRUD in Colabz

**CRUD** stands for **Create, Read, Update, Delete** — the four core operations of persistent storage.

| CRUD Operation | HTTP Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Create** | `POST` | `/api/projects` | Creates a new workspace project with the authenticated user as owner. |
| **Read (List)** | `GET` | `/api/projects` | Lists all projects owned by or shared with the authenticated user. |
| **Read (Detail)**| `GET` | `/api/projects/:projectId` | Retrieves metadata and details for a single project by ID or slug. |
| **Update** | `PATCH` | `/api/projects/:projectId` | Modifies specific project properties (e.g., description, status, tech stack). |
| **Delete** | `DELETE` | `/api/projects/:projectId` | Permanently deletes a project from MongoDB (owner only). |

### Why `PATCH` Instead of `PUT`?
* **`PUT`** replaces the **entire document**. Any omitted field is overwritten with null/defaults.
* **`PATCH`** applies **partial updates**, modifying only the fields explicitly provided in the request body (e.g. updating just the description while keeping the rest untouched).

---

## 3. Controller Architecture & Separation of Concerns

Putting routing, validation, database queries, and error handling into a single file results in "spaghetti code" that is difficult to test and maintain.

```text
HTTP Request (PATCH /api/projects/66f4c1...)
  │
  ▼
[1] Route Layer (`routes/projectRoutes.js`)
    • Matches HTTP Method & Path
    • Attaches middleware: protect, validate(updateProjectValidator)
  │
  ▼
[2] Controller Layer (`controllers/projectController.js`)
    • Orchestrates business logic & authorization
    • Extracts req.user._id (from JWT)
    • Validates project ownership
  │
  ▼
[3] Model Layer (`models/Project.js`)
    • Enforces schema types, defaults, and validations
    • Executes MongoDB queries: findOne, save, deleteOne
  │
  ▼
[4] Database Layer (MongoDB)
    • Persists BSON documents and updates B-tree indexes
```

---

## 4. Authentication vs. Authorization

* **Authentication (Who are you?)**: Verified by `authMiddleware` via JWT Bearer token (`req.user`).
* **Authorization (What are you allowed to do?)**: Enforced inside the controller by verifying whether the authenticated user owns or has permission for the specific resource:

```javascript
// Authorization check in projectController.js
if (project.owner.toString() !== req.user._id.toString()) {
  return sendError(res, "Only the project owner can update project settings", 403);
}
```

### Why Frontend Route Protection Alone is Insufficient:
Frontend guards (`<ProtectedRoute>`) only manage UI navigation. Anyone can send direct HTTP requests using Postman, curl, or browser developer tools. **The backend is the only true security boundary.**

---

## 5. MongoDB Indexes

An **Index** is a specialized data structure (typically a B-tree) that stores values of specific fields in sorted order, pointing to document locations on disk.

```text
Without Index: Full Collection Scan (O(N)) -> Checks 1,000,000 documents
With Index:    B-Tree Index Seek (O(log N)) -> Locates document in 3-4 operations
```

### When to Create an Index:
* Fields frequently used in query filters (`owner`, `members`, `slug`).
* Fields with uniqueness constraints (`email`, `slug`).
* Fields frequently used in sorting (`updatedAt: -1`).

### Why Too Many Indexes are Detrimental:
Every `insert`, `update`, and `delete` operation must update every existing index on that collection. Excessive indexes slow down write operations and consume server RAM.

---

## 6. URL-Friendly Slugs

### What is a Slug?
A slug is a URL-safe version of a title or name composed exclusively of lowercase alphanumeric characters and hyphens.

* **Readable Name**: `Campus Connect`
* **URL Slug**: `campus-connect`
* **Clean URL**: `https://colabz.dev/app/projects/campus-connect/repository`

### Collision Handling:
If two users create projects named "Campus Connect", slugs must remain distinct:
1. First project: `campus-connect`
2. Second project: `campus-connect-1`
3. Third project: `campus-connect-2`

---

## 7. Hands-on Learning Exercises

1. **Create a project via Postman or curl**:
   * Send `POST /api/projects` with `Authorization: Bearer <your_token>` and JSON body `{ "name": "My Learning Project" }`.
2. **Explain CRUD in your own words**:
   * Write down the 4 HTTP methods corresponding to CRUD and provide one practical example for each.
3. **Write a standalone GET route from scratch**:
   * Write a 10-line Express route that retrieves all projects for a given user ID.
4. **Explain ObjectId**:
   * Explain what the 24 hex characters of an ObjectId represent.
5. **Explain Project Ownership**:
   * Why must `owner` come from `req.user._id` instead of `req.body.owner`?
6. **Explain HTTP 401 vs 403**:
   * Provide a real scenario for when Colabz returns 401 and when it returns 403.
7. **Explain Frontend vs Backend Authorization**:
   * Why can an attacker not delete someone else's project simply by modifying client JavaScript?
8. **Inspect MongoDB project documents**:
   * Run a Mongo query (`db.projects.find()`) and verify that `owner` stores an `ObjectId`.
9. **Add a project field**:
   * Add a `websiteUrl` field to `models/Project.js` with URL validation.
10. **Trace the request lifecycle**:
    * Trace a `PATCH /api/projects/:id` request from the frontend button click all the way to the MongoDB disk write.

---

## 8. Technical Interview Questions & Answers

### Q1: What is CRUD?
**Answer**: CRUD stands for Create, Read, Update, and Delete — the four fundamental operations performed on persistent database storage.

### Q2: What is a REST API?
**Answer**: A REST (Representational State Transfer) API is an architectural style for network applications that uses standard HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`), stateless client-server communication, and uniform resource URIs.

### Q3: What is a MongoDB ObjectId?
**Answer**: A unique 12-byte binary identifier generated by MongoDB as `_id`, encoding a 4-byte timestamp, 5-byte random machine/process value, and a 3-byte incrementing counter.

### Q4: How do you reference another document in Mongoose?
**Answer**: By defining the schema field with `type: mongoose.Schema.Types.ObjectId` and setting `ref: '<ModelName>'`.

### Q5: What does Mongoose `populate()` do?
**Answer**: `populate()` automatically executes an internal query to replace stored ObjectIds with the actual documents from referenced collections.

### Q6: What is authorization?
**Answer**: Authorization is the process of checking whether an authenticated user possesses the permissions required to perform an action on a specific resource.

### Q7: What is the difference between Authentication and Authorization?
**Answer**: Authentication verifies identity (*who you are*), while authorization validates permissions (*what you are allowed to do*).

### Q8: Why use PATCH instead of PUT?
**Answer**: `PATCH` applies partial modifications to specific fields without affecting the rest of the document, whereas `PUT` replaces the entire document entity.

### Q9: What is HTTP 403 Forbidden?
**Answer**: An HTTP status code indicating that the server understands the authenticated user's identity, but refuses to authorize access to the requested resource.

### Q10: What is HTTP 404 Not Found?
**Answer**: An HTTP status code indicating that the server cannot locate the requested resource endpoint or database record.

### Q11: How do you protect a resource owned by a user?
**Answer**: Verify inside the route controller that the document's `owner` field matches the authenticated user's ID (`req.user._id`) extracted from the validated JWT.

### Q12: Why must ownership always be determined from the JWT?
**Answer**: The JWT is cryptographically signed by the server and cannot be tampered with by the client, preventing attackers from spoofing another user's ID.

### Q13: What is a MongoDB index?
**Answer**: An index is a sorted data structure (B-tree) that allows the database engine to quickly find documents without scanning every record in the collection.

### Q14: Why shouldn't every field in a schema be indexed?
**Answer**: Indexes require memory and add write overhead to every insert, update, and delete operation. Only frequently queried or sorted fields should be indexed.

### Q15: What is a slug in web development?
**Answer**: A slug is a human-readable, URL-friendly string derived from a title or name, using lowercase alphanumeric characters and hyphens.

### Q16: Why use controllers in Express?
**Answer**: Controllers separate business logic from route definitions, improving code organization, testability, reusability, and readability.

### Q17: What is Separation of Concerns (SoC)?
**Answer**: A software design principle where a program is divided into distinct sections, each addressing a separate concern (e.g., Routing, Validation, Business Logic, Data Persistence).

---
*Phase 3 Complete — Prepared for Phase 4: Members + Invitations + Role-Based Access Control.*
