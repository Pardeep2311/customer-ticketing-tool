import axios from 'axios';

// Create axios instance with base configuration
// NOTE: For cross-device access on your local network, set REACT_APP_API_URL in .env file
// Default uses localhost for same-machine development
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
    || process.env.REACT_APP_API_BASE_URL
    || 'http://localhost:5000/api', // Default to localhost for local development
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor - Add token to requests
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

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.error('Request timeout or network error:', error.message);
      // Don't redirect on timeout, let the component handle it
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

