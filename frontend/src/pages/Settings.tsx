import React, { useState, useEffect } from 'react';

const Settings: React.FC = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [threshold, setThreshold] = useState(240);
  const [currency, setCurrency] = useState('TSh');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const settings = localStorage.getItem('settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setEmailAlerts(parsed.emailAlerts !== undefined ? parsed.emailAlerts : true);
      setThreshold(parsed.threshold || 240);
      setCurrency(parsed.currency || 'TSh');
    }
  }, []);

  const handleSave = () => {
    const settings = { emailAlerts, threshold, currency };
    localStorage.setItem('settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Email alerts toggle */}
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="font-semibold">Email alerts</h3>
            <p className="text-sm text-gray-500">Receive notifications for critical alerts</p>
          </div>
          <button
            onClick={() => setEmailAlerts(!emailAlerts)}
            className={`px-4 py-2 rounded ${emailAlerts ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'}`}
          >
            {emailAlerts ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Overvoltage threshold */}
        <div className="border-b pb-4">
          <h3 className="font-semibold mb-2">Overvoltage threshold (V)</h3>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="border rounded p-2 w-32"
            min="200"
            max="300"
          />
          <p className="text-sm text-gray-500 mt-1">Voltage above this value triggers an alert</p>
        </div>

        {/* Currency selection */}
        <div className="border-b pb-4">
          <h3 className="font-semibold mb-2">Currency</h3>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="border rounded p-2"
          >
            <option value="TSh">TSh</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Save settings
          </button>
          {saved && <span className="text-green-600 text-sm">✅ Settings saved!</span>}
        </div>
      </div>
    </div>
  );
};

export default Settings;
