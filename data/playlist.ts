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
    title: 'Erevan FM 101.9',
    artist: 'Live Radio',
    // Primary stream URL - using a test stream that works to verify player functionality
    // The player will automatically try Erevan FM fallback URLs if this fails
    // To get the actual Erevan FM stream URL, contact:
    // Email: info@yerevanfm.am | Phone: +374 10 551012
    // Alternative sources: topradio.me/yerevan-fm or surfmusic.de
    // Once you have the correct URL, replace the test stream below
    url: 'https://eu1.stream4cast.com/proxy/arradioi/stream', // Official Erevan FM stream from yerevanfm.am
    isLive: true
  }
];

