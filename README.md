# Livre2main

Plateforme d'échange de livres entre utilisateurs proches géographiquement.

## Structure du projet

```
project/
├── backend/     # API FastAPI (Python)
└── frontend/    # Application Next.js (TypeScript)
```

## Prérequis

- Python 3.8+
- Node.js 18+
- MySQL 8.0+ (ou SQLite pour le développement)
- **Ollama** (pour la fonctionnalité de scan IA)

## Installation rapide (Windows)

Lancez simplement le script qui démarre tout :

```bash
start-all.bat
```

Cela lancera automatiquement :
- Backend sur http://localhost:8000
- Frontend sur http://localhost:3000

---

## Installation Backend

### 1. Installer les dépendances

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurer les variables d'environnement

Copiez le fichier `.env.example` en `.env` et adaptez vos paramètres :

```bash
cp .env.example .env
```

Fichier `.env` à créer dans `backend/`:

```
# Base de données
DATABASE_URL=sqlite:///./livre2main.db

# Configuration Ollama pour la vision d'images (optionnel - pour la fonctionnalité scan IA)
OLLAMA_API_URL=http://localhost:11434
VISION_MODEL=minicpm-v
```

**Note sur la base de données :**

- **SQLite (Développement - Par défaut)** : Utilisez `sqlite:///./livre2main.db` - la DB se crée automatiquement
- **MySQL (Production)** : Créez la base de données MySQL d'abord :

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS projet_startup CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p projet_startup < projet_startup.sql
```

Puis utilisez dans `.env` :
```
DATABASE_URL=mysql+pymysql://root:votre_password@localhost/projet_startup
```

### 3. Démarrer le serveur

#### Option A: MySQL (Production)

Créer la base de données MySQL:

```sql
CREATE DATABASE projet_startup;
```
 mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS projet_startup CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

mysql -u root -p projet_startup < projet_startup.sql


Créez un fichier `.env` dans le dossier `backend/`:

```
DATABASE_URL=mysql+pymysql://root:votre_password@localhost/projet_startups
```

### 3. Démarrer le serveur

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Le backend sera accessible sur http://localhost:8000

Documentation API: http://localhost:8000/docs

## Installation Frontend

### 1. Installer les dépendances

```bash
cd frontend
npm install
```

### 2. Configurer les variables d'environnement

Copiez le fichier `.env.local.example` en `.env.local` :

```bash
cp .env.local.example .env.local
```

Fichier `.env.local` à créer dans `frontend/`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=votre_cle_api_ici
```

**⚠️ Important** : La clé Google Books API ne doit pas être commitée. Utilisez votre propre clé ou laissez vide pour le développement.

### 3. Démarrer le serveur de développement

```bash
npm run dev
```

Le frontend sera accessible sur http://localhost:3000

## API Routes

### Authentication
- `POST /auth/register` - Créer un compte
- `POST /auth/login` - Se connecter

### Users
- `GET /users/me` - Profil utilisateur
- `GET /users/` - Liste tous les utilisateurs (Admin)
- `GET /users/{id}` - Détails utilisateur (Admin)
- `PUT /users/{id}` - Modifier utilisateur (Admin)
- `DELETE /users/{id}` - Supprimer utilisateur (Admin)
- `GET /users/ville/{ville}` - Utilisateurs par ville

### Livres
- `POST /livres/` - Créer un livre
- `GET /livres/` - Liste tous les livres
- `GET /livres/{id}` - Détails livre
- `PUT /livres/{id}` - Modifier livre
- `DELETE /livres/{id}` - Supprimer livre
- `GET /livres/search/{query}` - Rechercher livres
- `POST /livres/{livre_id}/assign/{user_id}` - Assigner livre à utilisateur
- `DELETE /livres/{livre_id}/unassign/{user_id}` - Retirer livre d'utilisateur

### Emprunts
- `POST /emprunts/` - Créer un emprunt
- `GET /emprunts/` - Liste tous les emprunts
- `GET /emprunts/{id}` - Détails emprunt
- `GET /emprunts/user/{user_id}` - Emprunts d'un utilisateur
- `DELETE /emprunts/{id}` - Supprimer emprunt
- `GET /emprunts/emprunteur/{user_id}` - Emprunts faits par utilisateur
- `GET /emprunts/emprunter/{user_id}` - Emprunts reçus par utilisateur

