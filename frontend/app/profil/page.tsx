'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, MapPin, BookOpen, User as UserIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/profil.module.css';
import cardStyles from '@/styles/cards.module.css';
import buttonStyles from '@/styles/buttons.module.css';
import formStyles from '@/styles/forms.module.css';
import paginationStyles from '@/styles/pagination.module.css';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

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
  description?: string;
}

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [livres, setLivres] = useState<PersonalBook[]>([]);
  const [filteredLivres, setFilteredLivres] = useState<PersonalBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdminHeader, setIsAdminHeader] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    villes: '',
    age: '',
    password: '',
    confirmPassword: '',
  });
  
  const itemsPerPage = 6;

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const userResponse = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error('Utilisateur non trouvé');
        }

        const userData = await userResponse.json();
        const userId = userData?.id ?? userData?.ID;
        if (userId !== undefined && userId !== null) {
          localStorage.setItem('userId', String(userId));
        }
        setUser(userData);
        setIsAdminHeader(String(userData?.role).toLowerCase() === 'admin');
        setFormData({
          name: userData?.name ?? '',
          surname: userData?.surname ?? '',
          email: userData?.email ?? '',
          villes: userData?.villes ?? '',
          age: userData?.age != null ? String(userData.age) : '',
          password: '',
          confirmPassword: '',
        });

        const livresResponse = await fetch(`${API_URL}/bibliotheque-personnelle/me?page=1&page_size=10000`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (livresResponse.ok) {
          const livresData = await livresResponse.json();
          console.log('Données reçues de l\'API:', livresData);
          console.log('Total de livres:', livresData.total);
          console.log('Nombre de livres dans items:', livresData.items?.length);
          const booksData = livresData.items || [];
          setLivres(booksData);
          setFilteredLivres(booksData);
        } else {
          console.error('Erreur lors du chargement des livres:', await livresResponse.text());
        }

        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du profil');
        setIsLoading(false);
      }
    };

    load();
  }, [router]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLivres(livres);
    } else {
      const filtered = livres.filter((livre) =>
        livre.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (livre.authors && livre.authors.some((author) => author.toLowerCase().includes(searchTerm.toLowerCase())))
      );
      setFilteredLivres(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, livres]);

  const handleEditToggle = () => {
    if (!user) return;
    setFormError('');
    setIsEditing((prev) => !prev);
    setFormData({
      name: user.name ?? '',
      surname: user.surname ?? '',
      email: user.email ?? '',
      villes: user.villes ?? '',
      age: user.age != null ? String(user.age) : '',
      password: '',
      confirmPassword: '',
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      if (formData.password || formData.confirmPassword) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        if (!PASSWORD_REGEX.test(formData.password)) {
          throw new Error('Mot de passe: 8+ caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 spécial');
        }
      }

      const payload = {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        email: formData.email.trim(),
        villes: formData.villes.trim(),
        age: formData.age ? Number(formData.age) : null,
        ...(formData.password ? { mdp: formData.password } : {}),
      };

      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const detail = errorData?.detail;
        if (typeof detail === 'string') {
          throw new Error(detail);
        }
        if (Array.isArray(detail)) {
          throw new Error(detail.map((e: any) => e.msg || JSON.stringify(e)).join(', '));
        }
        throw new Error('Erreur lors de la mise à jour');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/bibliotheque-personnelle/${bookId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setLivres((prev) => prev.filter((livre) => livre.id !== bookId));
        setFilteredLivres((prev) => prev.filter((livre) => livre.id !== bookId));
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };


  const totalPages = Math.ceil(filteredLivres.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = filteredLivres.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Header isAdminPage={isAdminHeader} />
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <p>Chargement...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles.container}>
        <Header isAdminPage={isAdminHeader} />
        <main className={styles.main}>
          <div className={styles.errorContainer}>
            <h2>Erreur</h2>
            <p>{error || 'Utilisateur non trouvé'}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header isAdminPage={isAdminHeader} />
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.pageTitle}>Mon Profil</h1>
          
          {}
          <div className={styles.profileSection}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarContainer}>
                <div className={styles.avatar}>
                  <span className={styles.avatarInitials}>
                    {user.name.charAt(0).toUpperCase()}{user.surname.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <button 
                className={styles.settingsButton}
                onClick={() => setIsEditing(true)}
                title="Modifier les informations"
              >
                <Settings size={24} />
              </button>
            </div>

            <div className={styles.profileInfo}>
              <h2 className={styles.userName}>{user.name} {user.surname} <span className={styles.userAge}>{user.age}ans</span></h2>
              <p className={styles.userDetail}>
                <MapPin size={20} className={styles.iconCircle} /> Ville résidence: {user.villes}
              </p>
              <p className={styles.userDetail}>
                <BookOpen size={20} className={styles.iconCircle} /> Vos livres disponibles: {livres.length}
              </p>
              <p className={styles.userDetail}>
                <UserIcon size={20} className={styles.iconCircle} /> Type d'abonnement: {user.role}
              </p>
            </div>
          </div>

          {}
          <div className={styles.booksSection}>
            <h2 className={styles.sectionTitle}>Mes Livres</h2>
            
            <div className={formStyles.searchContainer}>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={formStyles.searchInput}
              />
            </div>

            {filteredLivres.length === 0 ? (
              <p className={styles.emptyMessage}>Aucun livre trouvé</p>
            ) : (
              <>
                <div className={styles.booksGrid}>
                  {currentBooks.map((livre) => (
                    <div key={livre.id} className={cardStyles.bookCard}>
                      <div className={cardStyles.coverWrapper}>
                        {livre.cover_url ? (
                          <img
                            src={livre.cover_url}
                            alt={livre.title}
                            className={cardStyles.coverImage}
                          />
                        ) : (
                          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                            <rect x="20" y="10" width="40" height="60" rx="2" fill="#C8B299" />
                            <rect x="25" y="15" width="30" height="50" rx="1" fill="#E5D7C6" />
                            <line x1="30" y1="25" x2="50" y2="25" stroke="#8B7355" strokeWidth="2" />
                            <line x1="30" y1="35" x2="50" y2="35" stroke="#8B7355" strokeWidth="2" />
                            <line x1="30" y1="45" x2="45" y2="45" stroke="#8B7355" strokeWidth="2" />
                          </svg>
                        )}
                      </div>
                      <div className={cardStyles.cardContent}>
                        <div style={{ flex: 1 }}>
                          <h3 className={styles.bookTitle}>{livre.title}</h3>
                          <p className={styles.bookDescription}>
                            {livre.description
                              ? livre.description.substring(0, 80) + '...'
                              : (livre.authors && livre.authors.length > 0)
                              ? `Par ${livre.authors.join(', ')}`
                              : 'Lorem ipsum dolor sit amet'}
                          </p>
                        </div>
                        <div className={cardStyles.cardFooter}>
                          <button
                            onClick={() => handleDeleteBook(livre.id)}
                            className={`${buttonStyles.btn} ${buttonStyles.btnPrimary} ${buttonStyles.btnFull}`}
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className={paginationStyles.pagination}>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={paginationStyles.pageButton}
                    >
                      Précédent
                    </button>
                    <span className={paginationStyles.pageInfo}>{currentPage} / {totalPages}</span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={paginationStyles.pageButton}
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {}
      {isEditing && (
        <div className={styles.modalOverlay} onClick={() => setIsEditing(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <button className={styles.closeButton} onClick={() => setIsEditing(false)}>
                ×
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={formStyles.formGroup}>
                <label className={formStyles.label}>Modifier Nom</label>
                <input
                  type="text"
                  value={formData.surname}
                  onChange={(e) => handleInputChange('surname', e.target.value)}
                  className={formStyles.input}
                />
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label}>Modifier Ville</label>
                <input
                  type="text"
                  value={formData.villes}
                  onChange={(e) => handleInputChange('villes', e.target.value)}
                  className={formStyles.input}
                />
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label}>Modifier Prénom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={formStyles.input}
                />
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label}>Modifier mot de passe</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={formStyles.input}
                  placeholder="Nouveau mot de passe"
                />
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label}>Modifier Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={formStyles.input}
                />
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label}>Modifier l'age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className={formStyles.input}
                  min="12"
                />
              </div>

              {formData.password && (
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>Confirmer mot de passe</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={formStyles.input}
                    placeholder="Confirmer le mot de passe"
                  />
                </div>
              )}

              {formError && <p className={styles.formError}>{formError}</p>}

              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`${buttonStyles.btn} ${buttonStyles.btnPrimary} ${buttonStyles.btnFull}`}
              >
                {isSaving ? 'Enregistrement...' : 'Appliquer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
