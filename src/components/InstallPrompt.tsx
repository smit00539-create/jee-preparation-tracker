
import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInWebApp = window.matchMedia('(display-mode: fullscreen)').matches;
      setIsInstalled(isStandalone || isInWebAppiOS || isInWebApp);
    };

    checkIfInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[Install] beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt if not dismissed recently and not installed
      const dismissed = localStorage.getItem('installPromptDismissed');
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      if (dismissedTime < oneDayAgo && !isInstalled) {
        setTimeout(() => setShowInstallPrompt(true), 2000);
      }
    };

    const handleAppInstalled = () => {
      console.log('[Install] PWA was installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('installPromptDismissed');
    };

    // Listen for the install prompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    console.log('[Install] Install button clicked', { 
      deferredPrompt: !!deferredPrompt,
      userAgent: navigator.userAgent 
    });
    
    if (!deferredPrompt) {
      console.log('[Install] No deferred prompt available');
      
      // Try to show install prompt anyway for supported browsers
      if ('getInstalledRelatedApps' in navigator) {
        try {
          const relatedApps = await (navigator as any).getInstalledRelatedApps();
          if (relatedApps.length === 0) {
            // App is not installed, show browser-specific instructions
            showBrowserSpecificInstructions();
          }
        } catch (error) {
          console.log('[Install] getInstalledRelatedApps failed:', error);
          showBrowserSpecificInstructions();
        }
      } else {
        showBrowserSpecificInstructions();
      }
      return;
    }

    try {
      console.log('[Install] Showing install prompt');
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`[Install] Install prompt outcome: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('[Install] User accepted the install prompt');
        // The appinstalled event will handle the rest
      } else {
        console.log('[Install] User dismissed the install prompt');
        localStorage.setItem('installPromptDismissed', Date.now().toString());
      }
      
      // Clear the saved prompt since it can only be used once
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      
    } catch (error) {
      console.error('[Install] Error during installation:', error);
      setShowInstallPrompt(false);
    }
  };

  const showBrowserSpecificInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    let instructions = '';
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      instructions = 'Chrome: Look for the install icon (⚙️) in the address bar, or go to Settings → Install JEE Prepometer';
    } else if (userAgent.includes('safari')) {
      instructions = 'Safari: Tap the Share button (📤) → "Add to Home Screen"';
    } else if (userAgent.includes('firefox')) {
      instructions = 'Firefox: Look for the install icon in the address bar or go to Settings → "Install"';
    } else if (userAgent.includes('edge')) {
      instructions = 'Edge: Click the three dots menu → Apps → "Install JEE Prepometer"';
    } else {
      instructions = 'Look for "Install", "Add to Home Screen", or an install icon in your browser';
    }
    
    // Create a better modal instead of alert
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
      <button style="
        background: #3b82f6; color: white; border: none; padding: 10px 20px; 
        border-radius: 6px; cursor: pointer; font-weight: 500;
      " onclick="document.body.removeChild(this.closest('div'))">
        Got it!
      </button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    setTimeout(() => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    }, 10000);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  if (!showInstallPrompt || isInstalled) {
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
