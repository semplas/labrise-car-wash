import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Auth/Login';
import SuperAdminLogin from './pages/Auth/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import BusinessDashboard from './pages/Business/Dashboard';
import InstallPrompt from './components/InstallPrompt';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <InstallPrompt />
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