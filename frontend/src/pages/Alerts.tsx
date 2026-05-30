import React, { useEffect, useState } from 'react';
import { getAlerts, resolveAlert, getStreetlights } from '../services/api';
import { Alert, Streetlight } from '../types';

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lights, setLights] = useState<Streetlight[]>([]);

  const fetchAlerts = async () => {
    const res = await getAlerts();
    setAlerts(res.data);
  };

  useEffect(() => {
    fetchAlerts();
    getStreetlights().then((res) => setLights(res.data));
  }, []);

  const handleResolve = async (id: number) => {
    await resolveAlert(id);
    fetchAlerts();
  };

  const handleMarkAll = async () => {
    for (const alert of alerts) {
      await resolveAlert(alert.id);
    }
    fetchAlerts();
  };

  // Group alerts by severity for display
  const criticalAlerts = alerts.filter((a) => a.severity === 'high');
  const warningAlerts = alerts.filter((a) => a.severity === 'medium');
  const infoAlerts = alerts.filter((a) => a.severity === 'low');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Alerts</h2>
        <button
          onClick={handleMarkAll}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Mark all resolved
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Active alerts ({alerts.length} open)</h3>
          {criticalAlerts.map((alert) => (
            <div key={alert.id} className="border-l-4 border-red-500 bg-red-50 p-3 mb-3 rounded">
              <div className="font-bold">{alert.alert_type}</div>
              <div>{alert.message}</div>
              <div className="text-sm text-gray-500">{new Date(alert.created_at).toLocaleString()}</div>
              <button onClick={() => handleResolve(alert.id)} className="mt-2 text-blue-600 text-sm">
                Resolve
              </button>
            </div>
          ))}
          {warningAlerts.map((alert) => (
            <div key={alert.id} className="border-l-4 border-yellow-500 bg-yellow-50 p-3 mb-3 rounded">
              <div className="font-bold">{alert.alert_type}</div>
              <div>{alert.message}</div>
              <button onClick={() => handleResolve(alert.id)} className="mt-2 text-blue-600 text-sm">
                Resolve
              </button>
            </div>
          ))}
          {infoAlerts.map((alert) => (
            <div key={alert.id} className="border-l-4 border-blue-500 bg-blue-50 p-3 mb-3 rounded">
              <div className="font-bold">{alert.alert_type}</div>
              <div>{alert.message}</div>
              <button onClick={() => handleResolve(alert.id)} className="mt-2 text-blue-600 text-sm">
                Dismiss
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Remote control</h3>
          {lights.slice(0, 4).map((light) => (
            <div key={light.id} className="border-b py-3">
              <div className="font-medium">#{light.light_id} - {light.location}</div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm">Brightness</span>
                <input type="range" min="0" max="100" className="flex-1" />
                <span className="text-sm">100%</span>
              </div>
              <button className="text-blue-600 text-sm mt-1">View readings</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
