'use client';

import React, { useState, useEffect } from 'react';
import { SongCard } from '@/components/SongCard';
import { motion } from 'framer-motion';
import { Song } from '@/types';

import { usePlayerStore } from '@/store/usePlayerStore';
import { History } from 'lucide-react';

import { fetchTrendingMusic, searchMusic } from '@/lib/youtube';

const CATEGORIES = ['Pop', 'Hip-hop', 'Nepali', 'Lofi', 'Focus', 'Chill'];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('Pop');
  const [trending, setTrending] = useState<Song[]>([]);
  const [nepaliHits, setNepaliHits] = useState<Song[]>([]);
  const { history } = usePlayerStore();

  useEffect(() => {
    const loadData = async () => {
      const [trendingData, nepaliData] = await Promise.all([
        fetchTrendingMusic(false),
        fetchTrendingMusic(true)
      ]);
      setTrending(trendingData);
      setNepaliHits(nepaliData);
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadCategoryData = async () => {
       if (activeCategory === 'Pop') return; // Pop is from trending usually
       const data = await searchMusic(`${activeCategory} songs 2024`);
       if (data.length > 0) {
         setTrending(data.slice(0, 6));
       }
    };
    if (activeCategory !== 'Pop') {
        loadCategoryData();
    }
  }, [activeCategory]);

  return (
    <div className="space-y-10 pb-10">
      {/* Search/Bar Header Animation */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-3xl font-black tracking-tight text-white leading-tight">
            Discover your <br/>
            <span className="text-gradient">Daily Flow</span>
        </h2>
      </motion.section>

      {/* Categories Horizontal Scroll */}
      <section className="space-y-4 -mx-6 px-6 overflow-hidden">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
            {CATEGORIES.map((cat: string) => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                        activeCategory === cat 
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105' 
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-white/5'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </section>

      {/* RECENTLY PLAYED SECTION */}
      {history.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Recently Played</h3>
          </div>
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
              {history.map((song: Song, i: number) => (
                  <div key={`${song.id}-recent`} className="w-40 flex-shrink-0">
                      <SongCard song={song} index={i} />
                  </div>
              ))}
          </div>
        </section>
      )}

      {/* Trending Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Trending Now</h3>
            <button className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">See all</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.map((song: Song, i: number) => (
                <SongCard key={song.id} song={song} index={i} />
            ))}
        </div>
      </section>

      {/* Nepali Hits (Horizontal) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Nepali Hits</h3>
        </div>
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
            {nepaliHits.map((song: Song, i: number) => (
                <div key={`${song.id}-2`} className="w-40 flex-shrink-0">
                    <SongCard song={song} index={i} />
                </div>
            ))}
        </div>
      </section>
    </div>
  );
}
