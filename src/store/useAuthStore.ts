import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { AuthState, User } from '@/types';
import { toast } from 'react-hot-toast';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  
  signInWithGoogle: async () => {
    if (!supabase) {
      toast.error('Supabase configuration missing (Add keys to Netlify Environment Variables)');
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Error logging in');
      console.error('Error:', error);
    }
  },
  
  signOut: async () => {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error logging out');
    }
  },
}));
