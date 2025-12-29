'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './NewsModal.module.css';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl: string;
  url: string;
  hasVideo?: boolean;
  isExclusive?: boolean;
  time?: string;
  source?: string;
}

interface NewsModalProps {
  articleId: string | null;
  onClose: () => void;
}

export default function NewsModal({ articleId, onClose }: NewsModalProps) {
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!articleId) {
      setArticle(null);
      setError(null);
      return;
    }

    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/news/${articleId}`);
        
        if (!response.ok) {
          throw new Error('Articolul nu a fost găsit');
        }
        
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Eroare la încărcarea articolului');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  if (!articleId) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeButton} aria-label="Închide">
          <X size={24} />
        </button>

        {isLoading && (
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
            <p>Se încarcă articolul...</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <h2>Eroare</h2>
            <p>{error}</p>
          </div>
        )}

        {article && !isLoading && !error && (
          <>
            <header className={styles.header}>
              {article.category && (
                <span className={styles.category}>{article.category}</span>
              )}
              <h1 className={styles.title}>{article.title}</h1>
              <div className={styles.meta}>
                {article.time && <span className={styles.time}>{article.time}</span>}
                {article.date && <span className={styles.date}>{article.date}</span>}
                {article.source && <span className={styles.source}>{article.source}</span>}
              </div>
              <div className={styles.badges}>
                {article.hasVideo && (
                  <span className={styles.videoBadge}>VIDEO</span>
                )}
                {article.isExclusive && (
                  <span className={styles.exclusiveBadge}>Erevan+</span>
                )}
              </div>
            </header>

            {article.imageUrl && (
              <div className={styles.imageContainer}>
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className={styles.image}
                />
              </div>
            )}

            <div className={styles.content}>
              {article.content ? (
                <div 
                  className={styles.articleContent}
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              ) : (
                <div className={styles.excerpt}>
                  <p>{article.excerpt}</p>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.externalLink}
                  >
                    Citește articolul complet pe sursa originală →
                  </a>
                </div>
              )}
            </div>

            <footer className={styles.footer}>
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.sourceLink}
              >
                Sursa originală: {new URL(article.url).hostname}
              </a>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

