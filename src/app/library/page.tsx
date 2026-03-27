'use client';

import React, { useState } from 'react';
import { Heart, History, ListMusic, Plus, Play, Upload, Download } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { SongCard } from '@/components/SongCard';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function LibraryPage() {
  const { history, favorites, downloads, playlists, createPlaylist, setCurrentSong } = usePlayerStore();
  const [activeTab, setActiveTab] = useState<'history' | 'favorites' | 'downloads' | 'playlists'>('history');
  const [isNewPlaylistModalOpen, setIsNewPlaylistModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName);
    setNewPlaylistName('');
    setIsNewPlaylistModalOpen(false);
    toast.success('Playlist Created', {
        icon: '✨',
        style: {
            borderRadius: '20px',
            background: '#18181b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
        }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
        toast.error('Please select an audio file (MP3, WAV, etc.)');
        return;
    }

    const url = URL.createObjectURL(file);
    const newSong = {
        id: `local-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Local File',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop',
        url: url
    };

    setCurrentSong(newSong);
    toast.success(`Playing: ${newSong.title}`, {
        icon: '🎵',
        style: {
            borderRadius: '20px',
            background: '#18181b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
        }
    });
  };

  const tabs = [
    { id: 'history', icon: History, label: 'History' },
    { id: 'favorites', icon: Heart, label: 'Favorites' },
    { id: 'downloads', icon: Download, label: 'Downloads' },
    { id: 'playlists', icon: ListMusic, label: 'Playlists' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-black text-white leading-tight">Your <br/><span className="text-gradient">Library</span></h2>
        
        <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer active:scale-95">
                <Upload className="w-4 h-4" />
                <span>Import Files</span>
                <input 
                    type="file" 
                    accept="audio/*" 
                    className="hidden" 
                    onChange={handleFileUpload}
                />
            </label>
            
            <button 
                onClick={() => setIsNewPlaylistModalOpen(true)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">New Playlist</span>
            </button>
        </div>
      </div>

      {/* NEW PLAYLIST MODAL */}
      <AnimatePresence>
        {isNewPlaylistModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsNewPlaylistModalOpen(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.form
                    onSubmit={handleCreatePlaylist}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm glass-dark p-8 rounded-[40px] border border-white/10 shadow-2xl space-y-6"
                >
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto text-blue-500">
                            <ListMusic size={32} />
                        </div>
                        <h3 className="text-xl font-black">Create Playlist</h3>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Build your unique flow</p>
                    </div>

                    <div className="space-y-4">
                        <input 
                            autoFocus
                            type="text"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            placeholder="Playlist Name"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                        />
                        <div className="flex gap-3">
                            <button 
                                type="button"
                                onClick={() => setIsNewPlaylistModalOpen(false)}
                                className="flex-1 py-4 rounded-2xl bg-zinc-900 text-zinc-500 font-bold text-sm hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={!newPlaylistName.trim()}
                                className="flex-2 py-4 px-8 rounded-2xl bg-blue-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </motion.form>
            </div>
        )}
      </AnimatePresence>

      {/* TABS HEADER */}
      <div className="flex items-center gap-2 border-b border-white/5 no-scrollbar overflow-x-auto -mx-6 px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-4 text-sm font-bold transition-all duration-300 whitespace-nowrap",
                isActive ? "text-blue-400" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "fill-current" : "")} />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="library-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* CONTENT AREA */}
      <AnimatePresence mode="wait">
        {activeTab === 'history' && (
          <motion.section
            key="history"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {history.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((song, i) => (
                  <SongCard key={`${song.id}-history`} song={song} index={i} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 scale-110">
                  <History className="w-12 h-12 text-zinc-700" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-white text-lg">No playback history</p>
                  <p className="text-zinc-500 text-sm max-w-xs px-4">Songs you listen to will automatically appear here.</p>
                </div>
              </div>
            )}
          </motion.section>
        )}

        {activeTab === 'favorites' && (
          <motion.section
            key="favorites"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {favorites.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((song, i) => (
                  <SongCard key={`${song.id}-fav`} song={song} index={i} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 scale-110">
                  <Heart className="w-12 h-12 text-zinc-700" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-white text-lg">Your favorites</p>
                  <p className="text-zinc-500 text-sm max-w-sm px-4">Songs you heart will appear here.</p>
                </div>
              </div>
            )}
          </motion.section>
        )}

        {activeTab === 'downloads' && (
          <motion.section
            key="downloads"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {downloads.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {downloads.map((song, i) => (
                  <div key={`${song.id}-dl`} className="relative group">
                    <SongCard song={song} index={i} />
                    {song.sizeMB && (
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] font-black text-blue-400">{song.sizeMB} MB</span>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 scale-110">
                  <Download className="w-12 h-12 text-zinc-700" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-white text-lg">No downloads yet</p>
                  <p className="text-zinc-500 text-sm max-w-sm px-4">Download songs to listen to them offline.</p>
                </div>
              </div>
            )}
          </motion.section>
        )}

        {activeTab === 'playlists' && (
          <motion.section
            key="playlists"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Default Liked Songs Playlist */}
            <div className="flex items-center gap-4 p-4 glass rounded-[30px] border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                <Heart className="w-8 h-8 text-white fill-current" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-white text-lg">Liked Songs</h4>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">{favorites.length} TRACKS</p>
              </div>
              <div className="bg-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                <Play className="w-4 h-4 text-black fill-current" />
              </div>
            </div>

            {/* User Created Playlists */}
            {playlists.map((playlist) => (
                <div key={playlist.id} className="flex items-center gap-4 p-4 glass rounded-[30px] border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <ListMusic className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                    <h4 className="font-black text-white text-lg">{playlist.name}</h4>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">{playlist.songs.length} TRACKS</p>
                    </div>
                    <div className="bg-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    <Play className="w-4 h-4 text-black fill-current" />
                    </div>
                </div>
            ))}

            {/* Empty State */}
            {playlists.length === 0 && (
                <div className="md:col-span-2 flex flex-col items-center justify-center py-10 opacity-40 text-center">
                    <p className="text-xs font-black uppercase tracking-[0.3em]">No custom playlists yet</p>
                    <p className="text-[10px] text-zinc-600 font-bold mt-2">CREATE ONE TO ORGANIZE YOUR FLOW</p>
                </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
