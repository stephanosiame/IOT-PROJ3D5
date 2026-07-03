import axios from 'axios';
import { DashboardSummary, Streetlight, SensorReading, Alert, EnergyLog, User } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// --- Request interceptor: attach token ---
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

// --- Response interceptor: handle 401 globally ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Authentication ---
export const login = async (credentials: { username: string; password: string }) => {
  try {
    const response = await api.post('/api/accounts/token/', {
      username: credentials.username,
      password: credentials.password,
    });
    const token = response.data.access;
    localStorage.setItem('token', token);

    const userResponse = await api.get('/api/accounts/me/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = userResponse.data;
    localStorage.setItem('role', user.role);
    return { token, user };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href = '/login';
};

// --- Protected endpoints ---
export const getDashboardSummary = () => api.get<DashboardSummary>('/api/dashboard/');
export const getStreetlights = () => api.get<Streetlight[]>('/api/streetlights/');
export const getReadings = (streetlightId?: number) => {
  const url = streetlightId ? `/api/readings/?streetlight=${streetlightId}` : '/api/readings/';
  return api.get<SensorReading[]>(url);
};
export const getAlerts = () => api.get<Alert[]>('/api/alerts/');
export const resolveAlert = (alertId: number) => api.post(`/api/alerts/${alertId}/resolve/`);
export const getEnergyLogs = (startDate?: string, endDate?: string) => {
  let url = '/api/energylogs/';
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  if (params.toString()) url += `?${params.toString()}`;
  return api.get<EnergyLog[]>(url);
};

export const registerUser = (userData: any) => api.post('/api/accounts/register/', userData);
export const getUsers = () => api.get('/api/accounts/users/');

export default api;

export const getSettings = () => api.get('/api/settings/');

export const getCurrentUser = () => api.get<User>('/api/accounts/me/');
