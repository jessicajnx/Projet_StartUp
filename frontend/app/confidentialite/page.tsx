'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/layout.module.css';

export default function Confidentialite() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
          <h1 style={{ fontSize: "2.5rem", color: "var(--color-secondary)", marginBottom: "2rem", textAlign: "center", fontWeight: 700 }}>Politique de Confidentialité</h1>
          
          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>1. Introduction</h2>
            <p>
              La présente politique de confidentialité a pour but de vous informer sur la manière 
              dont Livre2Main traite vos données personnelles lorsque vous utilisez notre plateforme 
              d'échange de livres.
            </p>
            <p>
              Nous nous engageons à protéger votre vie privée et à respecter la réglementation en 
              vigueur, notamment le Règlement Général sur la Protection des Données (RGPD).
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>2. Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>
            <ul>
              <li><strong>Données d'identification :</strong> nom, prénom, email, âge</li>
              <li><strong>Données de localisation :</strong> ville (pour faciliter les échanges locaux)</li>
              <li><strong>Données de connexion :</strong> mot de passe (crypté), historique de connexion</li>
              <li><strong>Données d'utilisation :</strong> livres ajoutés à votre bibliothèque, emprunts effectués</li>
              <li><strong>Messages :</strong> communications entre utilisateurs dans le cadre des échanges</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>3. Finalités du traitement</h2>
            <p>Vos données personnelles sont utilisées pour :</p>
            <ul>
              <li>Créer et gérer votre compte utilisateur</li>
              <li>Faciliter les échanges de livres entre utilisateurs</li>
              <li>Permettre la mise en relation avec d'autres utilisateurs de votre région</li>
              <li>Gérer les emprunts et retours de livres</li>
              <li>Améliorer nos services et personnaliser votre expérience</li>
              <li>Assurer la sécurité de la plateforme et prévenir les abus</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>4. Durée de conservation</h2>
            <p>
              Vos données personnelles sont conservées pendant toute la durée d'utilisation de votre 
              compte, et jusqu'à 3 ans après votre dernière connexion. Vous pouvez demander la 
              suppression de votre compte et de vos données à tout moment.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>5. Partage des données</h2>
            <p>
              Vos données personnelles ne sont jamais vendues à des tiers. Elles peuvent être 
              partagées uniquement dans les cas suivants :
            </p>
            <ul>
              <li>Avec d'autres utilisateurs dans le cadre des échanges de livres (nom, ville)</li>
              <li>Avec les autorités compétentes en cas d'obligation légale</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>6. Sécurité des données</h2>
            <p>
              Nous mettons en œuvre toutes les mesures techniques et organisationnelles appropriées 
              pour protéger vos données personnelles contre tout accès non autorisé, modification, 
              divulgation ou destruction :
            </p>
            <ul>
              <li>Cryptage des mots de passe avec bcrypt</li>
              <li>Connexions sécurisées (HTTPS)</li>
              <li>Authentification par token JWT</li>
              <li>Accès restreint aux données</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>7. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> supprimer vos données ("droit à l'oubli")</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
              <li><strong>Droit de limitation :</strong> demander la limitation du traitement</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous à : <strong>contact@livre2main.fr</strong>
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>8. Cookies</h2>
            <p>
              Notre site utilise des cookies techniques nécessaires au bon fonctionnement de la 
              plateforme (authentification, préférences utilisateur). Vous pouvez désactiver les 
              cookies dans les paramètres de votre navigateur, mais cela peut affecter certaines 
              fonctionnalités.
            </p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>9. Modifications</h2>
            <p>
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout 
              moment. Les modifications prendront effet dès leur publication sur cette page. Nous 
              vous encourageons à consulter régulièrement cette page.
            </p>
            <p><strong>Dernière mise à jour :</strong> 28 janvier 2026</p>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", fontWeight: 600 }}>10. Contact</h2>
            <p>
              Pour toute question concernant cette politique de confidentialité ou vos données 
              personnelles, vous pouvez nous contacter :
            </p>
            <ul>
              <li><strong>Email :</strong> contact@livre2main.fr</li>
              <li><strong>Courrier :</strong> Livre2Main, Paris, France</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
