'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/layout.module.css';
import cardStyles from '@/styles/cards.module.css';
import formStyles from '@/styles/forms.module.css';
import buttonStyles from '@/styles/buttons.module.css';
import { Mail, MapPin, Clock } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--color-secondary)', marginBottom: '3rem', textAlign: 'center', fontWeight: 700 }}>
            Contactez-nous
          </h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div className={cardStyles.card}>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '1.5rem', fontWeight: 600 }}>
                Informations de contact
              </h2>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ minWidth: '40px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <Mail size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '0.3rem', fontWeight: 600 }}>Email</h3>
                  <p style={{ color: 'var(--color-text)', fontSize: '0.95rem' }}>contact@livre2main.fr</p>
                  <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginTop: '0.2rem' }}>Nous répondons sous 48h</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ minWidth: '40px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '0.3rem', fontWeight: 600 }}>Adresse</h3>
                  <p style={{ color: 'var(--color-text)', fontSize: '0.95rem' }}>Paris, France</p>
                  <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginTop: '0.2rem' }}>Plateforme 100% en ligne</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ minWidth: '40px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <Clock size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '0.3rem', fontWeight: 600 }}>Disponibilité</h3>
                  <p style={{ color: 'var(--color-text)', fontSize: '0.95rem' }}>Lundi - Vendredi</p>
                  <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginTop: '0.2rem' }}>9h00 - 18h00</p>
                </div>
              </div>
            </div>

            <div className={cardStyles.card}>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '1.5rem', fontWeight: 600 }}>
                Envoyez-nous un message
              </h2>
              
              {submitted && (
                <div style={{ padding: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #c3e6cb' }}>
                  ✅ Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
                </div>
              )}

              <form onSubmit={handleSubmit} className={formStyles.form}>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>Nom complet *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={formStyles.input}
                    placeholder="Jean Dupont"
                  />
                </div>

                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={formStyles.input}
                    placeholder="jean.dupont@email.com"
                  />
                </div>

                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>Sujet *</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={formStyles.select}
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="question">Question générale</option>
                    <option value="technique">Problème technique</option>
                    <option value="suggestion">Suggestion d'amélioration</option>
                    <option value="signalement">Signaler un problème</option>
                    <option value="partenariat">Partenariat</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className={formStyles.textarea}
                    placeholder="Décrivez votre demande en détail..."
                  />
                </div>

                <button type="submit" className={`${buttonStyles.btn} ${buttonStyles.btnPrimary} ${buttonStyles.btnFull}`}>
                  Envoyer le message
                </button>
              </form>
            </div>
          </div>

          <div className={cardStyles.card}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '1.5rem', fontWeight: 600 }}>
              Questions fréquentes
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-background)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Comment créer un compte ?
                </h3>
                <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Cliquez sur "S'inscrire" en haut de la page, remplissez le formulaire avec vos 
                  informations et validez. Vous recevrez un email de confirmation.
                </p>
              </div>

              <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-background)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Comment échanger des livres ?
                </h3>
                <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Ajoutez vos livres à votre bibliothèque, recherchez des livres disponibles près de 
                  chez vous, et contactez directement les propriétaires pour organiser l'échange.
                </p>
              </div>

              <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-background)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Est-ce que le service est gratuit ?
                </h3>
                <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Oui, Livre2Main est 100% gratuit ! Aucun frais d'inscription, aucun abonnement. 
                  Les échanges se font directement entre utilisateurs.
                </p>
              </div>

              <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-background)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Comment signaler un problème ?
                </h3>
                <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Utilisez le bouton de signalement sur le profil de l'utilisateur concerné, ou 
                  contactez-nous via ce formulaire en sélectionnant "Signaler un problème".
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

