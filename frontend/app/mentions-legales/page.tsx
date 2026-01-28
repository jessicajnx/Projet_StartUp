'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MentionsLegales() {
  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>Mentions Légales</h1>
          
          <section style={styles.section}>
            <h2 style={styles.subtitle}>1. Éditeur du site</h2>
            <p>Le site Livre2Main est édité par :</p>
            <ul>
              <li><strong>Raison sociale :</strong> Livre2Main</li>
              <li><strong>Forme juridique :</strong> Projet étudiant</li>
              <li><strong>Adresse :</strong> Paris, France</li>
              <li><strong>Email :</strong> contact@livre2main.fr</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subtitle}>2. Hébergement</h2>
            <p>Le site est hébergé par :</p>
            <ul>
              <li><strong>Hébergeur :</strong> À définir</li>
              <li><strong>Adresse :</strong> À définir</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subtitle}>3. Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu de ce site (textes, images, logos, graphiques) est la propriété 
              exclusive de Livre2Main, sauf mention contraire. Toute reproduction, distribution, 
              modification, adaptation, retransmission ou publication de ces différents éléments est 
              strictement interdite sans l'accord écrit préalable de Livre2Main.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subtitle}>4. Responsabilité</h2>
            <p>
              Livre2Main ne saurait être tenu responsable des erreurs ou omissions, d'une absence de 
              disponibilité des informations et des services. Livre2Main se réserve le droit de 
              modifier ou de corriger le contenu de ce site à tout moment et sans préavis.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subtitle}>5. Données personnelles</h2>
            <p>
              Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au 
              Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, 
              de rectification, de suppression et d'opposition aux données personnelles vous concernant.
            </p>
            <p>
              Pour exercer ce droit, vous pouvez nous contacter à l'adresse : contact@livre2main.fr
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subtitle}>6. Cookies</h2>
            <p>
              Le site Livre2Main utilise des cookies pour améliorer l'expérience utilisateur et 
              assurer le bon fonctionnement du service. En poursuivant votre navigation sur ce site, 
              vous acceptez l'utilisation de cookies.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.subtitle}>7. Droit applicable</h2>
            <p>
              Les présentes mentions légales sont régies par le droit français. Tout litige relatif à 
              l'utilisation du site sera soumis à la compétence exclusive des tribunaux français.
            </p>
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
    background: 'linear-gradient(135deg, #f7f2ea 0%, #f1e5d5 45%, #e6d4c0 100%)',
  },
  main: {
    flex: 1,
    padding: '2rem 1rem',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: '18px',
    padding: '2rem',
    boxShadow: '0 18px 45px rgba(47,36,29,0.12)',
  },
  title: {
    fontSize: '2.5rem',
    color: '#2f241d',
    marginBottom: '2rem',
    textAlign: 'center' as const,
    fontWeight: 700,
  },
  section: {
    marginBottom: '2rem',
  },
  subtitle: {
    fontSize: '1.5rem',
    color: '#8b5e3c',
    marginBottom: '1rem',
    fontWeight: 600,
  },
};
