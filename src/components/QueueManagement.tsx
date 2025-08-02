import React, { useState, useEffect } from 'react';
import { queueService, QueueItem } from '../services/queueService';
import { carService, Car } from '../services/carService';
import { serviceService, Service } from '../services/serviceService';
import { useAuth } from '../context/AuthContext';

const QueueManagement: React.FC = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!user?.businessId) return;
    loadData();
  }, [user]);

  const loadData = () => {
    if (!user?.businessId) return;
    setQueue(queueService.getQueue(user.businessId));
    setCars(carService.getCars(user.businessId));
    setServices(serviceService.getServices(user.businessId));
  };

  const getCarById = (carId: string) => cars.find(c => c.id === carId);
  const getServiceById = (serviceId: string) => services.find(s => s.id === serviceId);

  const handleStartService = (itemId: string) => {
    if (!user?.businessId) return;
    queueService.startService(user.businessId, itemId);
    loadData();
  };

  const handleCompleteService = (itemId: string) => {
    if (!user?.businessId) return;
    queueService.completeService(user.businessId, itemId);
    loadData();
  };

  const handleRemoveFromQueue = (itemId: string) => {
    if (!user?.businessId) return;
    if (window.confirm('Remove this item from queue?')) {
      queueService.removeFromQueue(user.businessId, itemId);
      loadData();
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
    <div className="queue-management">
      <div className="queue-header">
        <h2>Queue Management</h2>
        <button onClick={() => setShowAddForm(true)} className="create-btn">
          Add to Queue
        </button>
      </div>

      <div className="queue-stats">
        <div className="queue-stat">
          <h3>Waiting</h3>
          <p>{waitingItems.length}</p>
        </div>
        <div className="queue-stat">
          <h3>In Progress</h3>
          <p>{inProgressItems.length}</p>
        </div>
        <div className="queue-stat">
          <h3>Completed Today</h3>
          <p>{completedItems.length}</p>
        </div>
      </div>

      <div className="queue-columns">
        <div className="queue-column">
          <h3>Waiting ({waitingItems.length})</h3>
          {waitingItems.map(item => {
            const car = getCarById(item.carId);
            return (
              <div key={item.id} className="queue-item waiting">
                <div className="queue-item-header">
                  <h4>{car?.licensePlate || 'Unknown Car'}</h4>
                  <span className="estimated-time">{item.estimatedTime}min</span>
                </div>
                <div className="queue-services">
                  {item.serviceIds.map(serviceId => {
                    const service = getServiceById(serviceId);
                    return (
                      <span key={serviceId} className="service-tag">
                        {service?.name || 'Unknown Service'}
                      </span>
                    );
                  })}
                </div>
                <div className="queue-actions">
                  <button onClick={() => handleStartService(item.id)} className="start-btn">
                    Start
                  </button>
                  <button onClick={() => handleRemoveFromQueue(item.id)} className="remove-btn">
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="queue-column">
          <h3>In Progress ({inProgressItems.length})</h3>
          {inProgressItems.map(item => {
            const car = getCarById(item.carId);
            const elapsed = item.startTime ? Math.floor((Date.now() - item.startTime) / 60000) : 0;
            return (
              <div key={item.id} className="queue-item in-progress">
                <div className="queue-item-header">
                  <h4>{car?.licensePlate || 'Unknown Car'}</h4>
                  <span className="elapsed-time">{elapsed}min elapsed</span>
                </div>
                <div className="queue-services">
                  {item.serviceIds.map(serviceId => {
                    const service = getServiceById(serviceId);
                    return (
                      <span key={serviceId} className="service-tag">
                        {service?.name || 'Unknown Service'}
                      </span>
                    );
                  })}
                </div>
                <div className="queue-actions">
                  <button onClick={() => handleCompleteService(item.id)} className="complete-btn">
                    Complete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAddForm && (
        <AddToQueueModal
          cars={cars}
          services={services}
          onClose={() => setShowAddForm(false)}
          onAdd={(carId, serviceIds) => {
            if (!user?.businessId) return;
            queueService.addToQueue(user.businessId, carId, serviceIds);
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
  onClose: () => void;
  onAdd: (carId: string, serviceIds: string[]) => void;
}> = ({ cars, services, onClose, onAdd }) => {
  const [selectedCar, setSelectedCar] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

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
      onAdd(selectedCar, selectedServices);
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
              {cars.map(car => (
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
                  {service.name} - ${service.amount} ({service.duration}min)
                </label>
              ))}
            </div>
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