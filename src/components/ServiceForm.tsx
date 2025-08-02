import React, { useState } from 'react';
import { Service } from '../services/serviceService';

interface ServiceFormProps {
  onSubmit: (serviceData: Omit<Service, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  initialData?: Service;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ onSubmit, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    amount: initialData?.amount || 0,
    duration: initialData?.duration || 30,
    category: initialData?.category || 'basic' as const,
    carSizes: initialData?.carSizes || ['compact', 'suv', 'truck'] as ('compact' | 'suv' | 'truck')[]
  });

  const handleCarSizeChange = (size: 'compact' | 'suv' | 'truck') => {
    setFormData(prev => ({
      ...prev,
      carSizes: prev.carSizes.includes(size)
        ? prev.carSizes.filter(s => s !== size)
        : [...prev.carSizes, size]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.carSizes.length === 0) {
      alert('Please select at least one car size');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{initialData ? 'Edit Service' : 'Add New Service'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Service Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Amount (UGX)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                required
              />
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value as any})}
            >
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="package">Package</option>
            </select>
          </div>

          <div className="form-group">
            <label>Car Sizes</label>
            <div className="checkbox-group">
              {(['compact', 'suv', 'truck'] as const).map(size => (
                <label key={size} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.carSizes.includes(size)}
                    onChange={() => handleCarSizeChange(size)}
                  />
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">{initialData ? 'Update' : 'Add'} Service</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;