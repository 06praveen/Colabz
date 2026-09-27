# Phase 9 — Chat & Messaging Workspace Learning Guide

Welcome to the comprehensive learning guide for **Phase 9: Chat & Messaging Workspace** of Colabz ("Talk. Build. Ship."). This document explains the architecture, design choices, React state patterns, data relationships, accessibility requirements, and interview/viva preparation for building a developer-focused collaboration chat system.

---

## 1. What We Built

In Phase 9, we built the **Chat & Messaging Workspace** module connected directly to Colabz projects, repositories, tasks, and issues. Key features include:

- **Developer Workspace Chat**: Not a generic social clone, but a work-centric chat environment connecting discussions with repository commits, task cards, and issue tickets.
- **Channels & Direct Messaging**: Support for project channels (`#general`, `#development`, `#design`, `#random`) and direct messages with team members.
- **Message List & Grouping**: Auto-scrolling message list with date separators (`Today`, `Yesterday`), consecutive sender message grouping, and inline references.
- **Interactive Message Features**: Hover action toolbar supporting reactions (`👍`, `❤️`, `😂`, `🚀`, `👀`), quoted message replies (`replyTo`), inline message editing (`(Edited)` badge), and message deletion.
- **Contextual References**: Automatic inline rendering of task cards (`COL-24`), issue tickets (`#24`), commit references (`commit 9f4a8b1`), and file attachments (`App.jsx`).
- **Rich Message Composer**: Multiline textarea with Enter to send and Shift + Enter for newline, emoji picker popover, `@` teammate mention autocomplete, attachment selector (`+`), and reply quote preview.
- **Collapsible Details Panel**: Right desktop/tablet drawer showing conversation members and shared project assets (files, tasks, issues, links).
- **Responsive Panels**: Desktop 3-column workspace, Tablet 2-column layout, and Mobile 1-column dynamic view with navigation headers (`← Conversations`).

---

## 2. React State Architecture

Chat state is partitioned into clean layers:

1. **Active Conversation State**: Tracks `activeConversationId` ("conv_dev").
2. **Messages State**: Array of message objects for the active conversation.
3. **Composer State**: Controlled input text (`content`), attached items (`selectedAttachments`), and reply target (`replyingToMessage`).
4. **UI Panel State**: Details panel toggle (`isDetailsOpen`) and Mobile view panel switcher (`activeMobileView`: `'sidebar'` | `'conversation'`).

---

## 3. Context API (`ChatContext`)

`ChatContext` centralizes state across the workspace:

```javascript
<RepositoryProvider projectId={activeId}>
  <TaskProvider projectId={activeId}>
    <IssueProvider projectId={activeId}>
      <MemberProvider projectId={activeId}>
        <ChatProvider projectId={activeId}>
          <Outlet context={{ project }} />
        </ChatProvider>
      </MemberProvider>
    </IssueProvider>
  </TaskProvider>
</RepositoryProvider>
```

### Context API Surface

```javascript
const {
  conversations,          // List of project channels and DMs
  channels,               // Filtered channel list
  directMessages,         // Filtered DM list
  activeConversation,     // Current active conversation object
  messages,               // Message history for current conversation
  loading,                // Async loading indicator
  sendMessage,            // Sends a new message with reply/attachments
  editMessage,            // Edits an existing message
  deleteMessage,          // Removes a message locally
  toggleReaction,         // Toggles an emoji reaction
  createConversation,     // Creates a new channel or DM
  selectConversation,     // Switches active conversation & clears unread
  replyingToMessage,      // Active message being replied to
  setReplyingToMessage,
  isDetailsOpen,          // Right details panel open/close state
  setIsDetailsOpen
} = useChat();
```

---

## 4. Message Modeling

Messages are modeled as plain JavaScript objects structured for backend synchronization:

```javascript
{
  id: "msg_102",
  conversationId: "conv_dev",
  senderId: "usr_2", // Rahul Sharma
  content: "Yes, that makes total sense! I implemented the session provider in task COL-2.",
  createdAt: "10:32 AM",
  dateSeparator: null,
  editedAt: null,
  replyTo: "msg_101",
  reactions: [{ emoji: "🚀", count: 1, users: ["usr_1"] }],
  attachments: [
    {
      type: "task",
      taskId: "task_2",
      identifier: "COL-2",
      title: "Implement authentication flow and session provider",
      status: "DONE",
      priority: "Urgent"
    }
  ]
}
```

