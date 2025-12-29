'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { jokes } from '@/data/jokes';
import { Reel } from '@/types/reel';
import { FileText, Video, CheckCircle, Loader2, FileText as DraftIcon, XCircle } from 'lucide-react';
import styles from './page.module.css';
import Link from 'next/link';

export default function Dashboard() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [reels, setReels] = useState<Reel[]>([]);

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

  if (!isAuthenticated) {
    return null;
  }

  const totalJokes = jokes.length;
  const totalReels = reels.length;
  const completedReels = reels.filter(r => r.status === 'completed').length;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Dashboard</h1>
              <p className={styles.subtitle}>Radio Erevan - Panou de control</p>
            </div>
            <button onClick={logout} className={styles.logoutButton}>
              Ieșire
            </button>
          </div>
        </header>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FileText size={32} strokeWidth={2} />
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{totalJokes}</h3>
              <p className={styles.statLabel}>Glume totale</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Video size={32} strokeWidth={2} />
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{totalReels}</h3>
              <p className={styles.statLabel}>Reels create</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <CheckCircle size={32} strokeWidth={2} />
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{completedReels}</h3>
              <p className={styles.statLabel}>Reels finalizate</p>
            </div>
          </div>
        </div>

        <div className={styles.sectionsGrid}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWithIcon}>
                <FileText size={24} strokeWidth={2} />
                <h2 className={styles.sectionTitle}>Glume</h2>
              </div>
            </div>
            <p className={styles.sectionDescription}>
              Vezi și gestionează toate glumele Radio Erevan disponibile
            </p>
            <Link href="/jokes" className={styles.sectionButton}>
              Vezi glume →
            </Link>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWithIcon}>
                <Video size={24} strokeWidth={2} />
                <h2 className={styles.sectionTitle}>Reels</h2>
              </div>
            </div>
            <p className={styles.sectionDescription}>
              Generează și gestionează reels pentru social media cu AI
            </p>
            <Link href="/reels" className={styles.sectionButton}>
              Gestionează reels →
            </Link>
          </div>
        </div>

        {reels.length > 0 && (
          <div className={styles.recentSection}>
            <h2 className={styles.recentTitle}>Reels recente</h2>
            <div className={styles.reelsList}>
              {reels.slice(0, 3).map((reel) => (
                <div key={reel.id} className={styles.reelItem}>
                  <div className={styles.reelStatus} data-status={reel.status}>
                    {reel.status === 'completed' && <CheckCircle size={20} strokeWidth={2} />}
                    {reel.status === 'generating' && <Loader2 size={20} strokeWidth={2} className={styles.spinning} />}
                    {reel.status === 'draft' && <DraftIcon size={20} strokeWidth={2} />}
                    {reel.status === 'error' && <XCircle size={20} strokeWidth={2} />}
                  </div>
                  <div className={styles.reelContent}>
                    <p className={styles.reelQuestion}>{reel.question}</p>
                    <span className={styles.reelDate}>
                      {new Date(reel.createdAt).toLocaleDateString('ro-RO')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

