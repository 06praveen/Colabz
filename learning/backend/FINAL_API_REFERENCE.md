# Colabz — Final Comprehensive API Reference

This document provides the exhaustive specification for all REST API endpoints and Socket.IO real-time events across all 10 phases of the Colabz platform.

---

## 1. Authentication APIs (`/api/auth`)

### 1.1 Register User
- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Auth**: Public (Rate limited: 20 req / 5 min)
- **Request Body**:
  ```json
  {
    "name": "Ronak Kumar",
    "email": "ronak@example.com",
    "password": "password123",
    "avatar": "https://avatar.url/me.png"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "60d0fe4f5311236168a109ca",
        "name": "Ronak Kumar",
        "email": "ronak@example.com",
        "avatarColor": "#00e5a3"
      },
      "token": "eyJhbGciOiJIUzI1NiIsIn..."
    }
  }
  ```

### 1.2 Login User
- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Auth**: Public (Rate limited: 20 req / 5 min)
- **Request Body**:
  ```json
  {
    "email": "ronak@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": { "id": "...", "name": "...", "email": "..." },
      "token": "..."
    }
  }
  ```

### 1.3 Get Current User Session
- **Method**: `GET`
- **Endpoint**: `/api/auth/me`
- **Auth**: `Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "60d0fe4f5311236168a109ca",
        "name": "Ronak Kumar",
        "email": "ronak@example.com",
        "avatar": "",
        "avatarColor": "#00e5a3"
      }
    }
  }
  ```

---

## 2. Projects & Workspace APIs (`/api/projects`)

### 2.1 Create Project
- **Method**: `POST`
- **Endpoint**: `/api/projects`
- **Auth**: `Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Campus Connect",
    "description": "Student networking web application",
    "language": "JavaScript",
    "technologies": ["React", "Node.js", "MongoDB"],
    "visibility": "private"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Project created successfully",
    "data": {
      "project": {
        "id": "60d0fe4f5311236168a109cb",
        "name": "Campus Connect",
        "slug": "campus-connect",
        "owner": "...",
        "defaultBranch": "main"
      }
    }
  }
  ```

### 2.2 List User Projects
- **Method**: `GET`
- **Endpoint**: `/api/projects`
- **Auth**: `Bearer <token>`
- **Query Params**: `page` (default: 1), `limit` (default: 20)

### 2.3 Get Project Details
- **Method**: `GET`
- **Endpoint**: `/api/projects/:projectId`
- **Auth**: `Bearer <token>` (Active project member required)

---

## 3. Members & Invitations (`/api/projects/:projectId/members` & `/api/invitations`)

### 3.1 List Project Members
- **Method**: `GET`
- **Endpoint**: `/api/projects/:projectId/members`
- **Auth**: `Bearer <token>` (Member)

### 3.2 Invite Member
- **Method**: `POST`
- **Endpoint**: `/api/projects/:projectId/invitations`
- **Auth**: `Bearer <token>` (Role: `OWNER`, `ADMIN`)
- **Request Body**:
  ```json
  {
    "email": "teammate@example.com",
    "role": "DEVELOPER"
  }
  ```

### 3.3 Accept Invitation
- **Method**: `POST`
- **Endpoint**: `/api/invitations/:invitationId/accept`
- **Auth**: `Bearer <token>`

---

## 4. Tasks & Issues (`/api/projects/:projectId/tasks` & `/api/projects/:projectId/issues`)

### 4.1 List & Create Tasks
- **Method**: `GET` | `POST`
- **Endpoint**: `/api/projects/:projectId/tasks`
- **Auth**: `Bearer <token>` (Member)
- **POST Body**:
  ```json
  {
    "title": "Design Database Schema",
    "description": "Create Mongoose models with compound indexes",
    "priority": "High",
    "assignee": "60d0fe4f5311236168a109cd"
  }
  ```

### 4.2 Update Task Status
- **Method**: `PATCH`
- **Endpoint**: `/api/projects/:projectId/tasks/:taskId`
- **Auth**: `Bearer <token>` (Role: `DEVELOPER`+)
- **Body**: `{ "status": "IN_PROGRESS" }`

