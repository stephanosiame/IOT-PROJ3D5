import axios from 'axios';
import { DashboardSummary, Streetlight, SensorReading, Alert, EnergyLog, AuthResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

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

export const login = (credentials: { username: string; password: string; role: string }) => {
  return new Promise<{ data: AuthResponse }>((resolve) => {
    setTimeout(() => {
      const token = 'mock-jwt-token';
      localStorage.setItem('token', token);
      localStorage.setItem('role', credentials.role);
      resolve({ data: { token, user: { id: 1, username: credentials.username, role: credentials.role } } });
    }, 500);
  });
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

export default api;
