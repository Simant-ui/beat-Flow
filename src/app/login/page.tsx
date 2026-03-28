'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ShieldCheck, Music2, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
  const { signInWithGoogle } = useAuthStore();

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center -mt-24">
      <div className="w-full max-w-md space-y-10 p-8">
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30"
          >
            <Music2 className="w-10 h-10 text-white" />
          </motion.div>
          
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white tracking-tight">BeatFlow</h1>
            <p className="text-zinc-500 font-medium">Elevate your listening experience.</p>
          </div>
        </div>

        <div className="glass p-8 rounded-[40px] border border-white/5 space-y-8 shadow-2xl shadow-black/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
          
          <div className="space-y-4">
            <button 
                onClick={handleGoogleLogin}
                className="w-full h-14 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-zinc-100 transition-all active:scale-95 shadow-xl shadow-white/5"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              <span>Continue with Google</span>
            </button>

            <button className="w-full h-14 bg-zinc-900 text-white border border-white/5 rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-zinc-800 transition-all active:scale-95">
              <LogIn className="w-5 h-5" />
              <span>Alternative login</span>
            </button>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[10px] uppercase font-black tracking-widest text-zinc-600">Secure Authentication</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="space-y-4">
               <button className="w-full h-14 bg-transparent text-white border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-4 hover:border-white/20 transition-all">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span>Email Sign In</span>
               </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-zinc-600 text-xs font-medium px-4">
                By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-zinc-600 text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>End-to-End Encrypted Login</span>
        </div>
      </div>
    </div>
  );
}
