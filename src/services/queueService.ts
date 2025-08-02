export interface QueueItem {
  id: string;
  carId: string;
  serviceIds: string[];
  status: 'waiting' | 'in_progress' | 'completed';
  estimatedTime: number; // in minutes
  startTime?: number;
  completedTime?: number;
  createdAt: number;
}

export class QueueService {
  private getStorageKey(businessId: string): string {
    return `labrise_queue_${businessId}`;
  }

  getQueue(businessId: string): QueueItem[] {
    const stored = localStorage.getItem(this.getStorageKey(businessId));
    return stored ? JSON.parse(stored) : [];
  }

  addToQueue(businessId: string, carId: string, serviceIds: string[]): QueueItem {
    const queue = this.getQueue(businessId);
    const estimatedTime = serviceIds.length * 30; // 30 min per service estimate
    
    const queueItem: QueueItem = {
      id: Date.now().toString(),
      carId,
      serviceIds,
      status: 'waiting',
      estimatedTime,
      createdAt: Date.now()
    };
    
    queue.push(queueItem);
    localStorage.setItem(this.getStorageKey(businessId), JSON.stringify(queue));
    return queueItem;
  }

  updateQueueItem(businessId: string, itemId: string, updates: Partial<QueueItem>): QueueItem | null {
    const queue = this.getQueue(businessId);
    const index = queue.findIndex(item => item.id === itemId);
    
    if (index === -1) return null;
    
    queue[index] = { ...queue[index], ...updates };
    localStorage.setItem(this.getStorageKey(businessId), JSON.stringify(queue));
    return queue[index];
  }

  startService(businessId: string, itemId: string): boolean {
    return !!this.updateQueueItem(businessId, itemId, {
      status: 'in_progress',
      startTime: Date.now()
    });
  }

  completeService(businessId: string, itemId: string): boolean {
    return !!this.updateQueueItem(businessId, itemId, {
      status: 'completed',
      completedTime: Date.now()
    });
  }

  removeFromQueue(businessId: string, itemId: string): boolean {
    const queue = this.getQueue(businessId);
    const filtered = queue.filter(item => item.id !== itemId);
    
    if (filtered.length === queue.length) return false;
    
    localStorage.setItem(this.getStorageKey(businessId), JSON.stringify(filtered));
    return true;
  }
}

export const queueService = new QueueService();