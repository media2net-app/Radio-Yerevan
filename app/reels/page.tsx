'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { jokes } from '@/data/jokes';
import { Reel } from '@/types/reel';
import styles from './page.module.css';
import Link from 'next/link';

export default function ReelsPage() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [reels, setReels] = useState<Reel[]>([]);
  const [selectedJokeId, setSelectedJokeId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Load reels from localStorage
    const savedReels = localStorage.getItem('reels');
    if (savedReels) {
      setReels(JSON.parse(savedReels));
    }
  }, []);

  const saveReels = (newReels: Reel[]) => {
    setReels(newReels);
    localStorage.setItem('reels', JSON.stringify(newReels));
  };

  const handleGenerateReel = async () => {
    if (!selectedJokeId) {
      alert('Vă rugăm să selectați o glumă');
      return;
    }

    const joke = jokes.find(j => {
      return j.question === selectedJokeId;
    });

    if (!joke) return;

    setIsGenerating(true);

    // Create new reel
    const newReel: Reel = {
      id: Date.now().toString(),
      jokeId: selectedJokeId,
      question: joke.question,
      answer: joke.answer,
      status: 'generating',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedReels = [newReel, ...reels];
    saveReels(updatedReels);

    try {
      // Generate video using client-side generator
      const { generateReelVideo } = await import('@/lib/videoGenerator');
      
      // Use a rechtenvrije video from Pexels
      const backgroundVideos = [
        'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4',
        'https://videos.pexels.com/video-files/2491284/2491284-hd_1920_1080_25fps.mp4',
        'https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4',
      ];
      const randomVideo = backgroundVideos[Math.floor(Math.random() * backgroundVideos.length)];

      const { videoUrl, thumbnailUrl } = await generateReelVideo({
        question: joke.question,
        answer: joke.answer,
        backgroundVideoUrl: randomVideo,
        reelId: newReel.id,
      });

      const completedReel: Reel = {
        ...newReel,
        status: 'completed',
        videoUrl,
        thumbnailUrl,
        updatedAt: new Date().toISOString(),
      };

      const finalReels = updatedReels.map(r => 
        r.id === newReel.id ? completedReel : r
      );
      saveReels(finalReels);
      setIsGenerating(false);
      setSelectedJokeId('');
    } catch (error) {
      console.error('Error generating reel:', error);
      const errorReel: Reel = {
        ...newReel,
        status: 'error',
        updatedAt: new Date().toISOString(),
      };

      const finalReels = updatedReels.map(r => 
        r.id === newReel.id ? errorReel : r
      );
      saveReels(finalReels);
      setIsGenerating(false);
      alert('Eroare la generarea reel-ului. Vă rugăm să încercați din nou.');
    }
  };

  const handleDeleteReel = (reelId: string) => {
    if (confirm('Sigur doriți să ștergeți acest reel?')) {
      const updatedReels = reels.filter(r => r.id !== reelId);
      saveReels(updatedReels);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Reels</h1>
              <p className={styles.subtitle}>Generează reels pentru social media</p>
            </div>
            <div className={styles.headerActions}>
              <Link href="/dashboard" className={styles.backButton}>
                ← Dashboard
              </Link>
              <button onClick={logout} className={styles.logoutButton}>
                Ieșire
              </button>
            </div>
          </div>
        </header>

        <div className={styles.generateSection}>
          <h2 className={styles.sectionTitle}>Generează Reel Nou</h2>
          <div className={styles.generateForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="joke-select" className={styles.label}>
                Selectează gluma:
              </label>
              <select
                id="joke-select"
                value={selectedJokeId}
                onChange={(e) => setSelectedJokeId(e.target.value)}
                className={styles.select}
                disabled={isGenerating}
              >
                <option value="">-- Selectează o glumă --</option>
                {jokes.map((joke, index) => (
                  <option key={index} value={joke.question}>
                    {joke.question.substring(0, 60)}...
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGenerateReel}
              disabled={!selectedJokeId || isGenerating}
              className={styles.generateButton}
            >
              {isGenerating ? '⏳ Se generează...' : '🎬 Generează Reel cu AI'}
            </button>
          </div>
        </div>

        <div className={styles.reelsSection}>
          <h2 className={styles.sectionTitle}>Reels Create ({reels.length})</h2>
          
          {reels.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Nu există reels create încă. Generează primul tău reel!</p>
            </div>
          ) : (
            <div className={styles.reelsGrid}>
              {reels.map((reel) => (
                <div key={reel.id} className={styles.reelCard}>
                  <div className={styles.reelHeader}>
                    <div className={styles.reelStatus} data-status={reel.status}>
                      {reel.status === 'completed' && '✅ Finalizat'}
                      {reel.status === 'generating' && '⏳ Se generează...'}
                      {reel.status === 'draft' && '📝 Draft'}
                      {reel.status === 'error' && '❌ Eroare'}
                    </div>
                    <button
                      onClick={() => handleDeleteReel(reel.id)}
                      className={styles.deleteButton}
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className={styles.reelContent}>
                    <div className={styles.reelQuestion}>
                      <strong>Întrebare:</strong> {reel.question}
                    </div>
                    <div className={styles.reelAnswer}>
                      <strong>Răspuns:</strong> {reel.answer}
                    </div>
                    
                    {reel.status === 'completed' && reel.videoUrl && (
                      <div className={styles.reelVideoContainer}>
                        <video 
                          src={reel.videoUrl} 
                          controls 
                          className={styles.reelVideo}
                          poster={reel.thumbnailUrl}
                        >
                          Browser-ul tău nu suportă tag-ul video.
                        </video>
                      </div>
                    )}
                    
                    {reel.status === 'completed' && (
                      <div className={styles.reelActions}>
                        <a
                          href={reel.videoUrl}
                          download={`reel-${reel.id}.webm`}
                          className={styles.downloadButton}
                        >
                          Descarcă Video
                        </a>
                        <button 
                          onClick={() => {
                            if (navigator.share && reel.videoUrl) {
                              navigator.share({
                                title: reel.question,
                                text: reel.answer,
                                url: reel.videoUrl,
                              });
                            } else {
                              navigator.clipboard.writeText(reel.videoUrl || '');
                              alert('Link copiat în clipboard!');
                            }
                          }}
                          className={styles.shareButton}
                        >
                          Distribuie pe Social Media
                        </button>
                      </div>
                    )}
                    
                    <div className={styles.reelDate}>
                      Creat: {new Date(reel.createdAt).toLocaleString('ro-RO')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

