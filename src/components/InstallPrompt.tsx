
import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstallStatus = () => {
      const installed = (window as any).isAppInstalled?.() || false;
      setIsAppInstalled(installed);
      return installed;
    };

    const installed = checkInstallStatus();

    // Listen for installable event
    const handleInstallable = () => {
      console.log('[InstallPrompt] App became installable');
      setIsInstallable(true);
      
      if (!installed) {
        // Check if user dismissed recently
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        const dismissTime = dismissed ? parseInt(dismissed) : 0;
        const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
        
        if (dismissTime < dayAgo) {
          // Show prompt after 2 seconds
          setTimeout(() => setShowPrompt(true), 2000);
        }
      }
    };

    // Listen for installed event
    const handleInstalled = () => {
      console.log('[InstallPrompt] App was installed');
      setIsAppInstalled(true);
      setShowPrompt(false);
      setIsInstallable(false);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    console.log('[InstallPrompt] Install button clicked');
    
    try {
      const result = await (window as any).triggerPWAInstall?.();
      
      if (result?.success) {
        console.log('[InstallPrompt] Installation successful');
        setShowPrompt(false);
        setIsAppInstalled(true);
      } else {
        console.log('[InstallPrompt] Install failed or was dismissed:', result?.reason);
        // Hide prompt to avoid annoyance, but don't mark as installed
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('[InstallPrompt] Install error:', error);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if app is installed or not installable
  if (isAppInstalled || !isInstallable || !showPrompt) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-2xl z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <div className="bg-white/20 rounded-full p-2">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">Install JEE Prepometer</h3>
          <p className="text-blue-100 text-sm mb-4 leading-relaxed">
            Get instant access, work offline, and enjoy a native app experience!
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Install Now
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              className="text-white hover:bg-white/20 p-2 rounded-lg"
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
