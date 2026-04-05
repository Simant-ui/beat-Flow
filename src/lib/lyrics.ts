
/**
 * Utility to clean YouTube-style titles for lyrics APIs
 */
export const cleanSongTitle = (title: string): string => {
  return title
    .replace(/\(Official.*?\)/gi, '')
    .replace(/\[Official.*?\]/gi, '')
    .replace(/\(Video.*?\)/gi, '')
    .replace(/\[Video.*?\]/gi, '')
    .replace(/\(Audio.*?\)/gi, '')
    .replace(/\[Audio.*?\]/gi, '')
    .replace(/\(Lyrics.*?\)/gi, '')
    .replace(/\[Lyrics.*?\]/gi, '')
    .replace(/\(Visual.*?\)/gi, '')
    .replace(/\[Visual.*?\]/gi, '')
    .trim();
};

export const cleanArtistName = (name: string): string => {
  return name
    .replace(/ - Topic/gi, '')
    .replace(/VEVO/gi, '')
    .replace(/Official/gi, '')
    .trim();
};

export const fetchLyrics = async (artist: string, title: string): Promise<string | null> => {
  // 1. DEDUPLICATE: If title already contains artist name, don't repeat it
  const cleanA = cleanArtistName(artist);
  const cleanT = cleanSongTitle(title);
  
  let query = cleanT.toLowerCase().includes(cleanA.toLowerCase()) 
    ? cleanT 
    : `${cleanA} ${cleanT}`;

  // 2. REGIONAL HINT: Add 'lyrics' suffix for clarity
  query += ' lyrics';
  
  try {
     const res = await fetch(`/api/lyrics?q=${encodeURIComponent(query)}`);
     if (res.ok) {
        const data = await res.json();
        if (data.lyrics) return data.lyrics;
     }
  } catch(e) {}

  // Standard fallback
  try {
    const ovhRes = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(cleanA)}/${encodeURIComponent(cleanT)}`);
    if (ovhRes.ok) {
        const data = await ovhRes.json();
        if (data.lyrics && data.lyrics.length > 20) return data.lyrics;
    }
  } catch(e) {}
  
  return null;
};
