import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/api';
import { User } from '../types';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // If unauthorized, redirect to login
        logout();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: '📊' },
    { name: 'Locations', path: '/map', icon: '🗺️' },
    { name: 'Energy analytics', path: '/analytics', icon: '⚡' },
    { name: 'Alerts', path: '/alerts', icon: '⚠️' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() || user.username : 'User';
  const roleMap: Record<string, string> = {
    admin: 'Admin',
    engineer: 'Engineer',
    city_auth: 'City Authority',
  };
  const roleDisplay = user ? roleMap[user.role] || user.role : '';

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 text-2xl font-bold text-blue-600 border-b">StreetLight</div>
        <nav className="flex-1 mt-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 ${
                location.pathname === item.path ? 'bg-green-100 border-r-4 border-green-600' : ''
              }`}
            >
              <span className="mr-3">{item.icon}</span> {item.name}
            </Link>
          ))}
        </nav>
        {!loading && (
          <div className="p-4 border-t">
            <div className="text-sm font-medium text-gray-800">{fullName}</div>
            <div className="text-xs text-gray-500">{roleDisplay}</div>
            <button onClick={handleLogout} className="text-red-500 text-sm mt-2 hover:underline">
              Sign out
            </button>
          </div>
        )}
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
