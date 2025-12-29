'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Vă rugăm să completați toate câmpurile');
      return;
    }

    const success = login(username, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Autentificare eșuată');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <header className={styles.header}>
          <h1 className={styles.title}>Radio Yerevan</h1>
          <p className={styles.subtitle}>Autentificare</p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Utilizator
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              placeholder="Introduceți numele de utilizator"
              autoComplete="username"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Parolă
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Introduceți parola"
              autoComplete="current-password"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submitButton}>
            Autentificare
          </button>

          <p className={styles.hint}>
            (Dummy login - orice utilizator și parolă funcționează)
          </p>
        </form>
      </div>
    </div>
  );
}

