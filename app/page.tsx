'use client';

import { useState } from 'react';
import { jokes } from '@/data/jokes';
import { newsItems, categories } from '@/data/news';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import RadioPlayer from '@/components/RadioPlayer';
import styles from './page.module.css';

export default function Home() {
  const [currentJokeIndex, setCurrentJokeIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Toate');

  const handleNextJoke = () => {
    setCurrentJokeIndex((prevIndex) => (prevIndex + 1) % jokes.length);
    setIsAnswerRevealed(false); // Reset reveal state for new joke
  };

  const handleRevealAnswer = () => {
    setIsAnswerRevealed(true);
  };

  const currentJoke = jokes[currentJokeIndex];

  // Filter news by category
  const filteredNews = selectedCategory === 'Toate' 
    ? newsItems 
    : newsItems.filter(item => item.category === selectedCategory);

  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.container}>
      {/* Theme Switcher */}
      <button onClick={toggleTheme} className={styles.themeSwitcher} aria-label="Toggle theme">
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

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
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=600&fit=crop" 
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
              <h1 className={styles.title}>Radio Yerevan</h1>
              <p className={styles.subtitle}>Întrebare și Răspuns</p>
            </header>

            <div className={styles.jokeCard}>
              <div className={styles.questionSection}>
                <div className={styles.label}>Întrebare:</div>
                <p className={styles.question}>{currentJoke.question}</p>
              </div>

              {isAnswerRevealed ? (
                <div className={styles.answerSection}>
                  <div className={styles.label}>Răspuns:</div>
                  <p className={styles.answer}>{currentJoke.answer}</p>
                </div>
              ) : (
                <div className={styles.answerSection}>
                  <div className={styles.label}>Răspuns:</div>
                  <div className={styles.hiddenAnswer}>
                    <p>Apasă butonul pentru a vedea răspunsul</p>
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

            <div className={styles.footer}>
              {!isAnswerRevealed ? (
                <button onClick={handleRevealAnswer} className={styles.revealButton}>
                  Reveal Răspuns
                </button>
              ) : (
                <button onClick={handleNextJoke} className={styles.nextButton}>
                  Glumă următoare
                </button>
              )}
              <div className={styles.counter}>
                {currentJokeIndex + 1} / {jokes.length}
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
                src="https://images.unsplash.com/photo-1511497584788-876760111969?w=300&h=600&fit=crop" 
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
            <div className={styles.newsHeader}>
              <h2 className={styles.newsTitle}>Ultimele Știri din România</h2>
            </div>

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
                          <span className={styles.exclusiveBadge}>Yerevan+</span>
                        )}
                      </div>
                    </div>
                    <h2 className={styles.featuredTitle}>
                      <a href={filteredNews[0].url}>{filteredNews[0].title}</a>
                    </h2>
                    <p className={styles.featuredExcerpt}>{filteredNews[0].excerpt}</p>
                  </article>
                )}

                {/* News List (Text Only) */}
                <ul className={styles.newsList}>
                  {filteredNews.slice(1).map((item) => (
                    <li key={item.id} className={styles.newsListItem}>
                      <div className={styles.newsListContent}>
                        <a href={item.url} className={styles.newsListTitle}>
                          {item.title}
                        </a>
                        <div className={styles.newsListBadges}>
                          {item.hasVideo && (
                            <span className={styles.videoBadgeSmall}>VIDEO</span>
                          )}
                          {item.isExclusive && (
                            <span className={styles.exclusiveBadgeSmall}>Yerevan+</span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sidebar - Net binnen */}
              <aside className={styles.newsSidebar}>
                <div className={styles.netBinnenSection}>
                  <h3 className={styles.netBinnenTitle}>Net binnen</h3>
                  <ul className={styles.netBinnenList}>
                    {filteredNews
                      .filter(item => item.time)
                      .slice(0, 5)
                      .map((item) => (
                        <li key={item.id} className={styles.netBinnenItem}>
                          <span className={styles.netBinnenTime}>{item.time}</span>
                          <a href={item.url} className={styles.netBinnenLink}>
                            {item.title}
                            {item.hasVideo && (
                              <span className={styles.videoBadgeInline}> VIDEO</span>
                            )}
                            {item.isExclusive && (
                              <span className={styles.exclusiveBadgeInline}> Yerevan+</span>
                            )}
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
              </aside>
            </div>
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
