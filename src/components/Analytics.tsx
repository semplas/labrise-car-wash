import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { serviceHistoryService } from '../services/serviceHistoryService';
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
    
    const todayRevenue = serviceHistoryService.getRevenueByPeriod(user.businessId, 1);
    const weekRevenue = serviceHistoryService.getRevenueByPeriod(user.businessId, 7);
    const monthRevenue = serviceHistoryService.getRevenueByPeriod(user.businessId, 30);
    
    const history = serviceHistoryService.getHistory(user.businessId);
    const services = serviceService.getServices(user.businessId);
    const popularServiceData = serviceHistoryService.getPopularServices(user.businessId);
    
    const popularServices = popularServiceData.slice(0, 5).map(item => {
      const service = services.find(s => s.id === item.serviceId);
      return {
        name: service?.name || 'Unknown Service',
        count: item.count
      };
    });

    setAnalytics({
      todayRevenue,
      weekRevenue,
      monthRevenue,
      totalServices: history.length,
      popularServices,
      recentActivity: history.slice(-10).reverse()
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
      serviceHistory: serviceHistoryService.getHistory(user.businessId)
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
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>Business Analytics</h2>
        <button onClick={exportData} className="export-btn">
          Export Data
        </button>
      </div>

      <div className="revenue-cards">
        <div className="revenue-card">
          <h3>Today</h3>
          <p className="revenue-amount">UGX {analytics.todayRevenue.toLocaleString()}</p>
        </div>
        <div className="revenue-card">
          <h3>This Week</h3>
          <p className="revenue-amount">UGX {analytics.weekRevenue.toLocaleString()}</p>
        </div>
        <div className="revenue-card">
          <h3>This Month</h3>
          <p className="revenue-amount">UGX {analytics.monthRevenue.toLocaleString()}</p>
        </div>
        <div className="revenue-card">
          <h3>Total Services</h3>
          <p className="revenue-amount">{analytics.totalServices}</p>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-section">
          <h3>Popular Services</h3>
          <div className="popular-services">
            {analytics.popularServices.length === 0 ? (
              <p className="no-data">No service data available</p>
            ) : (
              analytics.popularServices.map((service, index) => (
                <div key={index} className="service-stat">
                  <span className="service-name">{service.name}</span>
                  <div className="service-bar">
                    <div 
                      className="service-fill" 
                      style={{ 
                        width: `${(service.count / analytics.popularServices[0].count) * 100}%` 
                      }}
                    ></div>
                    <span className="service-count">{service.count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="analytics-section">
          <h3>Recent Activity</h3>
          <div className="recent-activity">
            {analytics.recentActivity.length === 0 ? (
              <p className="no-data">No recent activity</p>
            ) : (
              analytics.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-info">
                    <span className="activity-amount">UGX {activity.totalAmount.toLocaleString()}</span>
                    <span className="activity-date">
                      {new Date(activity.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="activity-details">
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