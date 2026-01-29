'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/hero.module.css';
import cardStyles from '@/styles/cards.module.css';
import gridStyles from '@/styles/grids.module.css';
import typographyStyles from '@/styles/typography.module.css';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(Boolean(token));
  }, []);

  return (
    <div className="container">
      <Header />
      
      <main className="main">
        {isLoggedIn ? (
          <section className={styles.hero}>
            <h1 className={typographyStyles.heroTitle}>Prêt à échanger ?</h1>
            <p className={typographyStyles.heroSubtitle}>
              Trouvez votre prochain livre en quelques minutes
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => router.push('/livres')}
                style={{
                  backgroundColor: '#8b5e3c',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2.5rem',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px rgba(47, 36, 29, 0.18)',
                }}
              >
                Commencer les échanges maintenant
              </button>
            </div>

            <div
              style={{
                marginTop: '2rem',
                maxWidth: '720px',
                marginLeft: 'auto',
                marginRight: 'auto',
                backgroundColor: 'rgba(255, 255, 255, 0.78)',
                borderRadius: '14px',
                padding: '1.5rem 2rem',
                boxShadow: '0 18px 45px rgba(47, 36, 29, 0.12)',
                textAlign: 'left',
              }}
            >
              <h2 className={typographyStyles.sectionTitle} style={{ marginBottom: '0.75rem' }}>
                Comment ça se passe ?
              </h2>
              <p className={styles.aboutText} style={{ marginBottom: '0.75rem' }}>
                Choisissez un livre, trouvez un lecteur près de chez vous, proposez un échange et
                finalisez directement via la messagerie. Simple, rapide, et sécurisé.
              </p>
              <p className={styles.aboutText} style={{ marginBottom: 0 }}>
                <strong>1.</strong> Sélectionnez un livre &nbsp;•&nbsp;
                <strong>2.</strong> Choisissez un lecteur &nbsp;•&nbsp;
                <strong>3.</strong> Validez l’échange
              </p>
            </div>
          </section>
        ) : (
          <>
            <section className={styles.hero}>
              <h1 className={typographyStyles.heroTitle}>Livre2Main</h1>
              <p className={typographyStyles.heroSubtitle}>
                Partagez votre passion de la lecture, échangez vos livres facilement
              </p>
              <p className={typographyStyles.heroDescription}>
                L'accès à la culture pour tous, même avec un petit budget
              </p>
            </section>

            <section style={{ padding: '3rem 2rem', backgroundColor: 'transparent' }}>
              <h2 className={typographyStyles.sectionTitle}>Comment ça marche ?</h2>
              
              <div className={gridStyles.featuresGrid}>
                <div className={cardStyles.featureCard}>
                  <div className={cardStyles.featureIcon}>1</div>
                  <h3>Inscrivez-vous gratuitement</h3>
                  <p>Créez votre compte en quelques minutes et rejoignez notre communauté de lecteurs</p>
                </div>
                
                <div className={cardStyles.featureCard}>
                  <div className={cardStyles.featureIcon}>2</div>
                  <h3>Scannez vos livres avec l'IA</h3>
                  <p>Prenez en photo vos livres, notre IA détecte automatiquement les informations</p>
                </div>
                
                <div className={cardStyles.featureCard}>
                  <div className={cardStyles.featureIcon}>3</div>
                  <h3>Recherchez et échangez</h3>
                  <p>Trouvez des livres près de chez vous et proposez des échanges</p>
                </div>
              </div>

              <div className={styles.aboutSection}>
                <h2 className={typographyStyles.sectionTitle}>Notre mission</h2>
                <p className={styles.aboutText}>
                  Livre2Main permet à tous les passionnés de lecture d'échanger leurs livres facilement,
                  sans se ruiner. Nous croyons que la culture doit être accessible à tous, et que le partage
                  de livres est une belle façon de créer du lien entre les lecteurs.
                </p>
                <p className={styles.aboutText}>
                  <strong>Version gratuite :</strong> 1 échange simultané<br/>
                  <strong>Version premium :</strong> Échanges illimités
                </p>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
