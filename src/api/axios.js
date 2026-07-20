import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send httpOnly auth cookie on every request
});

// Public auth pages where a 401 should NOT trigger a full-page redirect
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 &&
      !AUTH_PATHS.some((p) => window.location.pathname.startsWith(p))
    ) {
      const from = window.location.pathname + window.location.search;
      window.location.href = `/login?from=${encodeURIComponent(from)}`;
    }
    return Promise.reject(err);
  }
);

export default api;
