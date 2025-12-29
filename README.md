# Radio Erevan

Een moderne Next.js applicatie om klassieke Radio Erevan grappen te bekijken, met nieuws, reels generatie en een volledig geoptimaliseerde mobile layout.

## Over Radio Erevan

Radio Erevan-grappen waren populaire vraag-en-antwoord moppen die ontstonden in de Sovjet-Unie en andere Oostbloklanden tijdens de tweede helft van de 20e eeuw. Deze grappen volgden een vast patroon: een luisteraar stelde een vraag aan Radio Erevan, en het station gaf een gevat antwoord dat vaak de tekortkomingen van het communistische regime belichtte.

## Features

- 🎭 **Radio Erevan Jokes**: Bekijk klassieke vraag-en-antwoord grappen één voor één
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
│   ├── jokes.ts          # Radio Erevan jokes
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

## Deployment

### Vercel (Aanbevolen)

1. **Deploy via Vercel CLI**:
   ```bash
   vercel
   ```
   
   Volg de instructies om:
   - Je Vercel account te linken (of maak er een aan)
   - Het project te deployen
   - Een custom domain toe te voegen (optioneel)

2. **Of via Vercel Website**:
   - Ga naar [vercel.com](https://vercel.com)
   - Klik op "New Project"
   - Import je GitHub repository
   - Vercel detecteert automatisch Next.js en configureert alles
   - Klik op "Deploy"

3. **Environment Variables**:
   - Geen environment variables nodig voor deze applicatie

### Productie Build

De applicatie is klaar voor productie:
```bash
npm run build  # Build succesvol ✓
npm start      # Start productie server
```

## Licentie

Dit project is gemaakt voor Media2Net.

