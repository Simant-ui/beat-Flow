'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, CheckCircle2, X, Music, Loader2 } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { cn } from '@/lib/utils';

export const DownloadManager = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { downloadQueue, theme } = usePlayerStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={cn(
              "absolute right-0 mt-2 w-80 p-5 rounded-[32px] z-[70] border shadow-2xl backdrop-blur-xl",
              theme === 'dark' ? "bg-zinc-900/90 border-white/10" : "bg-white/90 border-zinc-200"
            )}
          >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-blue-500">
                    <Download size={18} className="animate-pulse" />
                    <h3 className="font-black text-xs uppercase tracking-[0.2em]">Active Beam</h3>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full transition-colors">
                    <X size={16} className="text-zinc-500" />
                </button>
            </div>

            <div className="space-y-6 max-h-[400px] overflow-y-auto no-scrollbar">
              {downloadQueue.length > 0 ? (
                downloadQueue.map((item) => (
                  <div key={item.songId} className="space-y-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                        <img src={item.song.thumbnail} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold truncate text-white">{item.song.title}</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate">{item.song.artist}</p>
                      </div>
                      {item.status === 'COMPLETED' ? (
                          <CheckCircle2 size={16} className="text-green-500" />
                      ) : (
                          <Loader2 size={16} className="text-blue-500 animate-spin" />
                      )}
                    </div>

                    <div className="space-y-2">
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${item.progress}%` }}
                                className={cn(
                                    "h-full transition-all duration-500",
                                    item.status === 'COMPLETED' ? "bg-green-500" : "bg-blue-500"
                                )}
                            />
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                            <span className={item.status === 'COMPLETED' ? "text-green-500" : "text-blue-500"}>
                                {item.status === 'COMPLETED' ? "COMPLETED" : `${Math.floor(item.progress)}%`}
                            </span>
                            <span className="text-zinc-500">
                                {item.currentMB} MB / {item.totalMB} MB
                            </span>
                        </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 space-y-4 opacity-40">
                    <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500">
                        <Music size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Queue is empty</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/5 text-center">
                 <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-[0.3em] font-mono">End-to-End Encrypted Transfer</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
