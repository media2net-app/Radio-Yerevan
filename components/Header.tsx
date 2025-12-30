'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Play, Pause, Radio, Menu, X, LogIn, LogOut, User, Trophy, TrendingUp, SkipBack, SkipForward, List } from 'lucide-react';
import { playlist, Track } from '@/data/playlist';
import { useAuth } from '@/contexts/AuthContext';
import { jokes } from '@/data/jokes';
import styles from './Header.module.css';

export default function Header() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [autoplayAttempted, setAutoplayAttempted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(true); // Standaard open
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  
  const progressPercentage = user ? Math.round((user.totalJokesViewed / jokes.length) * 100) : 0;

  const currentTrack = playlist[currentTrackIndex];
  
  // Use the track URL directly (which points to our API route for Suno)
  const currentStreamUrl = currentTrack.url;

  useEffect(() => {
    const enableAutoplay = async () => {
      if (hasUserInteracted && !isPlaying && !autoplayAttempted && audioRef.current) {
        setAutoplayAttempted(true);
        try {
          const audio = audioRef.current;
          if (audio.readyState >= 2) {
            await audio.play();
            setIsPlaying(true);
            setError(null);
          }
        } catch (error) {
          console.log('Autoplay still blocked:', error);
        }
      }
    };
    enableAutoplay();
  }, [hasUserInteracted, isPlaying, autoplayAttempted]);

  useEffect(() => {
    const handleUserInteraction = async () => {
      if (!hasUserInteracted) {
        setHasUserInteracted(true);
        // Small delay to ensure audio is ready
        setTimeout(async () => {
          if (audioRef.current && !isPlaying) {
            try {
              // Make sure audio source is set
              if (!audioRef.current.src && currentTrack) {
                audioRef.current.src = currentTrack.url;
                audioRef.current.load();
                await new Promise(resolve => {
                  const handleCanPlay = () => {
                    audioRef.current?.removeEventListener('canplay', handleCanPlay);
                    resolve(undefined);
                  };
                  audioRef.current?.addEventListener('canplay', handleCanPlay, { once: true });
                  setTimeout(resolve, 1000); // Timeout after 1 second
                });
              }
              await audioRef.current.play();
              setIsPlaying(true);
              setError(null);
              setAutoplayAttempted(true);
            } catch (error) {
              console.log('Play on interaction failed:', error);
            }
          }
        }, 100);
      }
    };

    const events = ['click', 'touchstart', 'keydown', 'scroll', 'mousemove'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [hasUserInteracted, isPlaying, currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setError('Nu se poate reda audio. Verifică conexiunea sau descarcă track-ul de pe Suno.');
    };

    audio.addEventListener('error', handleError);
    return () => audio.removeEventListener('error', handleError);
  }, []);

  // Listen for playTrack events from homepage
  useEffect(() => {
    const handlePlayTrack = (event: CustomEvent) => {
      const trackIndex = event.detail?.index;
      if (typeof trackIndex === 'number' && trackIndex >= 0 && trackIndex < playlist.length) {
        const wasPlaying = isPlaying;
        setCurrentTrackIndex(trackIndex);
        // Auto-play when track changes
        setTimeout(() => {
          if (audioRef.current) {
            if (wasPlaying || hasUserInteracted) {
              audioRef.current.play().catch(console.error);
              setIsPlaying(true);
            }
          }
        }, 200);
      }
    };

    window.addEventListener('playTrack', handlePlayTrack as EventListener);
    return () => window.removeEventListener('playTrack', handlePlayTrack as EventListener);
  }, [isPlaying, hasUserInteracted]);

  // Broadcast track state changes and audio data to page component
  useEffect(() => {
    const event = new CustomEvent('trackStateChange', { 
      detail: { 
        currentTrackIndex, 
        isPlaying 
      } 
    });
    window.dispatchEvent(event);
  }, [currentTrackIndex, isPlaying]);

  // Broadcast audio data for equalizer
  useEffect(() => {
    if (audioData && isPlaying) {
      const event = new CustomEvent('audioDataUpdate', {
        detail: { audioData }
      });
      window.dispatchEvent(event);
    }
  }, [audioData, isPlaying]);

  // Initialize Web Audio API for equalizer
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying) {
      setAudioData(null);
      return;
    }

    let animationFrameId: number;
    let isMounted = true;

    const initAudioContext = async () => {
      try {
        // Close old context if exists
        if (audioContextRef.current) {
          try {
            await audioContextRef.current.close();
          } catch (e) {
            // Ignore errors
          }
          audioContextRef.current = null;
          analyserRef.current = null;
        }

        // Wait a bit for audio to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!isMounted || !audioRef.current) return;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        
        // Start analyzing audio
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateAudioData = () => {
          if (!isMounted || !analyserRef.current || !isPlaying) {
            setAudioData(null);
            return;
          }
          analyserRef.current.getByteFrequencyData(dataArray);
          setAudioData(new Uint8Array(dataArray));
          animationFrameId = requestAnimationFrame(updateAudioData);
        };
        
        updateAudioData();
      } catch (error) {
        console.error('Error initializing audio context:', error);
        setAudioData(null);
      }
    };

    initAudioContext();

    return () => {
      isMounted = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, currentTrackIndex]);

  // Update audio source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const trackUrl = currentTrack.url;
    const shouldAutoPlay = hasUserInteracted; // Auto-play if user has interacted
    
    // Close old audio context before changing source
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
      analyserRef.current = null;
    }
    
    // Pause current audio before changing
    audio.pause();
    setError(null);
    
    // Set new source - use absolute URL to ensure correct path
    const absoluteUrl = trackUrl.startsWith('/') ? trackUrl : `/${trackUrl}`;
    audio.src = absoluteUrl;
    audio.load();
    
    console.log('Loading track:', absoluteUrl, 'Current track index:', currentTrackIndex);
    
    // Auto-play when track changes if user has interacted
    if (shouldAutoPlay) {
      const playAudio = async () => {
        try {
          // Double check audio is still the current track and hasn't changed
          const currentAudio = audioRef.current;
          const expectedUrl = absoluteUrl;
          const currentSrc = currentAudio?.src || '';
          
          // Check if the audio source matches (handle both relative and absolute URLs)
          const srcMatches = currentSrc.includes(trackUrl.split('/').pop() || '') || 
                           currentSrc.endsWith(expectedUrl) ||
                           currentSrc.includes(expectedUrl);
          
          if (currentAudio && srcMatches) {
            console.log('Playing track:', expectedUrl);
            await currentAudio.play();
            setIsPlaying(true);
            setError(null);
          } else {
            console.warn('Audio source mismatch. Expected:', expectedUrl, 'Got:', currentSrc);
          }
        } catch (error) {
          console.error('Error playing audio after track change:', error);
          setIsPlaying(false);
          // Don't set error for autoplay failures, user can manually play
        }
      };
      
      // Wait for audio to be ready
      const handleReady = () => {
        // Use a small delay to ensure audio is fully ready
        setTimeout(playAudio, 400);
      };
      
      const handleError = (e: Event) => {
        console.error('Audio load error for track:', trackUrl, e);
        setError(`Nu se poate încărca track-ul: ${trackUrl}`);
      };
      
      audio.addEventListener('canplay', handleReady, { once: true });
      audio.addEventListener('loadeddata', handleReady, { once: true });
      audio.addEventListener('canplaythrough', handleReady, { once: true });
      audio.addEventListener('error', handleError, { once: true });
      
      // Also try immediately if already ready
      if (audio.readyState >= 3) {
        setTimeout(playAudio, 400);
      }
      
      return () => {
        audio.removeEventListener('canplay', handleReady);
        audio.removeEventListener('loadeddata', handleReady);
        audio.removeEventListener('canplaythrough', handleReady);
        audio.removeEventListener('error', handleError);
      };
    } else {
      setIsPlaying(false);
    }
  }, [currentTrackIndex, currentTrack?.url, hasUserInteracted]);

  // Update current time and duration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const updateDuration = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
    };
  }, [currentTrackIndex]);

  // Format time helper
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audio.currentTime = percentage * audio.duration;
  };

  // Auto-play initial track on first load (only once)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || autoplayAttempted || currentTrackIndex !== 0) return;

    const handleCanPlay = async () => {
      if (!isPlaying && hasUserInteracted && !autoplayAttempted) {
        try {
          await audio.play();
          setIsPlaying(true);
          setError(null);
          setAutoplayAttempted(true);
        } catch (error) {
          // Autoplay blocked - will try on user interaction
          console.log('Autoplay blocked, waiting for user interaction');
        }
      }
    };

    // Only try autoplay if user has interacted
    if (hasUserInteracted && audio.readyState >= 2 && !isPlaying && !autoplayAttempted) {
      handleCanPlay();
    }

    audio.addEventListener('canplay', handleCanPlay, { once: true });
    audio.addEventListener('loadeddata', handleCanPlay, { once: true });
    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadeddata', handleCanPlay);
    };
  }, [isPlaying, hasUserInteracted, autoplayAttempted, currentTrackIndex]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    
    // Mark user interaction
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
    
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // Make sure audio source is set correctly
        if (!audio.src || !audio.src.endsWith(currentTrack.url)) {
          audio.src = currentTrack.url;
          audio.load();
        }
        
        // Wait for audio to be ready if needed
        if (audio.readyState === 0) {
          audio.load();
          await new Promise((resolve) => {
            const handleCanPlay = () => {
              audio.removeEventListener('canplay', handleCanPlay);
              resolve(undefined);
            };
            audio.addEventListener('canplay', handleCanPlay, { once: true });
            // Timeout after 3 seconds
            setTimeout(() => {
              audio.removeEventListener('canplay', handleCanPlay);
              resolve(undefined);
            }, 3000);
          });
        }
        
        await audio.play();
        setIsPlaying(true);
        setError(null);
      }
    } catch (error) {
      console.error('Play/pause error:', error);
      setError('Eroare la redare. Verifică fișierul audio.');
      setIsPlaying(false);
    }
  };

  const playNext = () => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const playPrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const menuItems = [
    { href: '/', label: 'Acasă' },
  ];
  
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      {/* Top Bar: Logo + Stream */}
      <div className={styles.topBar}>
        <div className={styles.headerContent}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <Radio size={32} />
            <span className={styles.logoText}>Radio Erevan</span>
          </Link>

          {/* Stream Player */}
          <div className={styles.streamPlayer}>
            <div className={styles.streamInfo}>
              <span className={styles.streamTitle}>{currentTrack.title}</span>
            </div>
            <div className={styles.playerControls}>
              <button
                onClick={playPrevious}
                className={styles.navButton}
                disabled={currentTrackIndex === 0}
                aria-label="Previous track"
              >
                <SkipBack size={18} />
              </button>
              <button 
                onClick={togglePlay} 
                className={styles.streamPlayButton}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                onClick={playNext}
                className={styles.navButton}
                disabled={currentTrackIndex === playlist.length - 1}
                aria-label="Next track"
              >
                <SkipForward size={18} />
              </button>
              <button
                onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
                className={styles.playlistButton}
                aria-label="Toggle playlist"
              >
                <List size={18} />
              </button>
            </div>
            {/* Progress Bar */}
            <div className={styles.progressContainer}>
              <span className={styles.timeDisplay}>{formatTime(currentTime)}</span>
              <div 
                className={styles.progressBar}
                onClick={handleProgressClick}
              >
                <div 
                  className={styles.progressFill}
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <span className={styles.timeDisplay}>{formatTime(duration)}</span>
            </div>
            {error && (
              <span className={styles.streamError}>{error}</span>
            )}
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <button 
            className={styles.menuToggle}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <ul className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ''}`}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {/* Auth Buttons - Right Side */}
            <li className={styles.menuAuth}>
              {isAuthenticated && user ? (
                <>
                  <div className={styles.userMenuInfo}>
                    <User size={16} />
                    <span className={styles.userMenuName}>{user.username}</span>
                    <div className={styles.userMenuBadge}>
                      <Trophy size={12} />
                      <span>{user.streak}</span>
                    </div>
                    <div className={styles.userMenuBadge}>
                      <TrendingUp size={12} />
                      <span>{progressPercentage}%</span>
                    </div>
                  </div>
                  <button onClick={handleLogout} className={styles.menuLogoutButton}>
                    <LogOut size={16} />
                    Ieșire
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className={styles.menuAuthButton}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn size={16} />
                    Autentificare
                  </Link>
                  <Link 
                    href="/register" 
                    className={styles.menuAuthButton}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Înregistrare
                  </Link>
                </>
              )}
            </li>
          </ul>
        </div>
      </nav>


      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        preload="auto"
        crossOrigin="anonymous"
        onPlaying={() => {
          setIsPlaying(true);
          setError(null);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          // Auto-play next track when current ends
          if (currentTrackIndex < playlist.length - 1) {
            playNext();
          } else {
            // Loop back to first track
            setCurrentTrackIndex(0);
          }
        }}
        onError={(e) => {
          const audio = e.currentTarget;
          const error = audio.error;
          let errorMessage = 'Eroare la încărcarea audio.';
          
          if (error) {
            switch (error.code) {
              case error.MEDIA_ERR_ABORTED:
                errorMessage = 'Încărcarea audio a fost întreruptă.';
                break;
              case error.MEDIA_ERR_NETWORK:
                errorMessage = 'Eroare de rețea. Verifică conexiunea.';
                break;
              case error.MEDIA_ERR_DECODE:
                errorMessage = 'Eroare la decodarea audio. Verifică fișierul.';
                break;
              case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMessage = 'Format audio neacceptat sau fișier lipsă.';
                break;
              default:
                errorMessage = `Eroare audio (${error.code}). Verifică fișierul: ${currentTrack?.url}`;
            }
          }
          
          console.error('Audio element error:', errorMessage, error, currentTrack?.url);
          setError(errorMessage);
          setIsPlaying(false);
        }}
        onLoadedData={() => {
          // Audio is loaded and ready - try autoplay if user has interacted
          if (hasUserInteracted && !isPlaying && !autoplayAttempted && audioRef.current) {
            audioRef.current.play().catch(() => {
              // Autoplay blocked, will try on user interaction
            });
          }
        }}
      />
    </header>
  );
}

