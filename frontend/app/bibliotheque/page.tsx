'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import api from '@/lib/api';

interface Livre {
  id: number;
  nom: string;
  auteur: string;
  genre: string;
}

export default function BibliothequePage() {
  const [livres, setLivres] = useState<Livre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const booksPerPage = 50;

  useEffect(() => {
    loadLivres();
    loadTotal();
  }, [currentPage]);

  const loadTotal = async () => {
    try {
      const response = await api.get('/livres/count');
      setTotal(response.data.total);
    } catch (err) {
      console.error('Erreur lors du chargement du total:', err);
    }
  };

  const loadLivres = async () => {
    setLoading(true);
    setError('');
    try {
      const skip = (currentPage - 1) * booksPerPage;
      const response = await api.get(`/livres/?skip=${skip}&limit=${booksPerPage}`);
      setLivres(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement des livres');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadLivres();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/livres/search/${searchQuery}`);
      setLivres(response.data);
      setTotal(response.data.length);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / booksPerPage);

  return (
    <div style={styles.container}>
      <Header />
      
      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>Bibliothèque</h1>
          <p style={styles.subtitle}>
            Découvrez notre collection de {total.toLocaleString()} livres
          </p>

          {/* Barre de recherche */}
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              type="text"
              placeholder="Rechercher par titre, auteur ou genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchButton}>
              Rechercher
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                  loadLivres();
                }}
                style={styles.clearButton}
              >
                Effacer
              </button>
            )}
          </form>

          {loading && <p style={styles.loading}>Chargement des livres...</p>}
          {error && <p style={styles.error}>{error}</p>}

          {!loading && !error && (
            <>
              <div style={styles.grid}>
                {livres.map((livre) => (
                  <div key={livre.id} style={styles.card}>
                    <h3 style={styles.bookTitle}>{livre.nom}</h3>
                    <p style={styles.bookAuthor}>par {livre.auteur}</p>
                    <span style={styles.bookGenre}>{livre.genre}</span>
                  </div>
                ))}
              </div>

              {livres.length === 0 && (
                <p style={styles.noResults}>Aucun livre trouvé</p>
              )}

              {/* Pagination */}
              {!searchQuery && totalPages > 1 && (
                <div style={styles.pagination}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    style={{
                      ...styles.pageButton,
                      ...(currentPage === 1 ? styles.pageButtonDisabled : {})
                    }}
                  >
                    Précédent
                  </button>
                  
                  <span style={styles.pageInfo}>
                    Page {currentPage} sur {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      ...styles.pageButton,
                      ...(currentPage === totalPages ? styles.pageButtonDisabled : {})
                    }}
                  >
                    Suivant
                  </button>
                </div>
              )}
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
  },
  main: {
    flex: 1,
    padding: '2rem',
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2.5rem',
    color: '#2f241d',
    marginBottom: '0.5rem',
    fontWeight: 700,
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#5c4b3a',
    marginBottom: '2rem',
  },
  searchForm: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
  },
  searchInput: {
    flex: 1,
    minWidth: '300px',
    padding: '0.75rem 1rem',
    border: '1px solid #d6c3a5',
    borderRadius: '10px',
    fontSize: '1rem',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  searchButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#8b5e3c',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 120ms ease',
  },
  clearButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    color: '#8b5e3c',
    border: '1px solid #8b5e3c',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 120ms ease',
  },
  loading: {
    textAlign: 'center' as const,
    color: '#5c4b3a',
    fontSize: '1.1rem',
    padding: '2rem',
  },
  error: {
    color: '#b42318',
    textAlign: 'center' as const,
    padding: '1rem',
    backgroundColor: 'rgba(180, 35, 24, 0.1)',
    borderRadius: '10px',
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.78)',
    border: '1px solid #d6c3a5',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 12px rgba(47,36,29,0.08)',
    backdropFilter: 'blur(6px)',
    transition: 'all 200ms ease',
    cursor: 'pointer',
  },
  bookTitle: {
    fontSize: '1.2rem',
    color: '#2f241d',
    marginBottom: '0.5rem',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as any,
  },
  bookAuthor: {
    color: '#5c4b3a',
    marginBottom: '0.75rem',
    fontSize: '0.95rem',
  },
  bookGenre: {
    display: 'inline-block',
    padding: '0.3rem 0.8rem',
    backgroundColor: '#f0e4d3',
    color: '#8b5e3c',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  noResults: {
    textAlign: 'center' as const,
    color: '#5c4b3a',
    fontSize: '1.1rem',
    padding: '3rem',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2rem',
  },
  pageButton: {
    padding: '0.6rem 1.2rem',
    backgroundColor: '#8b5e3c',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 120ms ease',
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  pageInfo: {
    color: '#2f241d',
    fontWeight: 600,
    fontSize: '1rem',
  },
};
