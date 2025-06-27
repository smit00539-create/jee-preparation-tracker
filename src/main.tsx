
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enhanced service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] SW registered successfully:', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          console.log('[PWA] New service worker found');
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New content available, reload to update');
                // Could show a toast here to inform user about update
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[PWA] SW registration failed:', error);
      });
  });
}

// Enhanced beforeinstallprompt handling
let deferredPrompt: any = null;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('[PWA] beforeinstallprompt event fired');
  e.preventDefault();
  deferredPrompt = e;
  // Dispatch custom event to notify components
  window.dispatchEvent(new CustomEvent('pwa-installable', { detail: e }));
});

window.addEventListener('appinstalled', () => {
  console.log('[PWA] App installed successfully');
  deferredPrompt = null;
  // Dispatch custom event to notify components
  window.dispatchEvent(new CustomEvent('pwa-installed'));
});

// Make install function globally available
(window as any).installPWA = async () => {
  console.log('[PWA] Install function called, deferredPrompt:', !!deferredPrompt);
  
  if (!deferredPrompt) {
    console.log('[PWA] No install prompt available');
    return { success: false, reason: 'no-prompt' };
  }

  try {
    console.log('[PWA] Showing install prompt');
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] Install prompt result:', outcome);
    
    deferredPrompt = null;
    return { success: outcome === 'accepted', outcome };
  } catch (error) {
    console.error('[PWA] Install error:', error);
    return { success: false, error };
  }
};

createRoot(document.getElementById("root")!).render(<App />);
