import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { carService, Car } from '../../services/carService';
import { serviceService, Service } from '../../services/serviceService';
import { customerService, Customer } from '../../services/customerService';
import CarForm from '../../components/CarForm';
import ServiceForm from '../../components/ServiceForm';
import QueueManagement from '../../components/QueueManagement';
import StaffManagement from '../../components/StaffManagement';
import Analytics from '../../components/Analytics';

const BusinessDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCarForm, setShowCarForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'staff' | 'analytics'>('overview');

  const loadData = () => {
    if (!user?.businessId) return;
    setCars(carService.getCars(user.businessId));
    setServices(serviceService.getServices(user.businessId));
    setCustomers(customerService.getCustomers(user.businessId));
  };

  useEffect(() => {
    if (!user || user.type !== 'business') {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const handleAddCar = async (carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.businessId) return;
    setLoading(true);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (editingCar) {
      carService.updateCar(user.businessId, editingCar.id, carData);
      setEditingCar(null);
    } else {
      carService.addCar(user.businessId, carData);
    }
    loadData();
    setShowCarForm(false);
    setLoading(false);
  };

  const handleAddService = async (serviceData: Omit<Service, 'id' | 'createdAt'>) => {
    if (!user?.businessId) return;
    setLoading(true);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (editingService) {
      serviceService.updateService(user.businessId, editingService.id, serviceData);
      setEditingService(null);
    } else {
      serviceService.addService(user.businessId, serviceData);
    }
    loadData();
    setShowServiceForm(false);
    setLoading(false);
  };

  const handleEditCar = (car: Car) => {
    setEditingCar(car);
    setShowCarForm(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowServiceForm(true);
  };

  const handleDeleteCar = (carId: string) => {
    if (!user?.businessId) return;
    if (window.confirm('Are you sure you want to delete this car?')) {
      carService.deleteCar(user.businessId, carId);
      loadData();
    }
  };

  const handleDeleteService = (serviceId: string) => {
    if (!user?.businessId) return;
    if (window.confirm('Are you sure you want to delete this service?')) {
      serviceService.deleteService(user.businessId, serviceId);
      loadData();
    }
  };

  const handleCloseCarForm = () => {
    setShowCarForm(false);
    setEditingCar(null);
  };

  const handleCloseServiceForm = () => {
    setShowServiceForm(false);
    setEditingService(null);
  };

  const filteredCars = searchQuery
    ? carService.searchCars(user?.businessId || '', searchQuery)
    : cars;

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{user.businessName} - Dashboard</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            Queue
          </button>
          <button 
            className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            Staff
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>
        {activeTab === 'overview' && (
          <>
            <div className="stats-row">
          <div className="stat-card">
            <h3>Total Cars</h3>
            <p>{cars.length}</p>
          </div>
          <div className="stat-card">
            <h3>Services</h3>
            <p>{services.length}</p>
          </div>
          <div className="stat-card">
            <h3>Customers</h3>
            <p>{customers.length}</p>
          </div>
        </div>

        <div className="search-section">
          <input
            type="text"
            placeholder="Search cars by license plate, make, color, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Cars ({filteredCars.length})</h2>
            <button 
              onClick={() => setShowCarForm(true)} 
              className="create-btn"
            >
              Add Car
            </button>
          </div>
          
          {filteredCars.length === 0 ? (
            <div className="empty-state">
              <p>{searchQuery ? 'No cars found matching your search' : 'No cars added yet'}</p>
            </div>
          ) : (
            <div className="cars-list">
              {filteredCars.map(car => (
                <div key={car.id} className="car-card">
                  <div className="car-images">
                    {car.images.length > 0 ? (
                      <img src={car.images[0]} alt={car.licensePlate} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                  <div className="car-info">
                    <h3>{car.licensePlate}</h3>
                    <p>{car.make} - {car.color}</p>
                    <p><strong>Owner:</strong> {car.owner.name}</p>
                    <p><strong>Phone:</strong> {car.owner.phone}</p>
                    <div className="card-actions">
                      <button onClick={() => handleEditCar(car)} className="edit-btn">Edit</button>
                      <button onClick={() => handleDeleteCar(car.id)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Services ({services.length})</h2>
            <button 
              onClick={() => setShowServiceForm(true)} 
              className="create-btn"
            >
              Add Service
            </button>
          </div>
          
          {services.length === 0 ? (
            <div className="empty-state">
              <p>No services added yet</p>
            </div>
          ) : (
            <div className="services-list">
              {services.map(service => (
                <div key={service.id} className="service-card">
                  <div className="service-info">
                    <h3>{service.name}</h3>
                    <p className="service-category">{service.category}</p>
                  </div>
                  <div className="service-details">
                    <p className="service-price">UGX {service.amount.toLocaleString()}</p>
                    <p>{service.duration} minutes</p>
                    <div className="car-sizes">
                      {service.carSizes.map(size => (
                        <span key={size} className="size-tag">{size}</span>
                      ))}
                    </div>
                  </div>
                  <div className="card-actions">
                    <button onClick={() => handleEditService(service)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDeleteService(service.id)} className="delete-btn">Delete</button>
                  </div>
                </div>
              ))
            </div>
          )}
        </div>

        {showCarForm && (
          <CarForm
            onSubmit={handleAddCar}
            onClose={handleCloseCarForm}
            initialData={editingCar || undefined}
          />
        )}

        {showServiceForm && (
          <ServiceForm
            onSubmit={handleAddService}
            onClose={handleCloseServiceForm}
            initialData={editingService || undefined}
          />
        )}
          </>
        )}

        {activeTab === 'queue' && <QueueManagement />}
        {activeTab === 'staff' && <StaffManagement />}
        {activeTab === 'analytics' && <Analytics />}


      </div>
    </div>
  );
};

export default BusinessDashboard;