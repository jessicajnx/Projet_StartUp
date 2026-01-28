import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Emprunts() {
  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.main}>
        <div className="card" style={styles.content}>
          <div className="card-header">
            <p className="card-kicker">Livre2main</p>
            <h1 className="card-title">Mes emprunts</h1>
            <p className="card-sub">Gérez vos emprunts et échanges en cours</p>
          </div>
          <p style={styles.placeholder}>Contenu à venir...</p>
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
    padding: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  content: {
    maxWidth: '960px',
    width: '100%',
  } as React.CSSProperties,
  placeholder: {
    textAlign: 'center' as const,
    color: '#5c4b3a',
    fontSize: '1.1rem',
    padding: '2rem',
  } as React.CSSProperties,
};
