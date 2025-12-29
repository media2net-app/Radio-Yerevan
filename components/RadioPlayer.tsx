'use client';

import { useState, useRef, useEffect } from 'react';
import { playlist, Track } from '@/data/playlist';
import styles from './RadioPlayer.module.css';

export default function RadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = playlist[currentTrackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      handleNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play();
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play();
    }
  };

  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index);
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
              </div>
            </div>
          </div>

          <div className={styles.playerControls}>
            <button 
              onClick={handlePrevious} 
              className={styles.controlButton}
              aria-label="Previous track"
            >
              ⏮
            </button>
            <button 
              onClick={togglePlay} 
              className={styles.playButton}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button 
              onClick={handleNext} 
              className={styles.controlButton}
              aria-label="Next track"
            >
              ⏭
            </button>
          </div>

          <div className={styles.progressSection}>
            <span className={styles.timeDisplay}>{formatTime(currentTime)}</span>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <span className={styles.timeDisplay}>{formatTime(duration)}</span>
          </div>

          <div className={styles.playerActions}>
            <button 
              onClick={() => setShowPlaylist(!showPlaylist)}
              className={styles.playlistButton}
            >
              {showPlaylist ? '▲' : '▼'} Playlist
            </button>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={currentTrack.url}
          preload="metadata"
        />
      </div>

      {showPlaylist && (
        <div className={styles.playlist}>
          <div className={styles.playlistHeader}>
            <h3>Playlist</h3>
            <button 
              onClick={() => setShowPlaylist(false)}
              className={styles.closeButton}
            >
              ✕
            </button>
          </div>
          <div className={styles.playlistItems}>
            {playlist.map((track, index) => (
              <div
                key={track.id}
                onClick={() => handleTrackSelect(index)}
                className={`${styles.playlistItem} ${
                  index === currentTrackIndex ? styles.playlistItemActive : ''
                }`}
              >
                <div className={styles.playlistItemNumber}>{index + 1}</div>
                <div className={styles.playlistItemInfo}>
                  <div className={styles.playlistItemTitle}>{track.title}</div>
                  <div className={styles.playlistItemArtist}>{track.artist}</div>
                </div>
                <div className={styles.playlistItemDuration}>
                  {formatTime(track.duration)}
                </div>
                {index === currentTrackIndex && isPlaying && (
                  <div className={styles.playingIndicator}>♪</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

