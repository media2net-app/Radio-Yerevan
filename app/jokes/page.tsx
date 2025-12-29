'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { jokes } from '@/data/jokes';
import styles from './page.module.css';
import Link from 'next/link';

export default function JokesPage() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [currentJokeIndex, setCurrentJokeIndex] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleNextJoke = () => {
    setCurrentJokeIndex((prevIndex) => (prevIndex + 1) % jokes.length);
  };

  const handlePreviousJoke = () => {
    setCurrentJokeIndex((prevIndex) => 
      prevIndex === 0 ? jokes.length - 1 : prevIndex - 1
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  const currentJoke = jokes[currentJokeIndex];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Radio Yerevan</h1>
              <p className={styles.subtitle}>Întrebare și Răspuns</p>
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

        <div className={styles.jokeCard}>
          <div className={styles.questionSection}>
            <div className={styles.label}>Întrebare:</div>
            <p className={styles.question}>{currentJoke.question}</p>
          </div>

          <div className={styles.answerSection}>
            <div className={styles.label}>Răspuns:</div>
            <p className={styles.answer}>{currentJoke.answer}</p>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.navigationButtons}>
            <button onClick={handlePreviousJoke} className={styles.navButton}>
              ← Anterior
            </button>
            <button onClick={handleNextJoke} className={styles.nextButton}>
              Următor →
            </button>
          </div>
          <div className={styles.counter}>
            {currentJokeIndex + 1} / {jokes.length}
          </div>
        </div>
      </div>
    </div>
  );
}

