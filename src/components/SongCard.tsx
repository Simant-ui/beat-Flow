'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, Download, CheckCircle2 } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Song } from '@/types';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface SongCardProps {
  song: Song;
  index: number;
}

export const SongCard = ({ song, index }: SongCardProps) => {
  const setCurrentSong = usePlayerStore(state => state.setCurrentSong);
  const currentSong = usePlayerStore(state => state.currentSong);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const favorites = usePlayerStore(state => state.favorites);
  const toggleFavorite = usePlayerStore(state => state.toggleFavorite);
  const downloads = usePlayerStore(state => state.downloads);
  const toggleDownload = usePlayerStore(state => state.toggleDownload);
  const startDownload = usePlayerStore(state => state.startDownload);
  
  const isCurrent = currentSong?.id === song.id;
  const isFavorite = favorites.some(s => s.id === song.id);
  const isDownloaded = downloads.some(s => s.id === song.id);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloaded) {
        toast("Already saved in Library", { icon: '📦' });
        return;
    }
    startDownload(song);
    toast.success(`Queued for download`, {
        icon: '📥',
        style: {
            borderRadius: '20px',
            background: '#18181b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
        }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="group relative cursor-pointer"
    >
      <div 
        className="relative aspect-square w-full rounded-[24px] overflow-hidden shadow-2xl mb-4 shadow-black/50 group-hover:shadow-blue-500/20 transition-all duration-700 premium-card"
        onClick={() => setCurrentSong(song)}
      >
        <img 
            src={song.thumbnail} 
            alt={song.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white text-black p-5 rounded-full shadow-2xl shadow-white/10"
            >
                <Play className="w-6 h-6 fill-current" />
            </motion.div>
        </div>
        
        {/* Actions on Card */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
               onClick={(e) => {
                 e.stopPropagation();
                 toggleFavorite(song);
               }}
               className={cn(
                 "p-2.5 rounded-2xl border backdrop-blur-xl transition-all duration-500",
                 isFavorite 
                    ? "bg-red-500 border-red-500 text-white scale-110 shadow-lg shadow-red-500/30" 
                    : "bg-black/40 border-white/10 text-white/70 hover:text-white opacity-0 group-hover:opacity-100"
               )}
            >
                <Heart size={14} className={isFavorite ? "fill-current" : ""} />
            </button>

            <button
               onClick={handleDownload}
               className={cn(
                 "p-2.5 rounded-2xl border backdrop-blur-xl transition-all duration-500",
                 isDownloaded 
                    ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30" 
                    : "bg-black/40 border-white/10 text-white/70 hover:text-white opacity-0 group-hover:opacity-100"
               )}
            >
                {isDownloaded ? <CheckCircle2 size={14} /> : <Download size={14} />}
            </button>
        </div>

        {isCurrent && isPlaying && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-xl border border-white/5">
                <div className="flex gap-1 items-end h-3">
                    <div className="w-0.5 h-full bg-blue-400 animate-[bounce_1s_infinite]" />
                    <div className="w-0.5 h-1/2 bg-blue-400 animate-[bounce_1.2s_infinite]" />
                    <div className="w-0.5 h-3/4 bg-blue-400 animate-[bounce_0.8s_infinite]" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">Playing</span>
            </div>
        )}
      </div>
      <div className="px-2" onClick={() => setCurrentSong(song)}>
        <h3 className={cn(
            "text-sm font-black truncate transition-colors duration-500 tracking-tight",
            isCurrent ? "text-blue-400" : "text-white group-hover:text-blue-200"
        )}>
            {song.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
            <p className="text-[11px] text-zinc-500 font-bold truncate group-hover:text-zinc-400 transition-colors">
                {song.artist}
            </p>
            {isDownloaded && <CheckCircle2 size={10} className="text-blue-500" />}
        </div>
      </div>
    </motion.div>
  );
};
