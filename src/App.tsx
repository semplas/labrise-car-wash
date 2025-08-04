import React, { useEffect } from 'react';
import './styles/App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { initializeDemoData } from './utils/demoData';
import Login from './pages/Auth/Login';
import SuperAdminLogin from './pages/Auth/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import BusinessDashboard from './pages/Business/Dashboard';

function App() {
  useEffect(() => {
    initializeDemoData();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/super-admin" element={<SuperAdminLogin />} />
            <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/business/dashboard" element={<BusinessDashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;