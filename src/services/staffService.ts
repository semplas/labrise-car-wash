export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'manager' | 'washer' | 'cashier';
  isActive: boolean;
  hireDate: number;
  performance: {
    servicesCompleted: number;
    averageRating: number;
    totalRevenue: number;
  };
}

export class StaffService {
  private getStorageKey(businessId: string): string {
    return `labrise_staff_${businessId}`;
  }

  getStaff(businessId: string): Staff[] {
    const stored = localStorage.getItem(this.getStorageKey(businessId));
    return stored ? JSON.parse(stored) : [];
  }

  addStaff(businessId: string, staffData: Omit<Staff, 'id' | 'performance'>): Staff {
    const staff = this.getStaff(businessId);
    const newStaff: Staff = {
      ...staffData,
      id: Date.now().toString(),
      performance: {
        servicesCompleted: 0,
        averageRating: 0,
        totalRevenue: 0
      }
    };
    
    staff.push(newStaff);
    localStorage.setItem(this.getStorageKey(businessId), JSON.stringify(staff));
    return newStaff;
  }

  updateStaff(businessId: string, staffId: string, updates: Partial<Staff>): Staff | null {
    const staff = this.getStaff(businessId);
    const index = staff.findIndex(s => s.id === staffId);
    
    if (index === -1) return null;
    
    staff[index] = { ...staff[index], ...updates };
    localStorage.setItem(this.getStorageKey(businessId), JSON.stringify(staff));
    return staff[index];
  }

  deleteStaff(businessId: string, staffId: string): boolean {
    const staff = this.getStaff(businessId);
    const filtered = staff.filter(s => s.id !== staffId);
    
    if (filtered.length === staff.length) return false;
    
    localStorage.setItem(this.getStorageKey(businessId), JSON.stringify(filtered));
    return true;
  }
}

export const staffService = new StaffService();