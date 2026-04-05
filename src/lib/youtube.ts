import { Song } from '@/types';
import toast from 'react-hot-toast';

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const formatYouTubeDuration = (duration: string) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const h = parseInt(match[1] || '0', 10);
  const m = parseInt(match[2] || '0', 10);
  const s = parseInt(match[3] || '0', 10);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const INVIDIOUS_INSTANCES = [
  'https://inv.vern.cc',
  'https://invidious.lunar.icu',
  'https://invidious.projectsegfau.lt',
  'https://invidious.nerdvpn.de',
  'https://iv.ggtyler.dev'
];

let currentInstanceIndex = 0;

const getInvidiousUrl = (path: string) => {
    const instance = INVIDIOUS_INSTANCES[currentInstanceIndex];
    return `${instance}/api/v1${path}`;
};

const rotateInstance = () => {
    currentInstanceIndex = (currentInstanceIndex + 1) % INVIDIOUS_INSTANCES.length;
};

const searchInvidious = async (query: string): Promise<Song[]> => {
    try {
        const res = await fetch(getInvidiousUrl(`/search?q=${encodeURIComponent(query)}&type=video`));
        if (!res.ok) throw new Error('Invidious instance down');
        const data = await res.json();
        
        return (data || []).map((item: any) => ({
            id: item.videoId,
            title: item.title,
            artist: item.author,
            thumbnail: item.videoThumbnails?.find((t: any) => t.quality === 'high')?.url || item.videoThumbnails[0]?.url,
            duration: item.lengthSeconds ? `${Math.floor(item.lengthSeconds / 60)}:${(item.lengthSeconds % 60).toString().padStart(2, '0')}` : '4:00'
        }));
    } catch (e) {
        rotateInstance();
        console.warn('Invidious error, rotating instance...', e);
        return [];
    }
};

export const fetchTrendingMusic = async (isNepali: boolean = false): Promise<Song[]> => {
  if (!API_KEY) {
    const q = isNepali ? 'Nepali trending music 2024' : 'trending music worldwide';
    return searchInvidious(q);
  }

  try {
    let url = `${BASE_URL}/videos?part=snippet,contentDetails&chart=mostPopular&videoCategoryId=10&maxResults=15&key=${API_KEY}`;
    
    if (isNepali) {
        const searchRes = await fetch(`${BASE_URL}/search?part=snippet&q=Nepali%20Songs%20new&type=video&maxResults=15&key=${API_KEY}`);
        const searchData = await searchRes.json();
        
        if (searchData.error) throw new Error(searchData.error.message);
        
        const videoIds = (searchData.items || []).map((item: any) => item.id.videoId).join(',');
        url = `${BASE_URL}/videos?part=snippet,contentDetails&id=${videoIds}&key=${API_KEY}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
        if (data.error.message?.includes('quota')) {
            toast.success('Switching to Backup Server (Unlimited Mode)...', { icon: '🔄' });
            return searchInvidious(isNepali ? 'trending Nepali music' : 'popular music tracks');
        }
        return [];
    }

    return (data.items || []).map((item: any) => ({
      id: typeof item.id === 'string' ? item.id : item.id.videoId, 
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      duration: formatYouTubeDuration(item.contentDetails.duration),
    }));
  } catch (error: any) {
    return searchInvidious(isNepali ? 'trending Nepali music' : 'popular music tracks');
  }
};

const searchCache = new Map<string, Song[]>();

export const searchMusic = async (query: string): Promise<Song[]> => {
  const trimmedQuery = query.trim().toLowerCase();
  if (!trimmedQuery) return [];

  if (searchCache.has(trimmedQuery)) {
      return searchCache.get(trimmedQuery) || [];
  }

  // Primary: YouTube API
  if (API_KEY) {
    try {
        const musicQuery = trimmedQuery + ' official music';
        const searchRes = await fetch(
            `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(musicQuery)}&type=video&maxResults=25&key=${API_KEY}`
        );
        const searchData = await searchRes.json();

        if (searchData.error && searchData.error.message?.includes('quota')) {
            throw new Error('quota');
        }

        if (searchData.items && searchData.items.length > 0) {
            const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
            const detailsRes = await fetch(
                `${BASE_URL}/videos?part=snippet,contentDetails&id=${videoIds}&key=${API_KEY}`
            );
            const detailsData = await detailsRes.json();

            const results = (detailsData.items || []).map((item: any) => ({
                id: item.id,
                title: item.snippet.title,
                artist: item.snippet.channelTitle,
                thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                duration: formatYouTubeDuration(item.contentDetails.duration),
            }));

            searchCache.set(trimmedQuery, results);
            return results;
        }
    } catch (e: any) {
        if (e.message === 'quota') {
            toast.success('Unlimited mode active', { icon: '⚡' });
        }
    }
  }

  // Secondary: Invidious Fallback (Unlimited)
  const results = await searchInvidious(trimmedQuery + ' music');
  searchCache.set(trimmedQuery, results);
  return results;
};

export const searchMusicByCategory = async (category: string): Promise<Song[]> => {
  return searchMusic(`${category} hits`);
};

export const fetchRelatedSongs = async (song: Song): Promise<Song[]> => {
    const musicQuery = `${song.artist} ${song.title} official music`;
    
    if (API_KEY) {
        try {
            const response = await fetch(
                `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(musicQuery)}&type=video&maxResults=10&key=${API_KEY}`
            );
            const data = await response.json();
            
            if (data.items) {
                const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
                const detailsRes = await fetch(
                    `${BASE_URL}/videos?part=snippet,contentDetails&id=${videoIds}&key=${API_KEY}`
                );
                const detailsData = await detailsRes.json();
                return (detailsData.items || [])
                    .filter((item: any) => item.id !== song.id)
                    .map((item: any) => ({
                        id: item.id,
                        title: item.snippet.title,
                        artist: item.snippet.channelTitle,
                        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                        duration: formatYouTubeDuration(item.contentDetails.duration),
                    }));
            }
        } catch (e) {}
    }

    return searchInvidious(`${song.artist} related music`);
};

