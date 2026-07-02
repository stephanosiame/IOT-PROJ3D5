import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EnergyAnalytics from './pages/EnergyAnalytics';
import Alerts from './pages/Alerts';
import MapView from './pages/MapView';
import Settings from './pages/Settings';
import Layout from './components/Layout';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="map" element={<MapView />} />
          <Route path="analytics" element={<EnergyAnalytics />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
