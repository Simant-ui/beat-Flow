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
        className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl mb-3 shadow-zinc-950/20 group-hover:shadow-blue-500/10 transition-all duration-300"
        onClick={() => setCurrentSong(song)}
      >
        <img 
            src={song.thumbnail} 
            alt={song.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-blue-500 p-4 rounded-full shadow-lg shadow-blue-500/40">
                <Play className="w-6 h-6 text-white fill-current" />
            </div>
        </div>
        
        {/* Actions on Card */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button
               onClick={(e) => {
                 e.stopPropagation();
                 toggleFavorite(song);
               }}
               className={cn(
                 "p-2 rounded-full border backdrop-blur-md transition-all duration-300",
                 isFavorite 
                    ? "bg-red-500 border-red-500 text-white scale-110" 
                    : "bg-black/40 border-white/10 text-white/70 hover:text-white opacity-0 group-hover:opacity-100"
               )}
            >
                <Heart size={14} className={isFavorite ? "fill-current" : ""} />
            </button>

            <button
               onClick={handleDownload}
               className={cn(
                 "p-2 rounded-full border backdrop-blur-md transition-all duration-300",
                 isDownloaded 
                    ? "bg-blue-500 border-blue-500 text-white animate-bounce-short" 
                    : "bg-black/40 border-white/10 text-white/70 hover:text-white opacity-0 group-hover:opacity-100"
               )}
            >
                {isDownloaded ? <CheckCircle2 size={14} /> : <Download size={14} />}
            </button>
        </div>

        {isCurrent && isPlaying && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-md backdrop-blur-md">
                <div className="w-1 h-3 bg-blue-400 animate-pulse" />
                <div className="w-1 h-2 bg-blue-300 animate-pulse delay-75" />
                <div className="w-1 h-3.5 bg-blue-500 animate-pulse delay-150" />
            </div>
        )}
      </div>
      <div className="px-1" onClick={() => setCurrentSong(song)}>
        <div className="flex items-center justify-between">
            <h3 className={cn(
                "text-sm font-bold truncate flex-1 transition-colors",
                isCurrent ? "text-blue-400" : "text-white group-hover:text-blue-200"
            )}>
                {song.title}
            </h3>
        </div>
        <div className="flex items-center gap-2">
            <p className="text-xs text-zinc-500 mt-0.5 truncate group-hover:text-zinc-400 transition-colors">
                {song.artist}
            </p>
            {isDownloaded && <CheckCircle2 size={10} className="text-blue-500 mt-0.5" />}
        </div>
      </div>
    </motion.div>
  );
};
