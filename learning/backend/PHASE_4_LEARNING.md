# Colabz Backend Engineering — Phase 4 Learning Guide

## Members, Invitations & Role-Based Access Control (RBAC)

Welcome to Phase 4 of Colabz backend engineering. In this phase, we transformed Colabz from an isolated single-user project repository into a collaborative workspace with real multi-tenant project membership, cryptographic invitation flows, and strict backend authorization.

---

## 1. Relationships in MongoDB

In document databases like MongoDB, relationships between different domain entities can be modeled in two ways:
1. **Embedding**: Storing nested documents directly inside the parent document.
2. **Referencing**: Storing IDs (like `ObjectId`) linking separate documents across distinct collections.

### The Colabz Relationship Model:
```text
┌─────────────────┐             ┌─────────────────────┐             ┌─────────────────┐
│      User       │ 1         * │  ProjectMembership  │ *         1 │     Project     │
│─────────────────│─────────────│─────────────────────│─────────────│─────────────────│
│ _id             │             │ _id                 │             │ _id             │
│ name            │             │ project (ObjectId)  │             │ name            │
│ email           │             │ user (ObjectId)     │             │ slug            │
│ password        │             │ role (String)       │             │ owner (ObjectId)│
│ avatar          │             │ status (String)     │             │ description     │
└─────────────────┘             │ joinedAt (Date)     │             └─────────────────┘
                                └─────────────────────┘
```

---

## 2. Many-to-Many Relationships

### Why One-to-Many is Insufficient:
- **One User can belong to Many Projects.**
- **One Project can contain Many Users.**

