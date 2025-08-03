import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SuperAdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [errors, setErrors] = useState({ username: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = { username: '', password: '' };
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  useEffect(() => {
    const superAdmin = localStorage.getItem('labrise_super_admin');
    setIsSetup(!!superAdmin);
  }, []);

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const superAdmin = { username, password, createdAt: Date.now() };
    localStorage.setItem('labrise_super_admin', JSON.stringify(superAdmin));
    localStorage.setItem('labrise_businesses', JSON.stringify([]));
    setIsSetup(true);
    setError('');
    setErrors({ username: '', password: '' });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setErrors({ username: '', password: '' });

    const success = await login(username, password, 'super_admin');
    if (success) {
      navigate('/super-admin/dashboard');
    } else {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1607860108855-64acf2078ed9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative z-10 backdrop-blur-sm bg-white/95">
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
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
              }`}
              placeholder="Enter admin username"
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
              }`}
              placeholder={isSetup ? "Create strong password" : "Enter admin password"}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
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
            {loading && <i className="fas fa-cog animate-spin"></i>}
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