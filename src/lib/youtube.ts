import { Song } from '@/types';

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

export const searchMusic = async (query: string): Promise<Song[]> => {
  if (!query.trim()) return [];

  if (!API_KEY) {
    console.warn('YouTube API Key missing. Falling back to mock data.');
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return Array.from({ length: 12 }).map((_, i) => ({
      id: `mock-${i}-${Date.now()}`,
      title: `${query} Track ${i + 1}`,
      artist: `Artist ${i + 1}`,
      thumbnail: `https://images.unsplash.com/photo-1514525253361-bee8d40c1151?w=800&q=80&sig=${i}`,
    }));
  }

  try {
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=12&key=${API_KEY}`
    );
    const data = await response.json();

    if (!data.items) return [];

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      channelId: item.snippet.channelId,
    }));
  } catch (error) {
    console.error('Error searching music:', error);
    return [];
  }
};

export const searchMusicByCategory = async (category: string): Promise<Song[]> => {
  return searchMusic(`${category} music hits 2024`);
};
