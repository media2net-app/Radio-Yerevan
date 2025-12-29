'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { jokes } from '@/data/jokes';
import { newsItems as fallbackNewsItems, categories } from '@/data/news';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Moon, Sun, ArrowLeft, Share2, Heart, MessageCircle, Shuffle, Star, User, LogIn, LogOut, Trophy, TrendingUp } from 'lucide-react';
import RadioPlayer from '@/components/RadioPlayer';
import styles from './page.module.css';
import type { NewsItem } from '@/data/news';

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

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, logout, addViewedJoke, toggleFavorite, updateStreak } = useAuth();
  const [currentJokeIndex, setCurrentJokeIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Toate');
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  
  // New features states
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const jokeCardRef = useRef<HTMLDivElement>(null);
  
  // Get Joke of the Day (based on date)
  const getJokeOfTheDay = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    return dayOfYear % jokes.length;
  };
  
  const jokeOfTheDayIndex = getJokeOfTheDay();

  const handleNextJoke = () => {
    // Track viewed joke
    if (isAuthenticated && user) {
      addViewedJoke(currentJokeIndex);
    }
    
    setCurrentJokeIndex((prevIndex) => (prevIndex + 1) % jokes.length);
    setIsAnswerRevealed(false);
    setShowComments(false);
    
    // Smooth scroll to top of joke card
    if (jokeCardRef.current) {
      jokeCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRevealAnswer = () => {
    setIsAnswerRevealed(true);
    // Track viewed joke when revealed
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
        await navigator.share({
          title: 'Radio Erevan Joke',
          text: text,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
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
  const hasViewed = user?.viewedJokes.includes(currentJokeIndex) || false;

  const handleArticleClick = async (articleId: string) => {
    if (selectedArticleId === articleId && selectedArticle) {
      // If clicking the same article, close it
      setSelectedArticleId(null);
      setSelectedArticle(null);
      return;
    }

    setSelectedArticleId(articleId);
    setIsLoadingArticle(true);
    
    try {
      const response = await fetch(`/api/news/${articleId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedArticle(data);
      } else {
        setSelectedArticle(null);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setSelectedArticle(null);
    } finally {
      setIsLoadingArticle(false);
    }
  };

  const handleCloseArticle = () => {
    setSelectedArticleId(null);
    setSelectedArticle(null);
  };

  const currentJoke = jokes[currentJokeIndex];

  // Load comments for current joke from localStorage
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

  // Update streak on mount if authenticated
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

      // Save to localStorage
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

  // Fetch news from RSS on mount and refresh every minute
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoadingNews(true);
        const response = await fetch('/api/news');
        if (response.ok) {
          const data = await response.json();
          setNewsItems(data);
        } else {
          // Keep empty if RSS fails - show loading state
          setNewsItems([]);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        // Keep empty on error - show loading state
        setNewsItems([]);
      } finally {
        setIsLoadingNews(false);
      }
    };

    // Fetch immediately on mount
    fetchNews();

    // Refresh every minute (60 seconds)
    const interval = setInterval(() => {
      fetchNews();
    }, 60 * 1000); // 60 seconds = 1 minute

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Filter news by category
  const filteredNews = selectedCategory === 'Toate' 
    ? newsItems 
    : newsItems.filter(item => item.category === selectedCategory);

  const { theme, toggleTheme } = useTheme();

  const progressPercentage = user ? Math.round((user.totalJokesViewed / jokes.length) * 100) : 0;
  const isJokeOfTheDay = currentJokeIndex === jokeOfTheDayIndex;

  return (
    <div className={styles.container}>
      {/* Theme Switcher */}
      <button onClick={toggleTheme} className={styles.themeSwitcher} aria-label="Toggle theme">
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* User Profile Bar */}
      {isAuthenticated && user && (
        <div className={styles.userBar}>
          <div className={styles.userInfo}>
            <User size={16} />
            <span className={styles.username}>{user.username}</span>
            <div className={styles.streakBadge}>
              <Trophy size={14} />
              <span>{user.streak} zile</span>
            </div>
            <div className={styles.progressBadge}>
              <TrendingUp size={14} />
              <span>{user.totalJokesViewed}/{jokes.length} ({progressPercentage}%)</span>
            </div>
          </div>
          <button onClick={logout} className={styles.logoutButton}>
            <LogOut size={16} />
            Ieșire
          </button>
        </div>
      )}

      {!isAuthenticated && (
        <div className={styles.authBar}>
          <Link href="/login" className={styles.authButton}>
            <LogIn size={16} />
            Autentificare
          </Link>
          <Link href="/register" className={styles.authButton}>
            Înregistrare
          </Link>
        </div>
      )}

      {/* Radio Player Sticky Header */}
      <RadioPlayer />

      {/* Top Banner Ad */}
      <div className={styles.topBannerAd}>
        <div className={styles.adPlaceholder}>
          <span className={styles.adLabel}>Reclamă</span>
              <img 
                src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=728&h=90&fit=crop" 
                alt="Nature Advertisement" 
                className={styles.adImage}
              />
        </div>
      </div>

      <div className={styles.mainLayout}>
        {/* Left Sidebar Ad */}
        <aside className={styles.leftSidebar}>
          <div className={styles.sidebarAd}>
            <div className={styles.adPlaceholder}>
              <span className={styles.adLabel}>Reclamă</span>
              <img 
                src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=250&fit=crop" 
                alt="Nature Advertisement" 
                className={styles.adImage}
              />
            </div>
          </div>
          <div className={styles.sidebarAd}>
            <div className={styles.adPlaceholder}>
              <span className={styles.adLabel}>Reclamă</span>
              <img 
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=250&fit=crop" 
                alt="Nature Advertisement" 
                className={styles.adImage}
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          <div className={styles.content}>
            <header className={styles.header}>
              <div className={styles.headerTop}>
                <div>
                  <h1 className={styles.title}>Radio Erevan</h1>
                  <p className={styles.subtitle}>Întrebare și Răspuns</p>
                </div>
                {isJokeOfTheDay && (
                  <div className={styles.jokeOfTheDayBadge}>
                    <Star size={16} />
                    <span>Gluma zilei</span>
                  </div>
                )}
              </div>
            </header>

            <div className={styles.jokeCard} ref={jokeCardRef}>
              <div className={styles.questionSection}>
                <div className={styles.label}>Întrebare:</div>
                <p className={styles.question}>{currentJoke.question}</p>
              </div>

              {/* Action Buttons */}
              <div className={styles.jokeActions}>
                <button 
                  onClick={handleRandomJoke} 
                  className={styles.actionButton}
                  title="Glumă aleatoare"
                >
                  <Shuffle size={18} />
                </button>
                <button 
                  onClick={handleShare} 
                  className={styles.actionButton}
                  title="Distribuie"
                >
                  <Share2 size={18} />
                </button>
                <button 
                  onClick={handleToggleFavorite} 
                  className={`${styles.actionButton} ${isFavorite ? styles.favoriteActive : ''}`}
                  title={isFavorite ? "Elimină din favorite" : "Adaugă la favorite"}
                >
                  <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button 
                  onClick={() => setShowComments(!showComments)} 
                  className={styles.actionButton}
                  title="Comentarii"
                >
                  <MessageCircle size={18} />
                  {comments.length > 0 && (
                    <span className={styles.commentCount}>{comments.length}</span>
                  )}
                </button>
              </div>

              {isAnswerRevealed ? (
                <div className={styles.answerSection}>
                  <div className={styles.label}>Răspuns:</div>
                  <p className={styles.answer}>{currentJoke.answer}</p>
                  
                  {/* Comments Section */}
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
                                <span className={styles.commentDate}>
                                  {new Date(comment.createdAt).toLocaleDateString('ro-RO')}
                                </span>
                              </div>
                              <p className={styles.commentText}>{comment.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {isAuthenticated ? (
                        <form onSubmit={handleSubmitComment} className={styles.commentForm}>
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Adaugă un comentariu..."
                            className={styles.commentInput}
                            rows={3}
                          />
                          <button 
                            type="submit" 
                            className={styles.commentSubmit}
                            disabled={isSubmittingComment || !newComment.trim()}
                          >
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
                    <button onClick={handleNextJoke} className={styles.nextButton}>
                      Glumă următoare
                    </button>
                    <div className={styles.counter}>
                      {currentJokeIndex + 1} / {jokes.length}
                      {user && (
                        <span className={styles.progressText}>
                          {' '}• {user.totalJokesViewed} văzute
                        </span>
                      )}
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
                    <button onClick={handleRevealAnswer} className={styles.revealButton}>
                      Reveal Răspuns
                    </button>
                    <div className={styles.counter}>
                      {currentJokeIndex + 1} / {jokes.length}
                      {user && (
                        <span className={styles.progressText}>
                          {' '}• {user.totalJokesViewed} văzute
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Inline Ad between content */}
            <div className={styles.inlineAd}>
              <div className={styles.adPlaceholder}>
                <span className={styles.adLabel}>Reclamă</span>
                <img 
                  src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=728&h=90&fit=crop" 
                  alt="Nature Advertisement" 
                  className={styles.adImage}
                />
              </div>
            </div>

          </div>
        </main>

        {/* Right Sidebar Ad */}
        <aside className={styles.rightSidebar}>
          <div className={styles.sidebarAd}>
            <div className={styles.adPlaceholder}>
              <span className={styles.adLabel}>Reclamă</span>
              <img 
                src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=250&fit=crop" 
                alt="Nature Advertisement" 
                className={styles.adImage}
              />
            </div>
          </div>
          <div className={styles.sidebarAd}>
            <div className={styles.adPlaceholder}>
              <span className={styles.adLabel}>Reclamă</span>
              <img 
                src="https://images.unsplash.com/photo-1511497584788-876760111969?w=300&h=250&fit=crop" 
                alt="Nature Advertisement" 
                className={styles.adImage}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* News Section - Full Width */}
      <div className={styles.newsSectionFullWidth}>
        <div className={styles.newsSectionContainer}>
          {/* News Section */}
          <div className={styles.newsSection}>
            {selectedArticleId ? (
              // Show only selected article
              <div className={styles.singleArticleView}>
                <button onClick={handleCloseArticle} className={styles.backButton}>
                  <ArrowLeft size={20} />
                  Înapoi
                </button>
                {isLoadingArticle ? (
                  <div className={styles.articleLoader}>
                    <div className={styles.loaderSpinner}></div>
                    <p>Se încarcă articolul...</p>
                  </div>
                ) : selectedArticle ? (
                  <>
                    {selectedArticle.category && (
                      <span className={styles.articleCategory}>{selectedArticle.category}</span>
                    )}
                    <h1 className={styles.articleTitle}>{selectedArticle.title}</h1>
                    <div className={styles.articleMeta}>
                      {selectedArticle.time && <span className={styles.articleTime}>{selectedArticle.time}</span>}
                      {selectedArticle.date && <span className={styles.articleDate}>{selectedArticle.date}</span>}
                      {selectedArticle.source && <span className={styles.articleSource}>{selectedArticle.source}</span>}
                    </div>
                    <div className={styles.articleBadges}>
                      {selectedArticle.hasVideo && (
                        <span className={styles.videoBadge}>VIDEO</span>
                      )}
                      {selectedArticle.isExclusive && (
                        <span className={styles.exclusiveBadge}>Erevan+</span>
                      )}
                    </div>
                    {selectedArticle.imageUrl && (
                      <div className={styles.articleImageContainer}>
                        <img 
                          src={selectedArticle.imageUrl} 
                          alt={selectedArticle.title}
                          className={styles.articleImage}
                        />
                      </div>
                    )}
                    <div 
                      className={styles.articleContent}
                      dangerouslySetInnerHTML={{ __html: selectedArticle.content || selectedArticle.excerpt }}
                    />
                    <a 
                      href={selectedArticle.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.articleSourceLink}
                    >
                      Citește articolul complet pe sursa originală →
                    </a>
                  </>
                ) : null}
              </div>
            ) : (
              // Show normal news layout
              <>
                <div className={styles.newsHeader}>
                  <h2 className={styles.newsTitle}>Ultimele Știri din România</h2>
                </div>

                {isLoadingNews ? (
                  <div className={styles.newsLoader}>
                    <div className={styles.loaderSpinner}></div>
                    <p className={styles.loaderText}>Se încarcă știrile...</p>
                  </div>
                ) : filteredNews.length === 0 ? (
                  <div className={styles.newsLoader}>
                    <p className={styles.loaderText}>Nu sunt știri disponibile momentan.</p>
                  </div>
                ) : (
                  <div className={styles.newsLayout}>
                    {/* Main News Column */}
                    <div className={styles.mainNewsColumn}>
                      {/* Featured Article with Image */}
                      {filteredNews.length > 0 && filteredNews[0] && (
                        <article className={styles.featuredArticle}>
                          <div className={styles.featuredImageContainer}>
                            <img 
                              src={filteredNews[0].imageUrl} 
                              alt={filteredNews[0].title}
                              className={styles.featuredImage}
                            />
                            <div className={styles.featuredBadges}>
                              {filteredNews[0].hasVideo && (
                                <span className={styles.videoBadge}>VIDEO</span>
                              )}
                              {filteredNews[0].isExclusive && (
                                <span className={styles.exclusiveBadge}>Erevan+</span>
                              )}
                            </div>
                          </div>
                          <h2 className={styles.featuredTitle}>
                            <button 
                              onClick={() => handleArticleClick(filteredNews[0].id)}
                              className={styles.newsLink}
                            >
                              {filteredNews[0].title}
                            </button>
                          </h2>
                          <p className={styles.featuredExcerpt}>{filteredNews[0].excerpt}</p>
                        </article>
                      )}

                      {/* News List in 3 Columns */}
                      <div className={styles.newsGrid}>
                        {filteredNews.slice(1).map((item) => (
                          <div key={item.id} className={styles.newsGridItem}>
                            <button 
                              onClick={() => handleArticleClick(item.id)}
                              className={styles.newsGridTitle}
                            >
                              {item.title}
                            </button>
                            <div className={styles.newsGridBadges}>
                              {item.hasVideo && (
                                <span className={styles.videoBadgeSmall}>VIDEO</span>
                              )}
                              {item.isExclusive && (
                                <span className={styles.exclusiveBadgeSmall}>Erevan+</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sidebar - Net binnen */}
                    <aside className={styles.newsSidebar}>
                      <div className={styles.netBinnenSection}>
                        <h3 className={styles.netBinnenTitle}>Tocmai sosit</h3>
                        <ul className={styles.netBinnenList}>
                          {filteredNews
                            .filter(item => item.time)
                            .slice(0, 5)
                            .map((item) => (
                              <li key={item.id} className={styles.netBinnenItem}>
                                <span className={styles.netBinnenTime}>{item.time}</span>
                                <button 
                                  onClick={() => handleArticleClick(item.id)}
                                  className={styles.netBinnenLink}
                                >
                                  {item.title}
                                  {item.hasVideo && (
                                    <span className={styles.videoBadgeInline}> VIDEO</span>
                                  )}
                                  {item.isExclusive && (
                                    <span className={styles.exclusiveBadgeInline}> Erevan+</span>
                                  )}
                                </button>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </aside>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Banner Ad */}
      <div className={styles.bottomBannerAd}>
        <div className={styles.adPlaceholder}>
          <span className={styles.adLabel}>Reclamă</span>
              <img 
                src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=728&h=90&fit=crop" 
                alt="Nature Advertisement" 
                className={styles.adImage}
              />
        </div>
      </div>

    </div>
  );
}