---

## 5. Conversation Modeling

Conversations support channels, direct messages, and group chats:

```javascript
{
  id: "conv_dev",
  projectId: "proj_1",
  name: "development",
  type: "channel", // "channel" | "direct" | "group"
  description: "Technical implementation, architecture, and code reviews.",
  unreadCount: 2,
  lastMessage: "Authentication UI is ready. I've linked COL-24 to the task.",
  lastTime: "10:44 AM",
  memberIds: ["usr_1", "usr_2", "usr_3", "usr_4", "usr_5"]
}
```

---

## 6. CRUD Operations (Frontend Flow)

1. **Send Message**: `sendMessage({ content, replyTo, attachments })` validates non-empty content/attachments, appends the message object to `messagesStore`, updates conversation `lastMessage`, auto-scrolls to the bottom, and resets composer state.
2. **Edit Message**: `editMessage(messageId, newContent)` updates the target message content inline, sets `editedAt: 'Edited'`, and refreshes message state.
3. **Delete Message**: Triggering delete opens `DeleteMessageDialog`. Confirmation invokes `deleteMessage(messageId)` which removes the message from state and displays a Toast notification.

---

## 7. Message Searching

Message searching allows users to query messages across channels and direct conversations by keyword, task identifier (`COL-24`), or issue number (`#24`). Clicking a search result invokes `selectConversation(msg.conversationId)` and closes the search modal.

---

## 8. Conversation Filtering

Sidebar search filters channels and direct messages in real time using client-side string matching against conversation names and last message previews.

---

## 9. Controlled Inputs (`MessageComposer`)

`MessageComposer.jsx` uses a controlled `<textarea>` bound to local `content` state. It handles keydown events to detect `Enter` (submit) vs. `Shift + Enter` (newline), preventing empty message dispatch.

---

## 10. Keyboard Interactions

- **Enter**: Triggers `handleSend()` (sends message).
- **Shift + Enter**: Inserts a line break inside the message composer.
- **Escape**: Closes active popovers (Emoji picker, Mention autocomplete, Attachment menu) or modals (`CreateConversationModal`, `MessageSearchModal`).

---

## 11. Reaction System

Reactions are stored as an array of objects per message:

```javascript
reactions: [
  { emoji: "👍", count: 2, users: ["usr_1", "usr_2"] }
]
```

Clicking a reaction toggles the user's ID (`"usr_1"`). If the user has already reacted, their ID is removed and the count decreases; if the count reaches 0, the reaction pill is removed.

---

## 12. Quoted Replies (`replyTo`)

When a user clicks "Reply" on a message, `replyingToMessage` is set in context. A banner appears above the composer showing the quoted snippet. Submitting the message includes `replyTo: parentMessage.id`, which renders a styled parent quote snippet above the new message.

---

## 13. Mention Autocomplete (`@`)

Typing or clicking `@` opens a floating suggestion menu listing team members from `MemberContext`. Selecting a member inserts `@username` directly into the composer text.

---

## 14. Derived State

To keep mock data normalized, conversation previews (`lastMessage`, `lastTime`, `unreadCount`) are updated dynamically whenever new messages are dispatched or when `markAsRead(conversationId)` is triggered.

---

## 15. Reusing Existing Workspace Data

Rather than creating duplicate fake data, Phase 9 connects chat with existing modules:
- **Members**: Reuses `mockMembers` and `MemberStatus` from Phase 8.
- **Tasks**: Reuses `mockTasks` (`COL-1`, `COL-2`, `COL-24`) from Phase 7.
- **Issues**: Reuses `mockIssues` (`#24`, `#18`, `#12`) from Phase 7.
- **Repository**: Reuses repository commits (`9f4a8b1`) and files from Phase 6.

---

## 16. Responsive Layout Architecture

