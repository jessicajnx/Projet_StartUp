'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, type CSSProperties } from 'react';

type HeaderProps = {
  hideAuthActions?: boolean;
  isAdminPage?: boolean;
};

export default function Header({ hideAuthActions = false, isAdminPage = false }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  // Vérifier l'état d'authentification à chaque changement de route
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const name = localStorage.getItem('userName');
      setIsAuthenticated(!!token);
      if (name) setUserName(name);
    };
    
    checkAuth();
    
    // Écouter les changements dans localStorage
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    router.push('/');
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdminPage) {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link 
          href={isAdminPage ? '/admin' : '/'}
          style={styles.logo}
        >
          <h1>Livre2Main</h1>
        </Link>
        
        {!hideAuthActions && (
          <nav style={styles.nav}>
            {isAdminPage ? (
              <>
                <Link href="/profil" style={styles.link}>
                  Profil
                </Link>
                <Link href="/admin" style={styles.link}>
                  Gérer les utilisateurs
                </Link>
                <button onClick={handleLogout} style={styles.button}>
                  Déconnexion
                </button>
              </>
            ) : isAuthenticated ? (
              <>
                <Link href="/profil" style={styles.link}>
                  Profil
                </Link>
                <Link href="/scan-livre" style={styles.link}>
                  Scanner un livre
                </Link>
                <Link href="/bibliotheque-personnelle" style={styles.link}>
                  Ma Bibliothèque
                </Link>
                <Link href="/messagerie" style={styles.link}>
                  Conversation
                </Link>
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
        )}
      </div>
    </header>
  );
}

const styles: Record<string, CSSProperties> = {
  header: {
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderBottom: '1px solid #d6c3a5',
    padding: '1rem 2rem',
    boxShadow: '0 4px 12px rgba(47,36,29,0.08)',
    backdropFilter: 'blur(6px)',
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
    color: '#2f241d',
    fontWeight: 700,
  } as React.CSSProperties,
  nav: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  link: {
    textDecoration: 'none',
    color: '#5c4b3a',
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    transition: 'all 120ms ease',
    fontWeight: 500,
  } as React.CSSProperties,
  button: {
    backgroundColor: '#8b5e3c',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '10px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    fontWeight: 600,
    transition: 'all 120ms ease',
    boxShadow: '0 4px 12px rgba(139,94,60,0.18)',
  } as React.CSSProperties,
  userName: {
    color: '#2f241d',
    fontWeight: 600,
  } as React.CSSProperties,
};
