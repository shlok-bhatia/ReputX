import axios from 'axios';

// In development, Vite proxy forwards /api/* to localhost:5000
// In production, set VITE_API_URL to the backend URL.
const API_URL = import.meta.env.VITE_API_URL || '';

console.log("🔗 API Base URL:", API_URL || "Using Vite Proxy");

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000
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

// Request interceptor - log requests in development
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    }
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ ${error.response.status} Error:`, error.response.data);
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        setAuthToken(null);
        // Optionally redirect to login
        // window.location.href = '/login';
      }
    } else if (error.request) {
      console.error("❌ No response from server:", error.request);
    } else {
      console.error("❌ Request Error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
