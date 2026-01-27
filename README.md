# BookExchange

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
- MySQL 8.0+

## Installation Backend

### 1. Créer la base de données MySQL

```sql
CREATE DATABASE bookexchange;
```

### 2. Configurer les variables d'environnement

Créez un fichier `.env` dans le dossier `backend/`:

```
DATABASE_URL=mysql+pymysql://root:votre_password@localhost/bookexchange
SECRET_KEY=votre_cle_secrete_super_securisee
```

### 3. Installer les dépendances

```bash
cd backend
pip install -r requirements.txt
```

### 4. Démarrer le serveur

```bash
uvicorn main:app --reload
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
uvicorn main:app --reload --host 0.0.0.0 --port 8000
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
- PyMySQL
- JWT Authentication
- Pydantic
- Passlib (bcrypt)

### Frontend
- Next.js 14
- TypeScript
- React 18
- Axios
