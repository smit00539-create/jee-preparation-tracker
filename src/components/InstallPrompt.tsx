
import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const InstallPrompt = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installAvailable, setInstallAvailable] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInWebApp = window.matchMedia('(display-mode: fullscreen)').matches;
      const installed = isStandalone || isInWebAppiOS || isInWebApp;
      console.log('[PWA] Installation check:', { isStandalone, isInWebAppiOS, isInWebApp, installed });
      setIsInstalled(installed);
      return installed;
    };

    const installed = checkIfInstalled();

    // Listen for PWA events
    const handleInstallable = (e: CustomEvent) => {
      console.log('[PWA] App is installable');
      setInstallAvailable(true);
      
      if (!installed) {
        const dismissed = localStorage.getItem('installPromptDismissed');
        const dismissedTime = dismissed ? parseInt(dismissed) : 0;
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        
        if (dismissedTime < oneDayAgo) {
          setTimeout(() => setShowInstallPrompt(true), 3000);
        }
      }
    };

    const handleInstalled = () => {
      console.log('[PWA] App installed via event');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setInstallAvailable(false);
      localStorage.removeItem('installPromptDismissed');
    };

    window.addEventListener('pwa-installable', handleInstallable as EventListener);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable as EventListener);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('[PWA] Install button clicked');
    
    try {
      const result = await (window as any).installPWA();
      console.log('[PWA] Install result:', result);
      
      if (result.success) {
        setShowInstallPrompt(false);
        setIsInstalled(true);
      } else if (result.reason === 'no-prompt') {
        // Show browser-specific instructions
        showBrowserInstructions();
      }
    } catch (error) {
      console.error('[PWA] Install failed:', error);
      showBrowserInstructions();
    }
  };

  const showBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    let instructions = '';
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      instructions = 'Chrome: Look for the install icon (⚙️) in the address bar, or use the three dots menu → "Install JEE Prepometer"';
    } else if (userAgent.includes('safari')) {
      instructions = 'Safari: Tap the Share button (📤) → "Add to Home Screen"';
    } else if (userAgent.includes('firefox')) {
      instructions = 'Firefox: Look for the install icon in the address bar';
    } else if (userAgent.includes('edge')) {
      instructions = 'Edge: Click the three dots menu → "Apps" → "Install JEE Prepometer"';
    } else {
      instructions = 'Look for "Install", "Add to Home Screen", or an install icon in your browser menu';
    }
    
    // Create a modal for instructions
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
      background: rgba(0,0,0,0.8); z-index: 10000; 
      display: flex; align-items: center; justify-content: center; padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white; padding: 30px; border-radius: 10px; max-width: 400px; text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    `;
    
    content.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
        Install JEE Prepometer
      </h3>
      <p style="margin: 0 0 20px 0; color: #6b7280; line-height: 1.5;">
        ${instructions}
      </p>
      <button id="close-modal" style="
        background: #3b82f6; color: white; border: none; padding: 10px 20px; 
        border-radius: 6px; cursor: pointer; font-weight: 500;
      ">
        Got it!
      </button>
    `;
    
    const closeButton = content.querySelector('#close-modal');
    closeButton?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    setTimeout(() => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    }, 15000);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  if (!showInstallPrompt || isInstalled || !installAvailable) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 p-4 bg-blue-600 text-white border-0 shadow-lg z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <Download className="h-6 w-6 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Install JEE Prepometer</h3>
          <p className="text-sm mb-3 opacity-90">
            Install our app for offline access and a native app experience!
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleInstallClick}
              className="text-blue-600 hover:bg-gray-100"
            >
              Install Now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-white hover:bg-blue-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InstallPrompt;
