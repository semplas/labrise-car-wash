import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface BusinessSettings {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  operatingHours: {
    open: string;
    close: string;
  };
  currency: string;
  taxRate: number;
}

interface SettingsProps {
  onSaveSuccess?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onSaveSuccess }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<BusinessSettings>({
    businessName: '',
    address: '',
    phone: '',
    email: '',
    operatingHours: { open: '08:00', close: '18:00' },
    currency: 'UGX',
    taxRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user?.businessId) return;
    loadSettings();
  }, [user]);

  const loadSettings = () => {
    if (!user?.businessId) return;
    const stored = localStorage.getItem(`labrise_settings_${user.businessId}`);
    if (stored) {
      setSettings(JSON.parse(stored));
    } else {
      setSettings(prev => ({ ...prev, businessName: user.businessName || '' }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.businessId) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    localStorage.setItem(`labrise_settings_${user.businessId}`, JSON.stringify(settings));
    setLoading(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSaveSuccess?.();
    }, 1500);
  };

  return (
    <div>
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="form-group">
              <label>Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({...settings, businessName: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({...settings, email: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({...settings, phone: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
              >
                <option value="UGX">UGX - Ugandan Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>

            <div className="form-group">
              <label>Opening Time</label>
              <input
                type="time"
                value={settings.operatingHours.open}
                onChange={(e) => setSettings({
                  ...settings,
                  operatingHours: {...settings.operatingHours, open: e.target.value}
                })}
              />
            </div>

            <div className="form-group">
              <label>Closing Time</label>
              <input
                type="time"
                value={settings.operatingHours.close}
                onChange={(e) => setSettings({
                  ...settings,
                  operatingHours: {...settings.operatingHours, close: e.target.value}
                })}
              />
            </div>

            <div className="form-group">
              <label>Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.taxRate}
                onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="form-group lg:col-span-2">
            <label>Business Address</label>
            <textarea
              value={settings.address}
              onChange={(e) => setSettings({...settings, address: e.target.value})}
              rows={3}
              required
            />
          </div>

          <div className="flex items-center gap-4 mt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading && <div className="loading-spinner"></div>}
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
            
            {saved && (
              <div className="flex items-center gap-2 text-green-600">
                <i className="fas fa-check"></i>
                <span className="text-sm">Settings saved successfully!</span>
              </div>
            )}
          </div>
        </form>
    </div>
  );
};

export default Settings;