import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from database import Base, get_db
from main import app
from models import User, Livre, Emprunt, BibliothequePersonnelle, Message
from auth import get_password_hash, create_access_token
from datetime import timedelta

# Configuration de la base de données en mémoire pour les tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Crée une session de base de données pour les tests"""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Crée un client de test FastAPI"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user_data():
    """Données de test pour un utilisateur"""
    return {
        "name": "John",
        "surname": "Doe",
        "email": "john.doe@test.com",
        "mdp": "TestPass123!",
        "villes": "Paris",
        "age": 25,
        "role": "Pauvre"
    }


@pytest.fixture
def test_premium_user_data():
    """Données de test pour un utilisateur premium"""
    return {
        "name": "Jane",
        "surname": "Premium",
        "email": "jane.premium@test.com",
        "mdp": "PremiumPass123!",
        "villes": "Lyon",
        "age": 30,
        "role": "Premium"
    }


@pytest.fixture
def test_admin_user_data():
    """Données de test pour un administrateur"""
    return {
        "name": "Admin",
        "surname": "User",
        "email": "admin@test.com",
        "mdp": "AdminPass123!",
        "villes": "Marseille",
        "age": 35,
        "role": "Admin"
    }


@pytest.fixture
def created_user(db_session, test_user_data):
    """Crée un utilisateur dans la base de données"""
    user = User(
        name=test_user_data["name"],
        surname=test_user_data["surname"],
        email=test_user_data["email"],
        mdp=get_password_hash(test_user_data["mdp"]),
        villes=test_user_data["villes"],
        age=test_user_data["age"],
        role=test_user_data["role"]
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def created_premium_user(db_session, test_premium_user_data):
    """Crée un utilisateur premium dans la base de données"""
    user = User(
        name=test_premium_user_data["name"],
        surname=test_premium_user_data["surname"],
        email=test_premium_user_data["email"],
        mdp=get_password_hash(test_premium_user_data["mdp"]),
        villes=test_premium_user_data["villes"],
        age=test_premium_user_data["age"],
        role=test_premium_user_data["role"]
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def created_admin_user(db_session, test_admin_user_data):
    """Crée un administrateur dans la base de données"""
    user = User(
        name=test_admin_user_data["name"],
        surname=test_admin_user_data["surname"],
        email=test_admin_user_data["email"],
        mdp=get_password_hash(test_admin_user_data["mdp"]),
        villes=test_admin_user_data["villes"],
        age=test_admin_user_data["age"],
        role=test_admin_user_data["role"]
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_token(created_user):
    """Génère un token d'authentification pour un utilisateur"""
    access_token = create_access_token(
        data={"sub": created_user.email, "role": created_user.role},
        expires_delta=timedelta(minutes=30)
    )
    return access_token


@pytest.fixture
def admin_auth_token(created_admin_user):
    """Génère un token d'authentification pour un administrateur"""
    access_token = create_access_token(
        data={"sub": created_admin_user.email, "role": created_admin_user.role},
        expires_delta=timedelta(minutes=30)
    )
    return access_token


@pytest.fixture
def premium_auth_token(created_premium_user):
    """Génère un token d'authentification pour un utilisateur premium"""
    access_token = create_access_token(
        data={"sub": created_premium_user.email, "role": created_premium_user.role},
        expires_delta=timedelta(minutes=30)
    )
    return access_token


@pytest.fixture
def auth_headers(auth_token):
    """Headers d'authentification pour les requêtes"""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture
def admin_auth_headers(admin_auth_token):
    """Headers d'authentification pour les requêtes admin"""
    return {"Authorization": f"Bearer {admin_auth_token}"}


@pytest.fixture
def premium_auth_headers(premium_auth_token):
    """Headers d'authentification pour les requêtes premium"""
    return {"Authorization": f"Bearer {premium_auth_token}"}


@pytest.fixture
def test_livre_data():
    """Données de test pour un livre"""
    return {
        "nom": "Le Petit Prince",
        "auteur": "Antoine de Saint-Exupéry",
        "genre": "Conte"
    }


@pytest.fixture
def created_livre(db_session, test_livre_data):
    """Crée un livre dans la base de données"""
    livre = Livre(**test_livre_data)
    db_session.add(livre)
    db_session.commit()
    db_session.refresh(livre)
    return livre


@pytest.fixture
def created_emprunt(db_session, created_user, created_premium_user, created_livre):
    """Crée un emprunt dans la base de données"""
    emprunt = Emprunt(
        id_user1=created_user.id,
        id_user2=created_premium_user.id,
        id_livre=created_livre.id
    )
    db_session.add(emprunt)
    db_session.commit()
    db_session.refresh(emprunt)
    return emprunt


@pytest.fixture
def assistant_user(db_session):
    """Crée l'utilisateur Assistant système"""
    assistant = User(
        name="Assistant",
        surname="Livre2Main",
        email="assistant@livre2main.com",
        mdp=get_password_hash("SystemPass123!"),
        role="System",
        villes="Paris",
        age=0,
        signalement=0
    )
    db_session.add(assistant)
    db_session.commit()
    db_session.refresh(assistant)
    return assistant


@pytest.fixture
def generic_book(db_session):
    """Crée le livre générique pour les propositions"""
    book = Livre(
        nom="Proposition d'échange",
        auteur="Système",
        genre="Notification"
    )
    db_session.add(book)
    db_session.commit()
    db_session.refresh(book)
    return book


@pytest.fixture
def test_personal_book_data():
    """Données de test pour un livre de bibliothèque personnelle"""
    return {
        "title": "1984",
        "authors": ["George Orwell"],
        "cover_url": "https://example.com/cover.jpg",
        "info_link": "https://example.com/book",
        "description": "Un roman dystopique",
        "source": "google_books",
        "source_id": "test123"
    }


@pytest.fixture
def created_personal_book(db_session, created_user, test_personal_book_data):
    """Crée un livre dans la bibliothèque personnelle"""
    book = BibliothequePersonnelle(
        user_id=created_user.id,
        **test_personal_book_data
    )
    db_session.add(book)
    db_session.commit()
    db_session.refresh(book)
    return book