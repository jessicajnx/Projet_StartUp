import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/layout.module.css';
import cardStyles from '@/styles/cards.module.css';

export default function Emprunts() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div style={{ padding: '4rem 2rem', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
          <div className={cardStyles.card}>
            <div className={cardStyles.cardHeader}>
              <p className={cardStyles.cardKicker}>Livre2Main</p>
              <h1 className={cardStyles.cardTitle}>Mes emprunts</h1>
              <p className={cardStyles.cardSub}>Gérez vos emprunts et échanges en cours</p>
            </div>
            <p style={{ textAlign: 'center', color: 'var(--color-text)', fontSize: '1.1rem', padding: '2rem' }}>
              Contenu à venir...
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
