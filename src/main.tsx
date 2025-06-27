
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// PWA Installation Handler
let deferredPrompt: any = null;
let isInstallable = false;

// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service worker registered successfully');
      })
      .catch((error) => {
        console.error('[PWA] Service worker registration failed:', error);
      });
  });
}

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('[PWA] App is installable');
  e.preventDefault();
  deferredPrompt = e;
  isInstallable = true;
  
  // Notify app that installation is available
  window.dispatchEvent(new CustomEvent('pwa-installable'));
});

// Listen for app installed event
window.addEventListener('appinstalled', () => {
  console.log('[PWA] App installed successfully');
  deferredPrompt = null;
  isInstallable = false;
  window.dispatchEvent(new CustomEvent('pwa-installed'));
});

// Global install function
(window as any).triggerPWAInstall = async () => {
  if (!deferredPrompt || !isInstallable) {
    console.log('[PWA] Installation not available');
    return { success: false, reason: 'not-available' };
  }

  try {
    // Show the native install prompt
    await deferredPrompt.prompt();
    
    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] User choice:', outcome);
    
    if (outcome === 'accepted') {
      deferredPrompt = null;
      isInstallable = false;
      return { success: true };
    } else {
      return { success: false, reason: 'dismissed' };
    }
  } catch (error) {
    console.error('[PWA] Installation failed:', error);
    return { success: false, reason: 'error', error };
  }
};

// Check if app is already installed
(window as any).isAppInstalled = () => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isInWebAppiOS = (window.navigator as any).standalone === true;
  const isInFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
  return isStandalone || isInWebAppiOS || isInFullscreen;
};

createRoot(document.getElementById("root")!).render(<App />);
