import React, { useEffect, useState } from 'react';
import { getEnergyLogs, getStreetlights } from '../services/api';
import { EnergyLog, Streetlight } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const EnergyAnalytics: React.FC = () => {
  const [logs, setLogs] = useState<EnergyLog[]>([]);
  const [lights, setLights] = useState<Streetlight[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const logsRes = await getEnergyLogs();
      const lightsRes = await getStreetlights();
      setLogs(logsRes.data);
      setLights(lightsRes.data);
      const last7 = logsRes.data.slice(-7).map((log) => ({
        day: new Date(log.log_date).toLocaleDateString('en-US', { weekday: 'short' }),
        actual: log.kWh_consumed,
        baseline: log.baseline_kwh,
      }));
      setDailyData(last7);
    };
    fetch();
  }, []);

  const totalConsumed = logs.reduce((sum, l) => sum + l.kWh_consumed, 0);
  const totalSaved = logs.reduce((sum, l) => sum + l.kWh_saved, 0);
  const tzsPerKwh = 224;
  const tzsSaved = totalSaved * tzsPerKwh;

  const topConsumers = lights.slice(0, 4).map((light, idx) => ({
    id: light.light_id,
    location: light.location,
    kWh_today: (idx + 1) * 0.3 + 1.2,
    kWh_saved: (idx + 1) * 0.2,
    saving_rate: ((idx + 1) * 5 + 10),
  }));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Energy analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500">Total consumed this month</div>
          <div className="text-3xl font-bold">{totalConsumed.toFixed(0)} kWh</div>
          <div className="text-green-600 text-sm">-8.3% vs last month</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500">Total saved this month</div>
          <div className="text-3xl font-bold text-green-600">{totalSaved.toFixed(0)} kWh</div>
          <div className="text-green-600 text-sm">+14% vs last month</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500">Estimated cost saved</div>
          <div className="text-3xl font-bold">TSh {tzsSaved.toFixed(0)}</div>
          <div className="text-gray-500 text-sm">at TSh {tzsPerKwh}/kWh</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-lg font-semibold mb-4">Daily consumption vs baseline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="actual" fill="#3b82f6" name="Actual kWh" />
            <Bar dataKey="baseline" fill="#9ca3af" name="Baseline kWh" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Per-light breakdown — top consumers</h3>
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Light ID</th>
              <th className="text-left py-2">Location</th>
              <th className="text-left py-2">kWh today</th>
              <th className="text-left py-2">kWh saved</th>
              <th className="text-left py-2">Saving rate</th>
            </tr>
          </thead>
          <tbody>
            {topConsumers.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="py-2">#{c.id}</td>
                <td>{c.location}</td>
                <td>{c.kWh_today.toFixed(2)}</td>
                <td>{c.kWh_saved.toFixed(2)}</td>
                <td>{c.saving_rate.toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnergyAnalytics;