### 4.3 Create Issue & Comment
- **Method**: `POST`
- **Endpoint**: `/api/projects/:projectId/issues`
- **Comment Endpoint**: `/api/projects/:projectId/issues/:issueId/comments`

---

## 5. Repository, Files, Branches & Commits

### 5.1 Repository File Tree
- **Method**: `GET`
- **Endpoint**: `/api/projects/:projectId/repository/tree?branchName=main`

### 5.2 Create / Update File
- **Method**: `POST` | `PATCH`
- **Endpoint**: `/api/projects/:projectId/repository/files`
- **Body**:
  ```json
  {
    "name": "server.js",
    "path": "src/server.js",
    "content": "const express = require('express');",
    "branchName": "main",
    "commitMessage": "Add Express entrypoint"
  }
  ```

### 5.3 Branches & Commits
- **List Branches**: `GET /api/projects/:projectId/branches`
- **Create Branch**: `POST /api/projects/:projectId/branches`
- **Commit History**: `GET /api/projects/:projectId/commits?branchName=main`

---

## 6. Real-Time Chat (`/api/projects/:projectId/conversations` & Socket.IO)

### 6.1 List / Create Conversation
- **List**: `GET /api/projects/:projectId/conversations`
- **Create Direct/Channel**: `POST /api/projects/:projectId/conversations`
  ```json
  { "type": "direct", "recipientId": "60d0fe4f5311236168a109cd" }
  ```

### 6.2 Messages
- **List Messages**: `GET /api/projects/:projectId/conversations/:conversationId/messages`
- **Send Message**: `POST /api/projects/:projectId/conversations/:conversationId/messages`
  ```json
  { "content": "Hello team!", "replyTo": null, "attachments": [] }
  ```

---

## 7. Notifications & Activity Feed (`/api/notifications` & `/api/projects/:projectId/activity`)

### 7.1 Notifications
- **List**: `GET /api/notifications`
- **Unread Count**: `GET /api/notifications/unread-count`
- **Mark Single Read**: `PATCH /api/notifications/:notificationId/read`
- **Mark All Read**: `PATCH /api/notifications/read-all`
- **Delete**: `DELETE /api/notifications/:notificationId`

### 7.2 Activity Feed
- **Timeline**: `GET /api/projects/:projectId/activity?page=1&limit=20`

---

## 8. Voice & Video Calling (`/api/projects/:projectId/calls`)

### 8.1 Start Call
- **Method**: `POST`
- **Endpoint**: `/api/projects/:projectId/calls`
- **Auth**: `Bearer <token>` (Member)
- **Request Body**:
  ```json
  {
    "receiverId": "60d0fe4f5311236168a109cd",
    "type": "VIDEO"
  }
  ```

### 8.2 Call History
- **Method**: `GET`
- **Endpoint**: `/api/projects/:projectId/calls`
- **Auth**: `Bearer <token>` (Member)

---

## 9. AI Assistant (`/api/ai`)

### 9.1 AI Coding Assistant Chat
- **Method**: `POST`
- **Endpoint**: `/api/ai/chat`
- **Auth**: `Bearer <token>` (Rate limited: 30 req / 1 min)
- **Request Body**:
  ```json
  {
    "prompt": "How do I optimize MongoDB query performance?",
    "actionType": "general",
    "projectId": "60d0fe4f5311236168a109cb",
    "codeSnippet": "User.find({ isOnline: true });",
    "history": []
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "AI response generated successfully",
    "data": {
      "reply": "To optimize this query:\n1. Add a single-field index on `{ isOnline: 1 }`...",
      "isFallback": false,
      "model": "gemini-3.8-flash",
      "actionType": "general"
    }
  }
  ```

### 9.2 AI Health / Configuration Status
- **Method**: `GET`
- **Endpoint**: `/api/ai/status`
- **Auth**: Public

---

## 10. System Health Endpoint

### 10.1 Health Check
- **Method**: `GET`
- **Endpoint**: `/api/health`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Colabz API is healthy and running",
    "data": {
      "status": "ok",
      "database": "connected",
      "environment": "development",
      "timestamp": "2026-10-03T18:20:26.041Z"
    }
  }
  ```
