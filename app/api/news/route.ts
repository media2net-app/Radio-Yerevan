import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'enclosure'],
  },
});

// Cache voor RSS feeds (5 minuten)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuten

// Bekende Roemeense nieuws RSS feeds
const RSS_FEEDS = [
  'https://www.digi24.ro/rss',
  'https://www.antena3.ro/rss',
  'https://www.hotnews.ro/rss',
  'https://www.mediafax.ro/rss',
];

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl: string;
  url: string;
  hasVideo?: boolean;
  isExclusive?: boolean;
  time?: string;
}

// Categorie mapping op basis van keywords in titel
const categorizeNews = (title: string, description: string): string => {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('politic') || text.includes('guvern') || text.includes('parlament')) {
    return 'Politică';
  }
  if (text.includes('tech') || text.includes('tehnologie') || text.includes('startup') || text.includes('digital')) {
    return 'Tehnologie';
  }
  if (text.includes('sport') || text.includes('fotbal') || text.includes('olimpic')) {
    return 'Sport';
  }
  if (text.includes('cultur') || text.includes('art') || text.includes('muzic') || text.includes('festival')) {
    return 'Cultură';
  }
  if (text.includes('econom') || text.includes('finanț') || text.includes('banc')) {
    return 'Economie';
  }
  if (text.includes('sănătate') || text.includes('spital') || text.includes('medic')) {
    return 'Sănătate';
  }
  if (text.includes('mediu') || text.includes('clim') || text.includes('ecolog')) {
    return 'Mediu';
  }
  if (text.includes('educaț') || text.includes('școal') || text.includes('universit')) {
    return 'Educație';
  }
  return 'Politică'; // Default
};

// Extract image from RSS item
const extractImage = (item: Parser.Item & { 'media:content'?: any; enclosure?: any }): string => {
  // Try media:content
  if (item['media:content']?.[0]?.['$']?.url) {
    return item['media:content'][0]['$'].url;
  }
  
  // Try enclosure
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }
  
  // Try to extract from content
  if (item.content) {
    const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/i);
    if (imgMatch) return imgMatch[1];
  }
  
  // Try contentSnippet
  if (item.contentSnippet) {
    const imgMatch = item.contentSnippet.match(/src="([^"]+)"/i);
    if (imgMatch) return imgMatch[1];
  }
  
  // Fallback to Unsplash based on category
  return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop';
};

// Format time from date in Romania timezone (Europe/Bucharest)
const formatTime = (date: Date): string => {
  // Convert to Romania timezone
  const romaniaTime = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Bucharest' }));
  const hours = romaniaTime.getHours().toString().padStart(2, '0');
  const minutes = romaniaTime.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export async function GET() {
  try {
    // Check cache
    const cacheKey = 'rss-news';
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    const allNews: NewsItem[] = [];

    // Fetch from all RSS feeds
    for (const feedUrl of RSS_FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl);
        
        if (feed.items) {
          feed.items.slice(0, 10).forEach((item, index) => {
            const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
            const category = categorizeNews(item.title || '', item.contentSnippet || item.content || '');
            
            // Create URL-safe ID: encode feed URL and combine with index and timestamp
            const feedUrlEncoded = encodeURIComponent(feedUrl).replace(/%/g, '_');
            const id = `${feedUrlEncoded}-${index}-${Date.now()}`;
            
            allNews.push({
              id,
              title: item.title || 'Fără titlu',
              excerpt: item.contentSnippet || item.content?.substring(0, 150) || (item as any).description || 'Fără descriere',
              category,
              date: pubDate.toISOString().split('T')[0],
              imageUrl: extractImage(item),
              url: item.link || '#',
              hasVideo: (item.title || '').toLowerCase().includes('video') || 
                       (item.content || '').toLowerCase().includes('video'),
              isExclusive: Math.random() > 0.85, // 15% chance voor Erevan+ badge
              time: formatTime(pubDate),
            });
          });
        }
      } catch (error) {
        console.error(`Error fetching RSS feed ${feedUrl}:`, error);
        // Continue with other feeds
      }
    }

    // Sort by date (newest first)
    allNews.sort((a, b) => {
      const dateA = new Date(a.date + ' ' + (a.time || '00:00'));
      const dateB = new Date(b.date + ' ' + (b.time || '00:00'));
      return dateB.getTime() - dateA.getTime();
    });

    // Limit to 20 items
    const newsData = allNews.slice(0, 20);

    // Cache the result
    cache.set(cacheKey, {
      data: newsData,
      timestamp: Date.now(),
    });

    return NextResponse.json(newsData);
  } catch (error) {
    console.error('Error fetching RSS news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

