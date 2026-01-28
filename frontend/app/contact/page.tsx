'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
    // Ici, vous pourriez envoyer les données à votre backend
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
    <div style={styles.container}>
      <Header />
      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>Contactez-nous</h1>
          
          <div style={styles.grid}>
            <div style={styles.infoSection}>
              <h2 style={styles.subtitle}>Informations de contact</h2>
              
              <div style={styles.infoCard}>
                <div style={styles.icon}>📧</div>
                <div>
                  <h3 style={styles.infoTitle}>Email</h3>
                  <p style={styles.infoText}>contact@livre2main.fr</p>
                  <p style={styles.infoSubtext}>Nous répondons sous 48h</p>
                </div>
              </div>

              <div style={styles.infoCard}>
                <div style={styles.icon}>📍</div>
                <div>
                  <h3 style={styles.infoTitle}>Adresse</h3>
                  <p style={styles.infoText}>Paris, France</p>
                  <p style={styles.infoSubtext}>Plateforme 100% en ligne</p>
                </div>
              </div>

              <div style={styles.infoCard}>
                <div style={styles.icon}>⏰</div>
                <div>
                  <h3 style={styles.infoTitle}>Disponibilité</h3>
                  <p style={styles.infoText}>Lundi - Vendredi</p>
                  <p style={styles.infoSubtext}>9h00 - 18h00</p>
                </div>
              </div>

              <div style={styles.socialSection}>
                <h3 style={styles.infoTitle}>Suivez-nous</h3>
                <p style={styles.infoText}>Restez informé de nos actualités !</p>
                <div style={styles.socialLinks}>
                  <a href="#" style={styles.socialLink}>Facebook</a>
                  <a href="#" style={styles.socialLink}>Twitter</a>
                  <a href="#" style={styles.socialLink}>Instagram</a>
                </div>
              </div>
            </div>

            <div style={styles.formSection}>
              <h2 style={styles.subtitle}>Envoyez-nous un message</h2>
              
              {submitted && (
                <div style={styles.successMessage}>
                  ✅ Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
                </div>
              )}

              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nom complet *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    placeholder="Jean Dupont"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    placeholder="jean.dupont@email.com"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Sujet *</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={styles.select}
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

                <div style={styles.formGroup}>
                  <label style={styles.label}>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    style={styles.textarea}
                    placeholder="Décrivez votre demande en détail..."
                  />
                </div>

                <button type="submit" style={styles.submitButton}>
                  Envoyer le message
                </button>
              </form>
            </div>
          </div>

          <div style={styles.faqSection}>
            <h2 style={styles.subtitle}>Questions fréquentes</h2>
            <div style={styles.faqGrid}>
              <div style={styles.faqCard}>
                <h3 style={styles.faqTitle}>Comment créer un compte ?</h3>
                <p style={styles.faqText}>
                  Cliquez sur "S'inscrire" en haut de la page, remplissez le formulaire avec vos 
                  informations et validez. Vous recevrez un email de confirmation.
                </p>
              </div>

              <div style={styles.faqCard}>
                <h3 style={styles.faqTitle}>Comment échanger des livres ?</h3>
                <p style={styles.faqText}>
                  Ajoutez vos livres à votre bibliothèque, recherchez des livres disponibles près de 
                  chez vous, et contactez directement les propriétaires pour organiser l'échange.
                </p>
              </div>

              <div style={styles.faqCard}>
                <h3 style={styles.faqTitle}>Est-ce que le service est gratuit ?</h3>
                <p style={styles.faqText}>
                  Oui, Livre2Main est 100% gratuit ! Aucun frais d'inscription, aucun abonnement. 
                  Les échanges se font directement entre utilisateurs.
                </p>
              </div>

              <div style={styles.faqCard}>
                <h3 style={styles.faqTitle}>Comment signaler un problème ?</h3>
                <p style={styles.faqText}>
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

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f7f2ea 0%, #f1e5d5 45%, #e6d4c0 100%)',
  },
  main: {
    flex: 1,
    padding: '2rem 1rem',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2.5rem',
    color: '#2f241d',
    marginBottom: '3rem',
    textAlign: 'center' as const,
    fontWeight: 700,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem',
  },
  infoSection: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: '18px',
    padding: '2rem',
    boxShadow: '0 18px 45px rgba(47,36,29,0.12)',
  },
  formSection: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: '18px',
    padding: '2rem',
    boxShadow: '0 18px 45px rgba(47,36,29,0.12)',
  },
  subtitle: {
    fontSize: '1.8rem',
    color: '#8b5e3c',
    marginBottom: '1.5rem',
    fontWeight: 600,
  },
  infoCard: {
    display: 'flex',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: '#f7f2ea',
    borderRadius: '12px',
    marginBottom: '1rem',
  },
  icon: {
    fontSize: '2rem',
    flexShrink: 0,
  },
  infoTitle: {
    fontSize: '1.1rem',
    color: '#2f241d',
    fontWeight: 600,
    marginBottom: '0.25rem',
  },
  infoText: {
    color: '#5c4b3a',
    margin: '0.25rem 0',
  },
  infoSubtext: {
    color: '#8b5e3c',
    fontSize: '0.9rem',
    margin: '0.25rem 0',
  },
  socialSection: {
    marginTop: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f7f2ea',
    borderRadius: '12px',
  },
  socialLinks: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  socialLink: {
    color: '#8b5e3c',
    textDecoration: 'none',
    fontWeight: 600,
    padding: '0.5rem 1rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    border: '1px solid #c3e6cb',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    color: '#2f241d',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #d6c3a5',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #d6c3a5',
    fontSize: '1rem',
    outline: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  textarea: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #d6c3a5',
    fontSize: '1rem',
    outline: 'none',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  },
  submitButton: {
    backgroundColor: '#8b5e3c',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '10px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 6px 12px rgba(139,94,60,0.2)',
  },
  faqSection: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: '18px',
    padding: '2rem',
    boxShadow: '0 18px 45px rgba(47,36,29,0.12)',
  },
  faqGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  faqCard: {
    padding: '1.5rem',
    backgroundColor: '#f7f2ea',
    borderRadius: '12px',
  },
  faqTitle: {
    fontSize: '1.1rem',
    color: '#8b5e3c',
    marginBottom: '0.5rem',
    fontWeight: 600,
  },
  faqText: {
    color: '#5c4b3a',
    fontSize: '0.95rem',
    lineHeight: 1.6,
  },
};
