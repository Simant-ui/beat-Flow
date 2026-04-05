'use client';

import React from 'react';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { MusicPlayer } from '@/components/Player';
import { Toaster } from 'react-hot-toast';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { User } from '@/types';
import { InstallPrompt } from '@/components/InstallPrompt';
import { motion, AnimatePresence } from 'framer-motion';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const theme = usePlayerStore(state => state.theme);
  const { setUser, setLoading } = useAuthStore();

  React.useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  React.useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userObj: User = {
            id: session.user.id,
            name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
            avatar: session.user.user_metadata.avatar_url || '',
            email: session.user.email || '',
          };
          setUser(userObj);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        const userObj: User = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
          avatar: session.user.user_metadata.avatar_url || '',
          email: session.user.email || '',
        };
        setUser(userObj);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading]);

  React.useEffect(() => {
    // Service Worker registration is now handled by next-pwa plugin config
  }, []);


  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500 pb-40 relative",
      theme === 'dark' ? "bg-black text-white" : "bg-white text-zinc-900"
    )}>
      <div className="mesh-bg" />
      
      <Header />
      
      <main className="max-w-4xl mx-auto pt-28 px-6 pb-[env(safe-area-inset-bottom)] relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={typeof window !== 'undefined' ? window.location.pathname : 'initial'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <MusicPlayer />
      <BottomNav />
      <InstallPrompt />
      
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'glass-dark',
          style: {
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 'bold',
          },
        }}
      />
    </div>
  );
};
