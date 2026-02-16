/**
 * API Service
 * Axios instance with JWT token and base configuration
 */

import axios from 'axios';

// Base URL for API - must match backend port (5001)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 for protected routes (not login attempts)
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

// Mail API
export const mailAPI = {
  send: (subject, body, recipients) =>
    api.post('/mail/send', { subject, body, recipients }),
  getHistory: (page = 1, limit = 10) =>
    api.get(`/mail/history?page=${page}&limit=${limit}`),
};

export default api;
