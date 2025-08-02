import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { carService, Car } from '../../services/carService';
import { serviceService, Service } from '../../services/serviceService';
import { customerService, Customer } from '../../services/customerService';
import CarForm from '../../components/CarForm';
import ServiceForm from '../../components/ServiceForm';

const BusinessDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCarForm, setShowCarForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user || user.type !== 'business') {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = () => {
    if (!user?.businessId) return;
    setCars(carService.getCars(user.businessId));
    setServices(serviceService.getServices(user.businessId));
    setCustomers(customerService.getCustomers(user.businessId));
  };

  const handleAddCar = (carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.businessId) return;
    carService.addCar(user.businessId, carData);
    loadData();
    setShowCarForm(false);
  };

  const handleAddService = (serviceData: Omit<Service, 'id' | 'createdAt'>) => {
    if (!user?.businessId) return;
    serviceService.addService(user.businessId, serviceData);
    loadData();
    setShowServiceForm(false);
  };

  const handleShowCarForm = () => {
    console.log('Add Car button clicked');
    setShowCarForm(true);
  };

  const handleShowServiceForm = () => {
    console.log('Add Service button clicked');
    setShowServiceForm(true);
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
            <button onClick={handleShowCarForm} className="create-btn">
              Add Car
            </button>
          </div>
          
          {filteredCars.length === 0 ? (
            <div className="empty-state">
              <p>{searchQuery ? 'No cars found matching your search' : 'No cars added yet'}</p>
            </div>
          ) : (
            <div className="cars-grid">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Services ({services.length})</h2>
            <button onClick={handleShowServiceForm} className="create-btn">
              Add Service
            </button>
          </div>
          
          {services.length === 0 ? (
            <div className="empty-state">
              <p>No services added yet</p>
            </div>
          ) : (
            <div className="services-grid">
              {services.map(service => (
                <div key={service.id} className="service-card">
                  <h3>{service.name}</h3>
                  <p className="service-price">${service.amount}</p>
                  <p>{service.duration} minutes</p>
                  <p className="service-category">{service.category}</p>
                  <div className="car-sizes">
                    {service.carSizes.map(size => (
                      <span key={size} className="size-tag">{size}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showCarForm && (
          <CarForm
            onSubmit={handleAddCar}
            onClose={() => {
              console.log('Closing car form');
              setShowCarForm(false);
            }}
          />
        )}

        {showServiceForm && (
          <ServiceForm
            onSubmit={handleAddService}
            onClose={() => {
              console.log('Closing service form');
              setShowServiceForm(false);
            }}
          />
        )}

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{position: 'fixed', top: 10, right: 10, background: 'white', padding: '10px', zIndex: 10000}}>
            <p>Car Form: {showCarForm ? 'OPEN' : 'CLOSED'}</p>
            <p>Service Form: {showServiceForm ? 'OPEN' : 'CLOSED'}</p>
            <p>User ID: {user?.businessId}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboard;