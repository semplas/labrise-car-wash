import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Business {
  id: string;
  businessName: string;
  ownerName: string;
  username: string;
  isActive: boolean;
  createdAt: number;
}

const SuperAdminDashboard: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.type !== 'super_admin') {
      navigate('/super-admin');
      return;
    }
    loadBusinesses();
  }, [user, navigate]);

  const loadBusinesses = () => {
    const stored = localStorage.getItem('labrise_businesses');
    if (stored) {
      setBusinesses(JSON.parse(stored));
    }
  };

  const createBusiness = (formData: any) => {
    const newBusiness: Business = {
      id: Date.now().toString(),
      businessName: formData.businessName,
      ownerName: formData.ownerName,
      username: formData.username,
      isActive: true,
      createdAt: Date.now()
    };

    const updatedBusinesses = [...businesses, { ...newBusiness, password: formData.password }];
    localStorage.setItem('labrise_businesses', JSON.stringify(updatedBusinesses));
    setBusinesses(updatedBusinesses);
    setShowCreateForm(false);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Super Admin Dashboard</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="stats-row">
          <div className="stat-card">
            <h3>Total Businesses</h3>
            <p>{businesses.length}</p>
          </div>
          <div className="stat-card">
            <h3>Active Businesses</h3>
            <p>{businesses.filter(b => b.isActive).length}</p>
          </div>
        </div>

        <div className="businesses-section">
          <div className="section-header">
            <h2>Businesses</h2>
            <button onClick={() => setShowCreateForm(true)} className="create-btn">
              Create Business
            </button>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px'}}>
            {businesses.map(business => (
              <div key={business.id} className="business-card">
                <h3>{business.businessName}</h3>
                <p>Owner: {business.ownerName}</p>
                <p>Username: {business.username}</p>
                <p>Status: {business.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            ))}
          </div>
        </div>

        {showCreateForm && (
          <CreateBusinessModal 
            onClose={() => setShowCreateForm(false)}
            onCreate={createBusiness}
          />
        )}
      </div>
    </div>
  );
};

const CreateBusinessModal: React.FC<{
  onClose: () => void;
  onCreate: (data: any) => void;
}> = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    username: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Create Business Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Business Name</label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({...formData, businessName: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Owner Name</label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;