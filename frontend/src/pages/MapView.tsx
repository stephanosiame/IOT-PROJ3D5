import React, { useEffect, useState } from 'react';
import { getStreetlights, getEnergyLogs, getAlerts, getReadings } from '../services/api';
import { Streetlight, EnergyLog, Alert, SensorReading } from '../types';

interface AreaStats {
  name: string;
  lights: Streetlight[];
  totalLights: number;
  damaged: number;
  consumption: number;
  savings: number;
  efficiency: number;
}

const MapView: React.FC = () => {
  const [areas, setAreas] = useState<AreaStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<AreaStats | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
  const [allReadings, setAllReadings] = useState<SensorReading[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lightsRes, logsRes, alertsRes, readingsRes] = await Promise.all([
          getStreetlights(),
          getEnergyLogs(),
          getAlerts(),
          getReadings(),
        ]);

        const lights = lightsRes.data;
        const logs = logsRes.data;
        const alerts = alertsRes.data;
        const readings = readingsRes.data;

        setAllAlerts(alerts);
        setAllReadings(readings);

        // Today's logs
        const today = new Date().toISOString().slice(0, 10);
        const todaysLogs = logs.filter(log => log.log_date === today);

        // Group lights by area
        const areaMap = new Map<string, Streetlight[]>();
        lights.forEach(light => {
          const area = light.location.split(',')[0]?.trim() || 'Unassigned';
          if (!areaMap.has(area)) areaMap.set(area, []);
          areaMap.get(area)!.push(light);
        });

        const areaStats: AreaStats[] = [];
        areaMap.forEach((lightList, areaName) => {
          const lightIds = lightList.map(l => l.id);

          // Damaged: lights with high severity alerts, faulty_light, or offline / power < 5
          const damaged = lightList.filter(light => {
            const hasAlert = alerts.some(a => a.streetlight === light.id && !a.is_resolved && (a.severity === 'high' || a.alert_type === 'faulty_light'));
            const reading = readings.find(r => r.streetlight === light.id);
            if (!reading) return true;
            const diffMinutes = (Date.now() - new Date(reading.timestamp).getTime()) / (1000 * 60);
            if (diffMinutes > 5) return true;
            if (reading.power < 5) return true;
            return hasAlert;
          }).length;

          let consumption = 0, savings = 0;
          todaysLogs.forEach(log => {
            if (lightIds.includes(log.streetlight)) {
              consumption += log.kWh_consumed;
              savings += log.kWh_saved;
            }
          });

          const total = consumption + savings;
          const efficiency = total > 0 ? (savings / total) * 100 : 0;

          areaStats.push({
            name: areaName,
            lights: lightList,
            totalLights: lightList.length,
            damaged,
            consumption,
            savings,
            efficiency,
          });
        });

        areaStats.sort((a, b) => a.name.localeCompare(b.name));
        setAreas(areaStats);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch location data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewDetails = (area: AreaStats) => {
    setSelectedArea(area);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedArea(null);
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading areas...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Location Overview</h2>

      {areas.length === 0 ? (
        <p className="text-gray-500">No areas found. Add streetlights with location data.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area) => (
            <div key={area.name} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">{area.name}</h3>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between"><span className="text-gray-500">Total lights:</span><span>{area.totalLights}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Damaged:</span><span className="text-red-600">{area.damaged}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Consumption today:</span><span>{area.consumption.toFixed(1)} kWh</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Savings today:</span><span className="text-green-600">{area.savings.toFixed(1)} kWh</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Efficiency:</span><span>{area.efficiency.toFixed(0)}%</span></div>
              </div>
              <div className="px-4 pb-4">
                <button
                  onClick={() => handleViewDetails(area)}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedArea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">{selectedArea.name} – Details</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded"><span className="text-gray-500">Total:</span> <span className="font-bold">{selectedArea.totalLights}</span></div>
                <div className="bg-gray-50 p-3 rounded"><span className="text-gray-500">Damaged:</span> <span className="font-bold text-red-600">{selectedArea.damaged}</span></div>
                <div className="bg-gray-50 p-3 rounded"><span className="text-gray-500">Consumption:</span> <span className="font-bold">{selectedArea.consumption.toFixed(1)} kWh</span></div>
                <div className="bg-gray-50 p-3 rounded"><span className="text-gray-500">Savings:</span> <span className="font-bold text-green-600">{selectedArea.savings.toFixed(1)} kWh</span></div>
              </div>
              <h4 className="font-semibold mb-2">Streetlights</h4>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Reading</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedArea.lights.map(light => {
                    const hasAlert = allAlerts.some(a => a.streetlight === light.id && !a.is_resolved && (a.severity === 'high' || a.alert_type === 'faulty_light'));
                    const reading = allReadings.find(r => r.streetlight === light.id);
                    let status = 'Active';
                    let color = 'text-green-600';
                    if (hasAlert) { status = '⚠️ Alert'; color = 'text-red-600'; }
                    else if (!reading) { status = 'Offline'; color = 'text-gray-400'; }
                    else if (reading.power < 5) { status = 'Off'; color = 'text-gray-500'; }
                    else if (reading.power < 30) { status = 'Dimmed'; color = 'text-yellow-600'; }
                    const lastReading = reading ? `${reading.voltage.toFixed(1)}V / ${reading.current.toFixed(2)}A` : '—';
                    return (
                      <tr key={light.id}>
                        <td className="px-4 py-2">#{light.light_id}</td>
                        <td className="px-4 py-2">{light.location}</td>
                        <td className={`px-4 py-2 ${color}`}>{status}</td>
                        <td className="px-4 py-2">{lastReading}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
