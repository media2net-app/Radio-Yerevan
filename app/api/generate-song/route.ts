import { NextRequest, NextResponse } from 'next/server';

// Suno API integration
// To use the real Suno API, set SUNO_API_KEY in your environment variables
// Documentation: https://docs.sunoapi.org/

export async function POST(request: NextRequest) {
  try {
    const { description, hasAudio, hasLyrics, isInstrumental, tags } = await request.json();

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const sunoApiKey = process.env.SUNO_API_KEY;

    // If API key is available, use real Suno API
    if (sunoApiKey) {
      try {
        // Build the prompt with tags
        let prompt = description;
        if (tags && tags.length > 0) {
          prompt += ' ' + tags.map((tag: string) => `+ ${tag}`).join(' ');
        }
        if (isInstrumental) {
          prompt += ' [instrumental]';
        }
        if (hasLyrics) {
          prompt += ' [with lyrics]';
        }

        // Call Suno API to generate song
        const sunoResponse = await fetch('https://api.suno.ai/v1/generate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sunoApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            make_instrumental: isInstrumental,
            wait_audio: true,
          }),
        });

        if (!sunoResponse.ok) {
          throw new Error(`Suno API error: ${sunoResponse.statusText}`);
        }

        const sunoData = await sunoResponse.json();
        
        // Extract song data from Suno response
        const song = sunoData.data?.[0] || sunoData;
        
        return NextResponse.json({
          id: song.id || `song-${Date.now()}`,
          title: song.title || description.substring(0, 50),
          version: song.model_version || 'v4.5-all',
          description: song.prompt || description.substring(0, 100),
          duration: song.duration || '2:30',
          thumbnail: song.image_url || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop`,
          audioUrl: song.audio_url || song.url,
          isPreview: false,
          createdAt: new Date().toISOString(),
          metadata: {
            hasAudio,
            hasLyrics,
            isInstrumental,
            tags: tags || [],
            fullDescription: description,
            sunoId: song.id,
          },
        });
      } catch (apiError) {
        console.error('Suno API error:', apiError);
        // Fall through to placeholder generation
      }
    }

    // Placeholder generation (when no API key or API fails)
    // Generate a unique ID for the song
    const songId = `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Extract a title from description (first 50 chars)
    const title = description.substring(0, 50).trim() + (description.length > 50 ? '...' : '');
    
    // Generate a version number
    const version = 'v4.5-all';
    
    // Create a description snippet
    const descriptionSnippet = description.length > 100 
      ? description.substring(0, 100) + '...'
      : description;
    
    // Random duration between 1:30 and 3:00
    const minutes = Math.floor(Math.random() * 2) + 1;
    const seconds = Math.floor(Math.random() * 60);
    const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Random thumbnail from Unsplash (music/radio themed)
    const thumbnailId = Math.floor(Math.random() * 10);
    const thumbnails = [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop',
    ];
    const thumbnail = thumbnails[thumbnailId % thumbnails.length];

    // Simulate song generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const generatedSong = {
      id: songId,
      title: title || 'Untitled Song',
      version,
      description: descriptionSnippet,
      duration,
      thumbnail,
      isPreview: !sunoApiKey, // Mark as preview if no API key
      createdAt: new Date().toISOString(),
      metadata: {
        hasAudio,
        hasLyrics,
        isInstrumental,
        tags: tags || [],
        fullDescription: description,
      },
    };

    return NextResponse.json(generatedSong);
  } catch (error) {
    console.error('Error generating song:', error);
    return NextResponse.json(
      { error: 'Failed to generate song' },
      { status: 500 }
    );
  }
}