If we embedded an array of users inside the `Project` document:
- The document could grow unboundedly (exceeding MongoDB's 16MB document limit in large teams).
- Metadata specific to the *membership relationship* (such as individual join dates, custom project permissions, role changes, notification settings) would clutter the project document.
- Querying "all projects a user belongs to" would require full collection table scans unless multi-key indexes are maintained.

### The Solution: A Dedicated Membership Junction Collection (`ProjectMembership`)
`ProjectMembership` acts as a junction model (pivot document) containing:
- Reference to `project`
- Reference to `user`
- Relationship-specific properties (`role`, `status`, `joinedAt`, `invitedBy`)

This makes queries on either axis blazing fast:
- **Find all members of project X**: `ProjectMembership.find({ project: projectId, status: 'ACTIVE' })`
- **Find all projects for user Y**: `ProjectMembership.find({ user: userId, status: 'ACTIVE' })`

---

## 3. Role-Based Access Control (RBAC)

RBAC is an authorization mechanism where access rights are grouped into **Roles**, and users are assigned to roles rather than granting ad-hoc permissions to individual accounts.

### The Colabz Permission Matrix

| Capability / Action | OWNER | ADMIN | DEVELOPER | DESIGNER | VIEWER |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **View Project Workspace** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Invite Members** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Remove Normal Members** | ✅ | ✅ (Dev/Des/View) | ❌ | ❌ | ❌ |
| **Remove Admin / Owner** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Change Member Roles** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Edit Project Settings** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Delete Project** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Leave Project** | ❌ (Must transfer/del) | ✅ | ✅ | ✅ | ✅ |

---

## 4. Authentication vs. Authorization

Understanding the difference is critical for system security:

### Authentication (AuthN) — "Who are you?"
- Verifies user identity (e.g., verifying email and bcrypt password hash, issuing and validating JWT tokens).
- Handled by `authMiddleware.js` (`protect`).
- Failure returns **HTTP 401 Unauthorized** (e.g. invalid or expired JWT token).

### Authorization (AuthZ) — "What are you allowed to do?"
- Verifies whether the authenticated user has permission to perform a specific action on a specific resource.
- Handled by `requireProjectMember` and `requireProjectRole(...)`.
- Failure returns **HTTP 403 Forbidden** (e.g. Developer trying to invite a member or remove an admin).

---

## 5. Middleware Pipeline Architecture

Requests flow through a deterministic layered pipeline:

```text
HTTP Request
     │
     ▼
[ 1. protect ]                  ──> Verifies JWT token, populates req.user
     │
     ▼
[ 2. requireProjectMember ]      ──> Verifies active membership in project, populates req.project & req.membership
     │
     ▼
[ 3. requireProjectRole("ADMIN") ] ─> Verifies role level (OWNER/ADMIN)
     │
     ▼
[ 4. Controller Handler ]        ──> Executes business logic and persists state to MongoDB
     │
     ▼
HTTP Response (JSON)
```

---

## 6. Invitation Lifecycle

```text
                    ┌─────────────────────────┐
                    │      Owner/Admin        │
                    │    Sends Invitation     │
                    └────────────┬────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │   Status: PENDING     │
                     │  (Expires in 7 days)  │
                     └───────────┬───────────┘
                                 │
       ┌─────────────────────────┼─────────────────────────┐
       │                         │                         │
       ▼                         ▼                         ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│ User Accepts │          │ User Declines│          │ 7 Days Pass  │
└──────┬───────┘          └──────┬───────┘          └──────┬───────┘
       │                         │                         │
       ▼                         ▼                         ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│   ACCEPTED   │          │   DECLINED   │          │   EXPIRED    │
│  Membership  │          │(No Membership│          │(No Membership│
│   Created    │          │   Created)   │          │   Created)   │
└──────────────┘          └──────────────┘          └──────────────┘
```

---

## 7. Database Constraints & Compound Unique Indexes

To prevent race conditions and duplicate entries, MongoDB enforces database-level uniqueness constraints:

```javascript
// Compound Unique Index on ProjectMembership
projectMembershipSchema.index({ project: 1, user: 1 }, { unique: true });
```

### Why Database Constraints are Mandatory:
- If two identical invite acceptance requests are fired simultaneously in parallel tabs, application-level `findOne()` checks can both return `null` before either write completes.
- The compound unique index guarantees that MongoDB will atomically reject the second write with error code `11000` (Duplicate Key), protecting data integrity.

---

## 8. Transactions in MongoDB

When an invitation is accepted:
1. `ProjectMembership` must be created or activated.
2. `Project.members` array must be updated.
3. `ProjectInvitation` status must change to `ACCEPTED`.

If step 1 succeeds but step 3 fails, the system enters an inconsistent state. Using MongoDB multi-document ACID transactions (`session.startTransaction()`) ensures that either **all** changes commit together or **none** do.

---

## 9. Practice Exercises

### 1. Explain One-to-Many vs. Many-to-Many Relationships
- **One-to-Many**: One parent entity owns multiple children (e.g., One User owns Many Personal Access Tokens).
- **Many-to-Many**: Entities on both sides can relate to multiple entities on the other (e.g., Users and Projects). Resolved via a junction document (`ProjectMembership`).

### 2. Why is `ProjectMembership` a separate collection?
- Keeps document sizes bounded, enables high-cardinality indexing, and cleanly isolates membership metadata (role, status, joined date, invitedBy) from project configuration.

### 3. What is Role-Based Access Control (RBAC)?
- A security paradigm where access permissions are assigned to named roles, and users are assigned to those roles.

### 4. What is the difference between HTTP 401 and HTTP 403?
- **401 Unauthorized**: User is unauthenticated (missing, invalid, or expired credentials).
- **403 Forbidden**: User is authenticated, but lacks sufficient permissions for the requested resource.

### 5. How do you create a role-checking middleware in Express?
```javascript
const requireProjectRole = (...allowedRoles) => (req, res, next) => {
  const role = req.membership?.role?.toUpperCase();
  if (role === "OWNER" || allowedRoles.includes(role)) return next();
  return res.status(403).json({ success: false, message: "Forbidden" });
};
```

### 6. Why can't the frontend enforce authorization?
- Anyone can open Developer Tools, craft custom curl requests, modify client-side JavaScript state, or bypass UI disabled states. Backend authorization is the only real line of defense.

### 7. What is a compound unique index?
- An index composed of multiple fields (e.g. `{ project: 1, user: 1 }`) where the combination of values must be unique across the collection.

### 8. Explain the lifecycle of an invitation.
- Created as `PENDING` with a cryptographically secure token and 7-day expiration. Transitions to `ACCEPTED` (creates membership), `DECLINED`, `EXPIRED`, or `CANCELLED`.

### 9. When should you use MongoDB transactions?
- When multiple write operations across different collections must be atomic (e.g. invitation acceptance + membership creation + notification dispatch).

### 10. How would you design permissions for a new `TESTER` role?
- Define `TESTER` in `validRoles`. Grant permissions: read repository, create/comment on issues, trigger test runs; deny permission: delete project, manage members, modify workspace settings.

---

## 10. Interview Questions & Answers

#### Q1: What is RBAC and why is it preferred over discretionary access control?
> **Answer:** RBAC (Role-Based Access Control) assigns permissions to roles rather than individuals. It is easier to audit, scales cleanly across organizations, minimizes permission creep, and simplifies role changes when team members join or switch departments.

#### Q2: What is the difference between Authentication and Authorization?
> **Answer:** Authentication verifies *identity* ("who you are" via JWT, passwords). Authorization verifies *privileges* ("what you are allowed to access" via RBAC middleware).

#### Q3: Why should project membership not be stored solely as an array of user IDs on the Project model?
> **Answer:** Storing only IDs prevents storing membership attributes (role, join date, status, inviter), causes document growth issues, makes two-way querying slower, and risks concurrency conflicts when multiple members are modified concurrently.

#### Q4: What is a Compound Unique Index in MongoDB?
> **Answer:** An index that spans two or more fields where the combination of all indexed keys must be unique across all documents in the collection, preventing duplicates at the database engine level.

#### Q5: How do you handle invitation tokens securely?
> **Answer:** Generate high-entropy cryptographic random bytes (e.g., `crypto.randomBytes(24).toString('hex')`), set strict expiration timestamps, and optionally store only one-way hashes in the database.

---

*Colabz Backend Engineering — Built for robust, production-grade real-time collaboration.*
