'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, X, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SongCard } from '@/components/SongCard';
import { Song } from '@/types';
import debounce from 'lodash/debounce';
import toast from 'react-hot-toast';
import { usePlayerStore } from '@/store/usePlayerStore';
import { searchMusic } from '@/lib/youtube';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Song[]>([]);
  const [pasteUrl, setPasteUrl] = useState('');
  const { setCurrentSong } = usePlayerStore();

  const handleSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const musicResults = await searchMusic(searchQuery);
        setResults(musicResults);
      } catch (error) {
        toast.error('Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    handleSearch(query);
  }, [query, handleSearch]);

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractVideoId(pasteUrl);
    
    if (videoId) {
      toast.success('Video loaded!');
      const newSong: Song = {
        id: videoId,
        title: 'Loaded via Link',
        artist: 'YouTube',
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      };
      setCurrentSong(newSong);
      setPasteUrl('');
    } else {
      toast.error('Invalid YouTube URL');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <h2 className="text-3xl font-black text-white">Search</h2>

      {/* SEARCH INPUT */}
      <div className="relative group">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Artists, songs, or podcasts"
          className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        )}
      </div>

      {/* PASTE LINK SECTION */}
      <div className="glass-dark border border-white/5 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 text-zinc-300 font-bold mb-2">
            <LinkIcon className="w-5 h-5 text-blue-400" />
            <span>Paste YouTube Link</span>
        </div>
        <form onSubmit={handlePasteSubmit} className="flex gap-2">
            <input
                type="text"
                value={pasteUrl}
                onChange={(e) => setPasteUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/30 transition-all"
            />
            <button 
                type="submit"
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
            >
                Play
            </button>
        </form>
      </div>

      {/* RESULTS GRID */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
            {isSearching ? (
                <motion.div 
                    key="searching"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-3 animate-pulse">
                            <div className="aspect-square bg-zinc-800 rounded-2xl" />
                            <div className="h-4 bg-zinc-800 rounded w-3/4" />
                            <div className="h-3 bg-zinc-800 rounded w-1/2" />
                        </div>
                    ))}
                </motion.div>
            ) : results.length > 0 ? (
                <motion.div 
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {results.map((song, i) => (
                        <SongCard key={song.id} song={song} index={i} />
                    ))}
                </motion.div>
            ) : query.length > 2 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500 space-y-4">
                    <AlertCircle className="w-12 h-12 opacity-20" />
                    <p className="font-medium">No results found for "{query}"</p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500 space-y-2">
                    <p className="font-bold text-zinc-600 uppercase tracking-widest text-xs">Search History</p>
                    <p className="text-zinc-700 text-sm">Your recent searches will appear here.</p>
                </div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
