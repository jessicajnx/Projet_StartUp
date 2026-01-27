'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    setIsAuthenticated(!!token);
    if (name) setUserName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    router.push('/');
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link href="/" style={styles.logo}>
          <h1>Livre2Main</h1>
        </Link>
        
        <nav style={styles.nav}>
          {isAuthenticated ? (
            <>
              <Link href="/profil" style={styles.link}>
                Profil
              </Link>
              <Link href="/bibliotheque-personnelle" style={styles.link}>
                Ma Bibliothèque
              </Link>
              <Link href="/messagerie" style={styles.link}>
                Conversation
              </Link>
              <span style={styles.userName}>Bonjour, {userName}</span>
              <button onClick={handleLogout} style={styles.button}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={styles.button}>
                Connexion
              </Link>
              <Link href="/register" style={styles.button}>
                Inscription
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: '#D4B59E',
    padding: '1rem 2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  logo: {
    textDecoration: 'none',
    color: '#5D4E37',
  } as React.CSSProperties,
  nav: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  link: {
    textDecoration: 'none',
    color: '#5D4E37',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  } as React.CSSProperties,
  button: {
    backgroundColor: '#8B7355',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  } as React.CSSProperties,
  userName: {
    color: '#5D4E37',
    fontWeight: 'bold',
  } as React.CSSProperties,
};
