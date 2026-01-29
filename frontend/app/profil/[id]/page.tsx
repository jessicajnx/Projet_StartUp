'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  villes: string;
  age: number;
  role: string;
}

interface PersonalBook {
  id: number;
  user_id: number;
  title: string;
  authors?: string[];
  cover_url?: string;
}

export default function UserProfilPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params?.id as string;
  
  // Détecter si on vient depuis un échange
  const fromExchange = searchParams?.get('from') === 'exchange';
  const messageId = searchParams?.get('messageId');

  const [user, setUser] = useState<User | null>(null);
  const [livres, setLivres] = useState<PersonalBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!userId) {
      setError('ID utilisateur manquant');
      setIsLoading(false);
      return;
    }

    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

      // Charger les informations de l'utilisateur
      const userResponse = await fetch(`${API_URL}/users/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Utilisateur non trouvé');
      }

      const userData = await userResponse.json();
      setUser(userData);

      // Charger la bibliothèque de l'utilisateur
      const livresResponse = await fetch(`${API_URL}/bibliotheque-personnelle/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (livresResponse.ok) {
        const livresData = await livresResponse.json();
        setLivres(livresData.items || []);
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error('Erreur chargement profil:', err);
      setError(err.message || 'Erreur lors du chargement du profil');
      setIsLoading(false);
    }
  };

  const handleBookExchangeProposal = async (bookId: number, bookTitle: string) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

      const response = await fetch(`${API_URL}/emprunts/propose-exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_user_id: parseInt(userId),
          book_id: bookId,
          book_title: bookTitle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la proposition');
      }

      setSelectedBookId(bookId);
      alert(`✅ Proposition d'échange envoyée pour le livre "${bookTitle}" !\n\nL'utilisateur recevra votre proposition dans sa messagerie.`);
    } catch (error: any) {
      console.error('Erreur lors de la proposition:', error);
      alert(`❌ Erreur: ${error.message}`);
    }
  };

  const handleAcceptExchange = async () => {
    if (!selectedBookId || !messageId) return;
    
    try {
      const selectedBook = livres.find(b => b.id === selectedBookId);
      if (!selectedBook) throw new Error('Livre non trouvé');
      
      const token = localStorage.getItem('token');
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

      const response = await fetch(`${API_URL}/messages/proposal/${messageId}/respond?response=accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          selected_book_id: selectedBookId,
          selected_book_title: selectedBook.title,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la confirmation');
      }

      alert(`✅ Échange confirmé avec le livre "${selectedBook.title}" !\n\nVous pouvez contacter l'autre utilisateur dans votre messagerie.`);
      
      setTimeout(() => {
        router.push('/messagerie');
      }, 1500);
    } catch (error: any) {
      console.error('Erreur lors de l\'acceptation:', error);
      alert(`❌ Erreur: ${error.message}`);
    }
  };

  const handleRejectExchange = async () => {
    if (!messageId) return;
    
    try {
      const token = localStorage.getItem('token');
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

      const response = await fetch(`${API_URL}/messages/proposal/${messageId}/respond?response=reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors du refus');
      }

      alert('❌ Proposition d\'échange refusée');
      setTimeout(() => {
        router.push('/messagerie');
      }, 1500);
    } catch (error: any) {
      console.error('Erreur lors du refus:', error);
      alert(`❌ Erreur: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <Header />
        <main style={styles.main}>
          <div style={styles.loading}>Chargement...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={styles.container}>
        <Header />
        <main style={styles.main}>
          <div style={styles.error}>
            <h2>Erreur</h2>
            <p>{error || 'Utilisateur non trouvé'}</p>
            <button onClick={() => router.back()} style={styles.backButton}>
              Retour
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.main}>
        <div style={styles.content}>
          <button onClick={() => router.back()} style={styles.backButton}>
            ← Retour
          </button>

          <div style={styles.profileCard}>
            <div style={styles.avatar}>
              {user.name.charAt(0)}{user.surname.charAt(0)}
            </div>
            <h1 style={styles.userName}>{user.name} {user.surname}</h1>
          </div>

          <div style={styles.librarySection}>
            <h2 style={styles.sectionTitle}>📚 Bibliothèque ({livres.length})</h2>
            {livres.length === 0 ? (
              <p style={styles.emptyText}>Aucun livre dans la bibliothèque</p>
            ) : (
              <div style={styles.booksGrid}>
                {livres.map((livre) => (
                  <div key={livre.id} style={styles.bookCard}>
                    {livre.cover_url ? (
                      <img
                        src={livre.cover_url}
                        alt={livre.title}
                        style={styles.bookCover}
                      />
                    ) : (
                      <div style={styles.noCover}>📖</div>
                    )}
                    <div style={styles.bookInfo}>
                      <h3 style={styles.bookTitle}>{livre.title}</h3>
                      {livre.authors && livre.authors.length > 0 && (
                        <p style={styles.bookAuthor}>
                          {Array.isArray(livre.authors) ? livre.authors.join(', ') : livre.authors}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (fromExchange) {
                          setSelectedBookId(livre.id);
                        } else {
                          handleBookExchangeProposal(livre.id, livre.title);
                        }
                      }}
                      disabled={fromExchange && selectedBookId !== null && selectedBookId !== livre.id}
                      style={{
                        ...styles.exchangeButton,
                        ...(fromExchange && selectedBookId !== null && selectedBookId !== livre.id && styles.exchangeButtonDisabled),
                        ...(selectedBookId === livre.id && styles.exchangeButtonSelected),
                      }}
                    >
                      {selectedBookId === livre.id 
                        ? '✓ Sélectionné' 
                        : fromExchange 
                          ? 'Sélectionner ce livre'
                          : 'Proposer cet échange'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {fromExchange && (
            <div style={styles.exchangeActionsSection}>
              <div style={styles.exchangeInfo}>
                {selectedBookId ? (
                  <p style={styles.selectedBookText}>
                    📚 Vous avez sélectionné : "<strong>{livres.find(b => b.id === selectedBookId)?.title}</strong>"
                  </p>
                ) : (
                  <p style={styles.selectBookText}>Sélectionnez un livre pour confirmer l'échange</p>
                )}
              </div>
              <div style={styles.exchangeButtonsRow}>
                <button 
                  onClick={handleAcceptExchange}
                  disabled={!selectedBookId}
                  style={{
                    ...styles.acceptButton,
                    ...(!selectedBookId && styles.buttonDisabled),
                  }}
                >
                  ✅ Accepter l'échange
                </button>
                <button 
                  onClick={handleRejectExchange}
                  style={styles.rejectButton}
                >
                  ❌ Refuser
                </button>
              </div>
            </div>
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
    backgroundColor: '#F5E6D3',
    padding: '2rem',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#8B7355',
  },
  error: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#d32f2f',
  },
  backButton: {
    backgroundColor: '#8b5e3c',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '2rem',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center' as const,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#8B7355',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 auto 1rem',
  },
  userName: {
    fontSize: '2rem',
    color: '#5D4E37',
    marginBottom: '1.5rem',
  },
  librarySection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    color: '#5D4E37',
    marginBottom: '1.5rem',
  },
  emptyText: {
    textAlign: 'center' as const,
    color: '#8B7355',
    padding: '2rem',
  },
  booksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '1.5rem',
  },
  bookCard: {
    backgroundColor: '#F5E6D3',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center' as const,
  },
  bookCover: {
    width: '100%',
    height: '200px',
    objectFit: 'cover' as const,
    borderRadius: '4px',
    marginBottom: '0.75rem',
  },
  noCover: {
    width: '100%',
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4B59E',
    borderRadius: '4px',
    marginBottom: '0.75rem',
    fontSize: '3rem',
  },
  bookInfo: {
    textAlign: 'left' as const,
  },
  bookTitle: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#5D4E37',
    marginBottom: '0.25rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
  },
  bookAuthor: {
    fontSize: '0.8rem',
    color: '#8B7355',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  exchangeButton: {
    marginTop: '0.75rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#8b5e3c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%',
  },
  exchangeButtonDisabled: {
    backgroundColor: '#D4B59E',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  exchangeButtonSelected: {
    backgroundColor: '#6d5642',
    cursor: 'default',
  },
  exchangeActionsSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginTop: '2rem',
    borderTop: '3px solid #8b5e3c',
  },
  exchangeInfo: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#F5E6D3',
    borderRadius: '8px',
    borderLeft: '4px solid #8b5e3c',
  },
  selectedBookText: {
    margin: 0,
    color: '#6d5642',
    fontSize: '1.1rem',
    fontWeight: 'bold',
  },
  selectBookText: {
    margin: 0,
    color: '#8b5e3c',
    fontSize: '1rem',
  },
  exchangeButtonsRow: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  acceptButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#8b5e3c',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  rejectButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#D4B59E',
    color: '#5D4E37',
    border: '2px solid #8B7355',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
};
