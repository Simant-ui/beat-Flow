'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/store/usePlayerStore';

export const InstallPrompt = () => {
  const { theme } = usePlayerStore();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 1. If already in standalone mode (already installed & running), hide
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return;
    }

    // 2. If user already dismissed it permanently or installed it, hide
    const hasBeenInstalled = localStorage.getItem('beatflow_app_installed');
    if (hasBeenInstalled) return;

    // 3. For the current session, if already shown, don't show "bich-bich ma"
    const shownThisSession = sessionStorage.getItem('beatflow_install_prompt_shown');
    if (shownThisSession) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Wait 5 seconds to not be too aggressive
      setTimeout(() => {
        setShowPrompt(true);
        sessionStorage.setItem('beatflow_install_prompt_shown', 'true');
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    if (outcome === 'accepted') {
        localStorage.setItem('beatflow_app_installed', 'true');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    // If they click X, mark it to never show again to avoid annoyance
    localStorage.setItem('beatflow_app_installed', 'true');
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 100 }}
          className="fixed bottom-[160px] left-4 right-4 z-50 flex justify-center"
        >
          <div className={cn(
            "p-6 rounded-3xl border shadow-2xl flex items-center justify-between max-w-sm w-full gap-4",
            theme === 'dark' ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200"
          )}>
            <div className="flex-1">
              <h3 className={cn("font-black text-lg", theme === 'dark' ? "text-white" : "text-zinc-950")}>Install our app</h3>
              <p className="text-xs text-zinc-500 font-medium">Get faster access & better experience</p>
            </div>
            
            <div className="flex items-center gap-3">
                <button
                    onClick={handleInstallClick}
                    className="bg-[#00703c] hover:bg-[#005c32] text-white px-6 py-2 rounded-xl font-black text-sm transition-all active:scale-95"
                >
                    Install
                </button>
                <button 
                    onClick={handleDismiss}
                    className="p-1 text-zinc-500 hover:text-zinc-700 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
