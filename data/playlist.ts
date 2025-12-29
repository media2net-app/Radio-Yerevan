export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
}

export const playlist: Track[] = [
  {
    id: '1',
    title: 'Radio Yerevan Theme',
    artist: 'Radio Yerevan',
    duration: 180,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: '2',
    title: 'Soviet Era Melody',
    artist: 'Radio Yerevan',
    duration: 195,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: '3',
    title: 'Armenian Folk Music',
    artist: 'Radio Yerevan',
    duration: 210,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: '4',
    title: 'Classic Radio Show',
    artist: 'Radio Yerevan',
    duration: 240,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  }
];

