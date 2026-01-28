'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { biblioAPI } from '@/lib/api';

interface PersonalBook {
  id: number;
  user_id: number;
  title: string;
  authors?: string[];
  cover_url?: string;
  info_link?: string;
  description?: string;
}

export default function BibliothequePersonnellePage() {
  const router = useRouter();
  const [books, setBooks] = useState<PersonalBook[]>([]);
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
      const response = await biblioAPI.listMe();
      setBooks(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des livres', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLivre = async (bookId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre de votre bibliothèque ?')) {
      return;
    }

    try {
      await biblioAPI.delete(bookId);
      loadLivres();
      alert('Livre retiré de votre bibliothèque !');
    } catch (error) {
      console.error('Erreur lors de la suppression', error);
      alert('Erreur lors de la suppression du livre');
    }
  };

  const filteredBooks = books.filter(book => {
    const inTitle = book.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const inAuthors = (book.authors || []).join(' ').toLowerCase().includes(searchQuery.toLowerCase());
    return inTitle || inAuthors;
  });

  return (
    <div style={styles.container}>
      <Header />
      
      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>Ma Bibliothèque Personnelle</h1>

          <section style={styles.statsSection}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{books.length}</div>
              <div style={styles.statLabel}>Livres enregistrés</div>
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
          ) : books.length === 0 ? (
            <div style={styles.emptyState}>
              <h2 style={styles.emptyTitle}>Votre bibliothèque est vide</h2>
              <p style={styles.emptyText}>
                Ajoutez vos premiers livres depuis la page Bibliothèque
              </p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div style={styles.emptyState}>
              <p>Aucun livre ne correspond à votre recherche</p>
            </div>
          ) : (
            <>
              <section style={styles.genreSection}>
                <div style={styles.livreGrid}>
                  {filteredBooks.map(book => {
                    const cover = book.cover_url || 'https://via.placeholder.com/300x450?text=Livre';
                    const truncatedDescription = book.description
                      ? (book.description.length > 220
                        ? `${book.description.slice(0, 217)}...`
                        : book.description)
                      : '';

                    return (
                      <div key={book.id} style={styles.livreCard}>
                        <div style={styles.coverWrapper}>
                          <img src={cover} alt={book.title} style={styles.coverImage} />
                        </div>
                        <div style={styles.meta}>
                          <h3 style={styles.livreTitle}>{book.title}</h3>
                          {book.authors && book.authors.length > 0 && (
                            <p style={styles.livreAuthor}>par {book.authors.join(', ')}</p>
                          )}
                          {truncatedDescription && (
                            <p style={styles.description}>{truncatedDescription}</p>
                          )}
                        </div>
                        <div style={styles.actionsRow}>
                          <button 
                            onClick={() => handleDeleteLivre(book.id)}
                            style={styles.deleteButton}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#8B5E3C';
                              e.currentTarget.style.color = 'white';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#8B5E3C';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  } as React.CSSProperties,
  livreCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 6px 14px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  } as React.CSSProperties,
  coverWrapper: {
    width: '100%',
    maxWidth: '180px',
    height: '240px',
    margin: '0 auto',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#F0E8DD',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  } as React.CSSProperties,
  meta: {
    textAlign: 'center' as const,
  } as React.CSSProperties,
  livreTitle: {
    color: '#5D4E37',
    fontSize: '1.3rem',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
  } as React.CSSProperties,
  livreAuthor: {
    color: '#8B7355',
    marginBottom: '0.5rem',
    fontSize: '1rem',
  } as React.CSSProperties,
  description: {
    color: '#6F5A40',
    fontSize: '0.95rem',
    lineHeight: 1.5,
  } as React.CSSProperties,
  actionsRow: {
    display: 'flex',
    marginTop: '0.5rem',
    justifyContent: 'center',
  } as React.CSSProperties,
  deleteButton: {
    backgroundColor: 'transparent',
    color: '#8B5E3C',
    border: '2px solid #8B5E3C',
    padding: '0.75rem 1.2rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    minWidth: '110px',
    transition: 'all 120ms ease',
  } as React.CSSProperties,
};