### AI - Scan de Livres (MiniCPM-V via Ollama)
- `POST /ai/analyze-book` - Analyser une image de livre avec IA (détection multiple)
- `POST /ai/add-detected-book` - Ajouter un livre détecté à la bibliothèque personnelle

## Fonctionnalité : Scanner un Livre avec IA (MiniCPM-V via Ollama)

Cette fonctionnalité est **optionnelle** et utilise **MiniCPM-V** via **Ollama** pour détecter automatiquement les informations de plusieurs livres à partir d'une seule photo.

### Configuration Ollama

1. Installez [Ollama](https://ollama.ai/)
2. Téléchargez le modèle MiniCPM-V :

```bash
ollama pull minicpm-v
```

3. Dans votre fichier `.env` du backend, assurez-vous que :

```env
OLLAMA_API_URL=http://localhost:11434
VISION_MODEL=minicpm-v
```

### Utilisation

1. Connectez-vous à votre compte
2. Cliquez sur "Scanner un livre" dans le menu
3. Choisissez une photo (peut contenir plusieurs livres)
4. Cliquez sur "Analyser avec IA"
5. L'IA détecte automatiquement **tous les livres** visibles
6. **Modifiez manuellement** les informations si nécessaire (bouton "Modifier")
7. Cliquez sur "Ajouter" pour chaque livre

### Avantages

- ✅ **Détection multiple** : analyse plusieurs livres en une seule fois
- ✅ **OCR ultra-précis** : optimisé pour la reconnaissance de texte (articles, ponctuation)
- ✅ **Édition manuelle** : corrigez les erreurs avant d'ajouter
- ✅ **100% local** : aucune clé API nécessaire, données privées
- ✅ **Gratuit** : pas de frais d'API


## Schéma de base de données

### Table User
- id (PK)
- name (Varchar)
- surname (Varchar)
- role (Varchar: Pauvre, Riche, Admin)
- villes (Varchar)
- mdp (Varchar - hashé)
- email (Varchar)
- age (Int)

### Table Livre
- id (PK)`User`
- **ID** (PK) - Integer
- **Name** - Varchar(100)
- **Surname** - Varchar(100)
- **Role** - Varchar(20) : Admin, Pauvre, Riche
- **Villes** - Varchar(100)
- **MDP** - Varchar(255) - hashé avec bcrypt
- **Email** - Varchar(255) - UNIQUE
- **Age** - Integer
- **Signalement** - Integer (défaut: 0)
- **liste_livres** - JSON

### Table `Livre`
- **ID** (PK) - Integer
- **Nom** - Varchar(255)
- **Auteur** - Varchar(255)
- **Genre** - Varchar(100)

### Table `Emprunt`
- **ID** (PK) - Integer
- **IDUser1** (FK → User.ID) - Integer - Emprunteur
- **IDUser2** (FK → User.ID) - Integer - Propriétaire (Emprunter)
- **IDLivre** (FK → Livre.ID) - Integer
- **DateTime** - DateTime

### Table `BibliothequePersonnelle`
- **ID** (PK) - Integer
- **UserID** (FK → User.ID) - Integer
- **Title** - Varchar(255)
- **Authors** - JSON
- **CoverUrl** - Varchar(512)
- **InfoLink** - Varchar(512)
- **Description** - Varchar(2000)
- **Source** - Varchar(50) (défaut: google_books)
- **SourceID** - Varchar(255)
- **CreatedAt** - DateTime

### Table `message`
- **ID** (PK) - Integer
- **IDEmprunt** (FK → Emprunt.ID) - Integer
- **IDSender** (FK → User.ID) - Integer
- **MessageText** - Varchar(2000)
- **DateTime** - DateTime
- **IsRead** - Integer (défaut: 0)
- **MessageMetadata** - JSON
```bash
cd frontend
npm install
npm run dev
npm run build
npm start
```

## Technologies utilisées

### Backend
- FastAPI
- SQLAlchemy
- PyMySQL / SQLite
- JWT Authentication
- Pydantic
- Passlib (bcrypt)

### Frontend
- Next.js 14
- TypeScript
- React 18
- Axios
