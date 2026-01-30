'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, MessageCircle, Star } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/hero.module.css';
import cardStyles from '@/styles/cards.module.css';
import gridStyles from '@/styles/grids.module.css';
import buttonStyles from '@/styles/buttons.module.css';
import typographyStyles from '@/styles/typography.module.css';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(Boolean(token));
  }, []);

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        {isLoggedIn ? (
          <>
            {/* Hero Section - Logged In */}
            <section className={styles.heroConnected}>
              <div className={styles.heroContent}>
                <div className={styles.heroImagePlaceholder}>
                  <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                    <circle cx="100" cy="60" r="30" fill="#D4B59E" />
                    <path d="M50 150 L100 100 L150 150 Z" fill="#8B7355" />
                  </svg>
                </div>
                <div className={styles.heroText}>
                  <h1 className={typographyStyles.heroTitle}>Prêt à échanger ?</h1>
                  <p className={typographyStyles.heroDescription}>
                    Trouvez votre prochain livre en quelques minutes. Notre plateforme vous connecte avec des lecteurs passionnés près de chez vous.
                  </p>
                  <button
                    onClick={() => router.push('/livres')}
                    className={`${buttonStyles.btn} ${buttonStyles.btnPrimary} ${buttonStyles.btnLarge}`}
                  >
                    Commencer les échanges
                  </button>
                </div>
              </div>
            </section>

            {/* Features Cards */}
            <section className={styles.featuresSection}>
              <div className={gridStyles.featuresGrid}>
                <div className={cardStyles.featureCard}>
                  <div className={styles.iconCircle}>
                    <BookOpen size={32} />
                  </div>
                  <h3>Parcourir les livres</h3>
                  <p>Découvrez des milliers de livres disponibles près de chez vous</p>
                </div>
                
                <div className={cardStyles.featureCard}>
                  <div className={styles.iconCircle}>
                    <Users size={32} />
                  </div>
                  <h3>Trouver des lecteurs</h3>
                  <p>Connectez-vous avec des passionnés de lecture dans votre ville</p>
                </div>
                
                <div className={cardStyles.featureCard}>
                  <div className={styles.iconCircle}>
                    <MessageCircle size={32} />
                  </div>
                  <h3>Échanger facilement</h3>
                  <p>Proposez et validez vos échanges en toute simplicité</p>
                </div>
              </div>
            </section>

            {/* Second Section */}
            <section className={styles.aboutSectionConnected}>
              <div className={styles.aboutContent}>
                <div className={styles.aboutText}>
                  <p>
                    Choisissez un livre, trouvez un lecteur près de chez vous, proposez un échange et finalisez directement via la messagerie. Simple, rapide, et sécurisé. Nous croyons que la culture doit être accessible à tous et que le partage de livres est une belle façon de créer du lien entre les lecteurs.
                  </p>
                </div>
                <div className={styles.aboutImagePlaceholder}>
                  <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                    <circle cx="100" cy="60" r="30" fill="#D4B59E" />
                    <path d="M50 150 L100 100 L150 150 Z" fill="#8B7355" />
                  </svg>
                </div>
              </div>
            </section>

            {/* Testimonials Section */}
            <section className={styles.testimonialsSection}>
              <h2 className={typographyStyles.sectionTitle}>Ils adorent ....</h2>
              <div className={gridStyles.featuresGrid}>
                <div className={cardStyles.featureCard}>
                  <h3>Marie Dubois</h3>
                  <p>Une plateforme géniale ! J'ai échangé plus de 20 livres en 3 mois. La communauté est super sympa.</p>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} fill="#8B7355" stroke="#8B7355" />
                    ))}
                  </div>
                </div>
                
                <div className={cardStyles.featureCard}>
                  <h3>Thomas Martin</h3>
                  <p>Simple et efficace. J'ai découvert des livres que je n'aurais jamais achetés. Un vrai bon plan !</p>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} fill="#8B7355" stroke="#8B7355" />
                    ))}
                  </div>
                </div>
                
                <div className={cardStyles.featureCard}>
                  <h3>Sophie Bernard</h3>
                  <p>Parfait pour les grands lecteurs comme moi. Économique et écologique, que demander de plus ?</p>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} fill="#8B7355" stroke="#8B7355" />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Statistics Section */}
            <section className={styles.statsSection}>
              <div className={gridStyles.featuresGrid}>
                <div className={styles.statCard}>
                  <h2 style={{ fontSize: '3rem', color: '#8B7355', marginBottom: '0.5rem' }}>12,547</h2>
                  <h3>Livres échangés</h3>
                </div>
                <div className={styles.statCard}>
                  <h2 style={{ fontSize: '3rem', color: '#8B7355', marginBottom: '0.5rem' }}>3,284</h2>
                  <h3>Membres actifs</h3>
                </div>
                <div className={styles.statCard}>
                  <h2 style={{ fontSize: '3rem', color: '#8B7355', marginBottom: '0.5rem' }}>98%</h2>
                  <h3>Satisfaction</h3>
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Hero Section - Not Logged In */}
            <section className={styles.hero}>
              <div className={styles.heroContent}>
                <div className={styles.heroImagePlaceholder}>
                  <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                    <rect x="40" y="40" width="120" height="120" rx="20" fill="#E5D7C6" stroke="#8B7355" strokeWidth="2" />
                    <circle cx="80" cy="80" r="15" fill="#8B7355" />
                    <path d="M60 150 L100 110 L140 150" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
                <div className={styles.heroText}>
                  <h1 className={typographyStyles.heroTitle}>Livre2Main</h1>
                  <p className={typographyStyles.heroSubtitle}>Échangez vos livres, partagez votre passion</p>
                  <p className={typographyStyles.heroDescription}>
                    Découvrez une nouvelle façon de lire sans vous ruiner. Livre2Main connecte les passionnés de lecture pour échanger leurs livres facilement et gratuitement. Rejoignez une communauté qui partage votre amour des livres et rend la culture accessible à tous, quel que soit votre budget.
                  </p>
                  <button
                    onClick={() => router.push('/register')}
                    className={`${buttonStyles.btn} ${buttonStyles.btnPrimary} ${buttonStyles.btnLarge}`}
                  >
                    Nous rejoindre
                  </button>
                </div>
              </div>
            </section>

            {/* Features Cards */}
            <section className={styles.featuresSection}>
              <div className={gridStyles.featuresGrid}>
                <div className={cardStyles.featureCard}>
                  <div className={styles.iconCircle}>
                    <BookOpen size={32} />
                  </div>
                  <h3>Scannez vos livres</h3>
                  <p>Utilisez notre IA pour ajouter vos livres en un clic</p>
                </div>
                
                <div className={cardStyles.featureCard}>
                  <div className={styles.iconCircle}>
                    <Users size={32} />
                  </div>
                  <h3>Communauté locale</h3>
                  <p>Rencontrez des lecteurs passionnés près de chez vous</p>
                </div>
                
                <div className={cardStyles.featureCard}>
                  <div className={styles.iconCircle}>
                    <MessageCircle size={32} />
                  </div>
                  <h3>Messagerie intégrée</h3>
                  <p>Organisez vos échanges directement sur la plateforme</p>
                </div>
              </div>
            </section>

            {/* Second Section */}
            <section className={styles.aboutSectionConnected}>
              <div className={styles.aboutContent}>
                <div className={styles.aboutText}>
                  <p>
                    Livre2Main rend la lecture accessible à tous en permettant aux passionnés de livres d'échanger facilement leurs ouvrages. Plus besoin de dépenser des fortunes en livres neufs : partagez votre bibliothèque et découvrez de nouvelles lectures gratuitement. Rejoignez une communauté grandissante de lecteurs qui partagent votre passion et font vivre la culture du partage. Ensemble, rendons la lecture accessible à tous, peu importe le budget.
                  </p>
                </div>
                <div className={styles.aboutImagePlaceholder}>
                  <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                    <circle cx="100" cy="60" r="30" fill="#D4B59E" />
                    <path d="M50 150 L100 100 L150 150 Z" fill="#8B7355" />
                  </svg>
                </div>
              </div>
            </section>

            {/* Testimonials Section */}
            <section className={styles.testimonialsSection}>
              <h2 className={typographyStyles.sectionTitle}>Ils adorent ....</h2>
              <div className={gridStyles.featuresGrid}>
                <div className={cardStyles.featureCard}>
                  <h3>Claire Petit</h3>
                  <p>Livre2Main a changé ma façon de lire ! Je dévore des livres sans me ruiner. Merci pour cette belle initiative !</p>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} fill="#8B7355" stroke="#8B7355" />
                    ))}
                  </div>
                </div>
                
                <div className={cardStyles.featureCard}>
                  <h3>Lucas Mercier</h3>
                  <p>Interface intuitive, échanges rapides. J'ai rencontré des gens géniaux grâce à cette plateforme !</p>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} fill="#8B7355" stroke="#8B7355" />
                    ))}
                  </div>
                </div>
                
                <div className={cardStyles.featureCard}>
                  <h3>Emma Rousseau</h3>
                  <p>Enfin une solution pour recycler ma bibliothèque ! Écologique et économique, je recommande à 100%.</p>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} fill="#8B7355" stroke="#8B7355" />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Statistics Section */}
            <section className={styles.statsSection}>
              <div className={gridStyles.featuresGrid}>
                <div className={styles.statCard}>
                  <h2 style={{ fontSize: '3rem', color: '#8B7355', marginBottom: '0.5rem' }}>12,547</h2>
                  <h3>Livres échangés</h3>
                </div>
                <div className={styles.statCard}>
                  <h2 style={{ fontSize: '3rem', color: '#8B7355', marginBottom: '0.5rem' }}>3,284</h2>
                  <h3>Membres actifs</h3>
                </div>
                <div className={styles.statCard}>
                  <h2 style={{ fontSize: '3rem', color: '#8B7355', marginBottom: '0.5rem' }}>98%</h2>
                  <h3>Satisfaction</h3>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
