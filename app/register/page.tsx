'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Radio } from 'lucide-react';
import styles from './page.module.css';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password || !confirmPassword) {
      setError('Vă rugăm să completați toate câmpurile');
      return;
    }

    if (password !== confirmPassword) {
      setError('Parolele nu se potrivesc');
      return;
    }

    const result = register(username, email, password);
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Înregistrare eșuată');
    }
  };

  return (
    <div className={styles.container}>
      {/* Logo */}
      <Link href="/" className={styles.logo}>
        <Radio size={40} />
        <span className={styles.logoText}>Radio Erevan</span>
      </Link>
      
      <div className={styles.registerCard}>
        <header className={styles.header}>
          <h1 className={styles.title}>Înregistrare</h1>
          <p className={styles.subtitle}>Creează un cont nou</p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Nume de utilizator
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
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Introduceți adresa de email"
              autoComplete="email"
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
              placeholder="Minim 6 caractere"
              autoComplete="new-password"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirmă parola
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              placeholder="Confirmați parola"
              autoComplete="new-password"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submitButton}>
            Înregistrare
          </button>

          <p className={styles.loginLink}>
            Ai deja cont? <Link href="/login">Autentifică-te</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

