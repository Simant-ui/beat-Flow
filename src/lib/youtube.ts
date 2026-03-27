import { Song } from '@/types';
import toast from 'react-hot-toast';


const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const NEPAL_TRENDING_MOCK: Song[] = [
  { id: 'ktvTqknDobU', title: 'Saili', artist: 'Hemant Rana', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80' },
  { id: 'dQw4w9WgXcQ', title: 'Kutu Ma Kutu', artist: 'Rajan Raj Siwakoti', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80' },
  { id: '9bZkp7q19f0', title: 'Pani Paryo', artist: 'Sushant KC', thumbnail: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80' },
  { id: 'lYBUbBu4W08', title: 'Maya Luki Luki', artist: 'Tika Prasain', thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80' },
  { id: 'JGwWNGJdvx8', title: 'Galbandi', artist: 'Prakash Saput', thumbnail: 'https://images.unsplash.com/photo-1459749411177-042180ce673f?w=800&q=80' },
];

export const fetchTrendingMusic = async (isNepali: boolean = false): Promise<Song[]> => {
  if (!API_KEY) {
    console.warn('YouTube API Key missing. Falling back to mock data.');
    return isNepali ? NEPAL_TRENDING_MOCK : [
      { id: 'dQw4w9WgXcQ', title: 'Trending Track 1', artist: 'Popular Artist', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80' },
      { id: '9bZkp7q19f0', title: 'Summer Vibes', artist: 'Chill Wave', thumbnail: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80' },
      { id: 'lYBUbBu4W08', title: 'Lofi Beats', artist: 'Study Girl', thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80' },
      { id: 'JGwWNGJdvx8', title: 'Midnight City', artist: 'M83', thumbnail: 'https://images.unsplash.com/photo-1459749411177-042180ce673f?w=800&q=80' },
      { id: 'ktvTqknDobU', title: 'Nepali Soul', artist: 'Himalayan Beats', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80' },
      { id: 'XqZsoesa55w', title: 'Focus Flow', artist: 'Deep Mind', thumbnail: 'https://images.unsplash.com/photo-1514525253361-bee8d40c1151?w=800&q=80' },
    ];
  }

  try {
    // If Nepali specifically requested, use search for "Nepali Songs" to get better results
    if (isNepali) {
        const res = await fetch(`${BASE_URL}/search?part=snippet&q=Nepali%20Songs%20new&type=video&videoCategoryId=10&maxResults=10&key=${API_KEY}`);
        const data = await res.json();
        return (data.items || []).map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        }));
    }

    const response = await fetch(
      `${BASE_URL}/videos?part=snippet,contentDetails&chart=mostPopular&videoCategoryId=10&maxResults=10&key=${API_KEY}`
    );
    const data = await response.json();

    if (!data.items) return [];

    return data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    }));
  } catch (error) {
    console.error('Error fetching trending music:', error);
    return [];
  }
};

const searchCache = new Map<string, Song[]>();
let lastQuery = '';

export const searchMusic = async (query: string): Promise<Song[]> => {
  const trimmedQuery = query.trim().toLowerCase();
  if (!trimmedQuery) return [];

  // 1. Prevent redundant search for the same exact previous query
  if (trimmedQuery === lastQuery) return [];
  lastQuery = trimmedQuery;

  // 2. Check local cache to save API Quota (very important for daily 10k limit)
  if (searchCache.has(trimmedQuery)) {
      console.log('Returning cached results for:', trimmedQuery);
      return searchCache.get(trimmedQuery) || [];
  }

  if (!API_KEY) {
    console.warn('YouTube API Key missing. Falling back to mock data.');
    await new Promise(resolve => setTimeout(resolve, 800));
    return Array.from({ length: 12 }).map((_, i) => ({
      id: `mock-${i}-${Date.now()}`,
      title: `${query} Track ${i + 1}`,
      artist: `Artist ${i + 1}`,
      thumbnail: `https://images.unsplash.com/photo-1514525253361-bee8d40c1151?w=800&q=80&sig=${i}`,
    }));
  }

  try {
    // Note: We removed videoCategoryId=10 to find all related video songs 
    // that might be categorized as "Entertainment" or "Film" instead of just "Music"
    // We increase maxResults to 20+ to show more variety like actual YouTube
    const musicQuery = trimmedQuery + ' music video song';
    console.log('Searching YouTube for:', musicQuery);
    
    let response = await fetch(
      `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(musicQuery)}&type=video&maxResults=25&key=${API_KEY}`
    );
    let data = await response.json();

    if (data.error) {
        // Show specific YouTube error message (e.g., quotaExceeded)
        const errorMsg = data.error.message?.includes('quota') 
            ? 'YouTube API daily limit reached. Please try again tomorrow or use a new key.' 
            : `YouTube Error: ${data.error.message}`;
        console.error('YouTube API Error:', data.error.message);
        toast.error(errorMsg); 
        return [];
    }

    // Fallback search if zero results
    if ((!data.items || data.items.length === 0) && query.length > 2) {
        console.log('No results for enhanced query, trying original query:', query);
        response = await fetch(
          `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(trimmedQuery)}&type=video&maxResults=25&key=${API_KEY}`
        );
        data = await response.json();
    }

    if (!data.items) return [];

    const results = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      channelId: item.snippet.channelId,
    }));

    // Cache results (max 20 entries)
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
        // We search for songs similar to the current one by using artist and title
        const query = `${song.artist} ${song.title.split('(')[0]} official music`;
        console.log('Fetching related songs for:', query);
        
        const response = await fetch(
          `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${API_KEY}`
        );
        const data = await response.json();
    
        if (!data.items) {
            if (data.error) console.error('Related Search Error:', data.error.message);
            return [];
        }
    
        // Filter out the current song from related results
        return data.items
            .filter((item: any) => item.id.videoId !== song.id)
            .map((item: any) => ({
                id: item.id.videoId,
                title: item.snippet.title,
                artist: item.snippet.channelTitle,
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            }));
    } catch (error) {
        console.error('Error fetching related songs:', error);
        return [];
    }
};
