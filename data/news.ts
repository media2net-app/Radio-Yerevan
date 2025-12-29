export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl: string;
  url: string;
  hasVideo?: boolean;
  isExclusive?: boolean;
  time?: string; // For "Tocmai sosit" section
}

export const newsItems: NewsItem[] = [
  {
    id: '1',
    title: 'România anunță investiții majore în infrastructură',
    excerpt: 'Guvernul a aprobat un plan de investiții de peste 10 miliarde de euro pentru modernizarea infrastructurii rutiere și feroviare.',
    category: 'Politică',
    date: '2024-12-29',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop',
    url: '#',
    time: '16:28'
  },
  {
    id: '2',
    title: 'Tehnologie: Start-up-ul românesc atinge evaluare unicorn',
    excerpt: 'O companie tech din București a atins o evaluare de peste 1 miliard de dolari, devenind primul unicorn românesc.',
    category: 'Tehnologie',
    date: '2024-12-29',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=250&fit=crop',
    url: '#',
    time: '16:18'
  },
  {
    id: '3',
    title: 'Sport: Echipa națională se califică pentru Campionatul European',
    excerpt: 'România a câștigat meciul decisiv și s-a calificat pentru turneul final al Campionatului European de fotbal.',
    category: 'Sport',
    date: '2024-12-28',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop',
    url: '#',
    hasVideo: true,
    time: '16:09'
  },
  {
    id: '4',
    title: 'Cultură: Festivalul de muzică clasică de la Sibiu',
    excerpt: 'Ediția a 25-a a Festivalului Internațional de Muzică Clasică din Sibiu aduce artiști de renume mondial.',
    category: 'Cultură',
    date: '2024-12-28',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop',
    url: '#',
    isExclusive: true,
    time: '15:57'
  },
  {
    id: '5',
    title: 'Economie: Creștere economică de 4,5% în trimestrul IV',
    excerpt: 'România înregistrează o creștere economică solidă, depășind prognozele economiștilor pentru ultimul trimestru.',
    category: 'Economie',
    date: '2024-12-27',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
    url: '#',
    time: '15:47'
  },
  {
    id: '6',
    title: 'Sănătate: Nou program de screening pentru cancer',
    excerpt: 'Ministerul Sănătății lansează un program național de screening pentru detectarea timpurie a cancerului.',
    category: 'Sănătate',
    date: '2024-12-27',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop',
    url: '#',
    hasVideo: true,
    time: '15:42'
  },
  {
    id: '7',
    title: 'Mediu: Proiect de reforestare în Carpați',
    excerpt: 'Autoritățile au lansat un proiect ambițios de reforestare a 10.000 de hectare în Munții Carpați.',
    category: 'Mediu',
    date: '2024-12-26',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop',
    url: '#',
    time: '14:59'
  },
  {
    id: '8',
    title: 'Educație: Reformă în sistemul de învățământ superior',
    excerpt: 'Noua reformă educațională vizează modernizarea programelor de studiu și creșterea calității educației.',
    category: 'Educație',
    date: '2024-12-26',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop',
    url: '#',
    isExclusive: true,
    time: '14:58'
  },
  {
    id: '9',
    title: 'Politică: Nouă lege pentru protecția mediului',
    excerpt: 'Parlamentul a aprobat o nouă lege care întărește măsurile de protecție a mediului înconjurător.',
    category: 'Politică',
    date: '2024-12-29',
    imageUrl: '',
    url: '#',
    time: '14:45'
  },
  {
    id: '10',
    title: 'Sport: Victorii importante pentru sportivii români',
    excerpt: 'Sportivii români au obținut rezultate remarcabile la competițiile internaționale din această săptămână.',
    category: 'Sport',
    date: '2024-12-29',
    imageUrl: '',
    url: '#',
    hasVideo: true,
    time: '14:30'
  }
];

export const categories = [
  'Toate',
  'Politică',
  'Tehnologie',
  'Sport',
  'Cultură',
  'Economie',
  'Sănătate',
  'Mediu',
  'Educație'
];

