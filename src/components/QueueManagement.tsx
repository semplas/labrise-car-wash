import React, { useState, useEffect } from 'react';
import { queueService, QueueItem } from '../services/queueService';
import { carService, Car } from '../services/carService';
import { serviceService, Service } from '../services/serviceService';
import { staffService, Staff } from '../services/staffService';
import { useAuth } from '../context/AuthContext';
import { notifyQueueUpdate, notifyServiceComplete } from '../services/pwaService';

const QueueManagement: React.FC = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState({ start: '', complete: '', remove: '' });

  useEffect(() => {
    if (!user?.businessId) return;
    loadData();
  }, [user]);

  const loadData = () => {
    if (!user?.businessId) return;
    setQueue(queueService.getQueue(user.businessId));
    setCars(carService.getCars(user.businessId));
    setServices(serviceService.getServices(user.businessId));
    setStaff(staffService.getStaff(user.businessId));
  };

  const getCarById = (carId: string) => cars.find(c => c.id === carId);
  const getServiceById = (serviceId: string) => services.find(s => s.id === serviceId);

  const handleStartService = async (itemId: string) => {
    if (!user?.businessId) return;
    setLoading(prev => ({ ...prev, start: itemId }));
    
    setTimeout(() => {
      const item = queue.find(q => q.id === itemId);
      const car = item ? getCarById(item.carId) : null;
      queueService.startService(user.businessId!, itemId);
      if (car) {
        notifyQueueUpdate(`Service started for ${car.licensePlate}`);
      }
      loadData();
      setLoading(prev => ({ ...prev, start: '' }));
    }, 500);
  };

  const handleCompleteService = async (itemId: string) => {
    if (!user?.businessId) return;
    setLoading(prev => ({ ...prev, complete: itemId }));
    
    setTimeout(() => {
      const item = queue.find(q => q.id === itemId);
      const car = item ? getCarById(item.carId) : null;
      queueService.completeService(user.businessId!, itemId);
      if (car) {
        notifyServiceComplete(car.licensePlate);
      }
      loadData();
      setLoading(prev => ({ ...prev, complete: '' }));
    }, 500);
  };

  const handleRemoveFromQueue = async (itemId: string) => {
    if (!user?.businessId) return;
    if (window.confirm('Remove this item from queue?')) {
      setLoading(prev => ({ ...prev, remove: itemId }));
      
      setTimeout(() => {
        queueService.removeFromQueue(user.businessId!, itemId);
        loadData();
        setLoading(prev => ({ ...prev, remove: '' }));
      }, 300);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return '#f39c12';
      case 'in_progress': return '#3498db';
      case 'completed': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const waitingItems = queue.filter(item => item.status === 'waiting');
  const inProgressItems = queue.filter(item => item.status === 'in_progress');
  const completedItems = queue.filter(item => item.status === 'completed');

  return (
    <div className="py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Queue Management</h2>
        <button onClick={() => setShowAddForm(true)} className="btn-success flex items-center gap-2">
          <i className="fas fa-plus"></i>
          Add to Queue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Waiting</h3>
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
              <i className="fas fa-clock text-white"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-500">{waitingItems.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">In Progress</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <i className="fas fa-cog fa-spin text-white"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-500">{inProgressItems.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Completed Today</h3>
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <i className="fas fa-check text-white"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-500">{completedItems.length}</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Waiting Queue ({waitingItems.length})</h3>
        {waitingItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <i className="fas fa-clock text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No items in waiting queue</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100 mb-8">
            <table className="w-full min-w-[700px] bg-white">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="p-4 text-left font-semibold text-gray-700 text-sm">Car</th>
                  <th className="p-4 text-left font-semibold text-gray-700 text-sm">Services</th>
                  <th className="p-4 text-center font-semibold text-gray-700 text-sm">Est. Time</th>
                  <th className="p-4 text-left font-semibold text-gray-700 text-sm">Assign Staff</th>
                  <th className="p-4 text-center font-semibold text-gray-700 text-sm min-w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {waitingItems.map((item, index) => {
                  const car = getCarById(item.carId);
                  return (
                    <tr key={item.id} className={`${index < waitingItems.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}>
                      <td className="p-4 font-semibold text-gray-800 text-sm">{car?.licensePlate || 'Unknown Car'}</td>
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap">
                          {item.serviceIds.map(serviceId => {
                            const service = getServiceById(serviceId);
                            return (
                              <span key={serviceId} className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                {service?.name || 'Unknown'}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-4 text-center text-gray-600 text-sm">{item.estimatedTime} min</td>
                      <td className="p-4">
                        {item.assignedStaff ? (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            {staff.find(s => s.id === item.assignedStaff)?.name || 'Unknown Staff'}
                          </span>
                        ) : (
                          <select 
                            className="px-3 py-2 border border-gray-300 rounded text-sm w-32"
                            onChange={(e) => {
                              if (e.target.value && user?.businessId) {
                                queueService.assignStaff(user.businessId, item.id, e.target.value);
                                loadData();
                              }
                            }}
                          >
                            <option value="">Select Staff</option>
                            {staff.filter(s => s.isActive).map(staffMember => (
                              <option key={staffMember.id} value={staffMember.id}>
                                {staffMember.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <button 
                          onClick={() => handleStartService(item.id)} 
                          disabled={loading.start === item.id}
                          className="inline-block p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors mr-2 w-7 h-7 text-xs disabled:bg-gray-400" 
                          title="Start"
                        >
                          {loading.start === item.id ? <i className="fas fa-cog animate-spin"></i> : <i className="fas fa-play"></i>}
                        </button>
                        <button 
                          onClick={() => handleRemoveFromQueue(item.id)} 
                          disabled={loading.remove === item.id}
                          className="inline-block p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors w-7 h-7 text-xs disabled:bg-gray-400" 
                          title="Remove"
                        >
                          {loading.remove === item.id ? <i className="fas fa-cog animate-spin"></i> : <i className="fas fa-trash"></i>}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">In Progress ({inProgressItems.length})</h3>
        {inProgressItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <i className="fas fa-cog text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No items in progress</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100">
            <table className="w-full min-w-[600px] bg-white">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="p-4 text-left font-semibold text-gray-700 text-sm">Car</th>
                  <th className="p-4 text-left font-semibold text-gray-700 text-sm">Services</th>
                  <th className="p-4 text-center font-semibold text-gray-700 text-sm">Elapsed</th>
                  <th className="p-4 text-center font-semibold text-gray-700 text-sm min-w-[80px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inProgressItems.map((item, index) => {
                  const car = getCarById(item.carId);
                  const elapsed = item.startTime ? Math.floor((Date.now() - item.startTime) / 60000) : 0;
                  return (
                    <tr key={item.id} className={`${index < inProgressItems.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}>
                      <td className="p-4 font-semibold text-gray-800 text-sm">{car?.licensePlate || 'Unknown Car'}</td>
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap">
                          {item.serviceIds.map(serviceId => {
                            const service = getServiceById(serviceId);
                            return (
                              <span key={serviceId} className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                {service?.name || 'Unknown'}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-4 text-center text-gray-600 text-sm">{elapsed} min</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleCompleteService(item.id)} 
                          disabled={loading.complete === item.id}
                          className="inline-block p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors w-7 h-7 text-xs disabled:bg-gray-400" 
                          title="Complete"
                        >
                          {loading.complete === item.id ? <i className="fas fa-cog animate-spin"></i> : <i className="fas fa-check"></i>}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddForm && (
        <AddToQueueModal
          cars={cars}
          services={services}
          staff={staff}
          onClose={() => setShowAddForm(false)}
          onAdd={(carId, serviceIds, assignedStaff) => {
            if (!user?.businessId) return;
            const newItem = queueService.addToQueue(user.businessId, carId, serviceIds, services);
            if (assignedStaff && newItem) {
              queueService.assignStaff(user.businessId, newItem.id, assignedStaff);
            }
            loadData();
            setShowAddForm(false);
          }}
        />
      )}
    </div>
  );
};

const AddToQueueModal: React.FC<{
  cars: Car[];
  services: Service[];
  staff: Staff[];
  onClose: () => void;
  onAdd: (carId: string, serviceIds: string[], assignedStaff?: string) => void;
}> = ({ cars, services, staff, onClose, onAdd }) => {
  const { user } = useAuth();
  const [selectedCar, setSelectedCar] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [assignedStaff, setAssignedStaff] = useState('');

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCar && selectedServices.length > 0) {
      onAdd(selectedCar, selectedServices, assignedStaff || undefined);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add to Queue</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Car</label>
            <select
              value={selectedCar}
              onChange={(e) => setSelectedCar(e.target.value)}
              required
            >
              <option value="">Choose a car...</option>
              {cars.filter(car => {
                // Filter out cars that are already in queue (waiting or in_progress)
                const queue = queueService.getQueue(user?.businessId || '');
                const carInQueue = queue.some(item => 
                  item.carId === car.id && 
                  (item.status === 'waiting' || item.status === 'in_progress')
                );
                return !carInQueue;
              }).map(car => (
                <option key={car.id} value={car.id}>
                  {car.licensePlate} - {car.make} ({car.owner.name})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Services</label>
            <div className="service-checkboxes">
              {services.map(service => (
                <label key={service.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                  />
                  {service.name} - UGX {service.amount.toLocaleString()} ({service.duration}min)
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Assign Staff (Optional)</label>
            <select
              value={assignedStaff}
              onChange={(e) => setAssignedStaff(e.target.value)}
            >
              <option value="">Select staff member...</option>
              {staff.filter(s => s.isActive).map(staffMember => (
                <option key={staffMember.id} value={staffMember.id}>
                  {staffMember.name} - {staffMember.role}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Add to Queue</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QueueManagement;