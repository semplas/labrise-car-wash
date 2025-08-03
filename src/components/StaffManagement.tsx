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
    <div className="py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Staff Management</h2>
        <button onClick={() => setShowAddForm(true)} className="btn-success flex items-center gap-2">
          <i className="fas fa-plus"></i>
          Add Staff
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Staff</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <i className="fas fa-users text-white"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-500">{staff.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Active</h3>
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <i className="fas fa-check text-white"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-500">{activeStaff.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Managers</h3>
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
              <i className="fas fa-crown text-white"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-500">{staff.filter(s => s.role === 'manager').length}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100">
        <table className="w-full min-w-[900px] bg-white">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="p-4 text-left font-semibold text-gray-700 text-sm">Name</th>
              <th className="p-4 text-left font-semibold text-gray-700 text-sm">Role</th>
              <th className="p-4 text-left font-semibold text-gray-700 text-sm">Contact</th>
              <th className="p-4 text-center font-semibold text-gray-700 text-sm">Status</th>
              <th className="p-4 text-center font-semibold text-gray-700 text-sm min-w-[120px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((staffMember, index) => (
              <tr key={staffMember.id} className={`${index < staff.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors ${!staffMember.isActive ? 'opacity-60' : ''}`}>
                <td className="p-4 font-semibold text-gray-800 text-sm">
                  <div>{staffMember.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <i className="fas fa-envelope mr-2"></i>
                    {staffMember.email}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white capitalize ${
                    staffMember.role === 'manager' ? 'bg-red-500' :
                    staffMember.role === 'washer' ? 'bg-blue-500' :
                    staffMember.role === 'cashier' ? 'bg-green-500' : 'bg-gray-500'
                  }`}>
                    {staffMember.role}
                  </span>
                </td>
                <td className="p-4 text-gray-600 text-sm">
                  <div className="flex items-center">
                    <i className="fas fa-phone mr-2 text-gray-400"></i>
                    {staffMember.phone}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                    staffMember.isActive ? 'bg-green-500' : 'bg-gray-500'
                  }`}>
                    {staffMember.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-center whitespace-nowrap">
                  <button onClick={() => handleEditStaff(staffMember)} className="inline-block p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2 w-7 h-7 text-xs" title="Edit">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    onClick={() => handleToggleActive(staffMember.id, staffMember.isActive)} 
                    className={`inline-block p-2 text-white rounded transition-colors w-7 h-7 text-xs ${
                      staffMember.isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'
                    }`}
                    title={staffMember.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <i className={`fas ${staffMember.isActive ? 'fa-pause' : 'fa-play'}`}></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{initialData ? 'Edit Staff' : 'Add New Staff'}</h2>
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
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{initialData ? 'Update' : 'Add'} Staff</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffManagement;