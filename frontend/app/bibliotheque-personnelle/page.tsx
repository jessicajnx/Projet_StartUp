'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { userAPI, livreAPI } from '@/lib/api';

interface Livre {
  id: number;
  nom: string;
  auteur: string;
  genre?: string;
}

export default function BibliothequePersonnellePage() {
  const router = useRouter();
  const [livres, setLivres] = useState<Livre[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    loadLivres();
  }, []);

  const loadLivres = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getMeLivres();
      setLivres(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des livres', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLivre = async (livreId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre de votre bibliothèque ?')) {
      return;
    }

    try {
      const userResponse = await userAPI.getMe();
      await livreAPI.unassignFromUser(livreId, userResponse.data.id);
      loadLivres();
      alert('Livre retiré de votre bibliothèque !');
    } catch (error) {
      console.error('Erreur lors de la suppression', error);
      alert('Erreur lors de la suppression du livre');
    }
  };

  const filteredLivres = livres.filter(livre =>
    livre.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    livre.auteur.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (livre.genre && livre.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const livresParGenre: { [key: string]: Livre[] } = {};
  filteredLivres.forEach(livre => {
    const genre = livre.genre || 'Non classifié';
    if (!livresParGenre[genre]) {
      livresParGenre[genre] = [];
    }
    livresParGenre[genre].push(livre);
  });

  return (
    <div style={styles.container}>
      <Header />
      
      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>Ma Bibliothèque Personnelle</h1>

          <section style={styles.statsSection}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{livres.length}</div>
              <div style={styles.statLabel}>Livres possédés</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{Object.keys(livresParGenre).length}</div>
              <div style={styles.statLabel}>Genres différents</div>
            </div>
          </section>

          <section style={styles.searchSection}>
            <input
              type="text"
              placeholder="Rechercher dans ma bibliothèque..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </section>

          {isLoading ? (
            <div style={styles.loading}>Chargement de votre bibliothèque...</div>
          ) : livres.length === 0 ? (
            <div style={styles.emptyState}>
              <h2 style={styles.emptyTitle}>Votre bibliothèque est vide</h2>
              <p style={styles.emptyText}>
                Ajoutez vos premiers livres depuis la page Bibliothèque
              </p>
            </div>
          ) : filteredLivres.length === 0 ? (
            <div style={styles.emptyState}>
              <p>Aucun livre ne correspond à votre recherche</p>
            </div>
          ) : (
            <>
              {Object.entries(livresParGenre).map(([genre, livresDuGenre]) => (
                <section key={genre} style={styles.genreSection}>
                  <h2 style={styles.genreTitle}>
                    {genre} ({livresDuGenre.length})
                  </h2>
                  <div style={styles.livreGrid}>
                    {livresDuGenre.map(livre => (
                      <div key={livre.id} style={styles.livreCard}>
                        <div style={styles.livreIcon}>📖</div>
                        <h3 style={styles.livreTitle}>{livre.nom}</h3>
                        <p style={styles.livreAuthor}>par {livre.auteur}</p>
                        {livre.genre && (
                          <span style={styles.genreBadge}>{livre.genre}</span>
                        )}
                        <button 
                          onClick={() => handleDeleteLivre(livre.id)}
                          style={styles.deleteButton}
                        >
                          Retirer
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}
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
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  } as React.CSSProperties,
  statCard: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    textAlign: 'center' as const,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  statNumber: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#8B7355',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  statLabel: {
    color: '#5D4E37',
    fontSize: '1rem',
  } as React.CSSProperties,
  searchSection: {
    marginBottom: '2rem',
  } as React.CSSProperties,
  searchInput: {
    width: '100%',
    padding: '1rem',
    border: '2px solid #D4B59E',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: 'white',
  } as React.CSSProperties,
  loading: {
    textAlign: 'center' as const,
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#5D4E37',
  } as React.CSSProperties,
  emptyState: {
    backgroundColor: 'white',
    padding: '3rem',
    borderRadius: '8px',
    textAlign: 'center' as const,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  emptyTitle: {
    color: '#5D4E37',
    fontSize: '1.8rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
  emptyText: {
    color: '#8B7355',
    fontSize: '1.1rem',
    marginBottom: '2rem',
  } as React.CSSProperties,
  genreSection: {
    marginBottom: '3rem',
  } as React.CSSProperties,
  genreTitle: {
    color: '#5D4E37',
    fontSize: '1.8rem',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #D4B59E',
    paddingBottom: '0.5rem',
  } as React.CSSProperties,
  livreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem',
  } as React.CSSProperties,
  livreCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  livreIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
  livreTitle: {
    color: '#5D4E37',
    fontSize: '1.3rem',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
  } as React.CSSProperties,
  livreAuthor: {
    color: '#8B7355',
    marginBottom: '1rem',
    fontSize: '1rem',
  } as React.CSSProperties,
  genreBadge: {
    display: 'inline-block',
    backgroundColor: '#D4B59E',
    color: '#5D4E37',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
  deleteButton: {
    width: '100%',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    marginTop: '1rem',
  } as React.CSSProperties,
};
