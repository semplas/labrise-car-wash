export const initializeDemoData = () => {
  if (localStorage.getItem('labrise_demo_initialized')) {
    return;
  }

  const superAdmin = {
    username: 'admin',
    password: 'admin123',
    createdAt: Date.now()
  };
  localStorage.setItem('labrise_super_admin', JSON.stringify(superAdmin));

  const demoBusiness = {
    id: 'demo-business-1',
    businessName: 'Demo Car Wash',
    ownerName: 'John Demo',
    username: 'demo',
    password: 'demo123',
    isActive: true,
    createdAt: Date.now()
  };

  localStorage.setItem('labrise_businesses', JSON.stringify([demoBusiness]));

  const demoCars = [
    {
      id: 'car-1',
      licensePlate: 'UAM-001A',
      make: 'Toyota Camry',
      color: 'White',
      images: [],
      owner: {
        name: 'Alice Johnson',
        address: 'Kampala, Uganda',
        phone: '+256701234567'
      },
      customerId: 'customer-1',
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000
    }
  ];

  localStorage.setItem('labrise_cars_demo-business-1', JSON.stringify(demoCars));

  const demoServices = [
    {
      id: 'service-1',
      name: 'Basic Wash',
      amount: 15000,
      duration: 30,
      category: 'basic',
      carSizes: ['compact', 'suv', 'truck'],
      createdAt: Date.now() - 86400000
    }
  ];

  localStorage.setItem('labrise_services_demo-business-1', JSON.stringify(demoServices));

  localStorage.setItem('labrise_demo_initialized', 'true');
};