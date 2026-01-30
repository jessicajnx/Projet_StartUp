'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
}

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [livres, setLivres] = useState<PersonalBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    villes: '',
    age: '',
    password: '',
    confirmPassword: '',
  });

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
        setFormData({
          name: userData?.name ?? '',
          surname: userData?.surname ?? '',
          email: userData?.email ?? '',
          villes: userData?.villes ?? '',
          age: userData?.age != null ? String(userData.age) : '',
          password: '',
          confirmPassword: '',
        });

        const livresResponse = await fetch(`${API_URL}/bibliotheque-personnelle/me?page=1&page_size=50`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (livresResponse.ok) {
          const livresData = await livresResponse.json();
          setLivres(livresData.items || []);
        }

        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du profil');
        setIsLoading(false);
      }
    };

    load();
  }, [router]);

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
          <div style={styles.profileCard}>
            <div style={styles.avatar}>
              {user.name.charAt(0)}{user.surname.charAt(0)}
            </div>
            <h1 style={styles.userName}>{user.name} {user.surname}</h1>
            {!isEditing ? (
              <div style={styles.profileInfo}>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Ville:</strong> {user.villes}</p>
                <p><strong>Âge:</strong> {user.age}</p>
                <p><strong>Rôle:</strong> {user.role}</p>
                <button onClick={handleEditToggle} style={styles.editButton}>
                  Modifier mes informations
                </button>
              </div>
            ) : (
              <div style={styles.editForm}>
                <div style={styles.formRow}>
                  <label style={styles.label}>
                    Prénom
                    <input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      style={styles.input}
                      type="text"
                    />
                  </label>
                  <label style={styles.label}>
                    Nom
                    <input
                      value={formData.surname}
                      onChange={(e) => handleInputChange('surname', e.target.value)}
                      style={styles.input}
                      type="text"
                    />
                  </label>
                </div>
                <div style={styles.formRow}>
                  <label style={styles.label}>
                    Email
                    <input
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      style={styles.input}
                      type="email"
                    />
                  </label>
                  <label style={styles.label}>
                    Ville
                    <input
                      value={formData.villes}
                      onChange={(e) => handleInputChange('villes', e.target.value)}
                      style={styles.input}
                      type="text"
                    />
                  </label>
                </div>
                <div style={styles.formRow}>
                  <label style={styles.label}>
                    Âge
                    <input
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      style={styles.input}
                      type="number"
                      min={12}
                    />
                  </label>
                </div>
                <div style={styles.formRow}>
                  <label style={styles.label}>
                    Nouveau mot de passe
                    <input
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      style={styles.input}
                      type="password"
                      placeholder="••••••••"
                    />
                  </label>
                  <label style={styles.label}>
                    Confirmer le mot de passe
                    <input
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      style={styles.input}
                      type="password"
                      placeholder="••••••••"
                    />
                  </label>
                </div>
                {formError && <p style={styles.formError}>{formError}</p>}
                <div style={styles.formActions}>
                  <button onClick={handleSave} style={styles.saveButton} disabled={isSaving}>
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button onClick={handleEditToggle} style={styles.cancelButton} disabled={isSaving}>
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={styles.librarySection}>
            <h2 style={styles.sectionTitle}>📚 Ma bibliothèque ({livres.length})</h2>
            {livres.length === 0 ? (
              <p style={styles.emptyText}>Aucun livre dans votre bibliothèque</p>
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
                  </div>
                ))}
              </div>
            )}
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
    marginBottom: '1rem',
  },
  profileInfo: {
    color: '#6d5642',
    lineHeight: 1.8,
  },
  editButton: {
    marginTop: '1.5rem',
    backgroundColor: '#8b5e3c',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  editForm: {
    marginTop: '1.5rem',
    textAlign: 'left' as const,
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    fontWeight: 600,
    color: '#5D4E37',
  },
  input: {
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #D4B59E',
    fontSize: '0.95rem',
    outline: 'none',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  saveButton: {
    backgroundColor: '#8b5e3c',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  cancelButton: {
    backgroundColor: '#D4B59E',
    color: '#5D4E37',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  formError: {
    color: '#d32f2f',
    marginTop: '0.5rem',
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
};
