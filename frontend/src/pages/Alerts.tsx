import React, { useEffect, useState } from 'react';
import { getAlerts, resolveAlert, getStreetlights } from '../services/api';
import { Alert, Streetlight } from '../types';

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lights, setLights] = useState<Streetlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [brightness, setBrightness] = useState<Record<number, number>>({});

  const fetchAlerts = async () => {
    try {
      const alertsRes = await getAlerts();
      const lightsRes = await getStreetlights();
      setAlerts(alertsRes.data);
      setLights(lightsRes.data);
      // Initialize brightness from localStorage or default 100
      const savedBrightness = localStorage.getItem('brightness');
      if (savedBrightness) {
        setBrightness(JSON.parse(savedBrightness));
      } else {
        const initial: Record<number, number> = {};
        lightsRes.data.forEach(l => initial[l.id] = 100);
        setBrightness(initial);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = async (id: number) => {
    try {
      await resolveAlert(id);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const handleMarkAll = async () => {
    for (const alert of alerts) {
      try {
        await resolveAlert(alert.id);
      } catch (error) {
        console.error('Failed to resolve alert:', error);
      }
    }
    setAlerts([]);
  };

  const handleBrightnessChange = (lightId: number, value: number) => {
    const updated = { ...brightness, [lightId]: value };
    setBrightness(updated);
    localStorage.setItem('brightness', JSON.stringify(updated));
    // In future, send to backend: PUT /api/streetlights/<id>/brightness
  };

  const critical = alerts.filter(a => a.severity === 'high');
  const warning = alerts.filter(a => a.severity === 'medium');
  const info = alerts.filter(a => a.severity === 'low');

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading alerts...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Alerts</h2>
        {alerts.length > 0 && (
          <button onClick={handleMarkAll} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Mark all resolved
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Alerts list */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="font-semibold mb-3">Active alerts ({alerts.length} open)</div>
          <div className="space-y-3">
            {critical.map(a => (
              <div key={a.id} className="border-l-4 border-red-500 bg-red-50 p-3 rounded">
                <div className="font-bold text-red-700">{a.alert_type}</div>
                <div>{a.message}</div>
                <div className="text-xs text-gray-500 mt-1">{new Date(a.created_at).toLocaleString()}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleResolve(a.id)} className="text-blue-600 text-sm">Resolve</button>
                  <button className="text-gray-600 text-sm">View readings</button>
                </div>
              </div>
            ))}
            {warning.map(a => (
              <div key={a.id} className="border-l-4 border-yellow-500 bg-yellow-50 p-3 rounded">
                <div className="font-bold text-yellow-700">{a.alert_type}</div>
                <div>{a.message}</div>
                <div className="text-xs text-gray-500 mt-1">{new Date(a.created_at).toLocaleString()}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleResolve(a.id)} className="text-blue-600 text-sm">Resolve</button>
                  <button className="text-gray-600 text-sm">View readings</button>
                </div>
              </div>
            ))}
            {info.map(a => (
              <div key={a.id} className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded">
                <div className="font-bold text-blue-700">{a.alert_type}</div>
                <div>{a.message}</div>
                <div className="text-xs text-gray-500 mt-1">{new Date(a.created_at).toLocaleString()}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleResolve(a.id)} className="text-blue-600 text-sm">Dismiss</button>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-gray-500 text-sm p-4 text-center">✅ All clear! No active alerts.</div>
            )}
          </div>
        </div>

        {/* Right column: Remote control */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Remote control</h3>
          <div className="space-y-4">
            {lights.slice(0, 5).map(light => (
              <div key={light.id} className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">#{light.light_id} - {light.location}</span>
                  <div className="flex gap-2">
                    <button className="text-green-600 text-sm">On</button>
                    <button className="text-yellow-600 text-sm">Dim</button>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm">Brightness: {brightness[light.id] || 100}%</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={brightness[light.id] || 100}
                    onChange={(e) => handleBrightnessChange(light.id, parseInt(e.target.value))}
                    className="w-full mt-1"
                  />
                </div>
                <button className="text-blue-600 text-sm mt-2">View readings</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
