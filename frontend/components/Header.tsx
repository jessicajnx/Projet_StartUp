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
  const [unreadCount, setUnreadCount] = useState(0);

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

  // Récupérer le nombre de conversations non lues
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/messages/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const conversations = await response.json();
          const total = conversations.reduce((sum: number, conv: any) => sum + (conv.unread_count || 0), 0);
          setUnreadCount(total);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des conversations:', error);
      }
    };

    // Récupérer au chargement
    fetchUnreadCount();

    // Actualiser toutes les 5 secondes
    const interval = setInterval(fetchUnreadCount, 5000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

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
                <Link href="/livres" style={styles.link}>
                  Tous les livres
                </Link>
                <Link href="/scan-livre" style={styles.link}>
                  Scanner un livre
                </Link>
                <Link href="/bibliotheque-personnelle" style={styles.link}>
                  Ma Bibliothèque
                </Link>
                <Link href="/messagerie" style={styles.link}>
                  Conversation
                  {unreadCount > 0 && (
                    <span style={styles.badge}>{unreadCount}</span>
                  )}
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
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d32f2f',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginLeft: '6px',
    position: 'relative' as const,
    top: '-2px',
  } as React.CSSProperties,
};
