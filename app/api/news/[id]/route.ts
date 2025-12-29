import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'enclosure'],
  },
});

// Bekende Roemeense nieuws RSS feeds
const RSS_FEEDS = [
  'https://www.digi24.ro/rss',
  'https://www.antena3.ro/rss',
  'https://www.hotnews.ro/rss',
  'https://www.mediafax.ro/rss',
];

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl: string;
  url: string;
  hasVideo?: boolean;
  isExclusive?: boolean;
  time?: string;
  source?: string;
}

// Extract image from RSS item
const extractImage = (item: any): string => {
  if (item['media:content']?.[0]?.$.url) {
    return item['media:content'][0].$.url;
  }
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }
  // Try to extract image from content
  const content = item.content || item.contentSnippet || '';
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) {
    return imgMatch[1];
  }
  // Fallback to Unsplash nature image
  return `https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=400&fit=crop`;
};

// Fetch full article content from URL
async function fetchArticleContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Try to extract main content from common news site structures
    // This is a simplified version - in production you might want to use a library like cheerio
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                        html.match(/<div[^>]*class=["'][^"']*article[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
                        html.match(/<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
    
    if (articleMatch) {
      let content = articleMatch[1];
      // Remove script and style tags
      content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      // Remove ads and unwanted elements
      content = content.replace(/<div[^>]*class=["'][^"']*ad[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
      return content;
    }
    
    // Fallback: return excerpt from RSS
    return '';
  } catch (error) {
    console.error('Error fetching article content:', error);
    return '';
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Parse the ID to extract feed URL and index
    // Format: encodedFeedUrl-index-timestamp
    const parts = id.split('-');
    if (parts.length < 3) {
      return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
    }
    
    // The last part is the timestamp, second to last is the index
    const index = parseInt(parts[parts.length - 2]);
    
    if (isNaN(index)) {
      return NextResponse.json({ error: 'Invalid article index' }, { status: 400 });
    }
    
    // Reconstruct the encoded feed URL (everything before the last two parts)
    const encodedFeedUrl = parts.slice(0, -2).join('-');
    
    // Decode the feed URL (replace _ back to % for proper decoding)
    const feedUrl = decodeURIComponent(encodedFeedUrl.replace(/_/g, '%'));
    
    // Find the article in RSS feeds
    let foundArticle: NewsArticle | null = null;
    
    // Try to find the feed URL in our RSS_FEEDS list
    const matchingFeedUrl = RSS_FEEDS.find(feed => feed === feedUrl);
    
    if (!matchingFeedUrl) {
      return NextResponse.json({ error: 'Feed URL not found' }, { status: 404 });
    }
    
    try {
      const feed = await parser.parseURL(matchingFeedUrl);
      
      if (feed.items && feed.items[index]) {
        const item = feed.items[index];
        
        if (item && item.link) {
          const articleUrl = item.link;
          
          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
          // Convert to Romania timezone (Europe/Bucharest)
          const romaniaTime = new Date(pubDate.toLocaleString('en-US', { timeZone: 'Europe/Bucharest' }));
          const hours = romaniaTime.getHours().toString().padStart(2, '0');
          const minutes = romaniaTime.getMinutes().toString().padStart(2, '0');
          
          // Fetch full content
          const fullContent = await fetchArticleContent(articleUrl);
          
          foundArticle = {
            id,
            title: item.title || 'Fără titlu',
            content: fullContent || item.content || item.contentSnippet || (item as any).description || 'Fără descriere',
            excerpt: item.contentSnippet || item.content?.substring(0, 150) || (item as any).description || 'Fără descriere',
            category: 'Știri',
            date: pubDate.toISOString().split('T')[0],
            imageUrl: extractImage(item),
            url: articleUrl,
            hasVideo: (item.title || '').toLowerCase().includes('video') || 
                     (item.content || '').toLowerCase().includes('video'),
            isExclusive: false,
            time: `${hours}:${minutes}`,
            source: feed.title || 'Radio Erevan',
          };
        }
      }
    } catch (error) {
      console.error(`Error fetching RSS feed ${matchingFeedUrl}:`, error);
    }
    
    if (!foundArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    return NextResponse.json(foundArticle);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
