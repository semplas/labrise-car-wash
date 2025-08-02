import React, { useState, useEffect } from 'react';
import { staffService, Staff } from '../services/staffService';
import { useAuth } from '../context/AuthContext';

const StaffManagement: React.FC = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  useEffect(() => {
    if (!user?.businessId) return;
    loadStaff();
  }, [user]);

  const loadStaff = () => {
    if (!user?.businessId) return;
    setStaff(staffService.getStaff(user.businessId));
  };

  const handleAddStaff = (staffData: Omit<Staff, 'id' | 'performance'>) => {
    if (!user?.businessId) return;
    if (editingStaff) {
      staffService.updateStaff(user.businessId, editingStaff.id, staffData);
      setEditingStaff(null);
    } else {
      staffService.addStaff(user.businessId, staffData);
    }
    loadStaff();
    setShowAddForm(false);
  };

  const handleEditStaff = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setShowAddForm(true);
  };

  const handleDeleteStaff = (staffId: string) => {
    if (!user?.businessId) return;
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      staffService.deleteStaff(user.businessId, staffId);
      loadStaff();
    }
  };

  const handleToggleActive = (staffId: string, isActive: boolean) => {
    if (!user?.businessId) return;
    staffService.updateStaff(user.businessId, staffId, { isActive: !isActive });
    loadStaff();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return '#e74c3c';
      case 'washer': return '#3498db';
      case 'cashier': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const activeStaff = staff.filter(s => s.isActive);
  const inactiveStaff = staff.filter(s => !s.isActive);

  return (
    <div className="staff-management">
      <div className="staff-header">
        <h2>Staff Management</h2>
        <button onClick={() => setShowAddForm(true)} className="create-btn">
          Add Staff
        </button>
      </div>

      <div className="staff-stats">
        <div className="staff-stat">
          <h3>Total Staff</h3>
          <p>{staff.length}</p>
        </div>
        <div className="staff-stat">
          <h3>Active</h3>
          <p>{activeStaff.length}</p>
        </div>
        <div className="staff-stat">
          <h3>Managers</h3>
          <p>{staff.filter(s => s.role === 'manager').length}</p>
        </div>
      </div>

      <div className="staff-list">
        {staff.map(staffMember => (
          <div key={staffMember.id} className={`staff-card ${!staffMember.isActive ? 'inactive' : ''}`}>
            <div className="staff-main-info">
              <div className="staff-header-info">
                <h3>{staffMember.name}</h3>
                <span 
                  className="role-badge" 
                  style={{ backgroundColor: getRoleColor(staffMember.role) }}
                >
                  {staffMember.role}
                </span>
              </div>
              <div className="staff-contact">
                <p><strong>Email:</strong> {staffMember.email}</p>
                <p><strong>Phone:</strong> {staffMember.phone}</p>
                <p><strong>Hire Date:</strong> {new Date(staffMember.hireDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="staff-secondary-info">
              <div className="staff-performance">
                <h4>Performance</h4>
                <div className="performance-stats">
                  <div className="perf-stat">
                    <span>Services</span>
                    <strong>{staffMember.performance.servicesCompleted}</strong>
                  </div>
                  <div className="perf-stat">
                    <span>Rating</span>
                    <strong>{staffMember.performance.averageRating.toFixed(1)}★</strong>
                  </div>
                  <div className="perf-stat">
                    <span>Revenue</span>
                    <strong>UGX {staffMember.performance.totalRevenue.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="staff-actions">
                <button onClick={() => handleEditStaff(staffMember)} className="edit-btn">
                  Edit
                </button>
                <button 
                  onClick={() => handleToggleActive(staffMember.id, staffMember.isActive)}
                  className={staffMember.isActive ? 'deactivate-btn' : 'activate-btn'}
                >
                  {staffMember.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleDeleteStaff(staffMember.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <StaffForm
          onSubmit={handleAddStaff}
          onClose={() => {
            setShowAddForm(false);
            setEditingStaff(null);
          }}
          initialData={editingStaff || undefined}
        />
      )}
    </div>
  );
};

const StaffForm: React.FC<{
  onSubmit: (data: Omit<Staff, 'id' | 'performance'>) => void;
  onClose: () => void;
  initialData?: Staff;
}> = ({ onSubmit, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    role: initialData?.role || 'washer' as const,
    isActive: initialData?.isActive ?? true,
    hireDate: initialData?.hireDate || Date.now()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{initialData ? 'Edit Staff' : 'Add New Staff'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
              >
                <option value="washer">Washer</option>
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div className="form-group">
              <label>Hire Date</label>
              <input
                type="date"
                value={new Date(formData.hireDate).toISOString().split('T')[0]}
                onChange={(e) => setFormData({...formData, hireDate: new Date(e.target.value).getTime()})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              Active Staff Member
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">{initialData ? 'Update' : 'Add'} Staff</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffManagement;