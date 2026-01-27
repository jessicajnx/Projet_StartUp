import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.section}>
          <h3>Livre2Main</h3>
          <p>Plateforme d'échange de livres pour tous</p>
        </div>
        
        <div style={styles.section}>
          <h4>Navigation</h4>
          <ul style={styles.list}>
            <li><Link href="/" style={styles.link}>Accueil</Link></li>
            <li><Link href="/profil" style={styles.link}>Profil</Link></li>
            <li><Link href="/bibliotheque-personnelle" style={styles.link}>Ma Bibliothèque</Link></li>
          </ul>
        </div>
        
        <div style={styles.section}>
          <h4>Informations</h4>
          <ul style={styles.list}>
            <li><Link href="/mentions-legales" style={styles.link}>Mentions légales</Link></li>
            <li><Link href="/confidentialite" style={styles.link}>Politique de confidentialité</Link></li>
            <li><Link href="/cgv" style={styles.link}>CGV</Link></li>
            <li><Link href="/contact" style={styles.link}>Contact</Link></li>
          </ul>
        </div>
      </div>
      
      <div style={styles.copyright}>
        <p>&copy; {new Date().getFullYear()} Livre2Main. Tous droits réservés.</p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#5D4E37',
    color: 'white',
    padding: '2rem 1rem 1rem',
    marginTop: 'auto',
  } as React.CSSProperties,
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  } as React.CSSProperties,
  section: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  } as React.CSSProperties,
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  } as React.CSSProperties,
  link: {
    color: '#D4B59E',
    textDecoration: 'none',
    transition: 'color 0.3s',
  } as React.CSSProperties,
  copyright: {
    textAlign: 'center' as const,
    borderTop: '1px solid #8B7355',
    paddingTop: '1rem',
  } as React.CSSProperties,
};
