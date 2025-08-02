export interface Car {
  id: string;
  licensePlate: string;
  make: string;
  color: string;
  images: string[];
  owner: {
    name: string;
    address: string;
    phone: string;
  };
  customerId?: string;
  createdAt: number;
  updatedAt: number;
}

export class CarService {
  private getStorageKey(businessId: string): string {
    return `labrise_cars_${businessId}`;
  }

  getCars(businessId: string): Car[] {
    const stored = localStorage.getItem(this.getStorageKey(businessId));
    return stored ? JSON.parse(stored) : [];
  }

  addCar(businessId: string, carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>): Car {
    const cars = this.getCars(businessId);
    const newCar: Car = {
      ...carData,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    cars.push(newCar);
    localStorage.setItem(this.getStorageKey(businessId), JSON.stringify(cars));
    return newCar;
  }

  updateCar(businessId: string, carId: string, updates: Partial<Car>): Car | null {
    const cars = this.getCars(businessId);
    const index = cars.findIndex(car => car.id === carId);
    
    if (index === -1) return null;
    
    cars[index] = { ...cars[index], ...updates, updatedAt: Date.now() };
    localStorage.setItem(this.getStorageKey(businessId), JSON.stringify(cars));
    return cars[index];
  }

  deleteCar(businessId: string, carId: string): boolean {
    const cars = this.getCars(businessId);
    const filtered = cars.filter(car => car.id !== carId);
    
    if (filtered.length === cars.length) return false;
    
    localStorage.setItem(this.getStorageKey(businessId), JSON.stringify(filtered));
    return true;
  }

  searchCars(businessId: string, query: string): Car[] {
    const cars = this.getCars(businessId);
    const lowerQuery = query.toLowerCase();
    
    return cars.filter(car => 
      car.licensePlate.toLowerCase().includes(lowerQuery) ||
      car.make.toLowerCase().includes(lowerQuery) ||
      car.color.toLowerCase().includes(lowerQuery) ||
      car.owner.name.toLowerCase().includes(lowerQuery)
    );
  }
}

export const carService = new CarService();