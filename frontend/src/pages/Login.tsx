import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login: React.FC = () => {
  const [role, setRole] = useState<'admin' | 'engineer' | 'city_auth'>('engineer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password, role });
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">StreetLight</h1>
        <p className="text-center text-gray-600 mb-6">Sign in</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Sign in as</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="admin">Admin</option>
              <option value="engineer">Engineer</option>
              <option value="city_auth">City Authority</option>
            </select>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Sign in
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Access restricted to authorised city personnel</p>
          <p className="mt-2">Forgot password?</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
