import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BusinessDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user || user.type !== 'business') {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{user.businessName} - Dashboard</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome to your Car Wash Management System</h2>
          <p>Manage your cars, services, and customers from this dashboard.</p>
        </div>

        <div className="quick-actions">
          <div className="action-card">
            <h3>Cars</h3>
            <p>No cars added yet</p>
            <button className="action-btn">Add Car</button>
          </div>
          
          <div className="action-card">
            <h3>Services</h3>
            <p>No services added yet</p>
            <button className="action-btn">Add Service</button>
          </div>
          
          <div className="action-card">
            <h3>Customers</h3>
            <p>No customers added yet</p>
            <button className="action-btn">Add Customer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;