- **Desktop (≥ 1025px)**: Full 3-column layout (Sidebar | Main Chat & Composer | Details Panel).
- **Tablet (769px – 1024px)**: 2-column layout (Sidebar | Main Chat & Composer, with toggleable details drawer).
- **Mobile (≤ 768px)**: 1-column view with active panel switching (`activeMobileView`: `'sidebar'` or `'conversation'`). Mobile header includes a prominent `←` back button.

---

## 17. Frontend-to-Real-Time Architecture Roadmap

Current Phase 9 Architecture:
```text
React Component ──> ChatContext ──> mockChatService ──> mockMessages (local memory)
```

Future Real-Time Architecture:
```text
React Component ──> ChatContext ──> Socket.IO Client ──> Express / WebSockets Server ──> MongoDB
```

The component API surface (`sendMessage`, `editMessage`, `deleteMessage`, `toggleReaction`) remains unchanged when switching to real-time Socket.IO event emitters!

---

## 18. WebSockets vs. HTTP Polling

> [!NOTE]
> **Why Real-Time Chat Requires WebSockets / Socket.IO:**
> Standard HTTP requests operate on a request-response model: the client must initiate every request. For chat, HTTP polling requires sending repeated requests every few seconds, causing high latency and bandwidth overhead.
> WebSockets establish a single persistent, full-duplex TCP connection, allowing the server to push incoming messages instantly to all connected project members with sub-10ms latency.

---

## 19. Accessibility (a11y)

- **Input Labels**: Message composer textarea has an explicit `placeholder` and `aria-label`.
- **Keyboard Navigation**: Emoji buttons, attachment triggers, and reaction pills can be focused and triggered via keyboard (`Space`/`Enter`).
- **Focus Trap & Escape**: Modals trap focus and close gracefully when `Escape` is pressed.
- **Contrast & Text Scales**: All text tokens adhere to dark mode contrast guidelines.

---

## 20. Debugging & Common Gotchas

1. **Auto-Scroll Behavior**: Always execute `scrollRef.current.scrollTop = scrollRef.current.scrollHeight` inside a `useEffect` triggered by `[messages]`.
2. **Multiline Enter Key**: Always check `if (e.key === 'Enter' && !e.shiftKey)` to prevent accidental submission during multiline drafting.
3. **Empty Message Dispatch**: Always sanitize input using `.trim()` and verify attachment array length before adding messages.

---

## 21. Interview Questions & Answers

### Q1: How do you handle consecutive message grouping in React?
**Answer**: Compare the current message's `senderId` with the previous message in the array. If the sender is identical, no date separator exists, and it is not a direct reply, mark `isGrouped = true`. This hides the duplicate avatar and sender header, rendering a compact message block.

### Q2: How does event-driven real-time chat integrate into React Context?
**Answer**: The React Context mounts a WebSocket/Socket.IO event listener inside a `useEffect` hook (`socket.on('message:received', handler)`). When the server pushes an event, the handler appends the incoming message to the React `messages` state array, instantly updating the UI.

---

## 22. Viva Questions & Answers

### Q1: How does Colabz Chat differ from a generic chat app like Discord or WhatsApp?
**Answer**: Colabz Chat is work-centric. It parses and renders interactive reference cards for tasks (`COL-24`), issues (`#24`), and commits (`commit 9f4a8b1`) inline within messages, enabling developers to jump directly to code and project tickets from conversation threads.

### Q2: How does the responsive layout work on mobile devices in Phase 9?
**Answer**: Using CSS media queries and React state (`activeMobileView`). On mobile screens (≤ 768px), only one panel is visible at a time (`sidebar` or `conversation`). Selecting a conversation switches the view to the chat area, and clicking the `←` back button returns to the conversation list.

---

## 23. Hands-on Exercises

1. **Exercise 1**: Add a "Pin Message" action to the message hover toolbar that places a pinned message banner at the top of the conversation header.
2. **Exercise 2**: Extend `MessageComposer` to support pasting image URLs, automatically rendering an inline image preview card inside `AttachmentPreview`.
3. **Exercise 3**: Add a "Copy Link to Message" button that copies a deep-link URL (e.g. `/app/projects/proj_1/chat/conv_dev?msg=msg_105`) to the user's clipboard.
