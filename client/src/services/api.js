import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('colabz_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling and 401 expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute =
        error.config.url?.includes('/api/auth/login') ||
        error.config.url?.includes('/api/auth/register');

      if (!isAuthRoute) {
        // Token expired or invalid
        localStorage.removeItem('colabz_token');
        localStorage.removeItem('colabz_user');
        window.dispatchEvent(new Event('colabz_auth_expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
