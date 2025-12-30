import { NextRequest, NextResponse } from 'next/server';

// Suno API endpoint to get audio URL
// Note: Suno tracks don't have direct public audio URLs
// You need to either:
// 1. Download the track from Suno and host it in /public/audio/
// 2. Use a third-party service to extract the audio
// 3. Use Suno's embed iframe (not suitable for audio element)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const songId = params.id;
  
  // Try multiple CDN URLs and patterns
  const cdnUrls = [
    `https://cdn1.suno.ai/${songId}.mp3`, // Direct pattern (without /audio/)
    `https://cdn1.suno.ai/audio/${songId}.mp3`, // With /audio/ path
    `https://cdn2.suno.ai/${songId}.mp3`,
    `https://cdn2.suno.ai/audio/${songId}.mp3`,
  ];

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://suno.com/',
    'Origin': 'https://suno.com',
    'Accept': 'audio/mpeg,audio/*,*/*;q=0.9',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'identity', // Don't compress audio
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'audio',
    'Sec-Fetch-Mode': 'no-cors',
    'Sec-Fetch-Site': 'cross-site',
  };

  for (const url of cdnUrls) {
    try {
      const response = await fetch(url, {
        headers,
        redirect: 'follow',
      });

      if (response.ok && response.headers.get('content-type')?.includes('audio')) {
        const audioBuffer = await response.arrayBuffer();
        
        // Check if we got actual audio (MP3 files start with specific bytes)
        if (audioBuffer.byteLength > 1000) { // At least 1KB
          return new NextResponse(audioBuffer, {
            headers: {
              'Content-Type': 'audio/mpeg',
              'Content-Length': audioBuffer.byteLength.toString(),
              'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
      continue; // Try next URL
    }
  }

  // If all CDN URLs failed, return error
  return NextResponse.json(
    { 
      error: 'Failed to fetch audio from Suno CDN. The audio files need to be downloaded manually from Suno and placed in /public/audio/',
      instructions: 'Please download the MP3 files from Suno and place them in the public/audio/ directory with the correct filenames.'
    },
    { status: 503 }
  );
}

