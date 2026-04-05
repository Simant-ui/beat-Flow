import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q) {
    return NextResponse.json({ error: 'Song query is required' }, { status: 400 });
  }

  try {
    // 1. GENIUS SEARCH API (Primary)
    const geniusSearchUrl = `https://genius.com/api/search/multi?q=${encodeURIComponent(q)}`;
    const geniusSearchRes = await fetch(geniusSearchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const geniusSearchData = await geniusSearchRes.json();
    const firstHit = geniusSearchData.response.sections.find((s: any) => s.type === 'song')?.hits?.[0]?.result;
    
    if (firstHit && firstHit.url) {
        const pageRes = await fetch(firstHit.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const pageHtml = await pageRes.text();
        let lyricsContent = "";
        const containers = pageHtml.match(/<div[^>]*class="Lyrics__Container[^>]*>(.*?)<\/div>/g);
        if (containers) {
             containers.forEach(c => {
               lyricsContent += c.replace(/<br\s*\/?>/gi, '\n')
                                .replace(/<[^>]+>/g, '') 
                                .replace(/&amp;/g, '&') + "\n\n";
             });
        }
        if (lyricsContent.trim().length > 100) {
          return NextResponse.json({ lyrics: lyricsContent.trim(), source: 'Genius API' });
        }
    }

    // 2. YOUTUBE TRANSCRIPT FALLBACK (The 'Every Song on YouTube' Solution)
    // We try to find a transcript-ready site for this song
    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(q + ' lyrics youtube transcript')}`;
    const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await searchRes.text();
    const transcriptLinkMatch = html.match(/https?:\/\/(www\.youtube\.com\/watch\?v=[^"&?']+|nepalilyrics\.com\/[^"&?']+|lyrics\.com\/[^"&?']+)/);
    
    if (transcriptLinkMatch) {
        const targetUrl = transcriptLinkMatch[0];
        const pageRes = await fetch(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const pageHtml = await pageRes.text();
        let lyricsContent = "";
        
        // Simple scraper for generic lyrics sites
        const pTags = pageHtml.match(/<p[^>]*>(.*?)<\/p>/g);
        if (pTags) {
          pTags.forEach(p => {
             const text = p.replace(/<[^>]+>/g, '').trim();
             if (text.length > 30) lyricsContent += text + "\n\n";
          });
        }
        
        if (lyricsContent.trim().length > 100) {
           return NextResponse.json({ lyrics: lyricsContent.trim(), source: 'Web Deep Scrape' });
        }
    }

    return NextResponse.json({ error: 'Lyrics not found' }, { status: 404 });

  } catch (error) {
    console.error('API Lyrics processing error:', error);
    return NextResponse.json({ error: 'Internal server error while searching' }, { status: 500 });
  }
}
