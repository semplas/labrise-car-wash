import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(username, password, 'business');
    if (success) {
      navigate('/business/dashboard');
    } else {
      setError('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Labrise Car Wash</h1>
          <h2 className="text-lg text-gray-600 font-normal">Business Login</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mt-6"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <Link to="/super-admin" className="text-primary-500 hover:text-primary-600 transition-colors">
            Super Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;