import React, { useState, useEffect } from 'react';
import { isAppInstalled } from '../services/pwaService';

const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Show install prompt if app is not installed and PWA is supported
    if (!isAppInstalled() && 'serviceWorker' in navigator) {
      setShowPrompt(true);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="install-prompt">
      <div className="install-content">
        <h3>📱 Install Labrise</h3>
        <p>Install our app for a better experience with offline access!</p>
        <div className="install-actions">
          <button 
            id="install-btn" 
            className="install-btn"
            style={{ display: 'none' }}
          >
            Install App
          </button>
          <button 
            onClick={() => setShowPrompt(false)}
            className="dismiss-btn"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;