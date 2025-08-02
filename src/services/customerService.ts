export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  loyaltyPoints: number;
  totalVisits: number;
  cars: string[]; // car IDs
  createdAt: number;
}

export class CustomerService {
  private getStorageKey(businessId: string): string {
    return `labrise_customers_${businessId}`;
  }

  getCustomers(businessId: string): Customer[] {
    const stored = localStorage.getItem(this.getStorageKey(businessId));
    return stored ? JSON.parse(stored) : [];
  }

  addCustomer(businessId: string, customerData: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints' | 'totalVisits' | 'cars'>): Customer {
    const customers = this.getCustomers(businessId);
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      loyaltyPoints: 0,
      totalVisits: 0,
      cars: [],
      createdAt: Date.now()
    };
    
    customers.push(newCustomer);
    localStorage.setItem(this.getStorageKey(businessId), JSON.stringify(customers));
    return newCustomer;
  }

  updateCustomer(businessId: string, customerId: string, updates: Partial<Customer>): Customer | null {
    const customers = this.getCustomers(businessId);
    const index = customers.findIndex(customer => customer.id === customerId);
    
    if (index === -1) return null;
    
    customers[index] = { ...customers[index], ...updates };
    localStorage.setItem(this.getStorageKey(businessId), JSON.stringify(customers));
    return customers[index];
  }

  deleteCustomer(businessId: string, customerId: string): boolean {
    const customers = this.getCustomers(businessId);
    const filtered = customers.filter(customer => customer.id !== customerId);
    
    if (filtered.length === customers.length) return false;
    
    localStorage.setItem(this.getStorageKey(businessId), JSON.stringify(filtered));
    return true;
  }

  linkCarToCustomer(businessId: string, customerId: string, carId: string): boolean {
    const customers = this.getCustomers(businessId);
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer || customer.cars.includes(carId)) return false;
    
    customer.cars.push(carId);
    localStorage.setItem(this.getStorageKey(businessId), JSON.stringify(customers));
    return true;
  }
}

export const customerService = new CustomerService();