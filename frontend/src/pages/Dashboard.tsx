import React, { useEffect, useState } from 'react';
import {
  getDashboardSummary,
  getReadings,
  getAlerts,
  getStreetlights,
  getEnergyLogs,
} from '../services/api';
import { DashboardSummary, SensorReading, Alert, Streetlight } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [streetlights, setStreetlights] = useState<Streetlight[]>([]);
  const [energyLogs, setEnergyLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [summaryRes, readingsRes, alertsRes, lightsRes, logsRes] = await Promise.all([
        getDashboardSummary(),
        getReadings(),
        getAlerts(),
        getStreetlights(),
        getEnergyLogs(),
      ]);
      setSummary(summaryRes.data);
      setReadings(readingsRes.data.slice(0, 6));
      setAlerts(alertsRes.data.slice(0, 3));
      setStreetlights(lightsRes.data);
      // Prepare chart data: last 7 days from energy logs
      const last7Days = logsRes.data.slice(-7).map((log) => ({
        day: new Date(log.log_date).toLocaleDateString('en-US', { weekday: 'short' }),
        consumed: log.kWh_consumed,
        baseline: log.baseline_kwh,
      }));
      setEnergyLogs(last7Days);
    };
    fetchData();
  }, []);

  const activeLights = streetlights.filter((l) => l.is_active).length;
  const lightsOff = 0; // you can compute from readings

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Overview — Dar es Salaam grid</h2>
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500">Total lights</div>
          <div className="text-3xl font-bold">{summary?.total_streetlights || 0}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500">Power now</div>
          <div className="text-3xl font-bold">
            {readings.length ? readings.reduce((s, r) => s + r.power, 0).toFixed(1) : 0} kW
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500">Saved today</div>
          <div className="text-3xl font-bold text-green-600">
            {summary?.total_savings_kwh.toFixed(1) || 0} kWh
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500">Active alerts</div>
          <div className="text-3xl font-bold text-red-600">{summary?.unresolved_alerts || 0}</div>
          <div className="text-sm text-red-500">2 critical</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-lg font-semibold mb-4">Energy consumption — last 7 days (kWh)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={energyLogs}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="consumed" stroke="#3b82f6" name="Consumed" />
            <Line type="monotone" dataKey="baseline" stroke="#9ca3af" name="Baseline" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Light status and alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Light status</h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span>On:</span><span>{activeLights}</span></div>
            <div className="flex justify-between"><span>Dimmed:</span><span>8</span></div>
            <div className="flex justify-between"><span>Off:</span><span>{lightsOff}</span></div>
            <div className="flex justify-between"><span>Offline:</span><span>{streetlights.length - activeLights}</span></div>
            <div className="flex justify-between"><span>Grid uptime:</span><span>99.2%</span></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Recent alerts</h3>
          {alerts.map((alert) => (
            <div key={alert.id} className="border-b py-2">
              <div className="font-medium">{alert.message}</div>
              <div className="text-sm text-gray-500">{alert.alert_type} - {new Date(alert.created_at).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live sensor feed */}
      <div className="bg-white p-4 rounded shadow mt-6">
        <h3 className="text-lg font-semibold mb-4">Live sensor feed</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {readings.map((r) => (
            <div key={r.id} className="text-sm">
              #{r.streetlight}: {r.voltage.toFixed(1)} V / {r.current.toFixed(2)} A
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
