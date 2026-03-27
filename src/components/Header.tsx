'use client';

import React from 'react';
import { Settings, Bell, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

import { usePlayerStore } from '@/store/usePlayerStore';
import { ProfileSection } from '@/components/ProfileSection';
import { BeatFlowLogo } from '@/components/BeatFlowLogo';

import { DownloadManager } from '@/components/DownloadManager';
import { DownloadCloud } from 'lucide-react';

export const Header = () => {
  const router = useRouter();
  const theme = usePlayerStore(state => state.theme);
  const downloadQueue = usePlayerStore(state => state.downloadQueue);
  const [isDownloadsOpen, setIsDownloadsOpen] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isStandalone, setIsStandalone] = React.useState(false);

  React.useEffect(() => {
    // Check if standalone
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
        setIsStandalone(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        setDeferredPrompt(null);
    }
  };

  // Active downloads count

  const activeCount = downloadQueue.filter(d => d.status === 'DOWNLOADING').length;

  return (
    <header className={cn(
        "fixed top-0 left-0 right-0 z-40 px-6 py-4 border-b safe-top transition-colors duration-500",
        theme === 'dark' ? "glass-dark border-white/5 shadow-2xl shadow-black/40" : "bg-white/80 backdrop-blur-xl border-zinc-100 shadow-sm"
    )}>
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="relative w-10 h-10 flex items-center justify-center">
            <BeatFlowLogo className="w-10 h-10" />
          </div>
          <h1 className={cn("text-2xl font-black tracking-tighter mb-0 flex items-center -ml-1", theme === 'dark' ? "text-white" : "text-zinc-900")}>
            <span className="text-gradient">Beat</span><span>Flow</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/search')}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Download Manager Button */}
          <div className="relative">
            <button
                onClick={() => setIsDownloadsOpen(!isDownloadsOpen)}
                className="p-2 text-zinc-400 hover:text-white transition-colors relative"
            >
                <DownloadCloud className={cn("w-5 h-5", activeCount > 0 ? "animate-pulse text-blue-500" : "")} />
                {activeCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30">
                        {activeCount}
                    </span>
                )}
            </button>
            <DownloadManager 
              isOpen={isDownloadsOpen} 
              onClose={() => setIsDownloadsOpen(false)} 
            />
          </div>
          
          <ProfileSection />

          {deferredPrompt && !isStandalone && (
            <button
                onClick={handleInstall}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95"
            >
                Install App
            </button>
          )}

          <button 
            onClick={() => router.push('/settings')}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>

        </div>
      </div>
    </header>
  );
};
