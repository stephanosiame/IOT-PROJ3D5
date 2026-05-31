import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login: React.FC = () => {
  const [role, setRole] = useState<'admin' | 'engineer' | 'city_auth'>('engineer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ username, password, role });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6">StreetLight</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Sign in as</label>
            <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full border p-2 rounded">
              <option value="admin">Admin</option>
              <option value="engineer">Engineer</option>
              <option value="city_auth">City Authority</option>
            </select>
          </div>
          <div className="mb-4">
            <input type="text" placeholder="Email or Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border p-2 rounded" required />
          </div>
          <div className="mb-4">
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 rounded" required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Sign in</button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-4">Access restricted to authorised city personnel</p>
        <p className="text-center text-gray-500 text-sm">Forgot password?</p>
      </div>
    </div>
  );
};

export default Login;
