'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import styles from '@/styles/layout.module.css';
import cardStyles from '@/styles/cards.module.css';
import formStyles from '@/styles/forms.module.css';
import buttonStyles from '@/styles/buttons.module.css';
import gridStyles from '@/styles/grids.module.css';
import paginationStyles from '@/styles/pagination.module.css';
import { BookOpen } from 'lucide-react';

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
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--color-secondary)', marginBottom: '0.5rem', fontWeight: 700 }}>
              Bibliothèque
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>
              Découvrez notre collection de {total.toLocaleString()} livres
            </p>
          </div>

          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className={formStyles.searchBar}>
            <input
              type="text"
              placeholder="Rechercher par titre, auteur ou genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={formStyles.input}
            />
            <button type="submit" className={`${buttonStyles.btn} ${buttonStyles.btnPrimary}`}>
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
                className={`${buttonStyles.btn} ${buttonStyles.btnGhost}`}
              >
                Effacer
              </button>
            )}
          </form>

          {loading && <p style={{ textAlign: 'center', color: 'var(--color-text)', fontSize: '1.1rem', padding: '2rem' }}>Chargement des livres...</p>}
          {error && <p style={{ color: 'var(--color-error)', textAlign: 'center', padding: '1rem', backgroundColor: 'rgba(180, 35, 24, 0.1)', borderRadius: '10px', marginBottom: '1rem' }}>{error}</p>}

          {!loading && !error && (
            <>
              <div className={gridStyles.booksGrid}>
                {livres.map((livre) => (
                  <div key={livre.id} className={cardStyles.bookCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={20} />
                      </div>
                      <h3 style={{ fontSize: '1.2rem', color: 'var(--color-secondary)', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {livre.nom}
                      </h3>
                    </div>
                    <p style={{ color: 'var(--color-text)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                      par {livre.auteur}
                    </p>
                    <span style={{ display: 'inline-block', padding: '0.3rem 0.8rem', backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500 }}>
                      {livre.genre}
                    </span>
                  </div>
                ))}
              </div>

              {livres.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--color-text)', fontSize: '1.1rem', padding: '3rem' }}>
                  Aucun livre trouvé
                </p>
              )}

              {/* Pagination */}
              {!searchQuery && totalPages > 1 && (
                <div className={paginationStyles.pagination}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`${paginationStyles.pageButton} ${currentPage === 1 ? paginationStyles.disabled : ''}`}
                  >
                    Précédent
                  </button>
                  
                  <span className={paginationStyles.pageInfo}>
                    Page {currentPage} sur {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`${paginationStyles.pageButton} ${currentPage === totalPages ? paginationStyles.disabled : ''}`}
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
