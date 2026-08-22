import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — kept for future backend JWT integration
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — only log errors, never force a page reload.
// Firebase onAuthStateChanged is the source of truth for auth state;
// a failed API call should not trigger a navigation side-effect.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      // Silently clear any stale legacy token — do NOT redirect or reload
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
