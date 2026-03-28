import { Song } from '@/types';
import toast from 'react-hot-toast';

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Helper to format YouTube duration (PT3M45S -> 3:45)
const formatYouTubeDuration = (duration: string) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const h = parseInt(match[1] || '0', 10);
  const m = parseInt(match[2] || '0', 10);
  const s = parseInt(match[3] || '0', 10);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const NEPAL_TRENDING_MOCK: Song[] = [
  { id: 'ktvTqknDobU', title: 'Saili', artist: 'Hemant Rana', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80', duration: '4:52' },
  { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80', duration: '3:32' },
  { id: '9bZkp7q19f0', title: 'Pani Paryo', artist: 'Sushant KC', thumbnail: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80', duration: '3:45' },
  { id: 'lYBUbBu4W08', title: 'Maya Luki Luki', artist: 'Tika Prasain', thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80', duration: '4:12' },
  { id: 'JGwWNGJdvx8', title: 'Galbandi', artist: 'Prakash Saput', thumbnail: 'https://images.unsplash.com/photo-1459749411177-042180ce673f?w=800&q=80', duration: '12:45' },
];

export const fetchTrendingMusic = async (isNepali: boolean = false): Promise<Song[]> => {
  if (!API_KEY) {
    console.warn('YouTube API Key missing. Falling back to mock data.');
    return isNepali ? NEPAL_TRENDING_MOCK : [
      { id: 'dQw4w9WgXcQ', title: 'Trending Track 1', artist: 'Popular Artist', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80', duration: '3:45' },
      { id: '9bZkp7q19f0', title: 'Summer Vibes', artist: 'Chill Wave', thumbnail: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80', duration: '4:20' },
    ];
  }

  try {
    let url = `${BASE_URL}/videos?part=snippet,contentDetails&chart=mostPopular&videoCategoryId=10&maxResults=15&key=${API_KEY}`;
    
    // If Nepali specifically requested, we use search then fetch details for durations
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
        if (data.error.message?.includes('quota')) toast.error('YouTube API quota reached.');
        return [];
    }

    return (data.items || []).map((item: any) => ({
      id: item.id, // For /videos, id is the videoId
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      duration: formatYouTubeDuration(item.contentDetails.duration),
    }));
  } catch (error: any) {
    console.error('Error fetching trending music:', error);
    return [];
  }
};

const searchCache = new Map<string, Song[]>();

export const searchMusic = async (query: string): Promise<Song[]> => {
  const trimmedQuery = query.trim().toLowerCase();
  if (!trimmedQuery) return [];

  // 1. Check local cache first (saves search quota and feels faster)
  if (searchCache.has(trimmedQuery)) {
      console.log('Returning cached results for:', trimmedQuery);
      return searchCache.get(trimmedQuery) || [];
  }

  if (!API_KEY) {
    console.warn('YouTube API Key missing. Falling back to mock data.');
    return Array.from({ length: 8 }).map((_, i) => ({
      id: `mock-${i}`,
      title: `${query} Track ${i + 1}`,
      artist: `Artist ${i + 1}`,
      thumbnail: `https://images.unsplash.com/photo-1514525253361-bee8d40c1151?w=800&q=80&sig=${i}`,
      duration: '4:00'
    }));
  }

  try {
    const musicQuery = trimmedQuery + ' official music video';
    
    // Step 1: Search for video IDs
    const searchRes = await fetch(
      `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(musicQuery)}&type=video&maxResults=25&key=${API_KEY}`
    );
    const searchData = await searchRes.json();

    if (searchData.error) {
        const errorMsg = searchData.error.message?.includes('quota') 
            ? 'YouTube API daily limit reached.' 
            : `YouTube Error: ${searchData.error.message}`;
        toast.error(errorMsg);
        return [];
    }

    if (!searchData.items || searchData.items.length === 0) return [];

    // Step 2: Fetch full details (durations, high-res thumbnails) for these IDs
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
      channelId: item.snippet.channelId,
    }));

    // Cache results
    if (searchCache.size > 20) searchCache.delete(searchCache.keys().next().value);
    searchCache.set(trimmedQuery, results);

    return results;
  } catch (error) {
    console.error('Error searching music:', error);
    return [];
  }
};

export const searchMusicByCategory = async (category: string): Promise<Song[]> => {
  return searchMusic(`${category} music hits 2024`);
};

export const fetchRelatedSongs = async (song: Song): Promise<Song[]> => {
    if (!API_KEY) return [];
    
    try {
        const query = `${song.artist} ${song.title.replace(/[()]/g, '')} official music`;
        const response = await fetch(
          `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${API_KEY}`
        );
        const data = await response.json();
    
        if (!data.items) return [];
    
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
    } catch (error) {
        console.error('Error fetching related songs:', error);
        return [];
    }
};

