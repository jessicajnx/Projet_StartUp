'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/hero.module.css';
import cardStyles from '@/styles/cards.module.css';
import gridStyles from '@/styles/grids.module.css';
import typographyStyles from '@/styles/typography.module.css';

export default function Home() {
  return (
    <div className="container">
      <Header />
      
      <main className="main">
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
      </main>

      <Footer />
    </div>
  );
}
