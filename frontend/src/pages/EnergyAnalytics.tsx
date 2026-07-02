import React, { useEffect, useState } from 'react';
import { getEnergyLogs, getStreetlights } from '../services/api';
import { EnergyLog } from '../types';
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
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [topConsumers, setTopConsumers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COST_PER_KWH = 224;

  useEffect(() => {
    const fetch = async () => {
      try {
        const logsRes = await getEnergyLogs();
        const lightsRes = await getStreetlights();
        setLogs(logsRes.data);

        // Chart data (last 7 days)
        const last7 = logsRes.data.slice(-7).map((log) => ({
          day: new Date(log.log_date).toLocaleDateString('en-US', { weekday: 'short' }),
          actual: log.kWh_consumed,
          baseline: log.baseline_kwh,
        }));
        setDailyData(last7);

        // Top consumers (today)
        const today = new Date().toISOString().slice(0, 10);
        const todayLogs = logsRes.data.filter(log => log.log_date === today);

        const lightMap = new Map<number, string>();
        lightsRes.data.forEach(light => lightMap.set(light.id, light.location));

        const consumers = todayLogs.map(log => {
          const location = lightMap.get(log.streetlight) || 'Unknown';
          const savingRate = log.baseline_kwh > 0 ? (log.kWh_saved / log.baseline_kwh) * 100 : 0;
          return {
            id: `#${log.streetlight}`,
            location,
            kWh_today: log.kWh_consumed,
            kWh_saved: log.kWh_saved,
            saving_rate: savingRate,
          };
        });

        consumers.sort((a, b) => b.kWh_today - a.kWh_today);
        setTopConsumers(consumers.slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch energy analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const totalConsumed = logs.reduce((sum, l) => sum + l.kWh_consumed, 0);
  const totalSaved = logs.reduce((sum, l) => sum + l.kWh_saved, 0);
  const costSaved = totalSaved * COST_PER_KWH;
  const costUsed = totalConsumed * COST_PER_KWH;

  const exportCSV = () => {
    const headers = ['Light ID', 'Location', 'kWh Consumed (today)', 'kWh Saved (today)', 'Saving Rate (%)'];
    const rows = topConsumers.map(c => [
      c.id,
      c.location,
      c.kWh_today.toFixed(2),
      c.kWh_saved.toFixed(2),
      c.saving_rate.toFixed(0),
    ]);

    const summary = [
      ['', '', '', '', ''],
      ['Summary', '', '', '', ''],
      [`Total Consumed (month): ${totalConsumed.toFixed(0)} kWh`, '', '', '', ''],
      [`Total Saved (month): ${totalSaved.toFixed(0)} kWh`, '', '', '', ''],
      [`Cost Saved: TSh ${costSaved.toFixed(0)}`, '', '', '', ''],
      [`Cost Used: TSh ${costUsed.toFixed(0)}`, '', '', '', ''],
    ];

    // Build CSV: headers as a single row, then rows, then summary rows
    const allRows = [headers, ...rows, ...summary];
    const csvContent = allRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `energy_analytics_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading energy analytics...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Energy analytics</h2>
        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
        >
          <span>📊</span> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500">Total consumed this month</div>
          <div className="text-3xl font-bold">{totalConsumed.toFixed(0)} kWh</div>
          <div className="text-green-600 text-sm">-8.3% vs last month</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500">Total saved this month</div>
          <div className="text-3xl font-bold text-green-600">{totalSaved.toFixed(0)} kWh</div>
          <div className="text-green-600 text-sm">+14% vs last month</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500">Estimated cost saved</div>
          <div className="text-3xl font-bold">TSh {costSaved.toFixed(0)}</div>
          <div className="text-gray-500 text-sm">at TSh {COST_PER_KWH}/kWh</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500">Estimated cost used</div>
          <div className="text-3xl font-bold">TSh {costUsed.toFixed(0)}</div>
          <div className="text-gray-500 text-sm">at TSh {COST_PER_KWH}/kWh</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="text-lg font-semibold p-4 border-b">Per-light breakdown — top consumers (today)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Light ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location (Area)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">kWh today</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">kWh saved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saving rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topConsumers.length > 0 ? (
                topConsumers.map((c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{c.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{c.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{c.kWh_today.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{c.kWh_saved.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{c.saving_rate.toFixed(0)}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No data available for today.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 text-sm text-gray-500">
          Showing top {topConsumers.length} consumers
        </div>
      </div>
    </div>
  );
};

export default EnergyAnalytics;
