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

## Installation Backend

### 1. Installer les dépendances

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurer la base de données

#### Option A: SQLite (Développement - Par défaut)

Pas de configuration requise. La base de données SQLite sera créée automatiquement au démarrage.

#### Option B: MySQL (Production)

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

Créez un fichier `.env.local` dans le dossier `frontend/`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

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

### AI - Scan de Livres (Qwen Vision)
- `POST /ai/analyze-book` - Analyser une image de livre avec IA
- `POST /ai/add-detected-book` - Ajouter un livre détecté à la bibliothèque

## Nouvelle Fonctionnalité : Scanner un Livre avec IA

Cette fonctionnalité utilise **Qwen Vision** pour détecter automatiquement les informations d'un livre à partir d'une photo.

### Configuration Qwen

1. Obtenez une clé API sur [Alibaba Cloud DashScope](https://dashscope.aliyun.com/)
2. Ajoutez votre clé dans le fichier `.env` du backend :

```env
QWEN_API_KEY=votre_cle_api_qwen
QWEN_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

### Utilisation

1. Connectez-vous à votre compte
2. Cliquez sur "Scanner un livre" dans le menu
3. Choisissez une photo de la couverture du livre
4. Cliquez sur "Analyser avec IA"
5. Vérifiez les informations détectées (titre, auteur, genre)
6. Cliquez sur "Ajouter à ma bibliothèque"

### Mode Simulation

Si aucune clé API n'est configurée, le système fonctionne en **mode simulation** avec des données d'exemple. Parfait pour tester l'interface sans configuration !

### Installation des dépendances

```bash
cd backend
pip install -r requirements.txt
```

Les nouvelles dépendances incluent :
- `Pillow` - Traitement d'images
- `requests` - Appels API
- `openai` - Client API compatible Qwen


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
- id (PK)
- nom (Varchar)
- auteur (Varchar)
- genre (Varchar)

### Table Emprunt
- id (PK)
- id_user1 (FK - Emprunteur)
- id_user2 (FK - Emprunter)
- datetime (DateTime)

### Table user_livre
- user_id (FK)
- livre_id (FK)

## Commandes utiles

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
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
