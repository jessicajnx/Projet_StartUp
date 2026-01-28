'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { userAPI, biblioAPI } from '@/lib/api';
import pageStyles from '@/styles/profil.module.css';
import cardStyles from '@/styles/cards.module.css';
import formStyles from '@/styles/forms.module.css';
import bibliothequeStyles from '@/styles/bibliotheque.module.css';

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

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [livres, setLivres] = useState<PersonalBook[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingLivres, setIsLoadingLivres] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    villes: '',
    age: 0,
    mdp: '',
  });

  const decodeTokenRole = (token: string): string | null => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.role ?? null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    const role = decodeTokenRole(token);
    if (role === 'Admin') {
      setIsAdmin(true);
    }
    
    loadUserData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserData = async () => {
    try {
      const userResponse = await userAPI.getMe();
      setUser(userResponse.data);
      setFormData({
        name: userResponse.data.name,
        surname: userResponse.data.surname,
        email: userResponse.data.email,
        villes: userResponse.data.villes,
        age: userResponse.data.age,
        mdp: '',
      });

      // Charger tous les livres de la bibliothèque personnelle (avec une grande limite)
      setIsLoadingLivres(true);
      try {
        const livresResponse = await biblioAPI.listMe(1, 1000);
        console.log('Livres response:', livresResponse.data);
        const data = livresResponse.data as PersonalBooksResponse;
        const books = data.items || [];
        console.log('Livres chargés:', books.length);
        setLivres(books);
      } catch (livresError) {
        console.error('Erreur lors du chargement des livres:', livresError);
        setLivres([]);
      } finally {
        setIsLoadingLivres(false);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      const updateData: any = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        villes: formData.villes,
        age: formData.age,
      };
      
      // N'envoyer le mot de passe que s'il est renseigné
      if (formData.mdp && formData.mdp.trim() !== '') {
        updateData.mdp = formData.mdp;
      }
      
      await userAPI.updateMe(updateData);
      setIsEditing(false);
      // Réinitialiser le champ mot de passe
      setFormData({...formData, mdp: ''});
      loadUserData();
      alert('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour', error);
      alert('Erreur lors de la mise à jour du profil');
    }
  };

  const filteredLivres = livres.filter(livre =>
    livre.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (livre.authors || []).join(' ').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div className={pageStyles.container}>
      <Header isAdminPage={isAdmin} />
      
      <main className={pageStyles.main}>
        <div className={pageStyles.content}>
          <h1 className={pageStyles.title}>Mon Profil</h1>

          <section className={pageStyles.section}>
            <div className={pageStyles.sectionHeader}>
              <h2 className={pageStyles.sectionTitle}>Informations personnelles</h2>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className={pageStyles.editButton}>
                  Modifier mes informations
                </button>
              )}
            </div>

            {isEditing ? (
              <div className={pageStyles.form}>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>Prénom:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={formStyles.input}
                  />
                </div>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>Nom:</label>
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={(e) => setFormData({...formData, surname: e.target.value})}
                    className={formStyles.input}
                  />
                </div>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>Email:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={formStyles.input}
                  />
                </div>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>Ville:</label>
                  <input
                    type="text"
                    value={formData.villes}
                    onChange={(e) => setFormData({...formData, villes: e.target.value})}
                    className={formStyles.input}
                  />
                </div>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>Âge:</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                    className={formStyles.input}
                  />
                </div>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>Nouveau mot de passe (laisser vide pour ne pas modifier):</label>
                  <input
                    type="password"
                    value={formData.mdp}
                    onChange={(e) => setFormData({...formData, mdp: e.target.value})}
                    className={formStyles.input}
                    placeholder="Nouveau mot de passe"
                  />
                </div>
                <div className={pageStyles.formActions}>
                  <button onClick={() => setIsEditing(false)} className={pageStyles.btnSecondary}>
                    Annuler
                  </button>
                  <button onClick={handleUpdateProfile} className={pageStyles.btnPrimary}>
                    Enregistrer
                  </button>
                </div>
              </div>
            ) : (
              <div className={pageStyles.infoGrid}>
                <div className={pageStyles.infoItem}>
                  <span className={pageStyles.infoLabel}>Prénom:</span>
                  <span className={pageStyles.infoValue}>{user.name}</span>
                </div>
                <div className={pageStyles.infoItem}>
                  <span className={pageStyles.infoLabel}>Nom:</span>
                  <span className={pageStyles.infoValue}>{user.surname}</span>
                </div>
                <div className={pageStyles.infoItem}>
                  <span className={pageStyles.infoLabel}>Email:</span>
                  <span className={pageStyles.infoValue}>{user.email}</span>
                </div>
                <div className={pageStyles.infoItem}>
                  <span className={pageStyles.infoLabel}>Ville:</span>
                  <span className={pageStyles.infoValue}>{user.villes}</span>
                </div>
                <div className={pageStyles.infoItem}>
                  <span className={pageStyles.infoLabel}>Âge:</span>
                  <span className={pageStyles.infoValue}>{user.age} ans</span>
                </div>
                <div className={pageStyles.infoItem}>
                  <span className={pageStyles.infoLabel}>Abonnement:</span>
                  <span className={pageStyles.infoValue}>{user.role}</span>
                </div>
              </div>
            )}
          </section>

          <section className={pageStyles.section}>
            <h2 className={pageStyles.sectionTitle}>Rechercher un livre</h2>
            <br />
            <input
              type="text"
              placeholder="Rechercher par titre ou auteur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={formStyles.searchInput}
            />
          </section>

          <section className={pageStyles.section}>
            <h2 className={pageStyles.sectionTitle}>Mes livres ({isLoadingLivres ? '...' : filteredLivres.length})</h2>
            {isLoadingLivres ? (
              <p className={pageStyles.emptyMessage}>
                Chargement de vos livres...
              </p>
            ) : filteredLivres.length === 0 ? (
              <p className={pageStyles.emptyMessage}>
                {searchQuery ? 'Aucun livre ne correspond à votre recherche.' : 'Aucun livre dans votre bibliothèque.'}
              </p>
            ) : (
              <div className={bibliothequeStyles.livreGrid}>
                {filteredLivres.map(livre => {
                  const cover = livre.cover_url || 'https://via.placeholder.com/300x450?text=Livre';
                  return (
                    <div key={livre.id} className={bibliothequeStyles.livreCard}>
                      <div className={cardStyles.coverWrapper}>
                        <img src={cover} alt={livre.title} className={cardStyles.coverImage} />
                      </div>
                      <div className={bibliothequeStyles.meta}>
                        <h3 className={bibliothequeStyles.livreTitle}>{livre.title}</h3>
                        {livre.authors && livre.authors.length > 0 && (
                          <p className={bibliothequeStyles.livreAuthor}>par {livre.authors.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
