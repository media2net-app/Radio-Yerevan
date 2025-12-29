# Radio Yerevan

Een moderne Next.js applicatie om klassieke Radio Yerevan grappen te bekijken, met nieuws, reels generatie en een volledig geoptimaliseerde mobile layout.

## Over Radio Yerevan

Radio Yerevan-grappen waren populaire vraag-en-antwoord moppen die ontstonden in de Sovjet-Unie en andere Oostbloklanden tijdens de tweede helft van de 20e eeuw. Deze grappen volgden een vast patroon: een luisteraar stelde een vraag aan Radio Yerevan, en het station gaf een gevat antwoord dat vaak de tekortkomingen van het communistische regime belichtte.

## Features

- 🎭 **Radio Yerevan Jokes**: Bekijk klassieke vraag-en-antwoord grappen één voor één
- 📰 **Nieuws Sectie**: Laatste nieuws uit Roemenië met verschillende categorieën
- 🎬 **Reels Generatie**: Genereer social media reels met AI (simulatie)
- 🎵 **Radio Player**: Live radio player met playlist en sticky header
- 🌓 **Dark Mode**: Schakel tussen licht en donker thema
- 📱 **Mobile Optimized**: Volledig responsive design voor alle schermformaten
- 🔐 **Authenticatie**: Login systeem met dashboard
- 📊 **Dashboard**: Overzicht van jokes, reels en statistieken

## Installatie

```bash
npm install
```

## Ontwikkeling

Start de ontwikkelserver:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

## Build

Bouw de productie versie:

```bash
npm run build
```

Start de productie server:

```bash
npm start
```

## Project Structuur

```
radio-yerevan/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Homepage met jokes en nieuws
│   ├── login/              # Login pagina
│   ├── dashboard/         # Dashboard na login
│   ├── jokes/             # Alle jokes overzicht
│   └── reels/             # Reels generatie pagina
├── components/            # React componenten
│   ├── RadioPlayer.tsx   # Radio player component
│   └── Providers.tsx     # Context providers
├── contexts/              # React contexts
│   ├── AuthContext.tsx   # Authenticatie context
│   └── ThemeContext.tsx  # Theme context
├── data/                 # Data bestanden
│   ├── jokes.ts          # Radio Yerevan jokes
│   ├── news.ts           # Nieuws items
│   └── playlist.ts       # Radio playlist
└── types/                # TypeScript types
    └── reel.ts           # Reel type definitie
```

## Technologieën

- **Next.js 14**: React framework met App Router
- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **CSS Modules**: Scoped styling
- **Lucide React**: Modern icon library

## Mobile Optimalisatie

De applicatie is volledig geoptimaliseerd voor mobile apparaten met:
- Responsive breakpoints (768px, 480px)
- Touch-vriendelijke button sizes (minimaal 44px)
- Geoptimaliseerde font sizes en spacing
- Volledige breedte layouts op mobile
- Viewport meta tags voor correcte scaling

## Licentie

Dit project is gemaakt voor Media2Net.

