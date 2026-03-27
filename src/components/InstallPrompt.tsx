'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, PlusSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/store/usePlayerStore';
import toast from 'react-hot-toast';


export const InstallPrompt = () => {
  const { theme } = usePlayerStore();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if it's already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
        console.log('App is already running in standalone mode');
        return;
    }

    // 2. Identify platform - iOS needs special treatment as it lacks beforeinstallprompt
    const ua = window.navigator.userAgent.toLowerCase();
    const isIphone = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIphone);

    // 3. User dismissal checks - COMMENTED OUT FOR TESTING
    // const hasBeenInstalled = localStorage.getItem('beatflow_app_installed');
    // const shownThisSession = sessionStorage.getItem('beatflow_install_prompt_shown');
    
    // For testing: Always show searching animation/prompt or at least when event fires
    
    // 4. Standard PWA listener (Chrome, Edge, Android)
    const handler = (e: any) => {
      console.log('beforeinstallprompt event caught');
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Force show immediately for the user to see the design
      setTimeout(() => {
        setShowPrompt(true);
      }, 500);
    };


    // Force show for design verification (development)
    const timeout = setTimeout(() => {
        setShowPrompt(true);
    }, 1500);

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
        window.removeEventListener('beforeinstallprompt', handler);
        clearTimeout(timeout);
    };
  }, []);


  const handleInstallClick = async () => {
    if (!deferredPrompt) {
        if (isIOS) {
            toast.error("Tap Share -> Add to Home Screen on iOS", { icon: '📱' });
            return;
        }
        toast.success("App reachable via browser menu / Already installed!");
        return;
    };

    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        localStorage.setItem('beatflow_app_installed', 'true');
        toast.success("Installed! Add to your apps for fast access.", { icon: '📱' });
        setShowPrompt(false);
    }
  };


  const handleDismiss = () => {
    // If they dismiss, don't show again in this session
    sessionStorage.setItem('beatflow_install_prompt_shown', 'true');
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          className="fixed bottom-24 left-4 right-4 z-50 flex justify-center pointer-events-none"
        >
          <div className={cn(
            "p-4 rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex items-center justify-between w-full max-w-sm pointer-events-auto border transition-colors duration-500 backdrop-blur-2xl",
             theme === 'dark' ? "bg-zinc-900/90 border-white/10" : "bg-white/90 border-zinc-200"
          )}>
            <div className="flex items-center gap-4 flex-1 overflow-hidden pr-2">
              <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                 <span className="text-white font-black text-sm tracking-tighter">BF</span>
              </div>
              <div className="flex flex-col overflow-hidden">
                <h3 className={cn("font-bold text-sm leading-tight truncate", theme === 'dark' ? "text-white" : "text-zinc-900")}>Get BeatFlow App</h3>
                <p className="text-zinc-500 text-[11px] font-medium truncate mt-0.5">Faster access, better streaming.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="bg-white text-black dark:bg-zinc-100 dark:text-zinc-900 hover:scale-105 active:scale-95 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg"
              >
                Install
              </button>
              
              <button 
                onClick={handleDismiss}
                className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all active:scale-95"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


