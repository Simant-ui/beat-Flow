'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Play, Pause, SkipBack, SkipForward, Maximize2, Minimize2, Heart, Volume2, X, Download, CheckCircle2, Languages } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchRelatedSongs } from '@/lib/youtube';

const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });


export const MusicPlayer = () => {
  const { 
    currentSong, 
    setCurrentSong,
    isPlaying, 
    volume, 
    togglePlay, 
    setPlaying, 
    setVolume,
    next, 
    previous,
    favorites,
    toggleFavorite,
    downloads,
    toggleDownload,
    dataSaver,
    incrementListeningTime
  } = usePlayerStore();
  
  const isFavorite = currentSong ? favorites.some(s => s.id === currentSong.id) : false;
  const isDownloaded = currentSong ? downloads.some(s => s.id === currentSong.id) : false;
  
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'PLAYER' | 'LYRICS' | 'RELATED'>('PLAYER');
  const [lyricsLanguage, setLyricsLanguage] = useState<'en' | 'ne' | 'hi'>('en');
  const [relatedSongs, setRelatedSongs] = useState<any[]>([]);
  const playerRef = useRef<any>(null);

  // Reset progress and ready state when song changes
  useEffect(() => {
    setPlayed(0);
    setDuration(0);
    setIsReady(false);
    
    // Fetch related songs
    if (currentSong) {
        fetchRelatedSongs(currentSong).then(setRelatedSongs);
    }
  }, [currentSong?.id]);



  // Real-time Session Listening Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && isReady) {
      interval = setInterval(() => {
        incrementListeningTime();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isReady, incrementListeningTime]);

  const [hasWindow, setHasWindow] = useState(false);
  useEffect(() => {
    setHasWindow(true);
  }, []);


  if (!currentSong) return null;

  const handleProgress = (state: any) => {
    if (state.played !== undefined) {
      setPlayed(state.played);
      // Force duration detection if it's still missing during playback
      if (duration === 0 && playerRef.current) {
        try {
          const d = playerRef.current.getDuration();
          if (d && d > 0) setDuration(d);
        } catch (e) {}
      }
    }
  };

  const handleDuration = (d: number) => {
    if (d && d > 0) setDuration(d);
  };

  const handleReady = () => {
    setIsReady(true);
    if (playerRef.current) {
        try {
          const d = playerRef.current.getDuration();
          if (d && d > 0) setDuration(d);
        } catch (e) {}
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPlayed(value);
    if (playerRef.current) {
        playerRef.current.seekTo(value);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSong) return;
    toggleDownload(currentSong);
    if (!isDownloaded) {
        toast.success(`Saved for Offline`, {
            style: {
                borderRadius: '20px',
                background: '#18181b',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
            }
        });
    } else {
        toast("Removed from Downloads", { icon: '🗑️' });
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds === undefined || seconds === null || isNaN(seconds) || seconds < 0) return "0:00";
    const mm = Math.floor(seconds / 60);
    const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const songUrl = currentSong.url || `https://www.youtube.com/watch?v=${currentSong.id}`;

  return (
    <div className={cn(
      "fixed z-50 transition-all duration-500 ease-in-out",
      isExpanded 
        ? "inset-0 h-full w-full bg-black flex flex-col active overflow-hidden" 
        : "bottom-[76px] left-4 right-4 h-[72px] glass-dark border border-white/10 rounded-2xl shadow-2xl shadow-black/40 px-4"
    )}>
      {/* Background for Expanded Player */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 overflow-hidden"
          >
            <img 
              src={currentSong.thumbnail} 
              alt="" 
              className="w-full h-full object-cover scale-150 blur-[80px] opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music Engine - Hidden but active */}
      {hasWindow && (
        <div className="fixed -top-[200px] -left-[200px] w-48 h-24 opacity-0 pointer-events-none -z-[100]">
          <ReactPlayer
            ref={playerRef}
            url={songUrl}
            playing={isPlaying}
            volume={volume}
            muted={false}
            playsinline={true}
            onProgress={handleProgress}
            onDuration={handleDuration}
            onEnded={next}
            onReady={handleReady}
            onStart={() => setIsReady(true)}
            onBuffer={() => setIsReady(false)}
            onBufferEnd={() => setIsReady(true)}
            onError={(e: any) => {
              console.error('Playback Error:', e);
              setIsReady(false);
            }}
            config={{
              youtube: {
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  modestbranding: 1,
                  rel: 0,
                  showinfo: 0,
                  iv_load_policy: 3,
                  disablekb: 1,
                  origin: typeof window !== 'undefined' ? window.location.origin : '',
                }
              }
            }}
            width="100%"
            height="100%"
          />
        </div>
      )}

      <div className={cn(
        "relative z-10 w-full h-full mx-auto overflow-y-auto no-scrollbar scroll-smooth",
        isExpanded ? "max-w-lg bg-black/20" : "flex items-center justify-between max-w-4xl px-4 h-full"
      )}>
        {isExpanded ? (
          <>
            {/* TOP CONTENT: Art + Info + Fixed Controls (Moves up on scroll like Spotify) */}
            <div className="flex-shrink-0 flex flex-col px-8 pt-10 pb-8">
                {/* Header Nav */}
                <div className="flex items-center justify-between w-full mb-10 flex-shrink-0">
                    <button 
                        onClick={() => setIsExpanded(false)}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <Minimize2 className="w-5 h-5 text-white" />
                    </button>
                    <div className="text-center flex-1 mx-4">
                        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-500/80">Now Playing</span>
                    </div>
                    <button 
                        onClick={() => setCurrentSong(null)}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Album Art (Medium size) */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative aspect-square w-[75%] mx-auto rounded-[40px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(59,130,246,0.3)] mb-10"
                >
                    <img 
                        src={currentSong.thumbnail} 
                        alt={currentSong.title} 
                        className={cn("w-full h-full object-cover transition-opacity duration-1000", !isReady ? "opacity-40 grayscale" : "opacity-100")}
                    />
                    {!isReady && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </motion.div>

                {/* Track Info & Actions */}
                <div className="flex items-center justify-between gap-6 px-1 mb-8">
                    <div className="flex-1 overflow-hidden">
                        <h2 className="text-2xl font-black text-white truncate leading-tight mb-1">
                            {currentSong.title}
                        </h2>
                        <p className="text-lg text-zinc-500 font-medium truncate">
                            {currentSong.artist}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleDownload}
                            className={cn(
                                "p-3 rounded-2xl border transition-all duration-300",
                                isDownloaded 
                                    ? "bg-blue-500/10 border-blue-500/20 text-blue-500" 
                                    : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                            )}
                        >
                            {isDownloaded ? <CheckCircle2 className="w-6 h-6" /> : <Download className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Full Controls */}
                <div className="space-y-10">
                    <div className="w-full">
                        <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                            <motion.div 
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500"
                                style={{ width: `${played * 100}%` }}
                                initial={false}
                            />
                            <input 
                                type="range"
                                min={0}
                                max={0.999999}
                                step="any"
                                value={played}
                                onChange={handleSeekChange}
                                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                            />
                        </div>
                        <div className="flex justify-between text-[11px] font-black tracking-widest text-zinc-600">
                            <span>{formatTime(played * duration)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-10">
                        <button onClick={previous} className="text-white/60 hover:text-blue-500 transition-colors p-2 active:scale-90">
                            <SkipBack className="w-10 h-10 fill-current" />
                        </button>
                        <button 
                            onClick={togglePlay}
                            className="bg-white text-black p-8 rounded-[40px] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_-10px_rgba(255,255,255,0.2)]"
                        >
                            {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
                        </button>
                        <button onClick={next} className="text-white/60 hover:text-blue-500 transition-colors p-2 active:scale-90">
                            <SkipForward className="w-10 h-10 fill-current" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between px-2 pt-4">
                        <button 
                            onClick={() => currentSong && toggleFavorite(currentSong)}
                            className={cn(
                                "transition-all duration-300",
                                isFavorite ? "text-red-500 scale-110" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            <Heart className={cn("w-7 h-7", isFavorite ? "fill-current" : "")} />
                        </button>
                        
                        <div className="flex items-center gap-3 bg-white/5 px-6 py-4 rounded-3xl border border-white/5 flex-1 ml-10">
                            <Volume2 className="w-5 h-5 text-zinc-600" />
                            <input 
                                type="range" 
                                min={0} 
                                max={1} 
                                step="any" 
                                value={volume} 
                                onChange={(e) => setVolume(parseFloat(e.target.value))} 
                                className="w-full h-1 accent-white bg-white/10 rounded-full appearance-none" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center justify-center gap-1 px-8 mb-6">
                {(['PLAYER', 'LYRICS', 'RELATED'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                            activeTab === tab ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT (Switches based on activeTab) */}
            <div className="px-8 pb-40 min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'PLAYER' && (
                        <motion.div 
                            key="player-stats"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-white/5 border border-white/5 p-8 rounded-[40px] space-y-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500">
                                    <Volume2 />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Audio Quality</p>
                                    <h4 className="text-white font-bold">Lossless Pro (256kbps)</h4>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500">
                                    <CheckCircle2 />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Source Verified</p>
                                    <h4 className="text-white font-bold">Official YouTube Audio</h4>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'LYRICS' && (
                        <motion.div 
                            key="lyrics"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Lyrics Header */}
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2 text-blue-500">
                                    <Languages size={18} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Translations Active</span>
                                </div>
                                <div className="flex gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10">
                                    {(['en', 'ne', 'hi'] as const).map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => setLyricsLanguage(lang)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all duration-300",
                                                lyricsLanguage === lang ? "bg-white text-black shadow-lg" : "text-white/30 hover:text-white"
                                            )}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic Lyrics Content */}
                            <div className="pt-4">
                                <div className="bg-white/5 border border-white/5 p-8 rounded-[40px] backdrop-blur-md">
                                    <p className="text-2xl font-black text-white leading-relaxed mb-6">
                                        {lyricsLanguage === 'ne' ? 'गीतका शब्दहरू उपलब्ध छैनन्...' : 
                                        lyricsLanguage === 'hi' ? 'बोल उपलब्ध नहीं हैं...' : 
                                        'No official lyrics found.'}
                                    </p>
                                    
                                    <div className="space-y-4 text-zinc-400 font-medium text-lg leading-loose italic opacity-60">
                                        <p>&quot;{currentSong.title}&quot;</p>
                                        <p>by {currentSong.artist}</p>
                                    </div>

                                    <button 
                                        onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(currentSong.title + ' ' + currentSong.artist + ' ' + lyricsLanguage + ' lyrics')}`, '_blank')}
                                        className="w-full py-5 rounded-[25px] bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest transition-all mt-10 shadow-xl shadow-blue-500/20 active:scale-95"
                                    >
                                        Full {lyricsLanguage.toUpperCase()} Lyrics on Google
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'RELATED' && (
                        <motion.div 
                            key="related"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 px-1">Up Next & Related</h3>
                            <div className="space-y-3">
                                {relatedSongs.length > 0 ? relatedSongs.map((song, i) => (
                                    <button 
                                        key={song.id}
                                        onClick={() => setCurrentSong(song)}
                                        className="w-full flex items-center gap-4 p-3 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group scale-100 active:scale-98"
                                    >
                                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                                            <img src={song.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                        </div>
                                        <div className="flex-1 text-left overflow-hidden">
                                            <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">{song.title}</h4>
                                            <p className="text-[11px] text-zinc-500 font-medium truncate mt-0.5">{song.artist}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                                            <Play size={14} className="fill-current" />
                                        </div>
                                    </button>
                                )) : (
                                    <div className="py-20 text-center">
                                        <div className="w-12 h-12 border-2 border-zinc-800 border-t-white rounded-full animate-spin mx-auto mb-4" />
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Loading similar vibes...</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

          </>
        ) : (
          <>
            <div 
                className="flex items-center gap-3 flex-1 overflow-hidden"
                onClick={() => setIsExpanded(true)}
            >
              <div className="relative w-12 h-12 flex-shrink-0">
                <img 
                    src={currentSong.thumbnail} 
                    alt={currentSong.title} 
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-semibold text-white truncate">{currentSong.title}</h4>
                <p className="text-xs text-zinc-400 truncate -mt-0.5">{currentSong.artist}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={togglePlay} 
                className="bg-white text-black p-2.5 rounded-full transition-all active:scale-90"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>
              <button 
                onClick={() => setIsExpanded(true)}
                className="text-white/40 hover:text-white transition-colors p-1"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentSong(null)}
                className="text-white/40 hover:text-white transition-colors p-1 ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="absolute bottom-1 left-3 right-3 h-[2px] bg-white/5 overflow-hidden rounded-full">
                <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${played * 100}%` }}
                />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
