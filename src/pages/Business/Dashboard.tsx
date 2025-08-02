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
            <div className="cars-list" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px'}}>
              {filteredCars.map(car => (
                <div key={car.id} className="car-card" style={{display: 'flex', flexDirection: 'row', width: '100%', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0'}}>
                  <div className="car-images" style={{width: '120px', height: '90px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, marginRight: '1.5rem'}}>
                    {car.images.length > 0 ? (
                      <img src={car.images[0]} alt={car.licensePlate} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                  <div className="car-info" style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                    <div style={{marginBottom: '1rem'}}>
                      <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50'}}>{car.licensePlate}</h3>
                      <p style={{margin: '0 0 0.25rem 0', color: '#7f8c8d', fontSize: '0.95rem'}}>{car.make} - {car.color}</p>
                      <p style={{margin: '0 0 0.25rem 0', color: '#34495e', fontSize: '0.9rem'}}><strong>Owner:</strong> {car.owner.name}</p>
                      <p style={{margin: '0', color: '#34495e', fontSize: '0.9rem'}}><strong>Phone:</strong> {car.owner.phone}</p>
                    </div>
                    <div className="card-actions" style={{display: 'flex', gap: '0.75rem', marginTop: '0', paddingTop: '0', border: 'none'}}>
                      <button onClick={() => handleEditCar(car)} style={{padding: '0.5rem 1rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500'}}>Edit</button>
                      <button onClick={() => handleDeleteCar(car.id)} style={{padding: '0.5rem 1rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500'}}>Delete</button>
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
            <div className="services-list" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px'}}>
              {services.map(service => (
                <div key={service.id} className="service-card" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0'}}>
                  <div className="service-info" style={{flex: 1, marginRight: '2rem'}}>
                    <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '600', color: '#2c3e50'}}>{service.name}</h3>
                    <p className="service-category" style={{margin: '0', color: '#7f8c8d', fontSize: '0.9rem', textTransform: 'capitalize'}}>{service.category}</p>
                  </div>
                  <div className="service-details" style={{display: 'flex', alignItems: 'center', gap: '2rem', marginRight: '2rem'}}>
                    <div style={{textAlign: 'center'}}>
                      <p className="service-price" style={{margin: '0 0 0.25rem 0', fontSize: '1.2rem', fontWeight: '700', color: '#27ae60'}}>UGX {service.amount.toLocaleString()}</p>
                      <p style={{margin: '0', color: '#7f8c8d', fontSize: '0.85rem'}}>{service.duration} min</p>
                    </div>
                    <div className="car-sizes" style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                      {service.carSizes.map(size => (
                        <span key={size} className="size-tag" style={{background: '#ecf0f1', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', color: '#2c3e50', textTransform: 'capitalize'}}>{size}</span>
                      ))}
                    </div>
                  </div>
                  <div className="card-actions" style={{display: 'flex', gap: '0.75rem', flexDirection: 'column'}}>
                    <button onClick={() => handleEditService(service)} style={{padding: '0.5rem 1rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500', minWidth: '80px'}}>Edit</button>
                    <button onClick={() => handleDeleteService(service.id)} style={{padding: '0.5rem 1rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500', minWidth: '80px'}}>Delete</button>
                  </div>
                </div>
              ))}
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