'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, Settings, ChevronRight, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useRouter } from 'next/navigation';

export const ProfileSection = () => {
  const router = useRouter();
  const { user, signInWithGoogle, signOut, isLoading } = useAuthStore();
  const { theme } = usePlayerStore();
  const [isOpen, setIsOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="w-9 h-9 rounded-full bg-zinc-800 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <button
        onClick={() => signInWithGoogle()}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300",
          "bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 shadow-md"
        )}
      >
        <LogIn size={16} />
        <span className="hidden sm:inline">Connect Google</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 rounded-full hover:bg-white/5 transition-colors"
      >
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20 bg-zinc-800">
          {user.avatar ? (
             <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold">
               {user.name.charAt(0)}
             </div>
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn(
                "absolute right-0 mt-3 w-64 p-4 rounded-3xl z-50 border shadow-2xl backdrop-blur-xl",
                theme === 'dark' ? "bg-zinc-900/90 border-white/10" : "bg-white/90 border-zinc-200"
              )}
            >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                   {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                   )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <p className="font-bold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <button 
                  onClick={() => {
                    router.push('/settings');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  <div className="flex items-center gap-3">
                    <Settings size={18} className="text-zinc-400" />
                    <span className={theme === 'dark' ? "text-white" : "text-zinc-950"}>Settings & Privacy</span>
                  </div>
                  <ChevronRight size={14} className="text-zinc-600" />
                </button>
                <button 
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors text-sm font-medium"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
