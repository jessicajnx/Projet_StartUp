import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
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
          <Link href="/register" style={styles.ctaButton}>
            Commencer l'échange
          </Link>
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
              <h3>Ajoutez vos livres</h3>
              <p>Partagez les livres que vous possédez et que vous souhaitez échanger</p>
            </div>
            
            <div style={styles.feature}>
              <div style={styles.featureIcon}>3</div>
              <h3>Recherchez et échangez</h3>
              <p>Trouvez des livres près de chez vous et proposez des échanges</p>
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
  } as React.CSSProperties,
  main: {
    flex: 1,
  } as React.CSSProperties,
  hero: {
    backgroundColor: '#F5E6D3',
    padding: '4rem 2rem',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  heroTitle: {
    fontSize: '3rem',
    color: '#5D4E37',
    marginBottom: '1rem',
  } as React.CSSProperties,
  heroSubtitle: {
    fontSize: '1.5rem',
    color: '#8B7355',
    marginBottom: '1rem',
  } as React.CSSProperties,
  heroDescription: {
    fontSize: '1.2rem',
    color: '#5D4E37',
    marginBottom: '2rem',
  } as React.CSSProperties,
  ctaButton: {
    display: 'inline-block',
    backgroundColor: '#8B7355',
    color: 'white',
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'background-color 0.3s',
  } as React.CSSProperties,
  imageSection: {
    padding: '3rem 2rem',
    backgroundColor: '#fff',
  } as React.CSSProperties,
  imagePlaceholder: {
    maxWidth: '800px',
    margin: '0 auto',
    height: '400px',
    backgroundColor: '#D4B59E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
  } as React.CSSProperties,
  imageText: {
    fontSize: '2rem',
    color: 'white',
  } as React.CSSProperties,
  description: {
    padding: '3rem 2rem',
    backgroundColor: '#F5E6D3',
  } as React.CSSProperties,
  sectionTitle: {
    textAlign: 'center' as const,
    color: '#5D4E37',
    fontSize: '2rem',
    marginBottom: '2rem',
  } as React.CSSProperties,
  features: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem',
  } as React.CSSProperties,
  feature: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    textAlign: 'center' as const,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  featureIcon: {
    width: '60px',
    height: '60px',
    backgroundColor: '#8B7355',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0 auto 1rem',
  } as React.CSSProperties,
  aboutSection: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
  } as React.CSSProperties,
  aboutText: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    color: '#5D4E37',
    marginBottom: '1rem',
  } as React.CSSProperties,
};
