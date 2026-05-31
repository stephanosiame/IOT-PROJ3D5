import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/api';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">StreetLight</h2>
        <nav>
          <ul>
            <li><Link to="/dashboard" className="block py-2">Overview</Link></li>
            <li><Link to="/analytics" className="block py-2">Energy analytics</Link></li>
            <li><Link to="/alerts" className="block py-2">Alerts</Link></li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="mt-8 text-red-400">Sign out</button>
      </aside>
      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
