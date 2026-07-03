import React, { useEffect, useState } from 'react';
import { getAlerts, resolveAlert, getStreetlights, getReadings } from '../services/api';
import { Alert, Streetlight, SensorReading } from '../types';

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lights, setLights] = useState<Streetlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const [selectedLight, setSelectedLight] = useState<Streetlight | null>(null);
  const [lightReadings, setLightReadings] = useState<SensorReading[]>([]);
  const [showReadingsModal, setShowReadingsModal] = useState(false);
  const [readingsLoading, setReadingsLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      const alertsRes = await getAlerts();
      const lightsRes = await getStreetlights();
      setAlerts(alertsRes.data);
      setLights(lightsRes.data);
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
      await resolveAlert(alert.id);
    }
    setAlerts([]);
  };

  const handleViewAlertDetails = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowAlertModal(true);
  };

  const closeAlertModal = () => {
    setShowAlertModal(false);
    setSelectedAlert(null);
  };

  const handleViewReadings = async (light: Streetlight) => {
    setSelectedLight(light);
    setReadingsLoading(true);
    setShowReadingsModal(true);
    try {
      const res = await getReadings(light.id);
      setLightReadings(res.data.slice(0, 10)); // latest 10
    } catch (error) {
      console.error('Failed to fetch readings:', error);
      setLightReadings([]);
    } finally {
      setReadingsLoading(false);
    }
  };

  const closeReadingsModal = () => {
    setShowReadingsModal(false);
    setSelectedLight(null);
    setLightReadings([]);
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading alerts...</div>;
  }

  const criticalAlerts = alerts.filter(a => a.severity === 'high');
  const warningAlerts = alerts.filter(a => a.severity === 'medium');
  const infoAlerts = alerts.filter(a => a.severity === 'low');

  const getLightLocation = (lightId: number) => {
    const light = lights.find(l => l.id === lightId);
    return light ? light.location : 'Unknown location';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Alerts</h2>
        {alerts.length > 0 && (
          <button
            onClick={handleMarkAll}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Mark all resolved
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Alerts list */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="font-semibold mb-3">
            Active alerts ({alerts.length} open)
            {alerts.length > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({criticalAlerts.length} critical, {warningAlerts.length} warning, {infoAlerts.length} info)
              </span>
            )}
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {criticalAlerts.map(alert => (
              <div key={alert.id} className="border-l-4 border-red-500 bg-red-50 p-3 rounded">
                <div className="font-bold text-red-700">{alert.alert_type}</div>
                <div>{alert.message}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {getLightLocation(alert.streetlight)} - {new Date(alert.created_at).toLocaleString()}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleViewAlertDetails(alert)}
                    className="text-gray-600 text-sm hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
            {warningAlerts.map(alert => (
              <div key={alert.id} className="border-l-4 border-yellow-500 bg-yellow-50 p-3 rounded">
                <div className="font-bold text-yellow-700">{alert.alert_type}</div>
                <div>{alert.message}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {getLightLocation(alert.streetlight)} - {new Date(alert.created_at).toLocaleString()}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleViewAlertDetails(alert)}
                    className="text-gray-600 text-sm hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
            {infoAlerts.map(alert => (
              <div key={alert.id} className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded">
                <div className="font-bold text-blue-700">{alert.alert_type}</div>
                <div>{alert.message}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {getLightLocation(alert.streetlight)} - {new Date(alert.created_at).toLocaleString()}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleViewAlertDetails(alert)}
                    className="text-gray-600 text-sm hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-gray-500 text-center py-4">No active alerts</div>
            )}
          </div>
        </div>

        {/* Right column: Remote control */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Remote control</h3>
          <div className="space-y-4">
            {lights.slice(0, 3).map(light => (
              <div key={light.id} className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">#{light.light_id} - {light.location}</span>
                  <div className="flex gap-2">
                    <button className="text-green-600 text-sm">On</button>
                    <button className="text-yellow-600 text-sm">Dim</button>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm">Brightness</span>
                  <input type="range" min="0" max="100" className="w-full mt-1" />
                </div>
                <button
                  onClick={() => handleViewReadings(light)}
                  className="text-blue-600 text-sm mt-2 hover:underline"
                >
                  View readings
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Alert Details */}
      {showAlertModal && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Alert Details</h3>
              <button onClick={closeAlertModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="space-y-3">
              <div><span className="font-semibold">ID:</span> {selectedAlert.id}</div>
              <div><span className="font-semibold">Type:</span> {selectedAlert.alert_type}</div>
              <div><span className="font-semibold">Severity:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  selectedAlert.severity === 'high' ? 'bg-red-100 text-red-800' :
                  selectedAlert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {selectedAlert.severity}
                </span>
              </div>
              <div><span className="font-semibold">Message:</span> {selectedAlert.message}</div>
              <div><span className="font-semibold">Streetlight:</span> {getLightLocation(selectedAlert.streetlight)}</div>
              <div><span className="font-semibold">Created:</span> {new Date(selectedAlert.created_at).toLocaleString()}</div>
              <div><span className="font-semibold">Status:</span> {selectedAlert.is_resolved ? 'Resolved' : 'Active'}</div>
              {selectedAlert.resolved_at && (
                <div><span className="font-semibold">Resolved at:</span> {new Date(selectedAlert.resolved_at).toLocaleString()}</div>
              )}
              {selectedAlert.resolved_by_username && (
                <div><span className="font-semibold">Resolved by:</span> {selectedAlert.resolved_by_username}</div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              {!selectedAlert.is_resolved && (
                <button
                  onClick={() => {
                    handleResolve(selectedAlert.id);
                    closeAlertModal();
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Resolve
                </button>
              )}
              <button
                onClick={closeAlertModal}
                className="ml-2 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Light Readings */}
      {showReadingsModal && selectedLight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Readings for {selectedLight.light_id} – {selectedLight.location}
              </h3>
              <button onClick={closeReadingsModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {readingsLoading ? (
              <div className="text-center py-4 text-gray-500">Loading readings...</div>
            ) : (
              <>
                {lightReadings.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Voltage (V)</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Current (A)</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Power (W)</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Energy (Wh)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lightReadings.map(r => (
                        <tr key={r.id}>
                          <td className="px-4 py-2 text-sm">{new Date(r.timestamp).toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm">{r.voltage.toFixed(1)}</td>
                          <td className="px-4 py-2 text-sm">{r.current.toFixed(3)}</td>
                          <td className="px-4 py-2 text-sm">{r.power.toFixed(1)}</td>
                          <td className="px-4 py-2 text-sm">{r.energy_wh.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 text-center py-4">No readings found for this streetlight.</p>
                )}
              </>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeReadingsModal}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
