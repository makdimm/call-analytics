import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (username: string, password: string) =>
  api.post('/auth/login', { username, password }).then((r) => r.data);

export const register = (data: { username: string; email: string; password: string; role?: string }) =>
  api.post('/auth/register', data).then((r) => r.data);

// Users
export const getMe = () => api.get('/users/me').then((r) => r.data);
export const getUsers = () => api.get('/users').then((r) => r.data);

// Calls
export const getCalls = (params?: Record<string, any>) =>
  api.get('/calls', { params }).then((r) => r.data);

export const getCall = (id: number) =>
  api.get(`/calls/${id}`).then((r) => r.data);

export const uploadCall = (formData: FormData) =>
  api.post('/calls/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const deleteCall = (id: number) =>
  api.delete(`/calls/${id}`).then((r) => r.data);

// Analytics
export const getDashboard = (days = 30) =>
  api.get('/analytics/dashboard', { params: { days } }).then((r) => r.data);

export const getManagerDetail = (managerId: number, days = 30) =>
  api.get(`/analytics/managers/${managerId}`, { params: { days } }).then((r) => r.data);

export default api;
