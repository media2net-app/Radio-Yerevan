'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { jokes } from '@/data/jokes';
import { playlist } from '@/data/playlist';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Moon, Sun, Share2, Heart, MessageCircle, Shuffle, Star, Play, Calendar, Clock, Mic, Radio, Music, X, List, Plus, Sparkles, Search, Filter, ThumbsUp, ThumbsDown, Download } from 'lucide-react';
import Header from '@/components/Header';
import styles from './page.module.css';

interface Comment {
  id: string;
  jokeIndex: number;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

interface Show {
  id: string;
  title: string;
  host: string;
  image: string;
  time: string;
  description: string;
}

interface Episode {
  id: string;
  title: string;
  show: string;
  image: string;
  date: string;
  duration: string;
}

interface DJ {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
}

// Sample data
const shows: Show[] = [
  {
    id: '1',
    title: 'Dimineața cu Erevan',
    host: 'Maria Popescu',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    time: '06:00 - 10:00',
    description: 'Start your day with the best music and news'
  },
  {
    id: '2',
    title: 'Jocuri și Glume',
    host: 'Ion Ionescu',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop',
    time: '10:00 - 14:00',
    description: 'Interactive games and Radio Erevan jokes'
  },
  {
    id: '3',
    title: 'Seara de Muzică',
    host: 'Ana Dumitru',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    time: '18:00 - 22:00',
    description: 'Evening music and entertainment'
  },
  {
    id: '4',
    title: 'Noaptea Live',
    host: 'Dan Constantinescu',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop',
    time: '22:00 - 02:00',
    description: 'Late night live sessions'
  }
];

const episodes: Episode[] = [
  {
    id: '1',
    title: 'Cea mai bună glumă a săptămânii',
    show: 'Jocuri și Glume',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=300&fit=crop',
    date: '15 Ian 2024',
    duration: '45 min'
  },
  {
    id: '2',
    title: 'Interviu cu artistul local',
    show: 'Dimineața cu Erevan',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    date: '14 Ian 2024',
    duration: '30 min'
  },
  {
    id: '3',
    title: 'Top 10 hituri',
    show: 'Seara de Muzică',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=300&fit=crop',
    date: '13 Ian 2024',
    duration: '60 min'
  }
];

const djs: DJ[] = [
  {
    id: '1',
    name: 'Maria Popescu',
    role: 'Morning Host',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
    bio: 'Experienced radio host with 10+ years'
  },
  {
    id: '2',
    name: 'Ion Ionescu',
    role: 'Entertainment Host',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    bio: 'Funny and engaging personality'
  },
  {
    id: '3',
    name: 'Ana Dumitru',
    role: 'Evening Host',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
    bio: 'Music enthusiast and DJ'
  }
];

const events: Event[] = [
  {
    id: '1',
    title: 'Concert Live',
    date: '20 Ian 2024',
    location: 'București',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    title: 'Festival de Muzică',
    date: '25 Ian 2024',
    location: 'Cluj-Napoca',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop'
  }
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, logout, addViewedJoke, toggleFavorite, updateStreak } = useAuth();
  const [currentJokeIndex, setCurrentJokeIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [email, setEmail] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const jokeCardRef = useRef<HTMLDivElement>(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const getJokeOfTheDay = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    return dayOfYear % jokes.length;
  };
  
  const jokeOfTheDayIndex = getJokeOfTheDay();

  const handleNextJoke = () => {
    if (isAuthenticated && user) {
      addViewedJoke(currentJokeIndex);
    }
    setCurrentJokeIndex((prevIndex) => (prevIndex + 1) % jokes.length);
    setIsAnswerRevealed(false);
    setShowComments(false);
    if (jokeCardRef.current) {
      jokeCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRevealAnswer = () => {
    setIsAnswerRevealed(true);
    if (isAuthenticated && user) {
      addViewedJoke(currentJokeIndex);
    }
  };

  const handleRandomJoke = () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * jokes.length);
    } while (randomIndex === currentJokeIndex && jokes.length > 1);
    
    setCurrentJokeIndex(randomIndex);
    setIsAnswerRevealed(false);
    setShowComments(false);
    if (jokeCardRef.current) {
      jokeCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleShare = async () => {
    const joke = jokes[currentJokeIndex];
    const text = `Radio Erevan: ${joke.question}\n\n${joke.answer}\n\n${window.location.href}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Radio Erevan Joke', text: text, url: window.location.href });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(text);
      alert('Gluma a fost copiată în clipboard!');
    }
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    toggleFavorite(currentJokeIndex);
  };

  const isFavorite = user?.favoriteJokes.includes(currentJokeIndex) || false;

  useEffect(() => {
    const loadComments = () => {
      try {
        const stored = localStorage.getItem('comments');
        const allComments: Comment[] = stored ? JSON.parse(stored) : [];
        const jokeComments = allComments.filter(c => c.jokeIndex === currentJokeIndex);
        setComments(jokeComments);
      } catch (error) {
        console.error('Error loading comments:', error);
        setComments([]);
      }
    };
    loadComments();
  }, [currentJokeIndex]);

  useEffect(() => {
    if (isAuthenticated && user) {
      updateStreak();
    }
  }, [isAuthenticated, user, updateStreak]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        jokeIndex: currentJokeIndex,
        userId: user.id,
        username: user.username,
        text: newComment.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: []
      };

      const stored = localStorage.getItem('comments');
      const allComments: Comment[] = stored ? JSON.parse(stored) : [];
      allComments.push(newCommentObj);
      localStorage.setItem('comments', JSON.stringify(allComments));

      setComments([...comments, newCommentObj]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Mulțumim pentru abonare!');
    setEmail('');
  };

  const currentJoke = jokes[currentJokeIndex];
  const { theme, toggleTheme } = useTheme();
  const progressPercentage = user ? Math.round((user.totalJokesViewed / jokes.length) * 100) : 0;
  const isJokeOfTheDay = currentJokeIndex === jokeOfTheDayIndex;
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  
  // Song creation state
  const [songDescription, setSongDescription] = useState('');
  const [hasAudio, setHasAudio] = useState(false);
  const [hasLyrics, setHasLyrics] = useState(false);
  const [isInstrumental, setIsInstrumental] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isGeneratingSong, setIsGeneratingSong] = useState(false);
  const [generatedSongs, setGeneratedSongs] = useState<any[]>([]);
  const [songSearchQuery, setSongSearchQuery] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedSongForUpgrade, setSelectedSongForUpgrade] = useState<any>(null);

  // Song generation handler
  const handleGenerateSong = async () => {
    if (!songDescription.trim()) {
      alert('Vă rugăm introduceți o descriere pentru cântec');
      return;
    }

    setIsGeneratingSong(true);
    
    try {
      const response = await fetch('/api/generate-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: songDescription,
          hasAudio,
          hasLyrics,
          isInstrumental,
          tags: selectedTags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate song');
      }

      const newSong = await response.json();
      setGeneratedSongs([newSong, ...generatedSongs]);
      setSongDescription('');
      setSelectedTags([]);
    } catch (error) {
      console.error('Error generating song:', error);
      alert('Eroare la generarea cântecului. Vă rugăm încercați din nou.');
    } finally {
      setIsGeneratingSong(false);
    }
  };

  const filteredGeneratedSongs = generatedSongs.filter(song =>
    song.title.toLowerCase().includes(songSearchQuery.toLowerCase()) ||
    song.description.toLowerCase().includes(songSearchQuery.toLowerCase())
  );

  // Listen for track state changes from Header
  useEffect(() => {
    const handleTrackStateChange = (event: CustomEvent) => {
      setCurrentTrackIndex(event.detail?.currentTrackIndex || 0);
      setIsPlaying(event.detail?.isPlaying || false);
    };

    const handleAudioData = (event: CustomEvent) => {
      setAudioData(event.detail?.audioData || null);
    };

    window.addEventListener('trackStateChange', handleTrackStateChange as EventListener);
    window.addEventListener('audioDataUpdate', handleAudioData as EventListener);
    return () => {
      window.removeEventListener('trackStateChange', handleTrackStateChange as EventListener);
      window.removeEventListener('audioDataUpdate', handleAudioData as EventListener);
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* Theme Switcher */}
      <button onClick={toggleTheme} className={styles.themeSwitcher} aria-label="Toggle theme">
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* Header with Logo, Stream and Menu */}
      <Header />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground}>
          <div className={styles.heroOverlay}></div>
        </div>
        {/* Joke Sidebar - Inside Hero Section (Left) */}
        {!isMobile && (
        <div className={styles.heroJokeSidebar}>
          <div className={styles.jokeSidebarHeader}>
            <h3>Gluma Zilei</h3>
          </div>
          <div className={styles.jokeSidebarContent}>
            {isJokeOfTheDay && (
              <div className={styles.jokeOfTheDayBadge}>
                <Star size={14} fill="currentColor" />
                <span>Gluma zilei</span>
              </div>
            )}
            <div className={styles.questionSection}>
              <div className={styles.label}>Întrebare:</div>
              <p className={styles.question}>{currentJoke.question}</p>
            </div>

            <div className={styles.jokeActions}>
              <button onClick={handleRandomJoke} className={styles.actionButton} title="Glumă aleatoare">
                <Shuffle size={16} />
              </button>
              <button onClick={handleShare} className={styles.actionButton} title="Distribuie">
                <Share2 size={16} />
              </button>
              <button onClick={handleToggleFavorite} className={`${styles.actionButton} ${isFavorite ? styles.favoriteActive : ''}`} title={isFavorite ? "Elimină din favorite" : "Adaugă la favorite"}>
                <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button onClick={() => setShowComments(!showComments)} className={styles.actionButton} title="Comentarii">
                <MessageCircle size={16} />
                {comments.length > 0 && <span className={styles.commentCount}>{comments.length}</span>}
              </button>
            </div>

            {isAnswerRevealed ? (
              <div className={styles.answerSection}>
                <div className={styles.label}>Răspuns:</div>
                <p className={styles.answer}>{currentJoke.answer}</p>
                
                {showComments && (
                  <div className={styles.commentsSection}>
                    <h3 className={styles.commentsTitle}>Comentarii ({comments.length})</h3>
                    <div className={styles.commentsList}>
                      {comments.length === 0 ? (
                        <p className={styles.noComments}>Nu există comentarii încă. Fii primul!</p>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className={styles.comment}>
                            <div className={styles.commentHeader}>
                              <strong>{comment.username}</strong>
                              <span className={styles.commentDate}>{new Date(comment.createdAt).toLocaleDateString('ro-RO')}</span>
                            </div>
                            <p className={styles.commentText}>{comment.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {isAuthenticated ? (
                      <form onSubmit={handleSubmitComment} className={styles.commentForm}>
                        <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Adaugă un comentariu..." className={styles.commentInput} rows={3} />
                        <button type="submit" className={styles.commentSubmit} disabled={isSubmittingComment || !newComment.trim()}>
                          {isSubmittingComment ? 'Se trimite...' : 'Trimite'}
                        </button>
                      </form>
                    ) : (
                      <p className={styles.loginPrompt}>
                        <Link href="/login">Autentifică-te</Link> pentru a adăuga comentarii
                      </p>
                    )}
                  </div>
                )}

                <div className={styles.footer}>
                  <button onClick={handleNextJoke} className={styles.nextButton}>Glumă următoare</button>
                  <div className={styles.counter}>
                    {currentJokeIndex + 1} / {jokes.length}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.answerSection}>
                <div className={styles.label}>Răspuns:</div>
                <div className={styles.hiddenAnswer}>
                  <p>Apasă butonul pentru a vedea răspunsul</p>
                </div>
                <div className={styles.footer}>
                  <button onClick={handleRevealAnswer} className={styles.revealButton}>Reveal Răspuns</button>
                  <div className={styles.counter}>
                    {currentJokeIndex + 1} / {jokes.length}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Radio size={20} />
            <span>LIVE NOW</span>
          </div>
          <h1 className={styles.heroTitle}>Radio Erevan</h1>
          <p className={styles.heroSubtitle}>Cea mai bună muzică și glume din România</p>
          <div className={styles.heroButtons}>
            <button className={styles.heroButtonPrimary}>
              <Play size={20} />
              Ascultă Live
            </button>
            <Link href="/jokes" className={styles.heroButtonSecondary}>
              Vezi Glume
            </Link>
          </div>
        </div>
        
        {/* Playlist Sidebar - Inside Hero Section (Right) */}
        {!isMobile && (
        <div className={styles.heroPlaylistSidebar}>
          <div className={styles.playlistHeader}>
            <h3>Playlist</h3>
            <button
              onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
              className={styles.playlistToggleButton}
              aria-label={isPlaylistOpen ? 'Collapse playlist' : 'Expand playlist'}
            >
              {isPlaylistOpen ? <X size={18} /> : <List size={18} />}
            </button>
          </div>
          {isPlaylistOpen && (
            <div className={styles.playlistList}>
              {playlist.map((track, index) => (
                <button
                  key={track.id}
                  className={`${styles.playlistItem} ${index === currentTrackIndex ? styles.playlistItemActive : ''}`}
                  onClick={() => {
                    setCurrentTrackIndex(index);
                    const event = new CustomEvent('playTrack', { detail: { index } });
                    window.dispatchEvent(event);
                  }}
                >
                  <div className={styles.playlistItemInfo}>
                    <div className={styles.playlistItemNumber}>{index + 1}</div>
                    <div className={styles.playlistItemDetails}>
                      <div className={styles.playlistItemTitle}>{track.title}</div>
                      <div className={styles.playlistItemArtist}>{track.artist}</div>
                    </div>
                  </div>
                  {index === currentTrackIndex && isPlaying && (
                    <div className={styles.playlistItemPlaying}>
                      <Play size={14} fill="currentColor" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        )}
      </section>

      {/* Logo Slider */}
      <section className={styles.logoSliderSection}>
        <div className={styles.logoSlider}>
          <div className={styles.logoSliderTrack}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={styles.logoSliderItem}>
                <Radio size={48} />
                <span className={styles.logoSliderText}>Radio Erevan</span>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[...Array(6)].map((_, i) => (
              <div key={`dup-${i}`} className={styles.logoSliderItem}>
                <Radio size={48} />
                <span className={styles.logoSliderText}>Radio Erevan</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Playlist Section */}
      <section className={styles.showsSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Playlist</h2>
            <p className={styles.sectionSubtitle}>Descoperă cântecele noastre</p>
          </div>
          <div className={styles.showsGrid}>
            {playlist.map((track, index) => {
              // Different images for each track
              const trackImages = [
                'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
              ];
              
              return (
                <div key={track.id} className={styles.showCard}>
                  <div className={styles.showImageContainer}>
                    <img 
                      src={trackImages[index % trackImages.length]} 
                      alt={track.title} 
                      className={styles.showImage} 
                    />
                    <div className={styles.showOverlay}>
                      <button 
                        className={styles.playShowButton}
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          const event = new CustomEvent('playTrack', { detail: { index } });
                          window.dispatchEvent(event);
                        }}
                      >
                        <Play size={24} fill="white" />
                      </button>
                    </div>
                  </div>
                  <div className={styles.showInfo}>
                    <div className={styles.showTime}>
                      <Music size={16} />
                      <span>Track {index + 1}</span>
                    </div>
                    <h3 className={styles.showTitle}>{track.title}</h3>
                    <p className={styles.showHost}>
                      <Mic size={14} />
                      {track.artist}
                    </p>
                    <p className={styles.showDescription}>Ascultă acest cântec din playlist-ul nostru</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Create Song Section */}
      <section className={styles.createSongSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Creează Cântec</h2>
            <p className={styles.sectionSubtitle}>Generează muzică personalizată cu AI</p>
          </div>
          
          <div className={styles.createSongContent}>
            {/* Left: Creation Form */}
            <div className={styles.creationForm}>
              <div className={styles.formCard}>
                <h3 className={styles.formTitle}>Song Description</h3>
                <textarea
                  className={styles.descriptionInput}
                  placeholder="Descrie cântecul pe care vrei să-l creezi... (ex: Radio Erevan - întrebări și răspunsuri în stil satiric)"
                  value={songDescription}
                  onChange={(e) => setSongDescription(e.target.value)}
                  rows={6}
                />

                <div className={styles.optionsRow}>
                  <button
                    className={`${styles.optionButton} ${hasAudio ? styles.optionButtonActive : ''}`}
                    onClick={() => setHasAudio(!hasAudio)}
                  >
                    <Plus size={16} />
                    Audio
                  </button>
                  <button
                    className={`${styles.optionButton} ${hasLyrics ? styles.optionButtonActive : ''}`}
                    onClick={() => setHasLyrics(!hasLyrics)}
                  >
                    <Plus size={16} />
                    Lyrics
                  </button>
                  <button
                    className={`${styles.optionButton} ${isInstrumental ? styles.optionButtonActive : ''}`}
                    onClick={() => setIsInstrumental(!isInstrumental)}
                  >
                    {isInstrumental && <span>✓</span>}
                    Instrumental
                  </button>
                </div>

                <div className={styles.inspirationSection}>
                  <h4 className={styles.inspirationTitle}>Inspiration</h4>
                  <div className={styles.tagsContainer}>
                    {['jazz vocal', 'cloud trap', 'pop-rap', 'balkan folk', 'eastern european', 'quirky', 'vintage radio', 'spoken word'].map((tag) => (
                      <button
                        key={tag}
                        className={`${styles.tagButton} ${selectedTags.includes(tag) ? styles.tagButtonActive : ''}`}
                        onClick={() => {
                          if (selectedTags.includes(tag)) {
                            setSelectedTags(selectedTags.filter(t => t !== tag));
                          } else {
                            setSelectedTags([...selectedTags, tag]);
                          }
                        }}
                      >
                        {selectedTags.includes(tag) ? <X size={14} /> : <Plus size={14} />}
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  className={styles.generateButton}
                  onClick={handleGenerateSong}
                  disabled={isGeneratingSong || !songDescription.trim()}
                >
                  {isGeneratingSong ? (
                    <>
                      <Sparkles size={20} className={styles.spinning} />
                      Generare...
                    </>
                  ) : (
                    <>
                      <Music size={20} />
                      Generează Cântec
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Generated Songs List */}
            <div className={styles.generatedSongsList}>
              <div className={styles.songsHeader}>
                <div className={styles.searchContainer}>
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search"
                    className={styles.searchInput}
                    value={songSearchQuery}
                    onChange={(e) => setSongSearchQuery(e.target.value)}
                  />
                </div>
                <div className={styles.filtersContainer}>
                  <button className={styles.filterButton}>
                    Filters
                  </button>
                  <select className={styles.sortSelect}>
                    <option>Newest</option>
                    <option>Oldest</option>
                    <option>Title A-Z</option>
                  </select>
                </div>
              </div>

              <div className={styles.songsList}>
                {filteredGeneratedSongs.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Music size={48} />
                    <p>Nu există cântece generate încă</p>
                    <p className={styles.emptyStateSubtext}>
                      Completează descrierea de mai sus și apasă "Generează Cântec" pentru a începe
                    </p>
                  </div>
                ) : (
                  filteredGeneratedSongs.map((song) => (
                    <div key={song.id} className={styles.songCard}>
                      <div className={styles.songThumbnail}>
                        <img src={song.thumbnail} alt={song.title} />
                      </div>
                      <div className={styles.songInfo}>
                        <div className={styles.songHeader}>
                          <h3 className={styles.songTitle}>{song.title}</h3>
                          <span className={styles.songVersion}>{song.version}</span>
                        </div>
                        <p className={styles.songDescription}>{song.description}</p>
                        <div className={styles.songMeta}>
                          <div className={styles.songDuration}>
                            <Clock size={14} />
                            {song.duration}
                          </div>
                          {song.isPreview && (
                            <button 
                              className={styles.upgradeButton}
                              onClick={() => {
                                setSelectedSongForUpgrade(song);
                                setShowUpgradeModal(true);
                              }}
                            >
                              <Play size={14} />
                              Song afspelen
                            </button>
                          )}
                        </div>
                      </div>
                      <div className={styles.songActions}>
                        <button className={styles.actionButton}>
                          <ThumbsUp size={16} />
                        </button>
                        <button className={styles.actionButton}>
                          <ThumbsDown size={16} />
                        </button>
                        <button className={styles.actionButton}>
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Episodes */}
      <section className={styles.episodesSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Episoade Recente</h2>
            <p className={styles.sectionSubtitle}>Ascultă cele mai populare episoade</p>
          </div>
          <div className={styles.episodesGrid}>
            {episodes.map((episode) => (
              <div key={episode.id} className={styles.episodeCard}>
                <div className={styles.episodeImageContainer}>
                  <img src={episode.image} alt={episode.title} className={styles.episodeImage} />
                  <button className={styles.episodePlayButton}>
                    <Play size={20} fill="white" />
                  </button>
                </div>
                <div className={styles.episodeInfo}>
                  <span className={styles.episodeShow}>{episode.show}</span>
                  <h3 className={styles.episodeTitle}>{episode.title}</h3>
                  <div className={styles.episodeMeta}>
                    <span className={styles.episodeDate}>
                      <Calendar size={14} />
                      {episode.date}
                    </span>
                    <span className={styles.episodeDuration}>
                      <Clock size={14} />
                      {episode.duration}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DJs Section */}
      <section className={styles.djsSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Echipa Noastră</h2>
            <p className={styles.sectionSubtitle}>Cunoaște prezentatorii noștri</p>
          </div>
          <div className={styles.djsGrid}>
            {djs.map((dj) => (
              <div key={dj.id} className={styles.djCard}>
                <div className={styles.djImageContainer}>
                  <img src={dj.image} alt={dj.name} className={styles.djImage} />
                </div>
                <div className={styles.djInfo}>
                  <h3 className={styles.djName}>{dj.name}</h3>
                  <p className={styles.djRole}>{dj.role}</p>
                  <p className={styles.djBio}>{dj.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className={styles.eventsSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Evenimente</h2>
            <p className={styles.sectionSubtitle}>Urmărește evenimentele noastre</p>
          </div>
          <div className={styles.eventsGrid}>
            {events.map((event) => (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventImageContainer}>
                  <img src={event.image} alt={event.title} className={styles.eventImage} />
                  <div className={styles.eventDateBadge}>
                    <Calendar size={16} />
                    <span>{event.date}</span>
                  </div>
                </div>
                <div className={styles.eventInfo}>
                  <h3 className={styles.eventTitle}>{event.title}</h3>
                  <p className={styles.eventLocation}>{event.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className={styles.newsletterSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.newsletterContent}>
            <h2 className={styles.newsletterTitle}>Abonează-te la Newsletter</h2>
            <p className={styles.newsletterSubtitle}>Primește cele mai noi glume și știri direct în inbox</p>
            <form onSubmit={handleNewsletterSubmit} className={styles.newsletterForm}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Introduceți adresa de email"
                className={styles.newsletterInput}
                required
              />
              <button type="submit" className={styles.newsletterButton}>
                Abonează-te
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUpgradeModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.modalCloseButton}
              onClick={() => setShowUpgradeModal(false)}
            >
              <X size={24} />
            </button>
            <div className={styles.modalHeader}>
              <Music size={48} />
              <h2 className={styles.modalTitle}>Upgrade voor volledige toegang</h2>
              <p className={styles.modalSubtitle}>
                Upgrade voor €1,99 om dit nummer te luisteren en te downloaden
              </p>
            </div>
            {selectedSongForUpgrade && (
              <div className={styles.modalSongInfo}>
                <div className={styles.modalSongThumbnail}>
                  <img src={selectedSongForUpgrade.thumbnail} alt={selectedSongForUpgrade.title} />
                </div>
                <div className={styles.modalSongDetails}>
                  <h3 className={styles.modalSongTitle}>{selectedSongForUpgrade.title}</h3>
                  <p className={styles.modalSongDescription}>{selectedSongForUpgrade.description}</p>
                  <div className={styles.modalSongDuration}>
                    <Clock size={16} />
                    {selectedSongForUpgrade.duration}
                  </div>
                </div>
              </div>
            )}
            <div className={styles.modalFeatures}>
              <div className={styles.modalFeature}>
                <Play size={20} />
                <span>Luister het volledige nummer</span>
              </div>
              <div className={styles.modalFeature}>
                <Download size={20} />
                <span>Download in hoge kwaliteit</span>
              </div>
              <div className={styles.modalFeature}>
                <Music size={20} />
                <span>Ongelimiteerde toegang</span>
              </div>
            </div>
            <div className={styles.modalPrice}>
              <span className={styles.modalPriceAmount}>€1,99</span>
              <span className={styles.modalPriceLabel}>Eenmalige betaling</span>
            </div>
            <button 
              className={styles.modalUpgradeButton}
              onClick={() => {
                // Hier zou de betalingslogica komen
                alert('Betalingsproces wordt gestart...');
                setShowUpgradeModal(false);
              }}
            >
              <Download size={20} />
              Upgrade nu voor €1,99
            </button>
            <p className={styles.modalDisclaimer}>
              Door te upgraden ga je akkoord met onze voorwaarden. Je kunt het nummer direct luisteren en downloaden na betaling.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
