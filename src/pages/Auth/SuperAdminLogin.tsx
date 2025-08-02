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
    <div className="login-container">
      <div className="login-card">
        <h1>Labrise Car Wash</h1>
        <h2>{isSetup ? 'Super Admin Login' : 'Setup Super Admin'}</h2>
        
        <form onSubmit={isSetup ? handleLogin : handleSetup}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div className="error">{error}</div>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : (isSetup ? 'Login' : 'Setup Admin')}
          </button>
        </form>
        
        <div className="admin-link">
          <Link to="/login">Business Login</Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;