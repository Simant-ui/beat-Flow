export interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
  channelId?: string;
  url?: string;
  sizeMB?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  queue: Song[];
  history: Song[];
  favorites: Song[];
  setCurrentSong: (song: Song | null) => void;
  togglePlay: () => void;
  setPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  addToHistory: (song: Song) => void;
  toggleFavorite: (song: Song) => void;
  downloads: Song[];
  toggleDownload: (song: Song) => void;
  clearDownloads: () => void;
  clearHistory: () => void;
  next: () => void;
  previous: () => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  dataSaver: boolean;
  setDataSaver: (dataSaver: boolean) => void;
  listeningTime: number;
  incrementListeningTime: () => void;
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  
  downloadQueue: DownloadProgress[];
  startDownload: (song: Song) => void;
  removeDownloadFromQueue: (songId: string) => void;
  addTransferredSong: (song: Song) => void;

  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  setShuffled: (isShuffled: boolean) => void;
  setRepeatMode: (repeatMode: 'none' | 'one' | 'all') => void;
  
  // Cloud Sync
  syncToCloud: (key: string, data: any) => Promise<void>;
  loadFromCloud: () => Promise<void>;
}


export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: string;
}

export interface DownloadProgress {
    songId: string;
    song: Song;
    progress: number;
    currentMB: number;
    totalMB: number;
    status: 'DOWNLOADING' | 'COMPLETED' | 'ERROR';
}
