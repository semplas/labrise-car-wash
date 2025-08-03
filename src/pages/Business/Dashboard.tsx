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
import CustomerManagement from '../../components/CustomerManagement';
import Analytics from '../../components/Analytics';
import Settings from '../../components/Settings';
import ServiceHistory from '../../components/ServiceHistory';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'queue' | 'staff' | 'analytics' | 'history'>('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{type: 'car' | 'service', id: string, name: string} | null>(null);

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
    const car = cars.find(c => c.id === carId);
    if (car) {
      setDeleteItem({type: 'car', id: carId, name: car.licensePlate});
      setShowDeleteModal(true);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setDeleteItem({type: 'service', id: serviceId, name: service.name});
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = () => {
    if (!user?.businessId || !deleteItem) return;
    if (deleteItem.type === 'car') {
      carService.deleteCar(user.businessId, deleteItem.id);
    } else {
      serviceService.deleteService(user.businessId, deleteItem.id);
    }
    loadData();
    setShowDeleteModal(false);
    setDeleteItem(null);
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
    <div className="min-h-screen bg-gray-50">
      {/* TailwindCSS Test - Remove this comment if styles are working */}
      <header className="bg-white px-3 py-4 shadow-lg border-b border-gray-200">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm sm:text-lg font-bold flex-shrink-0">
              {user.businessName?.charAt(0).toUpperCase() || 'B'}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-lg font-semibold text-gray-800 m-0 truncate">{user.businessName || 'Business Dashboard'}</h1>
              <p className="text-xs text-gray-500 m-0 hidden sm:block">Car Wash Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button 
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-100 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
            >
              <i className="fas fa-cog text-sm"></i>
              <span className="hidden sm:inline">Settings</span>
            </button>
            
            <button onClick={logout} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs sm:text-sm font-medium">
              <i className="fas fa-sign-out-alt text-sm"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <nav className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide">
            <button 
              className={`flex items-center gap-2 px-4 md:px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap border-b-2 min-w-max ${
                activeTab === 'overview' 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-blue-500 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-transparent hover:border-gray-200'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <i className={`fas fa-tachometer-alt ${activeTab === 'overview' ? 'text-blue-500' : ''}`}></i>
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Home</span>
            </button>
            <button 
              className={`flex items-center gap-2 px-4 md:px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap border-b-2 min-w-max ${
                activeTab === 'customers' 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-blue-500 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-transparent hover:border-gray-200'
              }`}
              onClick={() => setActiveTab('customers')}
            >
              <i className={`fas fa-address-book ${activeTab === 'customers' ? 'text-blue-500' : ''}`}></i>
              <span>Customers</span>
            </button>
            <button 
              className={`flex items-center gap-2 px-4 md:px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap border-b-2 min-w-max ${
                activeTab === 'queue' 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-blue-500 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-transparent hover:border-gray-200'
              }`}
              onClick={() => setActiveTab('queue')}
            >
              <i className={`fas fa-list-ol ${activeTab === 'queue' ? 'text-blue-500' : ''}`}></i>
              <span>Queue</span>
            </button>
            <button 
              className={`flex items-center gap-2 px-4 md:px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap border-b-2 min-w-max ${
                activeTab === 'staff' 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-blue-500 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-transparent hover:border-gray-200'
              }`}
              onClick={() => setActiveTab('staff')}
            >
              <i className={`fas fa-users ${activeTab === 'staff' ? 'text-blue-500' : ''}`}></i>
              <span>Staff</span>
            </button>
            <button 
              className={`flex items-center gap-2 px-4 md:px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap border-b-2 min-w-max ${
                activeTab === 'analytics' 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-blue-500 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-transparent hover:border-gray-200'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              <i className={`fas fa-chart-bar ${activeTab === 'analytics' ? 'text-blue-500' : ''}`}></i>
              <span>Analytics</span>
            </button>
            <button 
              className={`flex items-center gap-2 px-4 md:px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap border-b-2 min-w-max ${
                activeTab === 'history' 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-blue-500 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-transparent hover:border-gray-200'
              }`}
              onClick={() => setActiveTab('history')}
            >
              <i className={`fas fa-history ${activeTab === 'history' ? 'text-blue-500' : ''}`}></i>
              <span>History</span>
            </button>
          </div>
        </nav>
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Total Cars</h3>
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <i className="fas fa-car text-white"></i>
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-500 mb-1">{cars.length}</p>
                <p className="text-sm text-gray-500">Cars in system</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Services</h3>
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <i className="fas fa-cogs text-white"></i>
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-500 mb-1">{services.length}</p>
                <p className="text-sm text-gray-500">Available services</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Customers</h3>
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                    <i className="fas fa-users text-white"></i>
                  </div>
                </div>
                <p className="text-3xl font-bold text-orange-500 mb-1">{customers.length}</p>
                <p className="text-sm text-gray-500">Registered customers</p>
              </div>
            </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search cars by license plate, make, color, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-gray-800">Cars ({filteredCars.length})</h2>
            <button 
              onClick={() => setShowCarForm(true)} 
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Add Car
            </button>
          </div>
          
          {filteredCars.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <i className="fas fa-car text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">{searchQuery ? 'No cars found matching your search' : 'No cars added yet'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100">
              <table className="w-full min-w-[800px] bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">Image</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">License Plate</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Make</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Color</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Owner</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Phone</th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm min-w-[80px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                {filteredCars.map((car, index) => (
                  <tr key={car.id} className={`${index < filteredCars.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}>
                    <td className="p-4 text-center">
                      <div className="w-15 h-11 rounded overflow-hidden bg-gray-100 mx-auto">
                        {car.images.length > 0 ? (
                          <img src={car.images[0]} alt={car.licensePlate} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-800 text-sm">{car.licensePlate}</td>
                    <td className="p-4 text-gray-600 text-sm">{car.make}</td>
                    <td className="p-4 text-gray-600 text-sm">{car.color}</td>
                    <td className="p-4 text-gray-600 text-sm">{car.owner.name}</td>
                    <td className="p-4 text-gray-500 text-sm">{car.owner.phone}</td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <button 
                        onClick={() => handleEditCar(car)} 
                        className="inline-block p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2 w-7 h-7 text-xs"
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteCar(car.id)} 
                        className="inline-block p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors w-7 h-7 text-xs"
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-gray-800">Services ({services.length})</h2>
            <button 
              onClick={() => setShowServiceForm(true)} 
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Add Service
            </button>
          </div>
          
          {services.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <i className="fas fa-cogs text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No services added yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100">
              <table className="w-full min-w-[700px] bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Service Name</th>
                    <th className="p-4 text-left font-semibold text-gray-700 text-sm">Category</th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">Duration</th>
                    <th className="p-4 text-right font-semibold text-gray-700 text-sm">Price</th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm">Car Sizes</th>
                    <th className="p-4 text-center font-semibold text-gray-700 text-sm min-w-[80px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, index) => (
                    <tr key={service.id} className={`${index < services.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}>
                      <td className="p-4 font-semibold text-gray-800 text-sm">{service.name}</td>
                      <td className="p-4">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium uppercase">{service.category}</span>
                      </td>
                      <td className="p-4 text-center text-gray-600 text-sm">{service.duration} min</td>
                      <td className="p-4 text-right text-sm font-bold text-green-600">UGX {service.amount.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <div className="flex gap-1 justify-center flex-wrap">
                          {service.carSizes.map(size => (
                            <span key={size} className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600 capitalize border">{size}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <button 
                          onClick={() => handleEditService(service)} 
                          className="inline-block p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2 w-7 h-7 text-xs"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteService(service.id)} 
                          className="inline-block p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors w-7 h-7 text-xs"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

        {showDeleteModal && deleteItem && (
          <div className="modal-overlay">
            <div className="modal" style={{maxWidth: '400px', textAlign: 'center'}}>
              <div style={{marginBottom: '1.5rem'}}>
                <i className="fas fa-exclamation-triangle" style={{fontSize: '3rem', color: '#f39c12', marginBottom: '1rem'}}></i>
                <h2 style={{margin: '0 0 0.5rem 0', color: '#2c3e50'}}>Confirm Delete</h2>
                <p style={{margin: '0', color: '#7f8c8d'}}>Are you sure you want to delete {deleteItem.type} "{deleteItem.name}"?</p>
                <p style={{margin: '0.5rem 0 0 0', color: '#e74c3c', fontSize: '0.9rem', fontWeight: '500'}}>This action cannot be undone.</p>
              </div>
              <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
                <button onClick={() => {setShowDeleteModal(false); setDeleteItem(null);}} style={{padding: '0.75rem 1.5rem', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'}}>Cancel</button>
                <button onClick={confirmDelete} style={{padding: '0.75rem 1.5rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'}}>Delete</button>
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'queue' && <QueueManagement />}
        {activeTab === 'staff' && <StaffManagement />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'history' && <ServiceHistory />}

        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Business Settings</h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>
              <div className="p-6">
                <Settings onSaveSuccess={() => {
                  setShowSettings(false);
                  setActiveTab('overview');
                }} />
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default BusinessDashboard;