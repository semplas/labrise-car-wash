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

      <div className="staff-list" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', gridTemplateColumns: 'none', grid: 'none'}}>
        {staff.map(staffMember => (
          <div key={staffMember.id} className={`staff-card ${!staffMember.isActive ? 'inactive' : ''}`} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8e8e8', background: 'white', minHeight: '100px', opacity: !staffMember.isActive ? 0.6 : 1}}>
            <div className="staff-main-info" style={{flex: 1, marginRight: '1.5rem'}}>
              <div className="staff-header-info" style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem'}}>
                <h3 style={{margin: '0', fontSize: '1.1rem', fontWeight: '600', color: '#2c3e50'}}>{staffMember.name}</h3>
                <span 
                  className="role-badge" 
                  style={{ backgroundColor: getRoleColor(staffMember.role), color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '500', textTransform: 'uppercase' }}
                >
                  {staffMember.role}
                </span>
                {!staffMember.isActive && <span style={{background: '#f39c12', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '500'}}>INACTIVE</span>}
              </div>
              <div className="staff-contact" style={{display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#34495e'}}>
                <div><span style={{color: '#7f8c8d'}}>Email:</span> {staffMember.email}</div>
                <div><span style={{color: '#7f8c8d'}}>Phone:</span> {staffMember.phone}</div>
                <div><span style={{color: '#7f8c8d'}}>Hired:</span> {new Date(staffMember.hireDate).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="staff-secondary-info" style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
              <div className="staff-performance" style={{textAlign: 'center'}}>
                <h4 style={{margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#7f8c8d', fontWeight: '500'}}>Performance</h4>
                <div className="performance-stats" style={{display: 'flex', gap: '1rem'}}>
                  <div className="perf-stat" style={{textAlign: 'center', padding: '0.5rem', background: '#f8f9fa', borderRadius: '8px', minWidth: '60px'}}>
                    <span style={{display: 'block', fontSize: '0.7rem', color: '#7f8c8d', marginBottom: '0.25rem'}}>Services</span>
                    <strong style={{fontSize: '1rem', color: '#2c3e50'}}>{staffMember.performance.servicesCompleted}</strong>
                  </div>
                  <div className="perf-stat" style={{textAlign: 'center', padding: '0.5rem', background: '#f8f9fa', borderRadius: '8px', minWidth: '60px'}}>
                    <span style={{display: 'block', fontSize: '0.7rem', color: '#7f8c8d', marginBottom: '0.25rem'}}>Rating</span>
                    <strong style={{fontSize: '1rem', color: '#f39c12'}}>{staffMember.performance.averageRating.toFixed(1)}★</strong>
                  </div>
                  <div className="perf-stat" style={{textAlign: 'center', padding: '0.5rem', background: '#f8f9fa', borderRadius: '8px', minWidth: '80px'}}>
                    <span style={{display: 'block', fontSize: '0.7rem', color: '#7f8c8d', marginBottom: '0.25rem'}}>Revenue</span>
                    <strong style={{fontSize: '0.9rem', color: '#27ae60'}}>UGX {staffMember.performance.totalRevenue.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="staff-actions" style={{display: 'flex', gap: '0.5rem', flexDirection: 'column'}}>
                <button onClick={() => handleEditStaff(staffMember)} style={{padding: '0.4rem 0.8rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '500', minWidth: '80px', transition: 'all 0.2s'}}>
                  Edit
                </button>
                <button 
                  onClick={() => handleToggleActive(staffMember.id, staffMember.isActive)}
                  style={{padding: '0.4rem 0.8rem', background: staffMember.isActive ? '#f39c12' : '#27ae60', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '500', minWidth: '80px', transition: 'all 0.2s'}}
                >
                  {staffMember.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleDeleteStaff(staffMember.id)} style={{padding: '0.4rem 0.8rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '500', minWidth: '80px', transition: 'all 0.2s'}}>
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