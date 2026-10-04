# Colabz Phase 8 — API Documentation

---

## 1. Notification Endpoints

### 1.1 Get User Notifications
* **Method:** `GET`
* **URL:** `/api/notifications`
* **Authentication:** Required (`Authorization: Bearer <JWT>`)
* **Permission:** Authenticated User (retrieves notifications for current user only)
* **Query Parameters:**
  * `page` (optional, number, default: 1)
  * `limit` (optional, number, default: 30, max: 100)
  * `unreadOnly` (optional, boolean: `true` / `false`)
  * `projectId` (optional, ObjectId string)
  * `type` (optional, string, e.g. `TASK_ASSIGNED`, `ISSUE_COMMENTED`)
* **Request Body:** None
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "6ac141e1368e966662421a99",
        "type": "TASK_ASSIGNED",
        "title": "Praveen assigned you COL-1",
        "message": "Implement Notification System",
        "actorId": "6ac141e1368e966662421a81",
        "actor": {
          "id": "6ac141e1368e966662421a81",
          "name": "Praveen",
          "email": "praveen@example.com",
          "avatar": null
        },
        "recipientId": "6ac141e1368e966662421a82",
        "projectId": "6ac141e1368e966662421a86",
        "project": {
          "_id": "6ac141e1368e966662421a86",
          "name": "Colabz Workspace"
        },
        "entityType": "task",
        "entityId": "6ac141e1368e966662421a90",
        "isRead": false,
        "read": false,
        "readAt": null,
        "createdAt": "2026-10-03T17:56:49.123Z",
        "timeAgo": "Just now",
        "groupDate": "Today"
      }
    ],
    "page": 1,
    "limit": 30,
    "totalCount": 1,
    "hasMore": false
  }
}
```
* **Error Responses:**
  * `401 Unauthorized`: Missing or invalid JWT token.

---

### 1.2 Get Unread Notification Count
* **Method:** `GET`
* **URL:** `/api/notifications/unread-count`
* **Authentication:** Required (`Authorization: Bearer <JWT>`)
* **Permission:** Authenticated User
* **Query Parameters:** None
* **Request Body:** None
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "count": 3
  }
}
```
* **Error Responses:**
  * `401 Unauthorized`: Missing or invalid JWT token.

---

### 1.3 Mark Single Notification Read
* **Method:** `PATCH`
* **URL:** `/api/notifications/:notificationId/read`
* **Authentication:** Required (`Authorization: Bearer <JWT>`)
* **Permission:** Authenticated User (must be the notification recipient)
* **URL Parameters:**
  * `notificationId` (ObjectId string)
* **Request Body:** None
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "notification": {
      "id": "6ac141e1368e966662421a99",
      "isRead": true,
      "read": true,
      "readAt": "2026-10-03T17:57:00.000Z",
      "type": "TASK_ASSIGNED",
      "title": "Praveen assigned you COL-1"
    }
  },
  "message": "Notification marked as read"
}
```
* **Error Responses:**
  * `400 Bad Request`: Invalid notification ID.
  * `401 Unauthorized`: Not authenticated.
  * `404 Not Found`: Notification not found or not owned by user.

---

### 1.4 Mark All Notifications Read
* **Method:** `PATCH`
* **URL:** `/api/notifications/read-all`
* **Authentication:** Required (`Authorization: Bearer <JWT>`)
* **Permission:** Authenticated User
* **Query Parameters:**
  * `projectId` (optional, ObjectId string — mark read for a single project only)
* **Request Body:** None
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "updatedCount": 5
  },
  "message": "All notifications marked as read"
}
```
* **Error Responses:**
  * `401 Unauthorized`: Not authenticated.

---

### 1.5 Delete Notification
* **Method:** `DELETE`
* **URL:** `/api/notifications/:notificationId`
* **Authentication:** Required (`Authorization: Bearer <JWT>`)
* **Permission:** Authenticated User (must be the notification recipient)
* **URL Parameters:**
  * `notificationId` (ObjectId string)
