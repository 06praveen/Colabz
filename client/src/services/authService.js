import api from './api';

export const authService = {
  /**
   * Register a new user
   */
  async register(name, username, email, password) {
    let payload = {};
    if (typeof name === 'object') {
      payload = name;
    } else {
      payload = { name, username, email, password };
    }
    const response = await api.post('/api/auth/register', payload);
    return response.data;
  },

  /**
   * Login user with email/username and password
   */
  async login(emailOrUsername, password) {
    const payload = emailOrUsername && emailOrUsername.includes?.('@')
      ? { email: emailOrUsername, password }
      : { emailOrUsername, username: emailOrUsername, password };
    const response = await api.post('/api/auth/login', payload);
    return response.data;
  },

  /**
   * Get current authenticated user profile
   */
  async getMe() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  /**
   * Logout current session
   */
  async logout() {
    try {
      const response = await api.post('/api/auth/logout');
      return response.data;
    } catch {
      // Best-effort logout
      return { success: true };
    }
  },
};

export default authService;
