import axios from 'axios';

// Resolve API base URL supporting VITE_API_URL or VITE_API_BASE_URL
const rawBase = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').trim();

let resolvedBaseURL = '';
if (rawBase) {
  resolvedBaseURL = rawBase.replace(/\/+$/, '');
}

const api = axios.create({
  baseURL: resolvedBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token and normalize API paths
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('colabz_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.url) {
      const hasBaseApi = config.baseURL && config.baseURL.endsWith('/api');
      if (hasBaseApi && config.url.startsWith('/api/')) {
        config.url = config.url.substring(4);
      } else if (!hasBaseApi && !config.baseURL && !config.url.startsWith('/api/') && !config.url.startsWith('http')) {
        config.url = config.url.startsWith('/') ? `/api${config.url}` : `/api/${config.url}`;
      }
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
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register');

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
