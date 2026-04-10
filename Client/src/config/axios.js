import axios from 'axios';

// In development, Vite proxy forwards /auth, /reputation, etc. to localhost:5000
// so we can use relative paths. In production, set VITE_API_URL to the backend URL.
const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach JWT token to every request if available
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('reputx_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('reputx_token');
  }
}

// Restore token from localStorage on init
const savedToken = localStorage.getItem('reputx_token');
if (savedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear it
      setAuthToken(null);
    }
    return Promise.reject(error);
  }
);

export default api;
