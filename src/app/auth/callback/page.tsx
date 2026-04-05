'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { usePlayerStore } from '@/store/usePlayerStore';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      if (!supabase) {
        router.push('/');
        return;
      }
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (!error && session) {
        // Hydrate player store from cloud on login
        await usePlayerStore.getState().loadFromCloud();
        router.push('/');
      } else {
        console.error('Auth callback error:', error || 'No session');
        router.push('/');
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-zinc-400 font-medium animate-pulse">Setting up your musical flow...</p>
      </div>
    </div>
  );
}
