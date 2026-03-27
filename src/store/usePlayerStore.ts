import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayerState, Song, DownloadProgress } from '@/types';

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
      dataSaver: false,
      listeningTime: 0,
      
      setTheme: (theme: 'dark' | 'light') => set({ theme }),
      setDataSaver: (dataSaver: boolean) => set({ dataSaver }),
      incrementListeningTime: () => set((state) => ({ listeningTime: state.listeningTime + 1 })),
      
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
        set((state) => ({
          history: [song, ...state.history.filter((s) => s.id !== song.id)].slice(0, 50),
        })),

      toggleFavorite: (song: Song) =>
        set((state) => {
          const isFavorite = state.favorites.some((s) => s.id === song.id);
          if (isFavorite) {
            return { favorites: state.favorites.filter((s) => s.id !== song.id) };
          }
          return { favorites: [song, ...state.favorites] };
        }),
        
      toggleDownload: (song: Song) =>
        set((state) => {
          const isDownloaded = state.downloads.some((s) => s.id === song.id);
          if (isDownloaded) {
            return { downloads: state.downloads.filter((s) => s.id !== song.id) };
          }
          return { downloads: [song, ...state.downloads] };
        }),

      clearDownloads: () => set({ downloads: [] }),
        
      clearHistory: () => set({ history: [] }),
      
      playlists: [],
      
      createPlaylist: (name: string) => 
        set((state) => ({
          playlists: [
            ...state.playlists,
            { id: `playlist-${Date.now()}`, name, songs: [], createdAt: new Date().toISOString() }
          ]
        })),

      deletePlaylist: (playlistId: string) =>
        set((state) => ({
          playlists: state.playlists.filter(p => p.id !== playlistId)
        })),

      addToPlaylist: (playlistId: string, song: Song) =>
        set((state) => ({
          playlists: state.playlists.map(p => 
            p.id === playlistId 
              ? { ...p, songs: [...p.songs.filter(s => s.id !== song.id), song] }
              : p
          )
        })),

      removeFromPlaylist: (playlistId: string, songId: string) =>
        set((state) => ({
          playlists: state.playlists.map(p => 
            p.id === playlistId 
              ? { ...p, songs: p.songs.filter(s => s.id !== songId) }
              : p
          )
        })),
        
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
        
      next: () => {
        const { queue, currentSong } = get();
        if (queue.length === 0) return;
        
        const currentIndex = queue.findIndex(s => s.id === currentSong?.id);
        const nextIndex = (currentIndex + 1) % queue.length;
        set({ currentSong: queue[nextIndex], isPlaying: true });
      },
      
      previous: () => {
        const { queue, currentSong } = get();
        if (queue.length === 0) return;
        
        const currentIndex = queue.findIndex(s => s.id === currentSong?.id);
        const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
        set({ currentSong: queue[prevIndex], isPlaying: true });
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
        playlists: state.playlists
      }),
    }
  )
);
