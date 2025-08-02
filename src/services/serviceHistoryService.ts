export interface ServiceHistory {
  id: string;
  carId: string;
  serviceIds: string[];
  staffId?: string;
  totalAmount: number;
  duration: number; // actual duration in minutes
  completedAt: number;
  notes?: string;
  rating?: number; // 1-5 stars
}

export class ServiceHistoryService {
  private getStorageKey(businessId: string): string {
    return `labrise_service_history_${businessId}`;
  }

  getHistory(businessId: string): ServiceHistory[] {
    const stored = localStorage.getItem(this.getStorageKey(businessId));
    return stored ? JSON.parse(stored) : [];
  }

  addHistory(businessId: string, historyData: Omit<ServiceHistory, 'id'>): ServiceHistory {
    const history = this.getHistory(businessId);
    const newHistory: ServiceHistory = {
      ...historyData,
      id: Date.now().toString()
    };
    
    history.push(newHistory);
    localStorage.setItem(this.getStorageKey(businessId), JSON.stringify(history));
    return newHistory;
  }

  getCarHistory(businessId: string, carId: string): ServiceHistory[] {
    const history = this.getHistory(businessId);
    return history.filter(h => h.carId === carId);
  }

  getRevenueByPeriod(businessId: string, days: number): number {
    const history = this.getHistory(businessId);
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    return history
      .filter(h => h.completedAt >= cutoff)
      .reduce((total, h) => total + h.totalAmount, 0);
  }

  getPopularServices(businessId: string): { serviceId: string; count: number }[] {
    const history = this.getHistory(businessId);
    const serviceCounts: { [key: string]: number } = {};
    
    history.forEach(h => {
      h.serviceIds.forEach(serviceId => {
        serviceCounts[serviceId] = (serviceCounts[serviceId] || 0) + 1;
      });
    });
    
    return Object.entries(serviceCounts)
      .map(([serviceId, count]) => ({ serviceId, count }))
      .sort((a, b) => b.count - a.count);
  }
}

export const serviceHistoryService = new ServiceHistoryService();