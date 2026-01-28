import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Emprunts() {
  return (
    <div className="container">
      <Header />
      <main style={{ flex: 1, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '960px', width: '100%' }}>
          <div className="card-header">
            <p className="card-kicker">Livre2main</p>
            <h1 className="card-title">Mes emprunts</h1>
            <p className="card-sub">Gérez vos emprunts et échanges en cours</p>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--color-text)', fontSize: '1.1rem', padding: '2rem' }}>
            Contenu à venir...
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
