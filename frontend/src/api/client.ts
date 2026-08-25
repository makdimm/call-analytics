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

// Seed (dev only)
export const seedDev = () => api.post('/seed').then((r) => r.data);

export { api };
export default api;

// ═══════════════════════════════════════════
// AI-Sales API
// ═══════════════════════════════════════════

// Scripts
export const getSalesScripts = (params?: Record<string, any>) =>
  api.get('/sales/scripts', { params }).then((r) => r.data);

export const getSalesScript = (id: number) =>
  api.get(`/sales/scripts/${id}`).then((r) => r.data);

export const createSalesScript = (data: any) =>
  api.post('/sales/scripts', data).then((r) => r.data);

export const updateSalesScript = (id: number, data: any) =>
  api.put(`/sales/scripts/${id}`, data).then((r) => r.data);

export const deleteSalesScript = (id: number) =>
  api.delete(`/sales/scripts/${id}`).then((r) => r.data);

// Contacts
export const getSalesContacts = (params?: Record<string, any>) =>
  api.get('/sales/contacts', { params }).then((r) => r.data);

export const createSalesContact = (data: any) =>
  api.post('/sales/contacts', data).then((r) => r.data);

export const importSalesContacts = (file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return api.post('/sales/contacts/import', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};

// Campaigns
export const getSalesCampaigns = (params?: Record<string, any>) =>
  api.get('/sales/campaigns', { params }).then((r) => r.data);

export const getSalesCampaign = (id: number) =>
  api.get(`/sales/campaigns/${id}`).then((r) => r.data);

export const createSalesCampaign = (data: any) =>
  api.post('/sales/campaigns', data).then((r) => r.data);

export const addContactsToCampaign = (campaignId: number, contactIds: number[]) =>
  api.post(`/sales/campaigns/${campaignId}/contacts`, { contact_ids: contactIds }).then((r) => r.data);

export const getCampaignContacts = (campaignId: number) =>
  api.get(`/sales/campaigns/${campaignId}/contacts`).then((r) => r.data);

export const startCampaign = (campaignId: number) =>
  api.post(`/sales/campaigns/${campaignId}/start`).then((r) => r.data);

export const pauseCampaign = (campaignId: number) =>
  api.post(`/sales/campaigns/${campaignId}/pause`).then((r) => r.data);

// Calls
export const getSalesCalls = (params?: Record<string, any>) =>
  api.get('/sales/calls', { params }).then((r) => r.data);

export const getSalesCall = (id: number) =>
  api.get(`/sales/calls/${id}`).then((r) => r.data);

export const simulateCall = (data: {
  campaign_id: number;
  contact_id: number;
  simulation: { name: string; personality: string; objections?: string[]; max_turns?: number };
}) => api.post('/sales/simulate', data).then((r) => r.data);

// Stats
export const getSalesStats = () =>
  api.get('/sales/stats').then((r) => r.data);
