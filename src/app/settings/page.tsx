'use client';

import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Settings, 
  Moon, 
  Sun, 
  Shield, 
  Trash2, 
  Info, 
  ChevronRight, 
  Volume2, 
  Zap,
  Globe,
  Bell,
  ArrowRightLeft,
  ChevronLeft,
  Database,
  Smartphone,
  Eye,
  LogOut,
  FolderOpen
} from 'lucide-react';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const SettingsItem = ({ 
  icon: Icon, 
  label, 
  description, 
  children, 
  theme 
}: { 
  icon: any, 
  label: string, 
  description?: string, 
  children?: React.ReactNode,
  theme: 'dark' | 'light'
}) => (
  <div className={cn(
    "flex items-center justify-between p-4 rounded-3xl border transition-all duration-300",
    theme === 'dark' 
      ? "bg-zinc-900/40 border-white/5 hover:border-white/10 group" 
      : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm group"
  )}>
    <div className="flex items-center gap-4">
      <div className={cn(
        "w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300",
        theme === 'dark' ? "bg-white/5 text-blue-400 group-hover:bg-blue-500 group-hover:text-white" : "bg-zinc-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
      )}>
        <Icon size={22} />
      </div>
      <div>
        <h3 className="font-bold text-sm tracking-tight">{label}</h3>
        {description && <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">{description}</p>}
      </div>
    </div>
    <div className="flex items-center gap-3">
      {children}
    </div>
  </div>
);

const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-12 h-6 rounded-full relative transition-all duration-300",
      active ? "bg-blue-600 shadow-lg shadow-blue-600/20" : "bg-zinc-700"
    )}
  >
    <motion.div 
      animate={{ x: active ? 26 : 4 }}
      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
    />
  </button>
);

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme, dataSaver, setDataSaver, clearHistory, downloads, clearDownloads } = usePlayerStore();
  const { user, signOut } = useAuthStore();
  const [shareActivity, setShareActivity] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);
  const [downloadPath, setDownloadPath] = React.useState('Downloads');

  const chooseDirectory = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        // @ts-ignore
        const handle = await window.showDirectoryPicker();
        setDownloadPath(handle.name);
        toast.success(`Direct saved to: ${handle.name}`, { icon: '📂' });
      } else {
        toast("Change folder in browser settings (Standard mode active)", { icon: '📂' });
      }
    } catch (e) {
      console.log('User cancelled picker');
    }
  };


  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500 pb-32",
      theme === 'dark' ? "bg-black text-white" : "bg-zinc-50 text-zinc-950"
    )}>
      {/* Premium Settings Header */}
      <div className={cn(
          "fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b backdrop-blur-xl transition-all duration-500",
          theme === 'dark' ? "bg-black/60 border-white/5 shadow-2xl shadow-black/40" : "bg-white/80 border-zinc-100 shadow-sm"
      )}>
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
            <button 
                onClick={() => router.back()} 
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
                id="back-button"
            >
                <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-black tracking-tight">Settings & Privacy</h1>
        </div>
      </div>
      
      <main className="max-w-2xl mx-auto px-6 pt-24">
        {user && (
          <div className={cn(
            "p-6 rounded-[40px] border mb-12 flex items-center justify-between transition-all duration-500 group",
            theme === 'dark' 
              ? "bg-gradient-to-br from-zinc-900 to-zinc-950 border-white/10 shadow-3xl shadow-black" 
              : "bg-white border-zinc-200 shadow-xl shadow-zinc-200/50"
          )}>
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500/30 p-1">
                    <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800">
                        {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-2xl font-black">
                            {user.name.charAt(0)}
                        </div>
                        )}
                    </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-4 border-zinc-900 flex items-center justify-center text-white">
                    <Zap size={10} className="fill-current" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight">{user.name}</span>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{user.email || "Free Tier Account"}</span>
              </div>
            </div>
            <button 
              className={cn(
                "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                theme === 'dark' ? "bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/5" : "bg-black text-white hover:bg-zinc-800"
              )}
            >
              Pro Account
            </button>
          </div>
        )}

        <section className="space-y-10">
          {/* Dashboard Grid Simulation */}
          <div className="grid grid-cols-2 gap-4 mb-10">
              <button 
                onClick={() => router.push('/library')}
                className={cn(
                    "p-6 rounded-[32px] border text-left flex flex-col items-center justify-center transition-all duration-300 hover:scale-[1.02]",
                    theme === 'dark' ? "bg-zinc-900/40 border-white/5 hover:border-blue-500/30" : "bg-white border-zinc-200"
                )}
              >
                  <Database size={24} className="text-blue-500 mb-2" />
                  <span className="font-bold text-xs uppercase tracking-widest">Library</span>
                  <span className="text-[10px] text-zinc-500 mt-1">{downloads.length} Downloaded</span>
              </button>
              <button 
                onClick={() => router.push('/transfer')}
                className={cn(
                    "p-6 rounded-[32px] border text-left flex flex-col items-center justify-center transition-all duration-300 hover:scale-[1.02]",
                    theme === 'dark' ? "bg-zinc-900/40 border-white/5 hover:border-purple-500/30" : "bg-white border-zinc-200"
                )}
              >
                  <Smartphone size={24} className="text-purple-500 mb-2" />
                  <span className="font-bold text-xs uppercase tracking-widest text-center">Send Music to Friends</span>
                  <span className="text-[10px] text-zinc-500 mt-1">Quick Share</span>
              </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600 px-2">Basic Settings</h2>
            <div className="space-y-3">
              <SettingsItem 
                icon={theme === 'dark' ? Moon : Sun} 
                label="App Look (Day/Night)" 
                description="Change how the app looks"
                theme={theme}
              >
                <Toggle active={theme === 'dark'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
              </SettingsItem>
              <SettingsItem 
                icon={Zap} 
                label="Save My Internet Data" 
                description="Use less internet while playing music"
                theme={theme}
              >
                <Toggle active={dataSaver} onClick={() => setDataSaver(!dataSaver)} />
              </SettingsItem>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600 px-2">Security & Privacy</h2>
            <div className="space-y-3">
              <SettingsItem 
                icon={Eye} 
                label="Private Listening" 
                description="Don't save song history for now"
                theme={theme}
              >
                <Toggle active={!shareActivity} onClick={() => setShareActivity(!shareActivity)} />
              </SettingsItem>
              <SettingsItem 
                icon={Shield} 
                label="Safe Connection" 
                description="Keep your music streaming secure"
                theme={theme}
              >
                <Toggle active={true} onClick={() => {}} />
              </SettingsItem>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600 px-2">Clear Storage Space</h2>
            <div className="space-y-3">
              <SettingsItem 
                icon={Trash2} 
                label="Clear All History" 
                description="Delete all recently played songs"
                theme={theme}
              >
                <button 
                  onClick={() => {
                    clearHistory();
                    toast.success("History Purged");
                  }}
                  className="px-4 py-2 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  Clear All
                </button>
              </SettingsItem>
              <SettingsItem 
                icon={Database} 
                label="Delete All Downloaded Music" 
                description={`Remove all ${downloads.length} saved songs`}
                theme={theme}
              >
                <button 
                  onClick={() => {
                    clearDownloads();
                    toast.success("Downloads Purged");
                  }}
                  className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 hover:text-white transition-all"
                >
                  Clear {downloads.length}
                </button>
              </SettingsItem>
            </div>
          </div>


          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600 px-2">Music Save Location</h2>
            <div className="space-y-3">
              <SettingsItem 
                icon={FolderOpen} 
                label="Where to Save Music" 
                description={`Currently saving to: ${downloadPath}`}
                theme={theme}
              >
                <button 
                  onClick={chooseDirectory}
                  className={cn(
                    "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                    theme === 'dark' ? "bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                  )}
                >
                  Change Folder
                </button>
              </SettingsItem>
            </div>
          </div>

          <div className="space-y-4">

            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600 px-2">Device & App Status</h2>
            <div className="space-y-3">
              <SettingsItem 
                icon={Smartphone} 
                label="PWA Installation" 
                description={typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches) ? "Application is currently installed" : "Install for offline access"}
                theme={theme}
              >
                <div className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  {typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches) ? "Active" : "Available"}
                </div>
              </SettingsItem>
              <SettingsItem 
                icon={Info} 
                label="System Version" 
                description="BeatFlow Platinum 2.0.4"
                theme={theme}
              >
                <span className="text-[10px] font-bold text-zinc-500">v2.0.4</span>
              </SettingsItem>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 space-y-4">
              <button 
                onClick={() => {
                    signOut();
                    router.push('/login');
                }}
                className="w-full flex items-center justify-center gap-3 p-5 rounded-[30px] bg-red-600 text-white font-black shadow-2xl shadow-red-600/20 active:scale-95 transition-all"
              >
                  <LogOut size={20} />
                  SIGN OUT FROM BEATFLOW
              </button>
              <div className="text-center py-4">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Built for high-fidelity listeners</p>
                <p className="text-[10px] text-blue-500 mt-1 font-black underline uppercase tracking-widest cursor-pointer">Terms & Security Policy</p>
              </div>
          </div>
        </section>
      </main>
    </div>
  );
}

