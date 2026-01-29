'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { biblioAPI } from '@/lib/api';
import pageStyles from '@/styles/bibliotheque.module.css';
import cardStyles from '@/styles/cards.module.css';
import stateStyles from '@/styles/states.module.css';
import typographyStyles from '@/styles/typography.module.css';
import bibliothequeStyles from '@/styles/bibliotheque.module.css';

interface PersonalBook {
  id: number;
  user_id: number;
  title: string;
  authors?: string[];
  cover_url?: string;
  info_link?: string;
  description?: string;
}

interface PersonalBooksResponse {
  items: PersonalBook[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function BibliothequePersonnellePage() {
  const router = useRouter();
  const [books, setBooks] = useState<PersonalBook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    loadLivres();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadLivres = async () => {
    try {
      setIsLoading(true);
      const response = await biblioAPI.listMe(1, 10000);
      console.log('Livres response:', response.data);
      const data = response.data as PersonalBooksResponse;
      const loadedBooks = data.items || [];
      console.log('Livres chargés:', loadedBooks.length);
      console.log('Livres:', loadedBooks);
      setBooks(loadedBooks);
      setTotal(data.total);
    } catch (error) {
      console.error('Erreur lors du chargement des livres', error);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLivre = async (bookId: number) => {
    try {
      await biblioAPI.delete(bookId);
      loadLivres();
    } catch (error) {
      console.error('Erreur lors de la suppression', error);
    }
  };

  const filteredBooks = books.filter(book => {
    const inTitle = book.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const inAuthors = (book.authors || []).join(' ').toLowerCase().includes(searchQuery.toLowerCase());
    return inTitle || inAuthors;
  });

  console.log('Total books:', books.length);
  console.log('Filtered books:', filteredBooks.length);
  console.log('Is loading:', isLoading);

  return (
    <div className={pageStyles.container}>
      <Header />
      
      <main className={pageStyles.main}>
        <div className={pageStyles.content}>
          <h1 className={pageStyles.title}>Ma Bibliothèque Personnelle</h1>

          <section className={pageStyles.statsSection}>
            <div className={cardStyles.statCard}>
              <div className={cardStyles.statNumber}>{total}</div>
              <div className={cardStyles.statLabel}>Livres enregistrés</div>

            </div>
          </section>

          <section className={pageStyles.searchSection}>
            <input
              type="text"
              placeholder="Rechercher dans ma bibliothèque..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={pageStyles.searchInput}
            />
          </section>

          {isLoading ? (
            <div className={stateStyles.loading}>Chargement de votre bibliothèque...</div>
          ) : books.length === 0 ? (
            <div className={stateStyles.empty}>
              <h2 className={stateStyles.emptyTitle}>Votre bibliothèque est vide</h2>
              <p className={stateStyles.emptyText}>
                Ajoutez vos premiers livres depuis la page Bibliothèque
              </p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className={stateStyles.empty}>
              <p>Aucun livre ne correspond à votre recherche</p>
            </div>
          ) : (
            <div className={bibliothequeStyles.livreGrid}>
              {filteredBooks.map(book => {
                const cover = book.cover_url || 'https://via.placeholder.com/300x450?text=Livre';
                const truncatedDescription = book.description
                  ? (book.description.length > 220
                    ? `${book.description.slice(0, 217)}...`
                    : book.description)
                  : '';

                return (
                  <div key={book.id} className={bibliothequeStyles.livreCard}>
                    <div className={cardStyles.coverWrapper}>
                      <img src={cover} alt={book.title} className={cardStyles.coverImage} />
                    </div>
                    <div className={bibliothequeStyles.meta}>
                      <h3 className={bibliothequeStyles.livreTitle}>{book.title}</h3>
                      {book.authors && book.authors.length > 0 && (
                        <p className={bibliothequeStyles.livreAuthor}>par {book.authors.join(', ')}</p>
                      )}
                      {truncatedDescription && (
                        <p className={typographyStyles.description}>{truncatedDescription}</p>
                      )}
                    </div>
                    <div className={bibliothequeStyles.actionsRow}>
                      <button 
                        onClick={() => handleDeleteLivre(book.id)}
                        className={bibliothequeStyles.deleteButton}
                      >
                        Retirer
                      </button>
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
