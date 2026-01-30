'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/layout.module.css';

export default function CGV() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
          <h1 style={{ fontSize: "2.5rem", color: "var(--color-secondary)", marginBottom: "2rem", textAlign: "center", fontWeight: 700 }}>Conditions Générales d'Utilisation</h1>
          
          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>1. Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les 
              modalités et conditions dans lesquelles les utilisateurs peuvent accéder et utiliser 
              la plateforme Livre2Main, ainsi que les services qui y sont proposés.
            </p>
            <p>
              L'utilisation de la plateforme implique l'acceptation pleine et entière des présentes CGU.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>2. Description du service</h2>
            <p>
              Livre2Main est une plateforme gratuite permettant aux utilisateurs d'échanger des livres 
              entre eux de manière locale. Le service permet de :
            </p>
            <ul>
              <li>Créer une bibliothèque personnelle de livres</li>
              <li>Rechercher des livres disponibles près de chez vous</li>
              <li>Proposer vos livres à l'échange</li>
              <li>Entrer en contact avec d'autres lecteurs</li>
              <li>Gérer vos emprunts et prêts de livres</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>3. Inscription</h2>
            <p>
              Pour utiliser les services de Livre2Main, vous devez créer un compte en fournissant :
            </p>
            <ul>
              <li>Un nom et prénom</li>
              <li>Une adresse email valide</li>
              <li>Votre ville (pour faciliter les échanges locaux)</li>
              <li>Votre âge (minimum 12 ans)</li>
              <li>Un mot de passe sécurisé</li>
            </ul>
            <p>
              Vous vous engagez à fournir des informations exactes et à les maintenir à jour. 
              Vous êtes responsable de la confidentialité de votre mot de passe.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>4. Utilisation de la plateforme</h2>
            <h3 style={{ fontSize: "1.2rem", color: "var(--color-text)", marginBottom: "0.5rem", fontWeight: 600, marginTop: "1rem" }}>4.1 Obligations des utilisateurs</h3>
            <p>En utilisant Livre2Main, vous vous engagez à :</p>
            <ul>
              <li>Respecter les autres utilisateurs et leurs biens</li>
              <li>Fournir des informations exactes sur les livres que vous proposez</li>
              <li>Rendre les livres empruntés dans les délais convenus</li>
              <li>Prendre soin des livres empruntés</li>
              <li>Ne pas utiliser la plateforme à des fins commerciales</li>
              <li>Respecter les droits de propriété intellectuelle</li>
            </ul>

            <h3 style={{ fontSize: "1.2rem", color: "var(--color-text)", marginBottom: "0.5rem", fontWeight: 600, marginTop: "1rem" }}>4.2 Interdictions</h3>
            <p>Il est strictement interdit de :</p>
            <ul>
              <li>Créer plusieurs comptes</li>
              <li>Usurper l'identité d'un autre utilisateur</li>
              <li>Proposer des livres contrefaits ou piratés</li>
              <li>Harceler ou insulter d'autres utilisateurs</li>
              <li>Utiliser la plateforme pour toute activité illégale</li>
              <li>Tenter de contourner les mesures de sécurité</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>5. Échanges de livres</h2>
            <h3 style={{ fontSize: "1.2rem", color: "var(--color-text)", marginBottom: "0.5rem", fontWeight: 600, marginTop: "1rem" }}>5.1 Modalités</h3>
            <p>
              Les échanges de livres se font directement entre utilisateurs. Livre2Main met simplement 
              en relation les utilisateurs et ne gère pas physiquement les échanges.
            </p>
            
            <h3 style={{ fontSize: "1.2rem", color: "var(--color-text)", marginBottom: "0.5rem", fontWeight: 600, marginTop: "1rem" }}>5.2 Responsabilité</h3>
            <p>
              Livre2Main n'est pas responsable :
            </p>
            <ul>
              <li>De l'état des livres échangés</li>
              <li>Du non-respect des engagements entre utilisateurs</li>
              <li>Des litiges entre utilisateurs</li>
              <li>Des dommages causés lors des échanges</li>
            </ul>
            <p>
              Les utilisateurs échangent sous leur propre responsabilité. Nous recommandons de 
              toujours rencontrer les autres utilisateurs dans des lieux publics.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>6. Signalements et sanctions</h2>
            <p>
              En cas de comportement inapproprié, vous pouvez signaler un utilisateur. 
              Livre2Main se réserve le droit de :
            </p>
            <ul>
              <li>Avertir l'utilisateur concerné</li>
              <li>Suspendre temporairement son compte</li>
              <li>Supprimer définitivement son compte en cas de récidive ou de comportement grave</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>7. Propriété intellectuelle</h2>
            <p>
              Tous les éléments de la plateforme Livre2Main (logo, design, textes, code) sont 
              protégés par le droit d'auteur. Toute reproduction ou utilisation sans autorisation 
              est interdite.
            </p>
            <p>
              Les informations sur les livres (titres, auteurs, couvertures) proviennent de 
              l'API Google Books et restent la propriété de leurs auteurs respectifs.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>8. Données personnelles</h2>
            <p>
              Le traitement de vos données personnelles est décrit dans notre 
              Politique de Confidentialité. En utilisant Livre2Main, vous acceptez 
              ce traitement conformément au RGPD.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>9. Limitation de responsabilité</h2>
            <p>
              Livre2Main s'efforce de maintenir la plateforme accessible et fonctionnelle, mais ne 
              peut garantir :
            </p>
            <ul>
              <li>Une disponibilité 24h/24 et 7j/7</li>
              <li>L'absence d'erreurs ou de bugs</li>
              <li>La compatibilité avec tous les appareils</li>
            </ul>
            <p>
              Livre2Main ne pourra être tenu responsable des dommages directs ou indirects résultant 
              de l'utilisation ou de l'impossibilité d'utiliser la plateforme.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>10. Modifications des CGU</h2>
            <p>
              Livre2Main se réserve le droit de modifier les présentes CGU à tout moment. 
              Les utilisateurs seront informés des modifications importantes. La poursuite de 
              l'utilisation de la plateforme après modification vaut acceptation des nouvelles CGU.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>11. Résiliation</h2>
            <p>
              Vous pouvez supprimer votre compte à tout moment depuis votre profil. 
              Livre2Main se réserve également le droit de suspendre ou supprimer votre compte 
              en cas de non-respect des présentes CGU.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>12. Droit applicable et juridiction</h2>
            <p>
              Les présentes CGU sont régies par le droit français. Tout litige sera soumis à 
              la compétence exclusive des tribunaux français.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>13. Contact</h2>
            <p>
              Pour toute question concernant ces CGU :
            </p>
            <ul>
              <li><strong>Email :</strong> contact@livre2main.fr</li>
              <li><strong>Adresse :</strong> Livre2Main, Paris, France</li>
            </ul>
            <p><strong>Dernière mise à jour :</strong> 28 janvier 2026</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
