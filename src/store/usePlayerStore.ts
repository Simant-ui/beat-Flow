import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayerState, Song, DownloadProgress } from '@/types';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './useAuthStore';

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentSong: null,
      isPlaying: false,
      volume: 1,
      queue: [],
      history: [],
      favorites: [],
      downloads: [],
      theme: 'dark',
      listeningTime: 0,
      dataSaver: false,
      isShuffled: false,
      repeatMode: 'none',
      
      setShuffled: (isShuffled: boolean) => set({ isShuffled }),
      setRepeatMode: (repeatMode: 'none' | 'one' | 'all') => set({ repeatMode }),
      
      setTheme: (theme: 'dark' | 'light') => set({ theme }),
      setDataSaver: (dataSaver: boolean) => set({ dataSaver }),
      incrementListeningTime: () => set((state) => ({ listeningTime: state.listeningTime + 1 })),
      
      syncToCloud: async (key: string, data: any) => {
        const user = useAuthStore.getState().user;
        if (!user || !supabase) return;
        
        try {
          const { error } = await supabase
            .from('user_data')
            .upsert({ 
              user_id: user.id, 
              [key]: data,
              updated_at: new Error().stack // Simple way to force change detection if needed
            }, { onConflict: 'user_id' });
            
          if (error) console.error(`Sync error for ${key}:`, error);
        } catch (e) {
          console.error('Supabase Sync Failed:', e);
        }
      },

      loadFromCloud: async () => {
        const user = useAuthStore.getState().user;
        if (!user || !supabase) return;

        try {
          const { data, error } = await supabase
            .from('user_data')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (data && !error) {
            set({
              history: data.history || get().history,
              favorites: data.favorites || get().favorites,
              downloads: data.downloads || get().downloads,
              playlists: data.playlists || get().playlists
            });
          }
        } catch (e) {
          console.error('Cloud load failed:', e);
        }
      },

      setCurrentSong: (song: Song | null) => {
        if (!song) {
          set({ currentSong: null, isPlaying: false });
          return;
        }
        set({ currentSong: song, isPlaying: true });
        get().addToHistory(song);
      },
      
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      
      setPlaying: (isPlaying: boolean) => set({ isPlaying }),
      
      setVolume: (volume: number) => set({ volume }),
      
      addToQueue: (song: Song) => 
        set((state) => ({ 
          queue: [...state.queue.filter(s => s.id !== song.id), song] 
        })),
        
      removeFromQueue: (songId: string) =>
        set((state) => ({
          queue: state.queue.filter((s) => s.id !== songId),
        })),
        
      addToHistory: (song: Song) =>
        set((state) => {
          const newHistory = [song, ...state.history.filter((s) => s.id !== song.id)].slice(0, 50);
          state.syncToCloud('history', newHistory);
          return { history: newHistory };
        }),

      toggleFavorite: (song: Song) =>
        set((state) => {
          const isFavorite = state.favorites.some((s) => s.id === song.id);
          const newFavorites = isFavorite 
            ? state.favorites.filter((s) => s.id !== song.id)
            : [song, ...state.favorites];
          
          state.syncToCloud('favorites', newFavorites);
          return { favorites: newFavorites };
        }),
        
      toggleDownload: (song: Song) =>
        set((state) => {
          const isDownloaded = state.downloads.some((s) => s.id === song.id);
          let newDownloads;
          if (isDownloaded) {
            toast.success("Removed from Library", { icon: '🗑️' });
            newDownloads = state.downloads.filter((s) => s.id !== song.id);
          } else {
            toast.success("Added to Library", { icon: '💾' });
            newDownloads = [song, ...state.downloads];
          }
          state.syncToCloud('downloads', newDownloads);
          return { downloads: newDownloads };
        }),

      clearDownloads: () => set({ downloads: [] }),
        
      clearHistory: () => set({ history: [] }),
      
      playlists: [],
      
      createPlaylist: (name: string) => 
        set((state) => {
          const newPlaylists = [
            ...state.playlists,
            { id: `playlist-${Date.now()}`, name, songs: [], createdAt: new Date().toISOString() }
          ];
          state.syncToCloud('playlists', newPlaylists);
          return { playlists: newPlaylists };
        }),

      deletePlaylist: (playlistId: string) =>
        set((state) => {
          const newPlaylists = state.playlists.filter(p => p.id !== playlistId);
          state.syncToCloud('playlists', newPlaylists);
          return { playlists: newPlaylists };
        }),

      addToPlaylist: (playlistId: string, song: Song) =>
        set((state) => {
          const newPlaylists = state.playlists.map(p => 
            p.id === playlistId 
              ? { ...p, songs: [...p.songs.filter(s => s.id !== song.id), song] }
              : p
          );
          state.syncToCloud('playlists', newPlaylists);
          return { playlists: newPlaylists };
        }),

      removeFromPlaylist: (playlistId: string, songId: string) =>
        set((state) => {
          const newPlaylists = state.playlists.map(p => 
            p.id === playlistId 
              ? { ...p, songs: p.songs.filter(s => s.id !== songId) }
              : p
          );
          state.syncToCloud('playlists', newPlaylists);
          return { playlists: newPlaylists };
        }),
        
      downloadQueue: [],
      
      startDownload: (song: Song) => {
        const { downloadQueue, downloads } = get();
        
        // Don't redownload if already current or already in queue
        if (downloads.some(s => s.id === song.id) || downloadQueue.some(d => d.songId === song.id)) {
            return;
        }

        const totalMB = Math.round((3.5 + Math.random() * 8) * 10) / 10;
        const newDownload: DownloadProgress = {
            songId: song.id,
            song: song,
            progress: 0,
            currentMB: 0,
            totalMB: totalMB,
            status: 'DOWNLOADING'
        };

        set((state) => ({ downloadQueue: [...state.downloadQueue, newDownload] }));

        // Simulate progress
        let currentMB = 0;
        const interval = setInterval(() => {
            currentMB += 0.2 + (Math.random() * 0.5);
            
            if (currentMB >= totalMB) {
                currentMB = totalMB;
                clearInterval(interval);
                
                set((state) => ({
                    downloadQueue: state.downloadQueue.map(d => 
                        d.songId === song.id ? { ...d, progress: 100, currentMB: totalMB, status: 'COMPLETED' } : d
                    ),
                    downloads: [...state.downloads.filter(s => s.id !== song.id), { ...song, sizeMB: totalMB }]
                }));

                // Auto remove from queue after 5 seconds of 'COMPLETED'
                setTimeout(() => {
                    set((state) => ({
                        downloadQueue: state.downloadQueue.filter(d => d.songId !== song.id)
                    }));
                }, 5000);
                
            } else {
                set((state) => ({
                    downloadQueue: state.downloadQueue.map(d => 
                        d.songId === song.id ? { ...d, progress: (currentMB / totalMB) * 100, currentMB: Math.round(currentMB * 10) / 10 } : d
                    )
                }));
            }
        }, 800);
      },

      removeDownloadFromQueue: (songId: string) => 
        set((state) => ({ downloadQueue: state.downloadQueue.filter(d => d.songId !== songId) })),
        
      addTransferredSong: (song: Song) =>
        set((state) => ({ 
            downloads: [...state.downloads.filter(s => s.id !== song.id), song] 
        })),
        
      next: () => {
        const { queue, currentSong, history, repeatMode, isShuffled } = get();
        
        // Handle Repeat One
        if (repeatMode === 'one' && currentSong) {
            set({ isPlaying: true });
            return;
        }

        if (queue.length === 0) {
            // Fallback: If no queue, maybe there's a related song in history or we do nothing
            // For now, let's just toast
            return;
        }
        
        const currentIndex = queue.findIndex(s => s.id === currentSong?.id);
        let nextIndex;
        
        if (isShuffled) {
            nextIndex = Math.floor(Math.random() * queue.length);
        } else {
            nextIndex = (currentIndex + 1) % queue.length;
            // Handle Repeat None (stop at end)
            if (nextIndex === 0 && repeatMode === 'none' && currentIndex !== -1) {
                set({ isPlaying: false });
                return;
            }
        }
        
        set({ currentSong: queue[nextIndex], isPlaying: true });
        get().addToHistory(queue[nextIndex]);
      },
      
      previous: () => {
        const { queue, currentSong, history } = get();
        
        // If queue exists, go to previous in queue
        if (queue.length > 0) {
            const currentIndex = queue.findIndex(s => s.id === currentSong?.id);
            const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
            set({ currentSong: queue[prevIndex], isPlaying: true });
            return;
        }

        // Fallback: Go to previous song in History
        if (history.length > 1) {
            // history[0] is current, history[1] is previous
            const prevSong = history[1]; 
            set({ currentSong: prevSong, isPlaying: true });
        }
      },
    }),
    {
      name: 'music-player-storage',
      partialize: (state) => ({ 
        volume: state.volume, 
        history: state.history, 
        queue: state.queue,
        favorites: state.favorites,
        theme: state.theme,
        dataSaver: state.dataSaver,
        downloads: state.downloads,
        playlists: state.playlists,
        isShuffled: state.isShuffled,
        repeatMode: state.repeatMode
      }),
    }
  )
);
