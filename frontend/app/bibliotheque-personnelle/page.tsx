'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { biblioAPI } from '@/lib/api';
import pageStyles from '@/styles/bibliotheque.module.css';
import cardStyles from '@/styles/cards.module.css';
import stateStyles from '@/styles/states.module.css';
import paginationStyles from '@/styles/pagination.module.css';
import typographyStyles from '@/styles/typography.module.css';
import formStyles from '@/styles/forms.module.css';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const pageSizeOptions = [6, 12, 24, 48];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    loadLivres();
  }, [currentPage, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadLivres = async () => {
    try {
      setIsLoading(true);
      const response = await biblioAPI.listMe(currentPage, pageSize);
      const data = response.data as PersonalBooksResponse;
      setBooks(data.items || []);
      setTotal(data.total);
      setTotalPages(data.total_pages);
      setCurrentPage(data.page);
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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);

      if (startPage > 2) {
        pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const filteredBooks = books.filter(book => {
    const inTitle = book.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const inAuthors = (book.authors || []).join(' ').toLowerCase().includes(searchQuery.toLowerCase());
    return inTitle || inAuthors;
  });

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

          <div className={pageStyles.controls}>
            <label className={formStyles.label}>
              Livres par page :
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className={formStyles.select}
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>
          </div>

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
            <>
              <section className={pageStyles.genreSection}>
                <div className={pageStyles.livreGrid}>
                  {filteredBooks.map(book => {
                    const cover = book.cover_url || 'https://via.placeholder.com/300x450?text=Livre';
                    const truncatedDescription = book.description
                      ? (book.description.length > 220
                        ? `${book.description.slice(0, 217)}...`
                        : book.description)
                      : '';

                    return (
                      <div key={book.id} className={pageStyles.livreCard}>
                        <div className={cardStyles.coverWrapper}>
                          <img src={cover} alt={book.title} className={cardStyles.coverImage} />
                        </div>
                        <div className={pageStyles.meta}>
                          <h3 className={pageStyles.livreTitle}>{book.title}</h3>
                          {book.authors && book.authors.length > 0 && (
                            <p className={pageStyles.livreAuthor}>par {book.authors.join(', ')}</p>
                          )}
                          {truncatedDescription && (
                            <p className={typographyStyles.description}>{truncatedDescription}</p>
                          )}
                        </div>
                        <div className={pageStyles.actionsRow}>
                          <button 
                            onClick={() => handleDeleteLivre(book.id)}
                            className={pageStyles.deleteButton}
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {totalPages > 1 && (
                <div className={paginationStyles.pagination}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={paginationStyles.paginationButton}
                  >
                    Précédent
                  </button>

                  <div className={paginationStyles.pageNumbers}>
                    {getPageNumbers().map((pageNum, index) => (
                      typeof pageNum === 'number' ? (
                        <button
                          key={index}
                          onClick={() => handlePageChange(pageNum)}
                          className={`${paginationStyles.pageButton} ${currentPage === pageNum ? paginationStyles.pageButtonActive : ''}`}
                        >
                          {pageNum}
                        </button>
                      ) : (
                        <span key={index} className={paginationStyles.pageEllipsis}>{pageNum}</span>
                      )
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={paginationStyles.paginationButton}
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
