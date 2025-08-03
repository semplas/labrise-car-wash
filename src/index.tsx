import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { registerSW, initInstallPrompt, initOfflineDetection, requestNotificationPermission } from './services/pwaService';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA disabled to prevent flickering
// registerSW();