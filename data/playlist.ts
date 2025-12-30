export interface Track {
  id: string;
  title: string;
  artist: string;
  duration?: number; // Optional for live streams
  url: string;
  isLive?: boolean; // Indicates if this is a live stream
}

export const playlist: Track[] = [
  {
    id: '1',
    title: 'Radio Erevan (Întrebări Proaste, Răspunsuri Bune)',
    artist: 'BassBoostedMusicTeacher3030',
    // Suno track: https://suno.com/song/14b5c44e-b2a8-4c6c-8110-ed3c6d53131c?sh=IVfyT7R00kFqURAr
    // Song ID: 14b5c44e-b2a8-4c6c-8110-ed3c6d53131c
    // Using local audio file
    url: '/audio/14b5c44e-b2a8-4c6c-8110-ed3c6d53131c.mp3',
    isLive: false
  },
  {
    id: '2',
    title: 'Radio Erevan (Întrebări Proaste, Răspunsuri Bune)',
    artist: 'BassBoostedMusicTeacher3030',
    // Suno track: https://suno.com/song/1bc62c34-027f-4feb-842c-f9b43600674e?sh=iNr1Xk8C6Rciqp2F
    // Song ID: 1bc62c34-027f-4feb-842c-f9b43600674e
    // Using local audio file
    url: '/audio/1bc62c34-027f-4feb-842c-f9b43600674e.mp3',
    isLive: false
  },
  {
    id: '3',
    title: 'Radio MyWeel Erevan',
    artist: 'BassBoostedMusicTeacher3030',
    // Suno track: https://suno.com/song/49bebd38-896e-4179-a9ee-875bc28f3526?sh=yo1L05lkwPAaMoGS
    // Song ID: 49bebd38-896e-4179-a9ee-875bc28f3526
    // Using local audio file
    url: '/audio/49bebd38-896e-4179-a9ee-875bc28f3526.mp3',
    isLive: false
  },
  {
    id: '4',
    title: 'Radio Erevan: CallaPro Hotline',
    artist: 'BassBoostedMusicTeacher3030',
    // Suno track: https://suno.com/song/903d038c-d9c8-40a3-bb80-79f520f49f1e?sh=GLWUHY3IyBomeksB
    // Song ID: 903d038c-d9c8-40a3-bb80-79f520f49f1e
    // Using local audio file
    url: '/audio/903d038c-d9c8-40a3-bb80-79f520f49f1e.mp3',
    isLive: false
  }
];

