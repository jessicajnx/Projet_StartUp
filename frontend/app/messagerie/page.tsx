'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MessagériePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
  }, []);

  if (!isAuthenticated) {
    return <div>Chargement...</div>;
  }

  return (
    <div style={styles.container}>
      <Header />
      
      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>Messagerie</h1>
          
          <div style={styles.comingSoon}>
            <div style={styles.icon}>💬</div>
            <h2>Fonctionnalité en cours de développement</h2>
            <p>
              La messagerie vous permettra de discuter avec les autres utilisateurs
              pour organiser vos échanges de livres.
            </p>
            <p style={styles.features}>
              <strong>Prochainement :</strong><br/>
              • Conversations en temps réel<br/>
              • Notifications de nouveaux messages<br/>
              • Historique des conversations<br/>
              • Partage de photos de livres
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
  } as React.CSSProperties,
  main: {
    flex: 1,
    backgroundColor: '#F5E6D3',
    padding: '2rem',
  } as React.CSSProperties,
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  } as React.CSSProperties,
  title: {
    color: '#5D4E37',
    fontSize: '2.5rem',
    marginBottom: '2rem',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  comingSoon: {
    backgroundColor: 'white',
    padding: '4rem 2rem',
    borderRadius: '8px',
    textAlign: 'center' as const,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  icon: {
    fontSize: '5rem',
    marginBottom: '2rem',
  } as React.CSSProperties,
  features: {
    textAlign: 'left' as const,
    maxWidth: '500px',
    margin: '2rem auto',
    lineHeight: '2',
    color: '#5D4E37',
  } as React.CSSProperties,
};
