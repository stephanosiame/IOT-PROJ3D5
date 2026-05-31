import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/api';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'Engineer';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 text-2xl font-bold text-blue-600">StreetLight</div>
        <nav className="mt-6">
          <Link to="/dashboard" className="block py-2 px-4 text-gray-700 hover:bg-blue-50">
            Overview
          </Link>
          <Link to="/analytics" className="block py-2 px-4 text-gray-700 hover:bg-blue-50">
            Energy analytics
          </Link>
          <Link to="/alerts" className="block py-2 px-4 text-gray-700 hover:bg-blue-50">
            Alerts
          </Link>
          <div className="block py-2 px-4 text-gray-700">Settings</div>
        </nav>
        <div className="absolute bottom-4 left-4 text-sm text-gray-500">{role}</div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Dar es Salaam grid</h1>
          <button onClick={handleLogout} className="text-red-500 hover:text-red-700">
            Sign out
          </button>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
