import React, { useEffect, useState } from 'react';
import {
  getReadings,
  getAlerts,
  getEnergyLogs,
  getStreetlights,
} from '../services/api';
import { SensorReading, Alert, EnergyLog, Streetlight } from '../types';
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
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [streetlights, setStreetlights] = useState<Streetlight[]>([]);
  const [energyLogs, setEnergyLogs] = useState<EnergyLog[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [lightStatus, setLightStatus] = useState({
    on: 0,
    dimmed: 0,
    off: 0,
    offline: 0,
  });
  const [criticalAlerts, setCriticalAlerts] = useState(0);

  const toDateStr = (date: Date) => date.toISOString().slice(0, 10);
  const getDayName = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          readingsRes,
          alertsRes,
          energyRes,
          lightsRes,
        ] = await Promise.all([
          getReadings(),
          getAlerts(),
          getEnergyLogs(),
          getStreetlights(),
        ]);

        setReadings(readingsRes.data);
        setAlerts(alertsRes.data);
        setStreetlights(lightsRes.data);
        setEnergyLogs(energyRes.data);

        // Light status calculation
        const latestReadings = new Map<number, SensorReading>();
        readingsRes.data.forEach((r) => {
          const existing = latestReadings.get(r.streetlight);
          if (!existing || new Date(r.timestamp) > new Date(existing.timestamp)) {
            latestReadings.set(r.streetlight, r);
          }
        });

        const now = new Date();
        let on = 0, dimmed = 0, off = 0, offline = 0;
        lightsRes.data.forEach((light) => {
          const reading = latestReadings.get(light.id);
          if (!reading) {
            offline++;
          } else {
            const diffMinutes = (now.getTime() - new Date(reading.timestamp).getTime()) / (1000 * 60);
            if (diffMinutes > 5) {
              offline++;
            } else if (reading.power < 5) {
              off++;
            } else if (reading.power < 30) {
              dimmed++;
            } else {
              on++;
            }
          }
        });
        setLightStatus({ on, dimmed, off, offline });

        const critical = alertsRes.data.filter((a) => a.severity === 'high' && !a.is_resolved).length;
        setCriticalAlerts(critical);

        // Chart data (last 7 days)
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() - (6 - i));
          return toDateStr(d);
        });

        const chartData = last7Days.map((dateStr) => {
          const log = energyRes.data.find((e) => e.log_date === dateStr);
          return {
            day: getDayName(new Date(dateStr + 'T00:00:00')),
            consumed: log ? log.kWh_consumed : 0,
            baseline: log ? log.baseline_kwh : 5.0,
          };
        });
        setChartData(chartData);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  const powerNow = readings.reduce((sum, r) => sum + r.power, 0);
  const today = toDateStr(new Date());
  const todaysLog = energyLogs.find((e) => e.log_date === today);
  const savedToday = todaysLog ? todaysLog.kWh_saved : 0;
  const recentAlerts = alerts.filter((a) => !a.is_resolved).slice(0, 3);
  const liveFeed = readings.slice(0, 6);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Overview — Dar es Salaam grid</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500">Total lights</div>
          <div className="text-3xl font-bold">{streetlights.length}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500">Power now</div>
          <div className="text-3xl font-bold">{powerNow.toFixed(1)} kW</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500">Saved today</div>
          <div className="text-3xl font-bold text-green-600">{savedToday.toFixed(1)} kWh</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500">Active alerts</div>
          <div className="text-3xl font-bold text-red-600">{alerts.filter(a => !a.is_resolved).length}</div>
          <div className="text-sm text-red-500">{criticalAlerts} critical</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-lg font-semibold mb-4">Energy consumption — last 7 days (kWh)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Light status</h3>
          <div className="space-y-1">
            <div className="flex justify-between"><span>On:</span><span>{lightStatus.on}</span></div>
            <div className="flex justify-between"><span>Dimmed:</span><span>{lightStatus.dimmed}</span></div>
            <div className="flex justify-between"><span>Off:</span><span>{lightStatus.off}</span></div>
            <div className="flex justify-between"><span>Offline:</span><span>{lightStatus.offline}</span></div>
            <div className="flex justify-between"><span>Grid uptime:</span><span>99.2%</span></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Recent alerts</h3>
          {recentAlerts.length > 0 ? (
            recentAlerts.map((a) => (
              <div key={a.id} className="border-b py-2">
                <div className="font-medium">{a.message}</div>
                <div className="text-sm text-gray-500">
                  {a.alert_type} - {new Date(a.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No active alerts</p>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mt-6">
        <h3 className="font-semibold mb-2">Live sensor feed</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {liveFeed.map((r) => (
            <div key={r.id} className="text-sm">
              #{r.streetlight}: {r.voltage.toFixed(1)}V / {r.current.toFixed(2)}A / {r.power.toFixed(0)}W
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
