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
  password?: string;
}

const SuperAdminDashboard: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [showResetPassword, setShowResetPassword] = useState<Business | null>(null);
  const [showAnalytics, setShowAnalytics] = useState<Business | null>(null);
  const [showSystemPanel, setShowSystemPanel] = useState(false);
  const [analytics, setAnalytics] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [notifications, setNotifications] = useState<Array<{id: string; type: string; title: string; message: string; timestamp: number; businessId: string}>>([]);
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
      const businessList = JSON.parse(stored);
      setBusinesses(businessList);
      loadAnalytics(businessList);
    }
  };

  const loadAnalytics = (businessList: Business[]) => {
    const analyticsData: any = {};
    let totalRevenue = 0;
    let totalServices = 0;
    let totalCustomers = 0;
    
    businessList.forEach(business => {
      const queue = JSON.parse(localStorage.getItem(`labrise_queue_${business.id}`) || '[]');
      const cars = JSON.parse(localStorage.getItem(`labrise_cars_${business.id}`) || '[]');
      const services = JSON.parse(localStorage.getItem(`labrise_services_${business.id}`) || '[]');
      const customers = JSON.parse(localStorage.getItem(`labrise_customers_${business.id}`) || '[]');
      
      const completedItems = queue.filter((item: any) => item.status === 'completed');
      const businessRevenue = completedItems.reduce((sum: number, item: any) => {
        return sum + item.serviceIds.reduce((serviceSum: number, serviceId: string) => {
          const service = services.find((s: any) => s.id === serviceId);
          return serviceSum + (service?.amount || 0);
        }, 0);
      }, 0);
      
      const lastWeekRevenue = completedItems
        .filter((item: any) => item.completedTime && item.completedTime >= (Date.now() - 7 * 24 * 60 * 60 * 1000))
        .reduce((sum: number, item: any) => {
          return sum + item.serviceIds.reduce((serviceSum: number, serviceId: string) => {
            const service = services.find((s: any) => s.id === serviceId);
            return serviceSum + (service?.amount || 0);
          }, 0);
        }, 0);
      
      const healthScore = Math.min(100, Math.max(0, 
        (business.isActive ? 40 : 0) + 
        (completedItems.length > 0 ? 30 : 0) + 
        (customers.length > 0 ? 20 : 0) + 
        (lastWeekRevenue > 0 ? 10 : 0)
      ));
      
      analyticsData[business.id] = {
        revenue: businessRevenue,
        services: completedItems.length,
        customers: customers.length,
        cars: cars.length,
        growth: Math.floor(Math.random() * 20) + 5,
        healthScore,
        lastWeekRevenue,
        status: healthScore >= 80 ? 'excellent' : healthScore >= 60 ? 'good' : healthScore >= 40 ? 'warning' : 'critical'
      };
      
      totalRevenue += businessRevenue;
      totalServices += completedItems.length;
      totalCustomers += customers.length;
    });
    
    analyticsData.totals = {
      revenue: totalRevenue,
      services: totalServices,
      customers: totalCustomers,
      avgGrowth: businessList.length > 0 ? Math.floor(totalRevenue / businessList.length) : 0
    };
    
    setAnalytics(analyticsData);
    
    // Generate notifications based on business health
    const newNotifications: any[] = [];
    businessList.forEach(business => {
      const businessAnalytics = analyticsData[business.id];
      if (!business.isActive) {
        newNotifications.push({
          id: `inactive-${business.id}`,
          type: 'warning',
          title: 'Business Inactive',
          message: `${business.businessName} is currently inactive`,
          timestamp: Date.now(),
          businessId: business.id
        });
      }
      if (businessAnalytics?.healthScore < 40) {
        newNotifications.push({
          id: `health-${business.id}`,
          type: 'error',
          title: 'Poor Business Health',
          message: `${business.businessName} has low health score (${businessAnalytics.healthScore}%)`,
          timestamp: Date.now(),
          businessId: business.id
        });
      }
      if (businessAnalytics?.services === 0) {
        newNotifications.push({
          id: `noservices-${business.id}`,
          type: 'info',
          title: 'No Services Completed',
          message: `${business.businessName} has not completed any services yet`,
          timestamp: Date.now(),
          businessId: business.id
        });
      }
    });
    setNotifications(newNotifications.slice(0, 5)); // Keep only latest 5
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

  const updateBusiness = (formData: any) => {
    if (!editingBusiness) return;
    const updatedBusinesses = businesses.map(b => 
      b.id === editingBusiness.id 
        ? { ...b, ...formData }
        : b
    );
    localStorage.setItem('labrise_businesses', JSON.stringify(updatedBusinesses));
    setBusinesses(updatedBusinesses);
    setEditingBusiness(null);
  };

  const toggleBusinessStatus = (businessId: string) => {
    const updatedBusinesses = businesses.map(b => 
      b.id === businessId ? { ...b, isActive: !b.isActive } : b
    );
    localStorage.setItem('labrise_businesses', JSON.stringify(updatedBusinesses));
    setBusinesses(updatedBusinesses);
  };

  const deleteBusiness = (businessId: string) => {
    if (window.confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      const updatedBusinesses = businesses.filter(b => b.id !== businessId);
      localStorage.setItem('labrise_businesses', JSON.stringify(updatedBusinesses));
      setBusinesses(updatedBusinesses);
    }
  };

  const resetPassword = (businessId: string, newPassword: string) => {
    const updatedBusinesses = businesses.map(b => 
      b.id === businessId ? { ...b, password: newPassword } : b
    );
    localStorage.setItem('labrise_businesses', JSON.stringify(updatedBusinesses));
    setBusinesses(updatedBusinesses);
    setShowResetPassword(null);
  };

  const exportSystemData = () => {
    const systemData = {
      businesses,
      analytics,
      exportDate: new Date().toISOString(),
      systemInfo: {
        totalBusinesses: businesses.length,
        activeBusinesses: businesses.filter(b => b.isActive).length,
        systemHealth: businesses.length > 0 ? Math.round((businesses.filter(b => b.isActive).length / businesses.length) * 100) : 100
      }
    };
    
    const blob = new Blob([JSON.stringify(systemData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `labrise-system-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFilteredAndSortedBusinesses = () => {
    let filtered = businesses;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => 
        statusFilter === 'active' ? b.isActive : !b.isActive
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.businessName.localeCompare(b.businessName);
      }
      return b.createdAt - a.createdAt;
    });
    
    return filtered;
  };

  const filteredBusinesses = getFilteredAndSortedBusinesses();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white px-3 py-4 shadow-lg border-b border-gray-200">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
              <i className="fas fa-crown"></i>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Super Admin Dashboard</h1>
              <p className="text-sm text-gray-500">System Management Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-gray-800 relative">
                <i className="fas fa-bell text-lg"></i>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              {notifications.length > 0 && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">System Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map(notification => (
                      <div key={notification.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'error' ? 'bg-red-500' :
                            notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setShowSystemPanel(true)} className="btn-secondary flex items-center gap-2">
              <i className="fas fa-cogs"></i>
              <span className="hidden sm:inline">System</span>
            </button>
            <button onClick={logout} className="btn-danger flex items-center gap-2">
              <i className="fas fa-sign-out-alt"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Businesses</h3>
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <i className="fas fa-building text-white"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-500">{businesses.length}</p>
            <p className="text-sm text-gray-500 mt-1">Registered businesses</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Active Businesses</h3>
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <i className="fas fa-check-circle text-white"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-green-500">{businesses.filter(b => b.isActive).length}</p>
            <p className="text-sm text-gray-500 mt-1">Currently operational</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Inactive Businesses</h3>
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                <i className="fas fa-pause-circle text-white"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-red-500">{businesses.filter(b => !b.isActive).length}</p>
            <p className="text-sm text-gray-500 mt-1">Suspended accounts</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">System Health</h3>
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                <i className="fas fa-heartbeat text-white"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-500">{businesses.length > 0 ? Math.round((businesses.filter(b => b.isActive).length / businesses.length) * 100) : 100}%</p>
            <p className="text-sm text-gray-500 mt-1">Active business ratio</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-gray-800">Businesses ({filteredBusinesses.length})</h2>
            <button onClick={() => setShowCreateForm(true)} className="btn-success flex items-center gap-2">
              <i className="fas fa-plus"></i>
              Create Business
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by name, owner, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>

          {filteredBusinesses.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-building text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No businesses created yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Business Name</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Owner</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Username</th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">Status</th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">Revenue</th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">Services</th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">Customers</th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">Health</th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">Created</th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm min-w-[160px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBusinesses.map((business, index) => (
                    <tr key={business.id} className={`${index < filteredBusinesses.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}>
                      <td className="p-4 font-semibold text-gray-800 text-sm">{business.businessName}</td>
                      <td className="p-4 text-gray-600 text-sm">{business.ownerName}</td>
                      <td className="p-4 text-gray-600 text-sm">{business.username}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          business.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {business.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-center text-sm font-semibold text-green-600">
                        UGX {analytics[business.id]?.revenue?.toLocaleString() || 0}
                      </td>
                      <td className="p-4 text-center text-gray-600 text-sm">
                        {analytics[business.id]?.services || 0}
                      </td>
                      <td className="p-4 text-center text-gray-600 text-sm">
                        {analytics[business.id]?.customers || 0}
                      </td>
                      <td className="p-4 text-center text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            analytics[business.id]?.status === 'excellent' ? 'bg-green-500' :
                            analytics[business.id]?.status === 'good' ? 'bg-blue-500' :
                            analytics[business.id]?.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-xs font-medium">
                            {analytics[business.id]?.healthScore || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center text-gray-500 text-sm">
                        {new Date(business.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <button onClick={() => setEditingBusiness(business)} className="inline-block p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-1 w-7 h-7 text-xs" title="Edit">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={() => toggleBusinessStatus(business.id)} className={`inline-block p-2 text-white rounded transition-colors mr-1 w-7 h-7 text-xs ${
                          business.isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'
                        }`} title={business.isActive ? 'Deactivate' : 'Activate'}>
                          <i className={`fas ${business.isActive ? 'fa-pause' : 'fa-play'}`}></i>
                        </button>
                        <button onClick={() => setShowResetPassword(business)} className="inline-block p-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors mr-1 w-7 h-7 text-xs" title="Reset Password">
                          <i className="fas fa-key"></i>
                        </button>
                        <button onClick={() => setShowAnalytics(business)} className="inline-block p-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors mr-1 w-7 h-7 text-xs" title="View Analytics">
                          <i className="fas fa-chart-line"></i>
                        </button>
                        <button onClick={() => deleteBusiness(business.id)} className="inline-block p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors w-7 h-7 text-xs" title="Delete">
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showCreateForm && (
          <BusinessModal 
            onClose={() => setShowCreateForm(false)}
            onSubmit={createBusiness}
            title="Create Business Account"
          />
        )}

        {editingBusiness && (
          <BusinessModal 
            onClose={() => setEditingBusiness(null)}
            onSubmit={updateBusiness}
            initialData={editingBusiness}
            title="Edit Business"
          />
        )}

        {showResetPassword && (
          <ResetPasswordModal 
            business={showResetPassword}
            onClose={() => setShowResetPassword(null)}
            onReset={resetPassword}
          />
        )}

        {showAnalytics && (
          <BusinessAnalyticsModal 
            business={showAnalytics}
            analytics={analytics[showAnalytics.id] || {}}
            onClose={() => setShowAnalytics(null)}
          />
        )}

        {showSystemPanel && (
          <SystemManagementModal 
            onClose={() => setShowSystemPanel(false)}
            onExport={exportSystemData}
            businesses={businesses}
          />
        )}
      </div>
    </div>
  );
};

const BusinessModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Business;
  title: string;
}> = ({ onClose, onSubmit, initialData, title }) => {
  const [formData, setFormData] = useState({
    businessName: initialData?.businessName || '',
    ownerName: initialData?.ownerName || '',
    username: initialData?.username || '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{title}</h2>
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
          {!initialData && (
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          )}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{initialData ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ResetPasswordModal: React.FC<{
  business: Business;
  onClose: () => void;
  onReset: (businessId: string, password: string) => void;
}> = ({ business, onClose, onReset }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    onReset(business.id, password);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Reset Password</h2>
        <p className="text-gray-600 mb-4">Reset password for <strong>{business.businessName}</strong></p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Reset Password</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BusinessAnalyticsModal: React.FC<{
  business: Business;
  analytics: any;
  onClose: () => void;
}> = ({ business, analytics, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{business.businessName} - Analytics</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-700">Total Revenue</h3>
                <i className="fas fa-dollar-sign text-green-500"></i>
              </div>
              <p className="text-2xl font-bold text-green-600">UGX {analytics.revenue?.toLocaleString() || 0}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-700">Services Completed</h3>
                <i className="fas fa-cogs text-blue-500"></i>
              </div>
              <p className="text-2xl font-bold text-blue-600">{analytics.services || 0}</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-orange-700">Total Customers</h3>
                <i className="fas fa-users text-orange-500"></i>
              </div>
              <p className="text-2xl font-bold text-orange-600">{analytics.customers || 0}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-purple-700">Cars Registered</h3>
                <i className="fas fa-car text-purple-500"></i>
              </div>
              <p className="text-2xl font-bold text-purple-600">{analytics.cars || 0}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Owner:</span> {business.ownerName}</p>
                <p><span className="font-medium">Username:</span> {business.username}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    business.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {business.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
                <p><span className="font-medium">Created:</span> {new Date(business.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600">Growth Rate</span>
                    <span className="text-sm font-semibold text-green-600">+{analytics.growth || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: `${Math.min(analytics.growth || 0, 100)}%`}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600">Avg Revenue per Service</span>
                    <span className="text-sm font-semibold text-blue-600">
                      UGX {analytics.services > 0 ? Math.floor(analytics.revenue / analytics.services).toLocaleString() : 0}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600">Cars per Customer</span>
                    <span className="text-sm font-semibold text-purple-600">
                      {analytics.customers > 0 ? (analytics.cars / analytics.customers).toFixed(1) : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SystemManagementModal: React.FC<{
  onClose: () => void;
  onExport: () => void;
  businesses: Business[];
}> = ({ onClose, onExport, businesses }) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [systemLogs] = useState([
    { id: 1, timestamp: Date.now() - 3600000, action: 'Business Created', details: 'New business account created', type: 'info' },
    { id: 2, timestamp: Date.now() - 7200000, action: 'System Backup', details: 'Automated system backup completed', type: 'success' },
    { id: 3, timestamp: Date.now() - 10800000, action: 'Login Attempt', details: 'Failed super admin login attempt', type: 'warning' },
    { id: 4, timestamp: Date.now() - 14400000, action: 'Business Deactivated', details: 'Business account suspended', type: 'error' }
  ]);

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">System Management</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">System Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Maintenance Mode</span>
                  <button
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      maintenanceMode ? 'bg-red-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Auto Backup</span>
                  <span className="text-sm text-green-600 font-medium">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">System Status</span>
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Database Management</h3>
              <div className="space-y-3">
                <button onClick={onExport} className="w-full btn-primary flex items-center justify-center gap-2">
                  <i className="fas fa-download"></i>
                  Export System Data
                </button>
                <button className="w-full btn-secondary flex items-center justify-center gap-2">
                  <i className="fas fa-database"></i>
                  Backup Database
                </button>
                <button className="w-full btn-secondary flex items-center justify-center gap-2">
                  <i className="fas fa-broom"></i>
                  Clean Logs
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">System Logs</h3>
            <div className="max-h-64 overflow-y-auto scrollbar-hide space-y-2">
              {systemLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.type === 'success' ? 'bg-green-500' :
                      log.type === 'warning' ? 'bg-yellow-500' :
                      log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{log.action}</p>
                      <p className="text-xs text-gray-500">{log.details}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;