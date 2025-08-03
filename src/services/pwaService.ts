// PWA Service Worker Registration
export const registerSW = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  showUpdatePrompt();
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// Install prompt is now handled by InstallPrompt component
export const initInstallPrompt = () => {
  // No longer needed - handled by component
};

// Show update prompt
const showUpdatePrompt = () => {
  if (window.confirm('New version available! Reload to update?')) {
    window.location.reload();
  }
};

// Check if app is installed
export const isAppInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

// Online/Offline detection
export const initOfflineDetection = () => {
  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine;
    document.body.classList.toggle('offline', !isOnline);
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
};

// Push notifications
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return Notification.permission === 'granted';
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if ('serviceWorker' in navigator && Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        ...options
      });
    });
  }
};

// Queue notifications
export const notifyQueueUpdate = (message: string) => {
  showNotification('Queue Update', {
    body: message,
    tag: 'queue-update'
  });
};

// Service completion notifications
export const notifyServiceComplete = (carPlate: string) => {
  showNotification('Service Complete', {
    body: `Service completed for ${carPlate}`,
    tag: 'service-complete'
  });
};