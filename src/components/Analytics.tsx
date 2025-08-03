import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { queueService } from '../services/queueService';
import { carService } from '../services/carService';
import { serviceService } from '../services/serviceService';
import { staffService } from '../services/staffService';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    totalServices: 0,
    popularServices: [] as { name: string; count: number }[],
    recentActivity: [] as any[]
  });

  useEffect(() => {
    if (!user?.businessId) return;
    loadAnalytics();
  }, [user]);

  const loadAnalytics = () => {
    if (!user?.businessId) return;
    
    const queue = queueService.getQueue(user.businessId);
    const completedItems = queue.filter(item => item.status === 'completed');
    const services = serviceService.getServices(user.businessId);
    
    // Calculate revenue by period
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    const todayRevenue = completedItems
      .filter(item => item.completedTime && item.completedTime >= oneDayAgo)
      .reduce((sum, item) => {
        return sum + item.serviceIds.reduce((serviceSum, serviceId) => {
          const service = services.find(s => s.id === serviceId);
          return serviceSum + (service?.amount || 0);
        }, 0);
      }, 0);
    
    const weekRevenue = completedItems
      .filter(item => item.completedTime && item.completedTime >= oneWeekAgo)
      .reduce((sum, item) => {
        return sum + item.serviceIds.reduce((serviceSum, serviceId) => {
          const service = services.find(s => s.id === serviceId);
          return serviceSum + (service?.amount || 0);
        }, 0);
      }, 0);
    
    const monthRevenue = completedItems
      .filter(item => item.completedTime && item.completedTime >= oneMonthAgo)
      .reduce((sum, item) => {
        return sum + item.serviceIds.reduce((serviceSum, serviceId) => {
          const service = services.find(s => s.id === serviceId);
          return serviceSum + (service?.amount || 0);
        }, 0);
      }, 0);
    
    // Calculate popular services
    const serviceCount: { [key: string]: number } = {};
    completedItems.forEach(item => {
      item.serviceIds.forEach(serviceId => {
        serviceCount[serviceId] = (serviceCount[serviceId] || 0) + 1;
      });
    });
    
    const popularServices = Object.entries(serviceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([serviceId, count]) => {
        const service = services.find(s => s.id === serviceId);
        return {
          name: service?.name || 'Unknown Service',
          count
        };
      });
    
    // Recent activity from completed items
    const recentActivity = completedItems
      .filter(item => item.completedTime)
      .sort((a, b) => (b.completedTime || 0) - (a.completedTime || 0))
      .slice(0, 10)
      .map(item => ({
        totalAmount: item.serviceIds.reduce((sum, serviceId) => {
          const service = services.find(s => s.id === serviceId);
          return sum + (service?.amount || 0);
        }, 0),
        completedAt: item.completedTime || Date.now(),
        duration: item.estimatedTime,
        serviceIds: item.serviceIds
      }));

    setAnalytics({
      todayRevenue,
      weekRevenue,
      monthRevenue,
      totalServices: completedItems.length,
      popularServices,
      recentActivity
    });
  };

  const exportData = () => {
    if (!user?.businessId) return;
    
    const data = {
      business: user.businessName,
      exportDate: new Date().toISOString(),
      cars: carService.getCars(user.businessId),
      services: serviceService.getServices(user.businessId),
      staff: staffService.getStaff(user.businessId),
      queue: queueService.getQueue(user.businessId)
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user.businessName}-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Business Analytics</h2>
        <button onClick={exportData} className="btn-success flex items-center gap-2">
          <i className="fas fa-download"></i>
          Export Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Today's Revenue</h3>
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <i className="fas fa-calendar-day text-white"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-500 mb-1">UGX {analytics.todayRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Revenue generated today</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">This Week</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <i className="fas fa-calendar-week text-white"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-500 mb-1">UGX {analytics.weekRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Revenue this week</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">This Month</h3>
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
              <i className="fas fa-calendar-alt text-white"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-500 mb-1">UGX {analytics.monthRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Revenue this month</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Services</h3>
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
              <i className="fas fa-car-wash text-white"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-500 mb-1">{analytics.totalServices}</p>
          <p className="text-sm text-gray-500">Services completed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Popular Services</h3>
          <div className="space-y-4">
            {analytics.popularServices.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No service data available</p>
            ) : (
              analytics.popularServices.map((service, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{service.name}</span>
                    <span className="text-sm font-semibold text-gray-600">{service.count}</span>
                  </div>
                  <div className="relative bg-gray-200 h-6 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(service.count / analytics.popularServices[0].count) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Activity</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
            {analytics.recentActivity.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No recent activity</p>
            ) : (
              analytics.recentActivity.map((activity, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-green-600 text-lg">UGX {activity.totalAmount.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(activity.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {activity.duration} minutes • {activity.serviceIds.length} services
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;