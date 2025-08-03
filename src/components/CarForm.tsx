import React, { useState } from 'react';
import { Car } from '../services/carService';

interface CarFormProps {
  onSubmit: (carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  initialData?: Car;
}

const CarForm: React.FC<CarFormProps> = ({ onSubmit, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    licensePlate: initialData?.licensePlate || '',
    make: initialData?.make || '',
    color: initialData?.color || '',
    owner: {
      name: initialData?.owner.name || '',
      address: initialData?.owner.address || '',
      phone: initialData?.owner.phone || ''
    },
    images: initialData?.images || []
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 4) {
      alert('Maximum 4 images allowed');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, base64]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{initialData ? 'Edit Car' : 'Add New Car'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>License Plate</label>
            <input
              type="text"
              value={formData.licensePlate}
              onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Make</label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => setFormData({...formData, make: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Owner Name</label>
            <input
              type="text"
              value={formData.owner.name}
              onChange={(e) => setFormData({
                ...formData,
                owner: {...formData.owner, name: e.target.value}
              })}
              required
            />
          </div>

          <div className="form-group">
            <label>Owner Address</label>
            <textarea
              value={formData.owner.address}
              onChange={(e) => setFormData({
                ...formData,
                owner: {...formData.owner, address: e.target.value}
              })}
              required
            />
          </div>

          <div className="form-group">
            <label>Owner Phone</label>
            <input
              type="tel"
              value={formData.owner.phone}
              onChange={(e) => setFormData({
                ...formData,
                owner: {...formData.owner, phone: e.target.value}
              })}
              required
            />
          </div>

          <div className="form-group">
            <label>Car Images (Max 4)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={formData.images.length >= 4}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            <div className="image-preview">
              {formData.images.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image} alt={`Car ${index + 1}`} />
                  <button type="button" onClick={() => removeImage(index)}>×</button>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{initialData ? 'Update' : 'Add'} Car</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarForm;