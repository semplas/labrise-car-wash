import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SuperAdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const superAdmin = localStorage.getItem('labrise_super_admin');
    setIsSetup(!!superAdmin);
  }, []);

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      const superAdmin = { username, password, createdAt: Date.now() };
      localStorage.setItem('labrise_super_admin', JSON.stringify(superAdmin));
      localStorage.setItem('labrise_businesses', JSON.stringify([]));
      setIsSetup(true);
      setError('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(username, password, 'super_admin');
    if (success) {
      navigate('/super-admin/dashboard');
    } else {
      setError('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-crown text-white text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Labrise Car Wash</h1>
          <h2 className="text-lg text-gray-600 font-normal">{isSetup ? 'Super Admin Login' : 'Setup Super Admin'}</h2>
        </div>
        
        <form onSubmit={isSetup ? handleLogin : handleSetup} className="space-y-4">
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
            className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mt-6 flex items-center justify-center gap-2"
          >
            {loading && <div className="loading-spinner"></div>}
            {loading ? 'Processing...' : (isSetup ? 'Login' : 'Setup Admin')}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <Link to="/login" className="text-primary-500 hover:text-primary-600 transition-colors">
            Business Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;