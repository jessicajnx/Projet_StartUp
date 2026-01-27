'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleCtaClick = () => {
    if (isAuthenticated) {
      router.push('/recherche');
    } else {
      router.push('/register');
    }
  };

  return (
    <div style={styles.container}>
      <Header />
      
      <main style={styles.main}>
        {/* Section Accroche */}
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>Livre2Main</h1>
          <p style={styles.heroSubtitle}>
            Partagez votre passion de la lecture, échangez vos livres facilement
          </p>
          <p style={styles.heroDescription}>
            L'accès à la culture pour tous, même avec un petit budget
          </p>
          <button type="button" onClick={handleCtaClick} style={styles.ctaButton}>
            Commencer l'échange
          </button>
        </section>

        {/* Section Photo */}
        <section style={styles.imageSection}>
          <div style={styles.imagePlaceholder}>
            <p style={styles.imageText}>Photo : Bibliothèque partagée</p>
          </div>
        </section>

        {/* Section Description */}
        <section style={styles.description}>
          <h2 style={styles.sectionTitle}>Comment ça marche ?</h2>
          
          <div style={styles.features}>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>1</div>
              <h3>Inscrivez-vous gratuitement</h3>
              <p>Créez votre compte en quelques minutes et rejoignez notre communauté de lecteurs</p>
            </div>
            
            <div style={styles.feature}>
              <div style={styles.featureIcon}>2</div>
              <h3>Scannez vos livres avec l'IA</h3>
              <p>Prenez en photo vos livres, notre IA détecte automatiquement les informations</p>
            </div>
            
            <div style={styles.feature}>
              <div style={styles.featureIcon}>3</div>
              <h3>Recherchez et échangez</h3>
              <p>Trouvez des livres près de chez vous et proposez des échanges</p>
            </div>
          </div>

          {/* Nouvelle section IA */}
          <div style={styles.aiSection}>
            <h2 style={styles.aiTitle}>Nouvelle fonctionnalité IA !</h2>
            <div style={styles.aiContent}>
              <div>
                <h3 style={styles.aiSubtitle}>Scanner vos livres en un clic</h3>
                <p style={styles.aiText}>
                  Grâce à l'intelligence artificielle Qwen, ajoutez vos livres à votre bibliothèque 
                  simplement en prenant une photo de la couverture. Plus besoin de saisir manuellement 
                  les informations !
                </p>
                <Link href="/scan-livre" style={styles.aiButton}>
                  Essayer maintenant →
                </Link>
              </div>
            </div>
          </div>

          <div style={styles.aboutSection}>
            <h2 style={styles.sectionTitle}>Notre mission</h2>
            <p style={styles.aboutText}>
              Livre2Main permet à tous les passionnés de lecture d'échanger leurs livres facilement,
              sans se ruiner. Nous croyons que la culture doit être accessible à tous, et que le partage
              de livres est une belle façon de créer du lien entre les lecteurs.
            </p>
            <p style={styles.aboutText}>
              <strong>Version gratuite :</strong> 1 échange simultané<br/>
              <strong>Version premium :</strong> Échanges illimités
            </p>
          </div>
        </section>
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
  } as CSSProperties,
  main: {
    flex: 1,
  } as CSSProperties,
  hero: {
    backgroundColor: 'transparent',
    padding: '4rem 2rem',
    textAlign: 'center' as const,
  } as CSSProperties,
  heroTitle: {
    fontSize: '3rem',
    color: '#2f241d',
    marginBottom: '1rem',
    fontWeight: 700,
  } as CSSProperties,
  heroSubtitle: {
    fontSize: '1.5rem',
    color: '#5c4b3a',
    marginBottom: '1rem',
    fontWeight: 500,
  } as CSSProperties,
  heroDescription: {
    fontSize: '1.2rem',
    color: '#5c4b3a',
    marginBottom: '2rem',
  } as CSSProperties,
  ctaButton: {
    display: 'inline-block',
    backgroundColor: '#8b5e3c',
    color: 'white',
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    borderRadius: '10px',
    textDecoration: 'none',
    transition: 'all 120ms ease',
    fontWeight: 600,
    boxShadow: '0 10px 18px rgba(139,94,60,0.22)',
    border: 'none',
    cursor: 'pointer',
  } as CSSProperties,
  imageSection: {
    padding: '3rem 2rem',
    backgroundColor: 'transparent',
  } as CSSProperties,
  imagePlaceholder: {
    maxWidth: '800px',
    margin: '0 auto',
    height: '400px',
    backgroundColor: 'rgba(255,255,255,0.78)',
    border: '1px solid #d6c3a5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '18px',
    boxShadow: '0 18px 45px rgba(47,36,29,0.12)',
    backdropFilter: 'blur(6px)',
  } as CSSProperties,
  imageText: {
    fontSize: '2rem',
    color: '#8b5e3c',
    fontWeight: 600,
  } as CSSProperties,
  description: {
    padding: '3rem 2rem',
    backgroundColor: 'transparent',
  } as CSSProperties,
  sectionTitle: {
    textAlign: 'center' as const,
    color: '#2f241d',
    fontSize: '2rem',
    marginBottom: '2rem',
    fontWeight: 700,
  } as CSSProperties,
  features: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem',
  } as CSSProperties,
  feature: {
    backgroundColor: 'rgba(255,255,255,0.78)',
    border: '1px solid #d6c3a5',
    padding: '2rem',
    borderRadius: '18px',
    textAlign: 'center' as const,
    boxShadow: '0 18px 45px rgba(47,36,29,0.12)',
    backdropFilter: 'blur(6px)',
    color: '#2f241d',
  } as CSSProperties,
  featureIcon: {
    width: '60px',
    height: '60px',
    backgroundColor: '#8b5e3c',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0 auto 1rem',
    boxShadow: '0 8px 16px rgba(139,94,60,0.22)',
  } as CSSProperties,
  aboutSection: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'rgba(255,255,255,0.78)',
    border: '1px solid #d6c3a5',
    padding: '2rem',
    borderRadius: '18px',
    boxShadow: '0 18px 45px rgba(47,36,29,0.12)',
    backdropFilter: 'blur(6px)',
  } as CSSProperties,
  aboutText: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    color: '#2f241d',
    marginBottom: '1rem',
  } as CSSProperties,
};
