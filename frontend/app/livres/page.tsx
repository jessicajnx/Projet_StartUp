'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { biblioAPI } from '@/lib/api';
import pageStyles from '@/styles/livres.module.css';
import cardStyles from '@/styles/cards.module.css';
import formStyles from '@/styles/forms.module.css';
import stateStyles from '@/styles/states.module.css';
import buttonStyles from '@/styles/buttons.module.css';
import gridStyles from '@/styles/grids.module.css';
import typographyStyles from '@/styles/typography.module.css';

const GOOGLE_BOOKS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || "";

interface Book {
  id: string;
  title: string;
  authors: string[];
  thumbnail?: string;
  description?: string;
  infoLink?: string;
}

export default function Livres() {
  const router = useRouter();
  const [livres, setLivres] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [bookIdMap, setBookIdMap] = useState<Map<string, number>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    loadMyBooks();
    fetchLivres();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() === '') {
        fetchLivres();
      } else {
        searchBooks(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadMyBooks = async () => {
    try {
      const res = await biblioAPI.listMe(1, 100);
      const books = res.data?.items || [];
      const ids = new Set<string>(books.map((b: any) => b.source_id).filter(Boolean));
      const idMap = new Map<string, number>();
      books.forEach((b: any) => {
        if (b.source_id) {
          idMap.set(b.source_id, b.id);
        }
      });
      setAddedIds(ids);
      setBookIdMap(idMap);
    } catch (e) {
      console.error('Erreur lors du chargement de mes livres', e);
    }
  };

  const fetchLivres = async () => {
    if (!GOOGLE_BOOKS_API_KEY) {
      setError("Clé API Google Books manquante. Ajoutez NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY dans .env.local");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      params.set("q", "subject:fiction");
      params.set("key", GOOGLE_BOOKS_API_KEY);
      params.set("maxResults", "40");
      params.set("printType", "books");
      params.set("orderBy", "newest");
      params.set("langRestrict", "fr");

      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok && data.items && data.items.length > 0) {
        const parsed: Book[] = data.items.map((item: any) => {
          const info = item.volumeInfo || {};
          return {
            id: item.id,
            title: info.title || "Titre indisponible",
            authors: info.authors || [],
            thumbnail: info.imageLinks?.thumbnail?.replace('http:', 'https:'),
            description: info.description,
            infoLink: info.infoLink || info.previewLink,
          };
        });
        
        setLivres(parsed);
      } else if (response.ok) {
        setLivres([]);
        setError('Aucun livre trouvé.');
      } else {
        setError(`Erreur API: ${data.error?.message || 'Erreur inconnue'}`);
        setLivres([]);
      }
    } catch (err) {
      setError('Erreur lors du chargement des livres');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchBooks = async (query: string) => {
    if (!GOOGLE_BOOKS_API_KEY) {
      return;
    }

    try {
      setSearchLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      params.set("q", query);
      params.set("key", GOOGLE_BOOKS_API_KEY);
      params.set("maxResults", "40");
      params.set("printType", "books");
      params.set("langRestrict", "fr");

      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok && data.items && data.items.length > 0) {
        const parsed: Book[] = data.items.map((item: any) => {
          const info = item.volumeInfo || {};
          return {
            id: item.id,
            title: info.title || "Titre indisponible",
            authors: info.authors || [],
            thumbnail: info.imageLinks?.thumbnail?.replace('http:', 'https:'),
            description: info.description,
            infoLink: info.infoLink || info.previewLink,
          };
        });
        
        setLivres(parsed);
      } else if (response.ok) {
        setLivres([]);
      } else {
        setError(`Erreur lors de la recherche: ${data.error?.message || 'Erreur inconnue'}`);
      }
    } catch (err) {
      setError('Erreur lors de la recherche');
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddToLibrary = async (book: Book) => {
    setSavingId(book.id);

    try {
      const isAdded = addedIds.has(book.id);

      if (isAdded) {
        // Retirer le livre
        const dbId = bookIdMap.get(book.id);
        if (dbId) {
          await biblioAPI.delete(dbId);
          setAddedIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(book.id);
            return newSet;
          });
          setBookIdMap((prev) => {
            const newMap = new Map(prev);
            newMap.delete(book.id);
            return newMap;
          });
        }
      } else {
        // Ajouter le livre
        const res = await biblioAPI.add({
          title: book.title,
          authors: book.authors,
          cover_url: book.thumbnail,
          info_link: book.infoLink,
          description: book.description,
          source_id: book.id,
          source: 'google_books',
        });

        setAddedIds(prev => new Set(prev).add(book.id));
        // Stocker l'ID de la BDD pour pouvoir supprimer plus tard
        if (res.data?.id) {
          setBookIdMap((prev) => new Map(prev).set(book.id, res.data.id));
        }
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout/retrait', err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className={pageStyles.container}>
      <Header />
      <main className={pageStyles.main}>
        <div className={pageStyles.content}>
          <div className={pageStyles.header}>
            <h1 className={pageStyles.title}>Découvrez des livres</h1>
            <p className={pageStyles.subtitle}>
              Parcourez notre sélection et ajoutez vos favoris à votre bibliothèque
            </p>
          </div>

          <div className={formStyles.searchContainer}>
            <input
              type="text"
              placeholder="Rechercher par titre, auteur, ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={formStyles.searchInput}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={formStyles.clearButton}
              >
                ×
              </button>
            )}
          </div>

          {searchQuery && !searchLoading && (
            <p className={typographyStyles.searchInfo}>
              {livres.length} résultat{livres.length > 1 ? 's' : ''} pour "{searchQuery}"
            </p>
          )}

          {loading || searchLoading ? (
            <div className={stateStyles.loadingContainer}>
              <p className={stateStyles.loadingText}>Chargement des livres...</p>
            </div>
          ) : error ? (
            <div className={stateStyles.errorContainer}>
              <p className={stateStyles.errorText}>{error}</p>
            </div>
          ) : livres.length === 0 ? (
            <div className={stateStyles.emptyContainer}>
              <p className={stateStyles.emptyText}>
                {searchQuery ? 'Aucun livre ne correspond à votre recherche.' : 'Aucun livre disponible.'}
              </p>
            </div>
          ) : (
            <div className={gridStyles.booksGrid}>
              {livres.map((livre) => {
                const cover = livre.thumbnail || 'https://via.placeholder.com/300x450?text=Livre';
                const isInMyLibrary = addedIds.has(livre.id);
                const isSaving = savingId === livre.id;
                
                return (
                  <div 
                    key={livre.id} 
                    className={cardStyles.bookCard}
                  >
                    <div className={cardStyles.coverWrapper}>
                      <img src={cover} alt={livre.title} className={cardStyles.coverImage} />
                    </div>
                    <div className={cardStyles.cardContent}>
                      <h3 className={typographyStyles.bookTitle}>{livre.title}</h3>
                      {livre.authors && livre.authors.length > 0 && (
                        <p className={typographyStyles.bookAuthor}>par {livre.authors.join(', ')}</p>
                      )}
                      {livre.description && (
                        <p className={typographyStyles.description}>
                          {livre.description.length > 120
                            ? `${livre.description.slice(0, 117)}...`
                            : livre.description}
                        </p>
                      )}
                      <div className={cardStyles.cardFooter}>
                        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                          {isInMyLibrary ? (
                            <button
                              onClick={() => handleAddToLibrary(livre)}
                              disabled={isSaving}
                              className={`${buttonStyles.btn} ${buttonStyles.btnDanger}`}
                              style={{ flex: 1 }}
                            >
                              {isSaving ? 'Retrait...' : 'Retirer'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddToLibrary(livre)}
                              disabled={isSaving}
                              className={`${buttonStyles.btn} ${buttonStyles.btnPrimary}`}
                              style={{ flex: 1 }}
                            >
                              {isSaving ? 'Ajout...' : 'Ajouter'}
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/map?book=${livre.id}&title=${encodeURIComponent(livre.title)}`)}
                            className={`${buttonStyles.btn}`}
                            style={{ 
                              flex: 1,
                              backgroundColor: '#4CAF50',
                              color: 'white'
                            }}
                          >
                            🔍 Emprunter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
