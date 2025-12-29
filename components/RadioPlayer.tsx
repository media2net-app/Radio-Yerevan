'use client';

import { useState, useRef, useEffect } from 'react';
import { playlist, Track } from '@/data/playlist';
import { SkipBack, Play, Pause, SkipForward } from 'lucide-react';
import styles from './RadioPlayer.module.css';

export default function RadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [autoplayAttempted, setAutoplayAttempted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = playlist[currentTrackIndex];
  
  // Fallback stream URLs to try if main URL fails
  const fallbackUrls = [
    'https://eu1.stream4cast.com/proxy/arradioi/stream', // Official Erevan FM stream (primary)
    'http://stream.radiojar.com/am.yerevanfm', // Alternative RadioJar URLs
    'https://stream.radiojar.com/am.yerevanfm',
    'http://stream.radiojar.com/yerevanfm',
    'https://stream.radiojar.com/yerevanfm',
    'http://yerevanfm.am:8000/stream',
    'https://yerevanfm.am:8000/stream',
    // Test streams as last resort
    'http://stream-relay-geo.ntslive.net/stream',
    'http://radio.stereoscenic.com/asp-s',
  ];
  
  // Use fallback URL if available, otherwise use original
  const currentStreamUrl = fallbackIndex > 0 ? fallbackUrls[fallbackIndex] : currentTrack.url;

  
  // Handle user interaction to enable autoplay
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
            console.log('Autoplay enabled after user interaction');
          }
        } catch (error) {
          console.log('Autoplay still blocked:', error);
        }
      }
    };

    enableAutoplay();
  }, [hasUserInteracted, isPlaying, autoplayAttempted]);

  // Track user interactions (click, touch, scroll, keypress)
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (!hasUserInteracted) {
        setHasUserInteracted(true);
        // Try to play immediately on first interaction
        if (audioRef.current && !isPlaying) {
          try {
            await audioRef.current.play();
            setIsPlaying(true);
            setError(null);
            setAutoplayAttempted(true);
          } catch (error) {
            console.log('Play on interaction failed:', error);
          }
        }
      }
    };

    // Listen for various user interactions
    const events = ['click', 'touchstart', 'keydown', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [hasUserInteracted, isPlaying]);

  // Auto-play on mount (will likely be blocked, but we try)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Add error handling with fallback URLs
    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      const audioElement = e.target as HTMLAudioElement;
      const error = audioElement.error;
      if (error) {
        // Try next fallback URL
        const currentFallbackIndex = fallbackIndex;
        if (currentFallbackIndex < fallbackUrls.length - 1) {
          const nextIndex = currentFallbackIndex + 1;
          console.log(`Trying fallback URL ${nextIndex + 1}: ${fallbackUrls[nextIndex]}`);
          setFallbackIndex(nextIndex);
          // Update audio source
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.src = fallbackUrls[nextIndex];
              audioRef.current.load();
            }
          }, 100);
          return;
        }
        
        let errorMessage = 'Eroare la încărcarea stream-ului';
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            errorMessage = 'Stream-ul a fost întrerupt';
            break;
          case error.MEDIA_ERR_NETWORK:
            errorMessage = 'Eroare de rețea - Verifică conexiunea';
            break;
          case error.MEDIA_ERR_DECODE:
            errorMessage = 'Eroare la decodare';
            break;
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Formatul stream-ului nu este suportat - URL-ul poate fi incorect';
            break;
        }
        setError(errorMessage);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('All fallback URLs failed. Please contact Erevan FM for the correct stream URL.');
      }
    };

    const handleCanPlay = () => {
      console.log('Audio can play');
    };

    const handleLoadedData = () => {
      console.log('Audio data loaded');
    };

    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadeddata', handleLoadedData);

    // Try to auto-play (will likely be blocked on production)
    const attemptAutoPlay = async () => {
      try {
        audio.load();
        // Wait for metadata
        await new Promise((resolve) => {
          const onCanPlay = () => {
            audio.removeEventListener('canplay', onCanPlay);
            resolve(null);
          };
          audio.addEventListener('canplay', onCanPlay);
        });
        
        await audio.play();
        setIsPlaying(true);
        setAutoplayAttempted(true);
        console.log('Auto-play successful');
      } catch (error) {
        // Auto-play was prevented, user interaction required
        // Don't show error message - it will work after user interaction
        console.log('Auto-play prevented, waiting for user interaction:', error);
        setAutoplayAttempted(true);
        // Don't set error - autoplay prevention is normal behavior
      }
    };

    // Wait a bit for audio to load
    const timer = setTimeout(() => {
      attemptAutoPlay();
    }, 1500);

    return () => {
      clearTimeout(timer);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [fallbackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (!currentTrack.isLive) {
        setCurrentTime(audio.currentTime);
      }
    };
    
    const updateDuration = () => {
      if (!currentTrack.isLive && audio.duration) {
        setDuration(audio.duration);
      }
    };
    
    const handleEnded = () => {
      if (!currentTrack.isLive && playlist.length > 1) {
        const nextIndex = (currentTrackIndex + 1) % playlist.length;
        setCurrentTrackIndex(nextIndex);
        setIsPlaying(true);
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.play();
        }
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, currentTrack.isLive, playlist.length]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Mark user interaction
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // Make sure audio is loaded
        if (audio.readyState === 0) {
          audio.load();
        }
        await audio.play();
        setIsPlaying(true);
        setError(null);
      }
    } catch (error) {
      console.error('Play error:', error);
      setError('Nu se poate reda stream-ul. Verifică URL-ul.');
    }
  };

  const handleNext = () => {
    if (currentTrack.isLive) return; // Don't allow next for live streams
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play();
    }
  };

  const handlePrevious = () => {
    if (currentTrack.isLive) return; // Don't allow previous for live streams
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play();
    }
  };


  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className={styles.radioPlayer}>
        <div className={styles.playerContent}>
          <div className={styles.trackInfo}>
            <div className={styles.nowPlaying}>
              <span className={styles.nowPlayingLabel}>Acum se redă:</span>
              <div className={styles.trackDetails}>
                <span className={styles.trackTitle}>{currentTrack.title}</span>
                <span className={styles.trackArtist}>{currentTrack.artist}</span>
                {error && (
                  <span style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '4px' }}>
                    {error}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.playerControls}>
            {!currentTrack.isLive && (
              <button 
                onClick={handlePrevious} 
                className={styles.controlButton}
                aria-label="Previous track"
              >
                <SkipBack size={20} />
              </button>
            )}
            <button 
              onClick={togglePlay} 
              className={styles.playButton}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            {!currentTrack.isLive && (
              <button 
                onClick={handleNext} 
                className={styles.controlButton}
                aria-label="Next track"
              >
                <SkipForward size={20} />
              </button>
            )}
          </div>

          <div className={styles.progressSection}>
            {currentTrack.isLive ? (
              <>
                <span className={styles.timeDisplay}>LIVE</span>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '100%' }} />
                </div>
              </>
            ) : (
              <>
                <span className={styles.timeDisplay}>{formatTime(currentTime)}</span>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
                <span className={styles.timeDisplay}>{formatTime(duration)}</span>
              </>
            )}
          </div>

        </div>

        <audio
          ref={audioRef}
          src={currentStreamUrl}
          preload="auto"
          autoPlay
          playsInline
          onError={(e) => {
            console.error('Audio element error:', e);
            const audio = e.currentTarget;
            if (audio.error) {
              // Try next fallback URL
              const currentFallbackIndex = fallbackIndex;
              if (currentFallbackIndex < fallbackUrls.length - 1) {
                const nextIndex = currentFallbackIndex + 1;
                console.log(`Trying fallback URL ${nextIndex + 1}: ${fallbackUrls[nextIndex]}`);
                setFallbackIndex(nextIndex);
                // Update audio source
                setTimeout(() => {
                  if (audioRef.current) {
                    audioRef.current.src = fallbackUrls[nextIndex];
                    audioRef.current.load();
                  }
                }, 100);
                return;
              }
              
              let errorMessage = 'Eroare la încărcarea stream-ului';
              switch (audio.error.code) {
                case audio.error.MEDIA_ERR_ABORTED:
                  errorMessage = 'Stream-ul a fost întrerupt';
                  break;
                case audio.error.MEDIA_ERR_NETWORK:
                  errorMessage = 'Eroare de rețea - Verifică conexiunea';
                  break;
                case audio.error.MEDIA_ERR_DECODE:
                  errorMessage = 'Eroare la decodare';
                  break;
                case audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                  errorMessage = 'Formatul stream-ului nu este suportat - URL-ul poate fi incorect';
                  break;
              }
              setError(errorMessage);
              console.error('Error code:', audio.error.code);
              console.error('Error message:', audio.error.message);
              console.error('All fallback URLs failed. Please contact Erevan FM for the correct stream URL.');
            }
          }}
          onCanPlay={() => {
            console.log('Audio can play');
            setError(null);
            // Only try autoplay if user has interacted or if it hasn't been attempted yet
            if (!isPlaying && audioRef.current && (hasUserInteracted || !autoplayAttempted)) {
              audioRef.current.play().catch(err => {
                // Don't show error for autoplay prevention - it's normal behavior
                console.log('Play error (likely autoplay prevention):', err);
                // Only set error for actual playback errors, not autoplay prevention
              });
            }
          }}
          onLoadedMetadata={() => {
            console.log('Metadata loaded');
            setError(null);
          }}
          onLoadStart={() => {
            console.log('Loading started');
            setError(null);
          }}
          onPlaying={() => {
            console.log('Playing');
            setIsPlaying(true);
            setError(null);
          }}
          onPause={() => {
            console.log('Paused');
            setIsPlaying(false);
          }}
        />
      </div>

    </>
  );
}

