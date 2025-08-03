import React, { useState, useEffect } from 'react';
import { customerService, Customer } from '../services/customerService';
import { carService } from '../services/carService';
import { useAuth } from '../context/AuthContext';

const CustomerManagement: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cars, setCars] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user?.businessId) return;
    loadData();
  }, [user]);

  const loadData = () => {
    if (!user?.businessId) return;
    
    // Sync car owners as customers
    const existingCars = carService.getCars(user.businessId);
    const existingCustomers = customerService.getCustomers(user.businessId);
    
    existingCars.forEach(car => {
      const customerExists = existingCustomers.find(c => c.phone === car.owner.phone);
      if (!customerExists && user.businessId) {
        customerService.addCustomer(user.businessId, {
          name: car.owner.name,
          phone: car.owner.phone,
          address: car.owner.address,
          email: ''
        });
      }
    });
    
    setCustomers(customerService.getCustomers(user.businessId));
    setCars(existingCars);
  };



  const handleDeleteCustomer = (customerId: string) => {
    if (!user?.businessId) return;
    customerService.deleteCustomer(user.businessId, customerId);
    loadData();
  };

  const getCustomerCars = (customerId: string) => {
    return cars.filter(car => car.owner.phone === customers.find(c => c.id === customerId)?.phone);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Customer Management ({customers.length})</h2>
        <p className="text-sm text-gray-600 mt-2">Customers are automatically added when registering car owners</p>
      </div>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Search customers by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No customers found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100">
          <table className="w-full min-w-[800px] bg-white">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="p-4 text-left font-semibold text-gray-700 text-sm">Customer</th>
                <th className="p-4 text-left font-semibold text-gray-700 text-sm">Contact</th>
                <th className="p-4 text-center font-semibold text-gray-700 text-sm">Cars</th>
                <th className="p-4 text-center font-semibold text-gray-700 text-sm">Joined</th>
                <th className="p-4 text-center font-semibold text-gray-700 text-sm min-w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => {
                const customerCars = getCustomerCars(customer.id);
                return (
                  <tr key={customer.id} className={`${index < filteredCustomers.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}>
                    <td className="p-4 font-semibold text-gray-800 text-sm">
                      <div>{customer.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {customer.address}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      <div className="mb-1">
                        <i className="fas fa-phone mr-2 text-gray-400"></i>
                        {customer.phone}
                      </div>
                      <div>
                        <i className="fas fa-envelope mr-2 text-gray-400"></i>
                        {customer.email}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {customerCars.length} cars
                      </span>
                    </td>
                    <td className="p-4 text-center text-gray-500 text-sm">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <button onClick={() => handleDeleteCustomer(customer.id)} className="inline-block p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors w-7 h-7 text-xs" title="Delete">
                        <i className="fas fa-trash"></i>
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
  );
};



export default CustomerManagement;