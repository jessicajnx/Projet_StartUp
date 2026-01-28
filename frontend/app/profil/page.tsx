'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { userAPI, empruntAPI } from '@/lib/api';

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  villes: string;
  age: number;
  role: string;
}

interface Livre {
  id: number;
  nom: string;
  auteur: string;
  genre?: string;
}

interface Emprunt {
  id: number;
  id_user1: number;
  id_user2: number;
  datetime: string;
}

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [livres, setLivres] = useState<Livre[]>([]);
  const [emprunts, setEmprunts] = useState<Emprunt[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
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

      const livresResponse = await userAPI.getMeLivres();
      setLivres(livresResponse.data);

      const empruntsResponse = await empruntAPI.getByUser(userResponse.data.id);
      setEmprunts(empruntsResponse.data);
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
    livre.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    livre.auteur.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const livresEchanges = filteredLivres.filter(livre =>
    emprunts.some(e => e.id_user1 === user?.id || e.id_user2 === user?.id)
  );

  const livresNonEchanges = filteredLivres.filter(livre =>
    !emprunts.some(e => e.id_user1 === user?.id || e.id_user2 === user?.id)
  );

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div style={styles.container}>
      <Header isAdminPage={isAdmin} />
      
      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>Mon Profil</h1>

          {/* Informations personnelles */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Informations personnelles</h2>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} style={styles.editButton}>
                  Modifier mes informations
                </button>
              )}
            </div>

            {isEditing ? (
              <div style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Prénom:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nom:</label>
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={(e) => setFormData({...formData, surname: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Ville:</label>
                  <input
                    type="text"
                    value={formData.villes}
                    onChange={(e) => setFormData({...formData, villes: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Âge:</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nouveau mot de passe (laisser vide pour ne pas modifier):</label>
                  <input
                    type="password"
                    value={formData.mdp}
                    onChange={(e) => setFormData({...formData, mdp: e.target.value})}
                    style={styles.input}
                    placeholder="Nouveau mot de passe"
                  />
                </div>
                <div style={styles.buttonGroup}>
                  <button onClick={handleUpdateProfile} style={styles.saveButton}>
                    Enregistrer
                  </button>
                  <button onClick={() => setIsEditing(false)} style={styles.cancelButton}>
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.infoCard}>
                <p><strong>Prénom:</strong> {user.name}</p>
                <p><strong>Nom:</strong> {user.surname}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Ville:</strong> {user.villes}</p>
                <p><strong>Âge:</strong> {user.age} ans</p>
                <p><strong>Abonnement:</strong> {user.role}</p>
              </div>
            )}
          </section>

          {/* Barre de recherche */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Rechercher un livre</h2>
            <input
              type="text"
              placeholder="Rechercher par titre ou auteur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </section>

          {/* Livres personnels non échangés */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Mes livres disponibles ({livresNonEchanges.length})</h2>
            <div style={styles.livreGrid}>
              {livresNonEchanges.length === 0 ? (
                <p>Aucun livre disponible</p>
              ) : (
                livresNonEchanges.map(livre => (
                  <div key={livre.id} style={styles.livreCard}>
                    <h3 style={styles.livreTitle}>{livre.nom}</h3>
                    <p style={styles.livreAuthor}>par {livre.auteur}</p>
                    {livre.genre && <p style={styles.livreGenre}>{livre.genre}</p>}
                    <span style={styles.statusBadge}>Disponible</span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Livres échangés */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Mes livres échangés ({livresEchanges.length})</h2>
            <div style={styles.livreGrid}>
              {livresEchanges.length === 0 ? (
                <p>Aucun livre échangé</p>
              ) : (
                livresEchanges.map(livre => (
                  <div key={livre.id} style={{...styles.livreCard, ...styles.livreCardExchanged}}>
                    <h3 style={styles.livreTitle}>{livre.nom}</h3>
                    <p style={styles.livreAuthor}>par {livre.auteur}</p>
                    {livre.genre && <p style={styles.livreGenre}>{livre.genre}</p>}
                    <span style={styles.statusBadgeExchanged}>Échangé</span>
                  </div>
                ))
              )}
            </div>
          </section>
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
  section: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  } as React.CSSProperties,
  sectionTitle: {
    color: '#5D4E37',
    fontSize: '1.5rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
  editButton: {
    backgroundColor: '#8B7355',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  } as React.CSSProperties,
  infoCard: {
    lineHeight: '2',
    color: '#5D4E37',
  } as React.CSSProperties,
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  } as React.CSSProperties,
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  } as React.CSSProperties,
  label: {
    fontWeight: 'bold',
    color: '#5D4E37',
  } as React.CSSProperties,
  input: {
    padding: '0.5rem',
    border: '1px solid #D4B59E',
    borderRadius: '4px',
    fontSize: '1rem',
  } as React.CSSProperties,
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  } as React.CSSProperties,
  saveButton: {
    backgroundColor: '#8B7355',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  } as React.CSSProperties,
  cancelButton: {
    backgroundColor: '#ccc',
    color: '#333',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  } as React.CSSProperties,
  searchInput: {
    width: '100%',
    padding: '1rem',
    border: '2px solid #D4B59E',
    borderRadius: '8px',
    fontSize: '1rem',
  } as React.CSSProperties,
  livreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem',
  } as React.CSSProperties,
  livreCard: {
    backgroundColor: '#F5E6D3',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '2px solid #8B7355',
    position: 'relative' as const,
  } as React.CSSProperties,
  livreCardExchanged: {
    borderColor: '#D4B59E',
    opacity: 0.8,
  } as React.CSSProperties,
  livreTitle: {
    color: '#5D4E37',
    fontSize: '1.2rem',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  livreAuthor: {
    color: '#8B7355',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  livreGenre: {
    color: '#8B7355',
    fontSize: '0.9rem',
    fontStyle: 'italic',
  } as React.CSSProperties,
  statusBadge: {
    display: 'inline-block',
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  statusBadgeExchanged: {
    display: 'inline-block',
    backgroundColor: '#FF9800',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    marginTop: '0.5rem',
  } as React.CSSProperties,
};
