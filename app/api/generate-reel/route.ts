import { NextRequest, NextResponse } from 'next/server';

// Rechtenvrije video URLs van Pexels (stock videos)
const backgroundVideos = [
  'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4',
  'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4',
  'https://videos.pexels.com/video-files/2491284/2491284-hd_1920_1080_25fps.mp4',
  'https://videos.pexels.com/video-files/2491284/2491284-hd_1920_1080_25fps.mp4',
];

export async function POST(request: NextRequest) {
  try {
    const { question, answer, reelId } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    // In een echte implementatie zou je hier FFmpeg gebruiken om video's te genereren
    // Voor nu maken we een video URL die later kan worden gegenereerd
    // Dit is een placeholder - in productie zou je een video generatie service gebruiken
    
    // Random background video selecteren
    const randomVideo = backgroundVideos[Math.floor(Math.random() * backgroundVideos.length)];
    
    // Voor demo doeleinden: we maken een data URL die een video player kan gebruiken
    // In productie: gebruik FFmpeg of een video generatie service zoals:
    // - Remotion
    // - FFmpeg.wasm
    // - Cloudinary Video API
    // - Mux
    
    // Simuleer video generatie (in productie zou dit echt een video genereren)
    const videoData = {
      videoUrl: `/api/reels/${reelId}.mp4`,
      thumbnailUrl: `/api/reels/${reelId}.jpg`,
      backgroundVideo: randomVideo,
      question,
      answer,
      duration: 6, // 3 sec vraag + 3 sec antwoord
    };

    return NextResponse.json(videoData);
  } catch (error) {
    console.error('Error generating reel:', error);
    return NextResponse.json(
      { error: 'Failed to generate reel' },
      { status: 500 }
    );
  }
}

