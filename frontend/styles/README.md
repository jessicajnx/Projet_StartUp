# Structure CSS du projet Livre2Main

Ce dossier contient tous les styles modulaires CSS utilisés dans l'application.

## Fichiers disponibles

### globals.css
Variables CSS globales et styles de base :
- Variables de couleurs
- Variables de shadow et border-radius
- Animations (@keyframes spin, fadeIn, slideUp)
- Styles de base pour body

**Import dans layout.tsx :**
```tsx
import '@/styles/globals.css'
```

### Modules CSS

#### layout.module.css
Classes pour les layouts de base :
- `.container` - Container principal avec flexbox
- `.main` - Zone de contenu principale
- `.content` - Zone de contenu avec max-width
- `.flexCenter`, `.flexColumn`, `.flexBetween` - Utilities flexbox

#### buttons.module.css
Styles pour tous les boutons :
- `.btn` - Classe de base
- `.btnPrimary` - Bouton principal
- `.btnSecondary` - Bouton secondaire
- `.btnGhost` - Bouton sans fond
- `.btnSuccess` - Bouton succès
- `.btnLarge` - Grande taille
- `.btnFull` - Largeur 100%
- `.btnGroup` - Groupe de boutons

#### cards.module.css
Styles pour les cartes :
- `.card` - Carte de base
- `.cardHeader`, `.cardTitle`, `.cardSub` - En-tête de carte
- `.bookCard` - Carte pour les livres
- `.coverWrapper`, `.coverImage` - Images de couverture
- `.featureCard`, `.featureIcon` - Cartes de fonctionnalités
- `.statCard` - Cartes de statistiques

#### forms.module.css
Styles pour les formulaires :
- `.form`, `.formGrid` - Layouts de formulaire
- `.field`, `.label`, `.input` - Champs de formulaire
- `.searchContainer`, `.searchInput` - Barre de recherche
- `.clearButton`, `.searchSpinner` - Actions de recherche

#### typography.module.css
Styles de typographie :
- `.title`, `.subtitle` - Titres principaux
- `.sectionTitle` - Titre de section
- `.bookTitle`, `.bookAuthor` - Titres de livres
- `.description` - Descriptions
- `.textError`, `.textSuccess` - Messages d'état
- `.heroTitle`, `.heroSubtitle` - Titres hero

#### grids.module.css
Layouts en grille :
- `.grid` - Grille de base
- `.gridAutoFit`, `.gridAutoFill` - Grilles adaptatives
- `.grid2Cols`, `.grid3Cols` - Grilles à colonnes fixes
- `.booksGrid` - Grille pour les livres
- `.featuresGrid` - Grille pour les fonctionnalités

#### states.module.css
États de chargement et messages :
- `.loading`, `.loadingContainer`, `.spinner` - États de chargement
- `.errorContainer`, `.errorText` - États d'erreur
- `.empty`, `.emptyContainer`, `.emptyText` - États vides

#### pagination.module.css
Styles de pagination :
- `.pagination` - Container de pagination
- `.pageNumbers` - Liste des numéros
- `.paginationButton` - Boutons précédent/suivant
- `.pageButton`, `.pageButtonActive` - Boutons de page
- `.pageEllipsis` - Points de suspension

#### hero.module.css
Styles pour les sections hero :
- `.hero` - Section hero
- `.aboutSection` - Section à propos
- `.imageSection`, `.imagePlaceholder` - Sections d'images

### Pages spécifiques

#### livres.module.css
Styles pour la page de découverte de livres

#### bibliotheque.module.css
Styles pour la page bibliothèque personnelle

#### profil.module.css
Styles pour la page profil

## Utilisation

### Dans une page React/Next.js :

```tsx
import styles from '@/styles/layout.module.css';
import buttonStyles from '@/styles/buttons.module.css';
import cardStyles from '@/styles/cards.module.css';

export default function MyPage() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={cardStyles.card}>
          <h1 className={cardStyles.cardTitle}>Titre</h1>
          <button className={buttonStyles.btnPrimary}>
            Cliquez ici
          </button>
        </div>
      </main>
    </div>
  );
}
```

### Combiner plusieurs classes :

```tsx
<button className={`${buttonStyles.btn} ${buttonStyles.btnPrimary} ${buttonStyles.btnLarge}`}>
  Grand bouton
</button>
```

## Variables CSS disponibles

Utilisables avec `var(--nom-variable)` :

### Couleurs
- `--color-primary` - #8b5e3c
- `--color-primary-dark` - #6d5642
- `--color-primary-light` - #8B7355
- `--color-secondary` - #2f241d
- `--color-text` - #5c4b3a
- `--color-text-light` - #8a7a6a
- `--color-background` - #F5E6D3
- `--color-card` - #FDFAF7
- `--color-border` - #d6c3a5
- `--color-success`, `--color-error` - etc.

### Shadows
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-primary`

### Radius
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`

## Bonnes pratiques

1. **Utiliser les modules CSS** pour les styles spécifiques aux composants
2. **Utiliser les variables CSS** pour les valeurs réutilisables
3. **Éviter les styles inline** sauf pour les valeurs dynamiques
4. **Combiner les classes** plutôt que de créer de nouvelles classes pour chaque variation
5. **Utiliser les classes utilitaires** (flexCenter, grid, etc.) pour les layouts simples
