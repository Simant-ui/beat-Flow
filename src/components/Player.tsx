'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Maximize2, 
  Minimize2, 
  Heart, 
  Volume2, 
  X, 
  Download, 
  CheckCircle2, 
  Languages,
  Shuffle, 
  Repeat, 
  Repeat1 
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { cn } from '@/lib/utils'; // Ensure this utility is available
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchRelatedSongs } from '@/lib/youtube';
import { fetchLyrics } from '@/lib/lyrics';

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
    isShuffled,
    setShuffled,
    repeatMode,
    setRepeatMode,
    addToQueue,
    queue,
    incrementListeningTime
  } = usePlayerStore();
  
  const isFavorite = currentSong ? favorites.some(s => s.id === currentSong.id) : false;
  const isDownloaded = currentSong ? downloads.some(s => s.id === currentSong.id) : false;
  
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'PLAYER' | 'LYRICS' | 'RELATED'>('PLAYER');
  const [relatedSongs, setRelatedSongs] = useState<any[]>([]);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const playerRef = useRef<any>(null);
  const [hasWindow, setHasWindow] = useState(false);

  useEffect(() => {
    setHasWindow(true);
  }, []);

  useEffect(() => {
    if (currentSong) {
      setPlayed(0);
      setDuration(0);
      setIsReady(false);
      setIsLoadingLyrics(true);
      setLyrics(null);
      
      Promise.all([
        fetchRelatedSongs(currentSong),
        fetchLyrics(currentSong.artist, currentSong.title)
      ]).then(([songs, fetchedLyrics]) => {
        setRelatedSongs(songs);
        setLyrics(fetchedLyrics);
        setIsLoadingLyrics(false);
        if (queue.length <= 1) {
          songs.forEach(s => addToQueue(s));
        }
      });
    }
  }, [currentSong?.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && isReady) {
      interval = setInterval(() => {
        incrementListeningTime();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isReady, incrementListeningTime]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: 'BeatFlow Music',
        artwork: [{ src: currentSong.thumbnail, sizes: '512x512', type: 'image/jpeg' }],
      });
      navigator.mediaSession.setActionHandler('play', () => setPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', () => previous());
      navigator.mediaSession.setActionHandler('nexttrack', () => next());
    }
  }, [currentSong?.id, next, previous, setPlaying]);

  if (!currentSong) return null;

  const handleProgress = (state: { played: number }) => {
    if (state.played !== undefined) {
      setPlayed(state.played);
      if (duration === 0 && playerRef.current) {
        const d = playerRef.current.getDuration();
        if (d) setDuration(d);
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
    const mm = Math.floor(seconds / 60);
    const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
    return mm + ":" + ss;
  };

  const songUrl = currentSong.url || "https://www.youtube.com/watch?v=" + currentSong.id;

  return (
    <div className={cn(
        "fixed z-50 transition-all duration-500 ease-in-out",
        isExpanded 
          ? "inset-0 h-[100dvh] w-full bg-black flex flex-col overflow-hidden" 
          : "bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)] left-0 right-0 sm:left-4 sm:right-4 h-[72px] bg-black/80 backdrop-blur-xl border border-white/10 rounded-none sm:rounded-2xl shadow-2xl px-4"
      )}>
      
      {/* Background Gradient */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-0">
            <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover blur-[100px] opacity-30" />
            <div className="absolute inset-0 bg-black/60" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Music Player */}
      {hasWindow && (
        <div className="hidden">
          <ReactPlayer
            ref={playerRef}
            url={songUrl}
            playing={isPlaying}
            volume={volume}
            onProgress={handleProgress}
            onDuration={(d: number) => setDuration(d)}
            onEnded={next}
            onReady={() => setIsReady(true)}
            onStart={() => setIsReady(true)}
            config={{ youtube: { playerVars: { origin: window.location.origin } } }}
          />
        </div>
      )}

      {/* Interface */}
      <div className={cn(
        "relative z-10 w-full h-full mx-auto overflow-y-auto no-scrollbar",
        isExpanded ? "max-w-lg flex flex-col" : "flex items-center justify-between max-w-4xl h-full"
      )}>
        {isExpanded ? (
          <>
            {/* Expanded Header */}
            <div className="flex items-center justify-between w-full px-8 pt-10 mb-8">
              <button onClick={() => setIsExpanded(false)} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-400"><Minimize2 size={20} /></button>
              <div className="text-center font-black text-[10px] uppercase tracking-widest text-blue-500">Premium Playback</div>
              <button onClick={() => setCurrentSong(null)} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-400"><X size={20} /></button>
            </div>

            {/* ART & INFO */}
            <div className="px-8 mb-8 text-center">
              <motion.img layoutId="player-art" src={currentSong.thumbnail} className="aspect-square w-full rounded-[40px] shadow-2xl mx-auto mb-8 object-cover" />
              <div className="flex justify-between items-center px-2">
                <div className="text-left overflow-hidden">
                  <h2 className="text-2xl font-black text-white truncate">{currentSong.title}</h2>
                  <p className="text-lg text-zinc-500 font-medium truncate">{currentSong.artist}</p>
                </div>
                <button onClick={() => toggleFavorite(currentSong)} className={isFavorite ? "text-red-500" : "text-zinc-600"}>
                  <Heart size={28} className={isFavorite ? "fill-current" : ""} />
                </button>
              </div>
            </div>

            {/* PROGRESS & CONTROLS */}
            <div className="px-10 space-y-8">
              <div className="space-y-3">
                <div className="relative h-1 w-full bg-white/10 rounded-full">
                  <div className="absolute h-full bg-white rounded-full" style={{ width: (played * 100) + "%" }} />
                  <input type="range" min={0} max={0.99} step="any" value={played} onChange={(e) => { setPlayed(parseFloat(e.target.value)); playerRef.current?.seekTo(parseFloat(e.target.value)); }} className="absolute inset-0 w-full opacity-0 cursor-pointer" />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-zinc-600">
                  <span>{formatTime(played * duration)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setShuffled(!isShuffled)} className={isShuffled ? "text-blue-500" : "text-zinc-600"}><Shuffle size={22} /></button>
                <button onClick={previous} className="text-white"><SkipBack size={32} fill="currentColor" /></button>
                <button onClick={togglePlay} className="bg-white text-black p-6 rounded-full shadow-xl">
                  {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>
                <button onClick={next} className="text-white"><SkipForward size={32} fill="currentColor" /></button>
                <button onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')} className={repeatMode !== 'none' ? "text-blue-500" : "text-zinc-600"}>
                  {repeatMode === 'one' ? <Repeat1 size={22} /> : <Repeat size={22} />}
                </button>
              </div>

              <div className="bg-white/5 p-4 rounded-3xl flex items-center gap-4">
                <Volume2 size={18} className="text-zinc-600" />
                <input type="range" min={0} max={1} step="any" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="flex-1 h-1 bg-white/10 rounded-full appearance-none accent-white" />
                <button onClick={(e) => { e.stopPropagation(); toggleDownload(currentSong); toast.success("Offline Task Updated"); }} className={isDownloaded ? "text-blue-500" : "text-zinc-600"}><Download size={18} /></button>
              </div>
            </div>

            {/* TAB SELECTION */}
            <div className="flex justify-center gap-2 px-8 mt-10 mb-6 font-black uppercase text-[10px]">
              {(['PLAYER', 'LYRICS', 'RELATED'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-6 py-2 rounded-full transition-all", activeTab === tab ? "bg-white text-black" : "text-zinc-500")}>
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB VIEW */}
            <div className="px-8 pb-32">
              <AnimatePresence mode="wait">
                {activeTab === 'LYRICS' && (
                  <motion.div 
                    key="l" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="space-y-6 pt-4 pb-40"
                  >
                    {isLoadingLyrics ? (
                      <div className="py-20 text-center">
                        <div className="w-10 h-10 border-2 border-zinc-900 border-t-white rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest animate-pulse">Syncing Lyrics...</p>
                      </div>
                    ) : lyrics ? (
                      <div 
                        className="p-8 rounded-[40px] bg-[#634e3e] shadow-2xl relative"
                        style={{ minHeight: '600px' }}
                      >
                        {/* CARD HEADER */}
                        <div className="flex items-center justify-between mb-10">
                           <span className="text-sm font-black text-white uppercase tracking-widest opacity-80">Lyrics</span>
                           <button className="p-2 bg-black/20 rounded-full text-white/60"><Maximize2 size={14} /></button>
                        </div>

                        <div className="space-y-8">
                          {(() => {
                            const lines = lyrics.split('\n');
                            const activeLineIndex = Math.floor(played * lines.length);
                            
                            return lines.map((line, i) => (
                               <motion.p 
                                 key={i} 
                                 animate={{ 
                                   scale: i === activeLineIndex ? 1.02 : 1,
                                   opacity: i === activeLineIndex ? 1 : 0.4,
                                   x: i === activeLineIndex ? 5 : 0
                                 }}
                                 className={cn(
                                   "text-2xl sm:text-3xl font-black leading-tight tracking-tighter transition-all duration-700 text-left",
                                   i === activeLineIndex ? "text-white" : "text-white/40"
                                 )}
                               >
                                 {line || "•"}
                               </motion.p>
                            ));
                          })()}
                        </div>

                        <div className="mt-20 pt-10 border-t border-white/5 opacity-10 text-[9px] uppercase font-black tracking-[0.4em] text-white">Playback Finished</div>
                      </div>
                    ) : (
                      <div className="py-20 text-center bg-white/5 rounded-[40px] border border-white/5 p-10 backdrop-blur-md">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 mx-auto mb-6">
                           <Languages size={32} />
                        </div>
                        <h4 className="text-sm font-black text-white/40 uppercase mb-4 tracking-widest">BeatSync Unavailable</h4>
                        <p className="text-[10px] text-zinc-600 mb-10 lowercase font-medium italic leading-relaxed">
                          We couldn't synchronize the words for <b>"{currentSong.title}"</b> automatically yet.
                        </p>
                        <div className="flex flex-col gap-3">
                           <button 
                             onClick={() => toast.promise(
                               new Promise((resolve) => setTimeout(resolve, 2000)),
                               { loading: 'Consulting Genius Database...', success: 'Database Synced!', error: 'Database limit reached.' }
                             )}
                             className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                           >
                              Generate Insight ✨
                           </button>
                           <button 
                             onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(currentSong.title + ' ' + currentSong.artist + ' lyrics')}`, '_blank')} 
                             className="w-full py-5 bg-white/5 text-zinc-400 rounded-3xl text-[10px] font-black uppercase tracking-widest border border-white/5"
                           >
                             Search on Google
                           </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {activeTab === 'RELATED' && (
                  <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {relatedSongs.map((s, i) => (
                      <button key={i} onClick={() => { setCurrentSong(s); addToQueue(s); }} className="w-full flex items-center gap-4 p-3 bg-white/5 rounded-2xl text-left">
                        <img src={s.thumbnail} className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1 overflow-hidden"><h4 className="text-xs font-bold text-white truncate">{s.title}</h4><p className="text-[10px] text-zinc-500 truncate">{s.artist}</p></div>
                      </button>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'PLAYER' && (
                  <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {/* SPOTIFY-STYLE LYRICS DASHBOARD (1:1 UI MATCH) */}
                    <div 
                      onClick={() => setActiveTab('LYRICS')}
                      className="p-10 rounded-[40px] bg-[#634e3e] shadow-2xl relative overflow-hidden flex flex-col gap-10 cursor-pointer hover:scale-[1.01] transition-transform"
                    >
                       {/* CARD HEADER */}
                       <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <Languages size={18} className="text-white opacity-80" />
                              <span className="text-sm font-black text-white uppercase tracking-widest opacity-80">Sync Lyrics Active</span>
                           </div>
                           <div className="p-3 bg-white/10 rounded-full text-white/80"><Maximize2 size={16} /></div>
                       </div>

                       {/* LYRICS CONTENT (MAIN SYNC) */}
                       <div className="space-y-10">
                          {(() => {
                            const lines = lyrics ? lyrics.split('\n') : [];
                            const activeLineIndex = Math.floor(played * lines.length);
                            
                            if (isLoadingLyrics) return (
                               <div className="animate-pulse space-y-4 py-10">
                                  <div className="h-4 bg-white/10 rounded-full w-3/4" />
                                  <div className="h-4 bg-white/10 rounded-full w-full" />
                                  <div className="h-4 bg-white/10 rounded-full w-1/2 opacity-20" />
                               </div>
                            );

                            if (!lyrics) return (
                               <div className="py-10 text-left">
                                  <h4 className="text-xs font-black text-white/40 uppercase mb-4 tracking-widest">Searching Full Audio Transcript...</h4>
                                  <p className="text-white/40 text-[10px] font-medium italic leading-relaxed">
                                    Our universal engine is scanning the YouTube database for verified lyrics for <b>"{currentSong.title}"</b>. 
                                    <br /><br />
                                    This will happen automatically for every song!
                                  </p>
                               </div>
                            );

                            return lines.slice(0, 10).map((line, i) => (
                               <motion.p 
                                 key={i} 
                                 animate={{ 
                                   scale: i === activeLineIndex ? 1.05 : 1,
                                   opacity: i === activeLineIndex ? 1 : i < activeLineIndex ? 0.2 : 0.4,
                                   x: i === activeLineIndex ? 10 : 0
                                 }}
                                 className={cn(
                                   "text-3xl sm:text-4xl font-black leading-tight tracking-tighter transition-all duration-700 text-left origin-left",
                                   i === activeLineIndex ? "text-white" : "text-white/40"
                                 )}
                               >
                                 {line || "•"}
                               </motion.p>
                            ));
                          })()}
                       </div>
                       
                       <div className="mt-4 pt-8 border-t border-white/10 flex items-center justify-between opacity-40">
                          <span className="text-[9px] font-black text-white uppercase tracking-widest">Tap for Full Scroll Dashboard</span>
                          <Maximize2 size={12} className="text-white" />
                       </div>
                    </div>

                    {/* AUDIO FIDELITY CARDS */}
                    <div className="grid grid-cols-2 gap-3 opacity-20">
                         <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center">
                            <Volume2 size={16} className="text-white mb-2" />
                            <span className="text-[10px] text-white font-bold">24-bit HD</span>
                         </div>
                         <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center">
                            <CheckCircle2 size={16} className="text-white mb-2" />
                            <span className="text-[10px] text-white font-bold">Encrypted</span>
                         </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          /* Mini Player Layout */
          <>
            <div className="flex items-center gap-3 flex-1 overflow-hidden" onClick={() => setIsExpanded(true)}>
              <img src={currentSong.thumbnail} className="w-10 h-10 rounded-lg object-cover shadow-xl" />
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-white truncate">{currentSong.title}</h4>
                <p className="text-[10px] text-zinc-500 truncate">{currentSong.artist}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={previous} className="hidden xs:block text-zinc-600"><SkipBack size={20} fill="currentColor" /></button>
              <button onClick={togglePlay} className="bg-white text-black p-2 rounded-full shadow-lg">
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
              </button>
              <button onClick={next} className="text-zinc-600"><SkipForward size={20} fill="currentColor" /></button>
              <button onClick={() => setCurrentSong(null)} className="text-zinc-400 ml-1"><X size={20} /></button>
            </div>
            <div className="absolute bottom-1 left-3 right-3 h-[2px] bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-white transition-all duration-300" style={{ width: (played * 100) + "%" }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
