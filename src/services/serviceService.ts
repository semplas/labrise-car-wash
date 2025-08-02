export interface Service {
  id: string;
  name: string;
  amount: number;
  duration: number; // in minutes
  category: 'basic' | 'premium' | 'package';
  carSizes: ('compact' | 'suv' | 'truck')[];
  createdAt: number;
}

export class ServiceService {
  private getStorageKey(businessId: string): string {
    return `labrise_services_${businessId}`;
  }

  getServices(businessId: string): Service[] {
    const stored = localStorage.getItem(this.getStorageKey(businessId));
    return stored ? JSON.parse(stored) : [];
  }

  addService(businessId: string, serviceData: Omit<Service, 'id' | 'createdAt'>): Service {
    const services = this.getServices(businessId);
    const newService: Service = {
      ...serviceData,
      id: Date.now().toString(),
      createdAt: Date.now()
    };
    
    services.push(newService);
    localStorage.setItem(this.getStorageKey(businessId), JSON.stringify(services));
    return newService;
  }

  updateService(businessId: string, serviceId: string, updates: Partial<Service>): Service | null {
    const services = this.getServices(businessId);
    const index = services.findIndex(service => service.id === serviceId);
    
    if (index === -1) return null;
    
    services[index] = { ...services[index], ...updates };
    localStorage.setItem(this.getStorageKey(businessId), JSON.stringify(services));
    return services[index];
  }

  deleteService(businessId: string, serviceId: string): boolean {
    const services = this.getServices(businessId);
    const filtered = services.filter(service => service.id !== serviceId);
    
    if (filtered.length === services.length) return false;
    
    localStorage.setItem(this.getStorageKey(businessId), JSON.stringify(filtered));
    return true;
  }
}

export const serviceService = new ServiceService();