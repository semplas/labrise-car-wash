import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { queueService } from '../services/queueService';
import { carService } from '../services/carService';
import { serviceService } from '../services/serviceService';
import { staffService } from '../services/staffService';

interface ServiceRecord {
  id: string;
  carId: string;
  serviceIds: string[];
  assignedStaff?: string;
  startTime?: number;
  completedTime: number;
  totalAmount: number;
  duration: number;
}

const ServiceHistory: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<ServiceRecord[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingReceipt, setSendingReceipt] = useState('');

  useEffect(() => {
    if (!user?.businessId) return;
    loadData();
  }, [user]);

  const loadData = () => {
    if (!user?.businessId) return;
    
    const queue = queueService.getQueue(user.businessId);
    const completedServices = queue
      .filter(item => item.status === 'completed' && item.completedTime)
      .map(item => ({
        id: item.id,
        carId: item.carId,
        serviceIds: item.serviceIds,
        assignedStaff: item.assignedStaff,
        startTime: item.startTime,
        completedTime: item.completedTime!,
        totalAmount: item.serviceIds.reduce((sum, serviceId) => {
          const service = serviceService.getServices(user.businessId!).find(s => s.id === serviceId);
          return sum + (service?.amount || 0);
        }, 0),
        duration: item.startTime ? Math.floor((item.completedTime! - item.startTime) / 60000) : item.estimatedTime
      }))
      .sort((a, b) => b.completedTime - a.completedTime);

    setHistory(completedServices);
    setCars(carService.getCars(user.businessId));
    setServices(serviceService.getServices(user.businessId));
    setStaff(staffService.getStaff(user.businessId));
  };

  const generateReceiptImage = (record: ServiceRecord) => {
    const car = cars.find(c => c.id === record.carId);
    const serviceDetails = record.serviceIds.map(id => services.find(s => s.id === id)).filter(Boolean);
    const staffMember = staff.find(s => s.id === record.assignedStaff);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = 400;
    canvas.height = 650;
    
    // Background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ticket border
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Header section with rounded corners effect
    ctx.fillStyle = '#667eea';
    ctx.fillRect(20, 20, canvas.width - 40, 100);
    
    // Company logo placeholder (circle)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(70, 70, 25, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('L', 70, 78);
    
    // Company name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('LABRISE', 110, 65);
    ctx.font = '14px Arial';
    ctx.fillText('CAR WASH SERVICE', 110, 85);
    ctx.fillText(user?.businessName || '', 110, 100);
    
    // Receipt number in top right
    ctx.textAlign = 'right';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`#${record.id.slice(-8).toUpperCase()}`, canvas.width - 30, 45);
    ctx.font = '10px Arial';
    ctx.fillText(new Date(record.completedTime).toLocaleDateString(), canvas.width - 30, 60);
    ctx.fillText(new Date(record.completedTime).toLocaleTimeString(), canvas.width - 30, 75);
    
    // Dotted separator line
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(30, 140);
    ctx.lineTo(canvas.width - 30, 140);
    ctx.stroke();
    
    // Vehicle info section
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.setLineDash([]);
    let y = 170;
    
    ctx.fillText('🚗 VEHICLE DETAILS', 30, y);
    y += 30;
    
    // Vehicle info in ticket style
    ctx.fillStyle = '#495057';
    ctx.font = '14px Arial';
    const vehicleInfo = [
      [`License Plate:`, car?.licensePlate || 'N/A'],
      [`Make & Model:`, car?.make || 'N/A'],
      [`Color:`, car?.color || 'N/A'],
      [`Owner:`, car?.owner.name || 'N/A']
    ];
    
    vehicleInfo.forEach(([label, value]) => {
      ctx.fillStyle = '#6c757d';
      ctx.fillText(label, 30, y);
      ctx.fillStyle = '#2c3e50';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(value, 150, y);
      ctx.font = '14px Arial';
      y += 22;
    });
    
    // Services section
    y += 20;
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('🔧 SERVICES PROVIDED', 30, y);
    y += 30;
    
    // Services table header
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(30, y - 5, canvas.width - 60, 25);
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, y - 5, canvas.width - 60, 25);
    
    ctx.fillStyle = '#495057';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('SERVICE', 35, y + 10);
    ctx.textAlign = 'right';
    ctx.fillText('AMOUNT', canvas.width - 35, y + 10);
    
    y += 30;
    
    // Services list
    serviceDetails.forEach((service, index) => {
      if (index % 2 === 0) {
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(30, y - 8, canvas.width - 60, 20);
      }
      
      ctx.fillStyle = '#2c3e50';
      ctx.font = '13px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(service.name, 35, y + 5);
      ctx.textAlign = 'right';
      ctx.font = 'bold 13px Arial';
      ctx.fillText(`UGX ${service.amount.toLocaleString()}`, canvas.width - 35, y + 5);
      y += 20;
    });
    
    // Staff and duration
    y += 20;
    ctx.fillStyle = '#6c757d';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`👨‍🔧 Serviced by: ${staffMember?.name || 'N/A'}`, 30, y);
    y += 18;
    ctx.fillText(`⏱️ Duration: ${record.duration} minutes`, 30, y);
    
    // Total section with emphasis
    y += 40;
    ctx.fillStyle = '#28a745';
    ctx.fillRect(30, y - 10, canvas.width - 60, 45);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TOTAL', canvas.width / 2, y + 10);
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`UGX ${record.totalAmount.toLocaleString()}`, canvas.width / 2, y + 35);
    
    // Footer
    y += 70;
    ctx.fillStyle = '#6c757d';
    ctx.font = '12px Arial';
    ctx.fillText('Thank you for choosing Labrise Car Wash!', canvas.width / 2, y);
    y += 15;
    ctx.font = '10px Arial';
    ctx.fillText('Keep this receipt for your records', canvas.width / 2, y);
    
    // QR code
    const qrSize = 60;
    const qrX = canvas.width - 80;
    const qrY = canvas.height - 80;
    
    // QR code background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
    
    // Generate simple QR-like pattern
    const qrData = record.id + record.completedTime;
    ctx.fillStyle = '#000000';
    
    // Create a simple grid pattern based on receipt data
    const gridSize = 6;
    const cellSize = qrSize / gridSize;
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const hash = (qrData.charCodeAt((i * gridSize + j) % qrData.length) + i + j) % 3;
        if (hash === 0) {
          ctx.fillRect(qrX + j * cellSize, qrY + i * cellSize, cellSize, cellSize);
        }
      }
    }
    
    // Corner markers
    ctx.fillRect(qrX, qrY, cellSize * 2, cellSize * 2);
    ctx.fillRect(qrX + qrSize - cellSize * 2, qrY, cellSize * 2, cellSize * 2);
    ctx.fillRect(qrX, qrY + qrSize - cellSize * 2, cellSize * 2, cellSize * 2);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrX + cellSize/2, qrY + cellSize/2, cellSize, cellSize);
    ctx.fillRect(qrX + qrSize - cellSize * 1.5, qrY + cellSize/2, cellSize, cellSize);
    ctx.fillRect(qrX + cellSize/2, qrY + qrSize - cellSize * 1.5, cellSize, cellSize);
    
    return canvas.toDataURL('image/png');
  };

  const sendWhatsAppReceipt = (record: ServiceRecord) => {
    const car = cars.find(c => c.id === record.carId);
    const phoneNumber = car?.owner.phone?.replace(/[^0-9]/g, '') || '';
    
    if (!phoneNumber) {
      alert('No phone number found for this customer');
      return;
    }
    
    setSendingReceipt(record.id);
    
    setTimeout(() => {
      const imageData = generateReceiptImage(record);
      
      // Create download link for the image
      const link = document.createElement('a');
      link.download = `receipt-${record.id.slice(-8)}.png`;
      link.href = imageData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Format phone number for WhatsApp
      let formattedPhone = phoneNumber;
      if (phoneNumber.startsWith('0')) {
        formattedPhone = '256' + phoneNumber.substring(1);
      } else if (!phoneNumber.startsWith('256')) {
        formattedPhone = '256' + phoneNumber;
      }
      
      const message = `Hi ${car?.owner.name}, here's your receipt from ${user?.businessName}. Please find the receipt image downloaded to share.`;
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        setSendingReceipt('');
      }, 500);
    }, 1000);
  };

  const filteredHistory = history.filter(record => {
    const car = cars.find(c => c.id === record.carId);
    return car?.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
           car?.owner.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Service History ({filteredHistory.length})</h2>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by license plate or customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <i className="fas fa-history text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No service history found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100">
          <table className="w-full min-w-[800px] bg-white">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="p-4 text-left font-semibold text-gray-700 text-sm">Date</th>
                <th className="p-4 text-left font-semibold text-gray-700 text-sm">Car</th>
                <th className="p-4 text-left font-semibold text-gray-700 text-sm">Services</th>
                <th className="p-4 text-left font-semibold text-gray-700 text-sm">Staff</th>
                <th className="p-4 text-center font-semibold text-gray-700 text-sm">Duration</th>
                <th className="p-4 text-right font-semibold text-gray-700 text-sm">Amount</th>
                <th className="p-4 text-center font-semibold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((record, index) => {
                const car = cars.find(c => c.id === record.carId);
                const staffMember = staff.find(s => s.id === record.assignedStaff);
                return (
                  <tr key={record.id} className={`${index < filteredHistory.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}>
                    <td className="p-4 text-gray-600 text-sm">
                      {new Date(record.completedTime).toLocaleDateString()}
                      <br />
                      <span className="text-xs text-gray-400">
                        {new Date(record.completedTime).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-gray-800 text-sm">
                      {car?.licensePlate || 'Unknown'}
                      <br />
                      <span className="text-xs text-gray-500">{car?.owner.name}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {record.serviceIds.map(serviceId => {
                          const service = services.find(s => s.id === serviceId);
                          return (
                            <span key={serviceId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              {service?.name || 'Unknown'}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {staffMember?.name || 'Unassigned'}
                    </td>
                    <td className="p-4 text-center text-gray-600 text-sm">
                      {record.duration} min
                    </td>
                    <td className="p-4 text-right font-bold text-green-600 text-sm">
                      UGX {record.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => sendWhatsAppReceipt(record)}
                        disabled={sendingReceipt === record.id}
                        className="inline-block p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors w-7 h-7 text-xs disabled:bg-gray-400" 
                        title="Send WhatsApp Receipt"
                      >
                        {sendingReceipt === record.id ? <i className="fas fa-cog animate-spin"></i> : <i className="fab fa-whatsapp"></i>}
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

export default ServiceHistory;