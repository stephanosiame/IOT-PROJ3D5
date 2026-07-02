import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="md:w-1/2 bg-gradient-to-br from-green-600 to-green-800 text-white p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">StreetLight</h1>
            <p className="text-green-100 mb-8">Energy consumption & saving dashboard</p>
            <p className="text-green-100">Monitor, control, and optimise your city's streetlight network in real time — from any device, anywhere.</p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div><div className="text-3xl font-bold">248</div><div className="text-sm">Lights managed</div></div>
            <div><div className="text-3xl font-bold">99.2%</div><div className="text-sm">Grid uptime</div></div>
            <div><div className="text-3xl font-bold">22%</div><div className="text-sm">Avg energy saved</div></div>
          </div>
          <div className="mt-8 text-sm text-green-200">Dar es Salaam city grid - powered by ESP32 + Django</div>
        </div>

        <div className="md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign in</h2>
          <p className="text-gray-500 mb-6">Enter your credentials</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">Sign in</button>

            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Access restricted to authorised city personnel</p>
              <p className="mt-2">Forgot password?</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
