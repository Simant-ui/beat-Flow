'use client';

import React, { useState } from 'react';
import { 
  User, 
  LogOut, 
  Shield, 
  Heart, 
  Clock, 
  Star, 
  Headphones, 
  Moon, 
  Sun,
  ChevronRight,
  Zap,
  Trash2,
  Bell,
  Music,
  Download,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useAuthStore } from '@/store/useAuthStore';
import { SongCard } from '@/components/SongCard';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { theme, setTheme, favorites, history, downloads, dataSaver, setDataSaver, clearHistory, listeningTime } = usePlayerStore();
  const { user, signOut } = useAuthStore();
  
  const [activeView, setActiveView] = useState<'MAIN' | 'FAVORITES' | 'PRIVACY'>('MAIN');

  const formatListeningTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m`;
  };

  const stats = [
    { icon: Headphones, label: 'Listening', value: formatListeningTime(listeningTime) },
    { icon: Heart, label: 'Favorites', value: favorites.length.toString() },
    { icon: Download, label: 'Downloads', value: downloads.length.toString() },
  ];

  const menuItems = [
    { 
        icon: theme === 'dark' ? Sun : Moon, 
        label: theme === 'dark' ? 'Light Mode' : 'Dark Mode', 
        description: 'Adjust app appearance',
        color: 'text-blue-400',
        onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark')
    },
    { 
        icon: Shield, 
        label: 'Security & Privacy', 
        description: 'Manage data and account',
        color: 'text-purple-400',
        onClick: () => setActiveView('PRIVACY')
    },
    { 
        icon: Heart, 
        label: 'Your Favorites', 
        description: `${favorites.length} tracks you love`,
        color: 'text-pink-500', 
        onClick: () => setActiveView('FAVORITES')
    },
    { 
        icon: LogOut, 
        label: 'Sign Out', 
        description: 'Exit your current session',
        color: 'text-red-400', 
        isLast: true,
        onClick: () => {
            signOut();
            router.push('/login');
        }
    },
  ];

  return (
    <div className={cn(
        "min-h-screen pb-32 transition-colors duration-500",
        theme === 'dark' ? "text-white" : "text-zinc-950"
    )}>
      
      <AnimatePresence mode="wait">
        {activeView === 'MAIN' && (
          <motion.div 
            key="main"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-10"
          >
            {/* PROFILE HEADER */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 pt-10">
              <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-blue-500/20"
              >
                <div className={cn(
                    "w-full h-full rounded-full flex items-center justify-center overflow-hidden border-4",
                    theme === 'dark' ? "bg-zinc-950 border-zinc-950" : "bg-zinc-100 border-zinc-100"
                )}>
                   {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                   ) : (
                      <User className={cn("w-14 h-14", theme === 'dark' ? "text-white" : "text-zinc-400")} />
                   )}
                </div>
              </motion.div>
              
              <div className="space-y-1">
                  <h2 className="text-3xl font-black tracking-tight">
                      {user?.name || "Guest Listener"}
                  </h2>
                  <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
                      {user?.email || "listener.guest@beatflow.io"}
                  </p>
              </div>

              <button 
                onClick={() => router.push('/settings')}
                className={cn(
                    "px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all border active:scale-95",
                    theme === 'dark' ? "bg-white/5 hover:bg-white/10 text-white border-white/5" : "bg-black/5 hover:bg-black/10 text-black border-black/10"
                )}
              >
                  Advanced Settings
              </button>
            </div>

            {/* STATS GRID */}
            <section className="grid grid-cols-3 gap-4">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                        "p-5 rounded-[32px] border flex flex-col items-center justify-center space-y-2 text-center",
                        theme === 'dark' ? "bg-zinc-900/40 border-white/5" : "bg-white border-zinc-200 shadow-sm"
                    )}
                  >
                    <div className="bg-blue-500/10 p-2.5 rounded-2xl">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-lg font-black">{stat.value}</p>
                      <p className="text-[9px] uppercase tracking-widest font-black text-zinc-500">{stat.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </section>

            {/* MENU LIST */}
            <section className="space-y-4">
              <h3 className="text-base font-black text-zinc-600 px-2 uppercase tracking-[0.2em] text-[10px]">Settings & Privacy</h3>
              <div className={cn(
                  "rounded-[40px] border overflow-hidden p-2",
                  theme === 'dark' ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-xl"
              )}>
                  {menuItems.map((item, i) => (
                      <button 
                          key={item.label}
                          onClick={item.onClick}
                          className={cn(
                              "w-full flex items-center justify-between p-5 rounded-[32px] transition-all text-left group",
                              theme === 'dark' ? "hover:bg-white/5 active:bg-white/10" : "hover:bg-zinc-50 active:bg-zinc-100"
                          )}
                      >
                          <div className="flex items-center gap-4">
                              <div className={cn(
                                  "p-3 rounded-2xl transition-all duration-300", 
                                  theme === 'dark' ? "bg-zinc-800/50" : "bg-zinc-100",
                                  "group-hover:scale-110"
                              )}>
                                  <item.icon className={cn("w-5 h-5", item.color)} />
                              </div>
                              <div className="flex flex-col">
                                  <span className={cn(
                                      "font-bold text-sm", 
                                      item.label === 'Sign Out' ? "text-red-400" : (theme === 'dark' ? "text-zinc-200" : "text-zinc-800")
                                  )}>
                                      {item.label}
                                  </span>
                                  <p className="text-[10px] text-zinc-500 font-medium">{item.description}</p>
                              </div>
                          </div>
                          <ChevronRight size={18} className="text-zinc-600 group-hover:text-blue-500 transition-colors" />
                      </button>
                  ))}
              </div>
            </section>
          </motion.div>
        )}

        {activeView === 'FAVORITES' && (
           <motion.div 
             key="favorites"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             className="space-y-8"
           >
              <div className="flex items-center gap-4 pt-6">
                 <button 
                    onClick={() => setActiveView('MAIN')}
                    className="p-2 rounded-full bg-white/5 border border-white/5"
                 >
                    <ChevronLeft size={24} />
                 </button>
                 <div>
                    <h2 className="text-2xl font-black">Your Favorites</h2>
                    <p className="text-xs text-zinc-500">{favorites.length} tracks you love</p>
                 </div>
              </div>

              {favorites.length > 0 ? (
                 <div className="grid grid-cols-2 gap-6">
                    {favorites.map((song, i) => (
                        <SongCard key={song.id} song={song} index={i} />
                    ))}
                 </div>
              ) : (
                  <div className="flex flex-col items-center justify-center py-20 opacity-50 space-y-4">
                      <Heart size={48} className="text-zinc-700" />
                      <p className="text-sm font-bold uppercase tracking-widest font-black text-zinc-500">No Favorites Yet</p>
                  </div>
              )}
           </motion.div>
        )}

        {activeView === 'PRIVACY' && (
           <motion.div 
             key="privacy"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             className="space-y-8"
           >
              <div className="flex items-center gap-4 pt-6">
                 <button 
                    onClick={() => setActiveView('MAIN')}
                    className="p-2 rounded-full bg-white/5 border border-white/5"
                 >
                    <ChevronLeft size={24} />
                 </button>
                 <div>
                    <h2 className="text-2xl font-black">Privacy Control</h2>
                    <p className="text-xs text-zinc-500">Manage security settings</p>
                 </div>
              </div>

              <div className="space-y-4">
                 {[
                    { icon: Shield, label: 'Secure Mode', desc: 'Encrypt all network requests', active: true },
                    { icon: Zap, label: 'Data Saving', desc: 'Optimize playback for speed', active: dataSaver, onClick: () => setDataSaver(!dataSaver) },
                    { icon: Bell, label: 'Sound Notifications', desc: 'Get alerts for new music', active: true },
                    { icon: Trash2, label: 'Clear Cache', desc: 'Delete all temporary history', danger: true, onClick: () => { clearHistory(); toast.success("History Purged"); } },
                 ].map((item, idx) => (
                    <div key={idx} className="p-6 rounded-[32px] bg-zinc-900/40 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-2xl", item.danger ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-400")}>
                                <item.icon size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm tracking-tight">{item.label}</p>
                                <p className="text-[10px] text-zinc-500 font-medium">{item.desc}</p>
                            </div>
                        </div>
                        {item.onClick ? (
                            <button 
                                onClick={item.onClick}
                                className={cn(
                                    "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                    item.active ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-500"
                                )}
                            >
                                {item.danger ? "Purge" : (item.active ? "Active" : "OFF")}
                            </button>
                        ) : (
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                        )}
                    </div>
                 ))}
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER STATS */}
      <div className="text-center py-10 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">BeatFlow v2.0.4 Platinum</p>
        <p className="text-[9px] mt-1 font-bold">Managed by Antigravity Cloud</p>
      </div>
    </div>
  );
}

function ChevronLeft({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
  )
}
