'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import RadioPlayer from '@/components/RadioPlayer';
import styles from './page.module.css';

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

export default function NewsArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/news/${params.id}`);
        
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

    if (params.id) {
      fetchArticle();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <RadioPlayer />
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
          <p>Se încarcă articolul...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={styles.container}>
        <RadioPlayer />
        <div className={styles.error}>
          <h2>Eroare</h2>
          <p>{error || 'Articolul nu a fost găsit'}</p>
          <button onClick={() => router.push('/')} className={styles.backButton}>
            Înapoi la știri
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <RadioPlayer />
      <article className={styles.article}>
        <button onClick={() => router.push('/')} className={styles.backButton}>
          <ArrowLeft size={20} />
          Înapoi
        </button>

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
      </article>
    </div>
  );
}