* **Request Body:** None
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": null,
  "message": "Notification deleted successfully"
}
```
* **Error Responses:**
  * `400 Bad Request`: Invalid notification ID.
  * `401 Unauthorized`: Not authenticated.
  * `404 Not Found`: Notification not found.

---

### 1.6 Clear All Notifications
* **Method:** `DELETE`
* **URL:** `/api/notifications`
* **Authentication:** Required (`Authorization: Bearer <JWT>`)
* **Permission:** Authenticated User
* **Request Body:** None
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "deletedCount": 12
  },
  "message": "All notifications cleared successfully"
}
```

---

## 2. Activity Feed Endpoints

### 2.1 Get Project Activity Stream
* **Method:** `GET`
* **URL:** `/api/projects/:projectId/activity`
* **Authentication:** Required (`Authorization: Bearer <JWT>`)
* **Permission:** Active project member (`OWNER`, `ADMIN`, `DEVELOPER`, `DESIGNER`, `VIEWER`)
* **URL Parameters:**
  * `projectId` (ObjectId or Project Slug)
* **Query Parameters:**
  * `page` (optional, number, default: 1)
  * `limit` (optional, number, default: 30, max: 100)
  * `type` (optional, string, e.g. `COMMIT_CREATED`, `TASK_CREATED`, `ISSUE_CREATED`, `MEMBER_JOINED`)
* **Request Body:** None
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "6ac141e1368e966662421b01",
        "type": "COMMIT_CREATED",
        "title": "New commit created",
        "detail": "Praveen committed \"feat: add phase 8 notification pipeline\" to main",
        "message": "Praveen committed \"feat: add phase 8 notification pipeline\" to main",
        "actorId": "6ac141e1368e966662421a81",
        "actor": {
          "id": "6ac141e1368e966662421a81",
          "name": "Praveen",
          "email": "praveen@example.com",
          "avatar": null
        },
        "projectId": "6ac141e1368e966662421a86",
        "project": {
          "_id": "6ac141e1368e966662421a86",
          "name": "Colabz Workspace"
        },
        "entityType": "repository",
        "entityId": "6ac141e1368e966662421b00",
        "metadata": {
          "branch": "main",
          "hash": "7a8b9c0",
          "filesChanged": 1
        },
        "createdAt": "2026-10-03T17:56:50.000Z",
        "timeAgo": "Just now",
        "groupDate": "Today"
      }
    ],
    "page": 1,
    "limit": 30,
    "totalCount": 8,
    "hasMore": false
  }
}
```
* **Error Responses:**
  * `401 Unauthorized`: Not authenticated.
  * `403 Forbidden`: User is not an active member of this project.
  * `404 Not Found`: Project not found.

---

## 3. Real-Time Socket.IO Events

### Event: `notification:new`
* **Transport:** WebSocket / Polling
* **Channel / Room:** Private user room `user:<userId>`
* **Trigger:** Emitted immediately after a notification document is persisted to MongoDB.
* **Payload Structure:**
```json
{
  "id": "6ac141e1368e966662421a99",
  "_id": "6ac141e1368e966662421a99",
  "type": "TASK_ASSIGNED",
  "title": "Praveen assigned you COL-1",
  "message": "Implement Notification System",
  "actorId": "6ac141e1368e966662421a81",
  "actor": {
    "id": "6ac141e1368e966662421a81",
    "name": "Praveen",
    "email": "praveen@example.com",
    "avatar": null
  },
  "recipientId": "6ac141e1368e966662421a82",
  "projectId": "6ac141e1368e966662421a86",
  "project": {
    "_id": "6ac141e1368e966662421a86",
    "name": "Colabz Workspace"
  },
  "entityType": "task",
  "entityId": "6ac141e1368e966662421a90",
  "metadata": {},
  "isRead": false,
  "read": false,
  "readAt": null,
  "createdAt": "2026-10-03T17:56:49.123Z",
  "timeAgo": "Just now",
  "groupDate": "Today"
}
```
* **Client Usage (React / Socket.IO):**
```js
const socket = getSocket();

socket.on('notification:new', (newNotification) => {
  // Prepend to notifications list
  // Increment unread badge counter
  // Trigger toast banner
});
```
