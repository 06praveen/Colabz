import { io } from 'socket.io-client';

let socket = null;

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
  : 'http://localhost:5000';

/**
 * Get or initialize singleton Socket.IO connection
 */
export const getSocket = () => {
  const token = localStorage.getItem('colabz_token');

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      // Connected successfully
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection warning:', err.message);
    });
  } else if (token && socket.auth?.token !== token) {
    // If token changed, update auth and reconnect
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
  }

  return socket;
};

/**
 * Disconnect socket cleanly on logout
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const socketService = {
  getSocket,
  disconnectSocket,

  joinConversation(projectId, conversationId) {
    const s = getSocket();
    if (s && conversationId) {
      s.emit('conversation:join', { projectId, conversationId });
    }
  },

  leaveConversation(conversationId) {
    const s = getSocket();
    if (s && conversationId) {
      s.emit('conversation:leave', { conversationId });
    }
  },

  sendMessage({ projectId, conversationId, content, replyTo, attachments, clientMessageId }) {
    const s = getSocket();
    if (s && conversationId) {
      s.emit('message:send', {
        projectId,
        conversationId,
        content,
        replyTo,
        attachments,
        clientMessageId,
      });
    }
  },

  editMessage({ projectId, conversationId, messageId, content }) {
    const s = getSocket();
    if (s && conversationId && messageId) {
      s.emit('message:edit', { projectId, conversationId, messageId, content });
    }
  },

  deleteMessage({ projectId, conversationId, messageId }) {
    const s = getSocket();
    if (s && conversationId && messageId) {
      s.emit('message:delete', { projectId, conversationId, messageId });
    }
  },

  markRead({ projectId, conversationId, messageId }) {
    const s = getSocket();
    if (s && conversationId && messageId) {
      s.emit('message:read', { projectId, conversationId, messageId });
    }
  },

  toggleReaction({ projectId, conversationId, messageId, emoji }) {
    const s = getSocket();
    if (s && conversationId && messageId && emoji) {
      s.emit('message:react', { projectId, conversationId, messageId, emoji });
    }
  },
};
