'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Music, Plus, X, Search, Filter, Clock, ThumbsUp, ThumbsDown, Share2, Copy, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import styles from './page.module.css';

interface GeneratedSong {
  id: string;
  title: string;
  version: string;
  description: string;
  duration: string;
  thumbnail: string;
  isPreview?: boolean;
  createdAt: string;
}

const inspirationTags = [
  'post punk', 'zapateo', 'soukous', 'fast beat', 'balkan pop', 'acoustic', 'brass', 'comedy',
  'eastern european', 'quirky', 'playful', 'vintage radio', 'spoken word', 'gang vocals'
];

export default function CreatePage() {
  const [songDescription, setSongDescription] = useState('');
  const [hasAudio, setHasAudio] = useState(false);
  const [hasLyrics, setHasLyrics] = useState(false);
  const [isInstrumental, setIsInstrumental] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSongs, setGeneratedSongs] = useState<GeneratedSong[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState<GeneratedSong | null>(null);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleGenerate = async () => {
    if (!songDescription.trim()) {
      alert('Vă rugăm introduceți o descriere pentru cântec');
      return;
    }

    setIsGenerating(true);
    
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
      setIsGenerating(false);
    }
  };

  const filteredSongs = generatedSongs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.content}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Radio Erevan</h2>
          </div>
          
          <nav className={styles.sidebarNav}>
            <Link href="/" className={styles.navItem}>
              <span>🏠</span> Home
            </Link>
            <Link href="/create" className={`${styles.navItem} ${styles.navItemActive}`}>
              <Music size={20} />
              Create
            </Link>
            <Link href="/jokes" className={styles.navItem}>
              <span>🎭</span> Glume
            </Link>
            <Link href="/reels" className={styles.navItem}>
              <span>🎬</span> Reels
            </Link>
            <Link href="/dashboard" className={styles.navItem}>
              <span>📊</span> Dashboard
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {/* Top Bar */}
          <div className={styles.topBar}>
            <div className={styles.breadcrumb}>
              <span>Workspaces</span>
              <span>›</span>
              <span>My Workspace</span>
            </div>
          </div>

          {/* Song Creation Section */}
          <div className={styles.creationSection}>
            <h2 className={styles.sectionTitle}>Song Description</h2>
            <textarea
              className={styles.descriptionInput}
              placeholder="Descrie cântecul pe care vrei să-l creezi... (ex: Radio erevan (intrebari proaste, raspunsuri bune) un client vrea sa isi promoveze afacerea - o platforma online de management service roti, si vanzare de masini, car sharing... MyWeel.eu si sa fie in acelasi stil cum erau intrebarile si raspunsurile de la radio erevan)"
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
              <h3 className={styles.inspirationTitle}>Inspiration</h3>
              <div className={styles.tagsContainer}>
                {inspirationTags.map((tag) => (
                  <button
                    key={tag}
                    className={`${styles.tagButton} ${selectedTags.includes(tag) ? styles.tagButtonActive : ''}`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {selectedTags.includes(tag) ? <X size={14} /> : <Plus size={14} />}
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button
              className={styles.generateButton}
              onClick={handleGenerate}
              disabled={isGenerating || !songDescription.trim()}
            >
              {isGenerating ? (
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

          {/* Songs List Section */}
          <div className={styles.songsSection}>
            <div className={styles.songsHeader}>
              <div className={styles.searchContainer}>
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search"
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className={styles.filtersContainer}>
                <button className={styles.filterButton}>
                  Filters (3)
                </button>
                <select className={styles.sortSelect}>
                  <option>Newest</option>
                  <option>Oldest</option>
                  <option>Title A-Z</option>
                </select>
              </div>
            </div>

            <div className={styles.songsList}>
              {filteredSongs.length === 0 ? (
                <div className={styles.emptyState}>
                  <Music size={48} />
                  <p>Nu există cântece generate încă</p>
                  <p className={styles.emptyStateSubtext}>
                    Completează descrierea de mai sus și apasă "Generează Cântec" pentru a începe
                  </p>
                </div>
              ) : (
                filteredSongs.map((song) => (
                  <div
                    key={song.id}
                    className={styles.songCard}
                    onClick={() => setSelectedSong(song)}
                  >
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
                          <button className={styles.upgradeButton}>
                            Upgrade for full song
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
        </main>

        {/* Right Sidebar - Song Details */}
        {selectedSong && (
          <aside className={styles.detailsSidebar}>
            <button
              className={styles.closeButton}
              onClick={() => setSelectedSong(null)}
            >
              <X size={24} />
            </button>
            
            <div className={styles.songDetails}>
              <div className={styles.detailsThumbnail}>
                <img src={selectedSong.thumbnail} alt={selectedSong.title} />
              </div>
              
              <div className={styles.detailsStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>0</span>
                  <span className={styles.statLabel}>plays</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>0</span>
                  <span className={styles.statLabel}>likes</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>0</span>
                  <span className={styles.statLabel}>comments</span>
                </div>
                <button className={styles.statItem}>
                  <Share2 size={18} />
                </button>
              </div>

              <h2 className={styles.detailsTitle}>{selectedSong.title}</h2>
              
              <div className={styles.detailsCaption}>
                <input
                  type="text"
                  placeholder="Add a Caption"
                  className={styles.captionInput}
                />
              </div>

              <button className={styles.remixButton}>
                <Music size={18} />
                Remix/Edit
              </button>

              <div className={styles.detailsDescription}>
                <p>{selectedSong.description}</p>
                <button className={styles.copyButton}>
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

