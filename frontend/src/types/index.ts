export interface Streetlight {
  id: number;
  light_id: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  installed_date: string;
}

export interface SensorReading {
  id: number;
  streetlight: number;
  timestamp: string;
  voltage: number;
  current: number;
  power: number;
  energy_wh: number;
}

export interface Alert {
  id: number;
  streetlight: number;
  alert_type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  is_resolved: boolean;
  created_at: string;
  resolved_at: string | null;
  resolved_by: number | null;
  resolved_by_username?: string;
}

export interface EnergyLog {
  id: number;
  streetlight: number;
  log_date: string;
  kWh_consumed: number;
  kWh_saved: number;
  cost_used: number;
  baseline_kwh: number;
}

export interface DashboardSummary {
  total_streetlights: number;
  total_energy_kwh: number;
  total_savings_kwh: number;
  unresolved_alerts: number;
}

export interface AuthResponse {
  token: string;
  user: { id: number; username: string; role: string; };
}
