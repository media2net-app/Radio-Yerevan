'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Radio } from 'lucide-react';
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
      {/* Logo */}
      <Link href="/" className={styles.logo}>
        <Radio size={40} />
        <span className={styles.logoText}>Radio Erevan</span>
      </Link>
      
      <div className={styles.loginCard}>
        <header className={styles.header}>
          <h1 className={styles.title}>Autentificare</h1>
          <p className={styles.subtitle}>Conectează-te la contul tău</p>
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

          <p className={styles.loginLink}>
            Nu ai cont? <Link href="/register">Înregistrează-te</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

