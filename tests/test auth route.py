import pytest
from fastapi import status


@pytest.mark.integration
class TestAuthRoutes:
    """Tests d'intégration pour les routes d'authentification"""

    def test_register_success(self, client, test_user_data):
        """Test d'inscription réussie"""
        response = client.post("/auth/register", json=test_user_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["name"] == test_user_data["name"]
        assert data["surname"] == test_user_data["surname"]
        assert "mdp" not in data  # Le mot de passe ne doit pas être retourné

    def test_register_duplicate_email(self, client, test_user_data, created_user):
        """Test d'inscription avec un email déjà existant"""
        response = client.post("/auth/register", json=test_user_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "déjà enregistré" in response.json()["detail"].lower()

    def test_register_underage(self, client, test_user_data):
        """Test d'inscription avec un utilisateur mineur"""
        user_data = test_user_data.copy()
        user_data["age"] = 15
        
        response = client.post("/auth/register", json=user_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "16 ans" in response.json()["detail"]

    def test_register_invalid_email(self, client, test_user_data):
        """Test d'inscription avec un email invalide"""
        user_data = test_user_data.copy()
        user_data["email"] = "invalid-email"
        
        response = client.post("/auth/register", json=user_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_weak_password(self, client, test_user_data):
        """Test d'inscription avec un mot de passe faible"""
        user_data = test_user_data.copy()
        user_data["mdp"] = "weak"
        
        response = client.post("/auth/register", json=user_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_login_success(self, client, test_user_data, created_user):
        """Test de connexion réussie"""
        login_data = {
            "email": test_user_data["email"],
            "mdp": test_user_data["mdp"]
        }
        
        response = client.post("/auth/login", json=login_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0

    def test_login_wrong_email(self, client):
        """Test de connexion avec un email incorrect"""
        login_data = {
            "email": "wrong@example.com",
            "mdp": "TestPass123!"
        }
        
        response = client.post("/auth/login", json=login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Email non trouvé" in response.json()["detail"]

    def test_login_wrong_password(self, client, test_user_data, created_user):
        """Test de connexion avec un mot de passe incorrect"""
        login_data = {
            "email": test_user_data["email"],
            "mdp": "WrongPassword123!"
        }
        
        response = client.post("/auth/login", json=login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Mot de passe incorrect" in response.json()["detail"]

    def test_login_missing_fields(self, client):
        """Test de connexion avec des champs manquants"""
        response = client.post("/auth/login", json={})
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_and_login_flow(self, client):
        """Test du flux complet d'inscription et connexion"""
        # Inscription
        register_data = {
            "name": "Flow",
            "surname": "Test",
            "email": "flow@test.com",
            "mdp": "FlowPass123!",
            "villes": "Paris",
            "age": 25,
            "role": "Pauvre"
        }
        
        register_response = client.post("/auth/register", json=register_data)
        assert register_response.status_code == status.HTTP_201_CREATED
        
        # Connexion avec les mêmes identifiants
        login_data = {
            "email": register_data["email"],
            "mdp": register_data["mdp"]
        }
        
        login_response = client.post("/auth/login", json=login_data)
        assert login_response.status_code == status.HTTP_200_OK
        assert "access_token" in login_response.json()

    def test_register_different_roles(self, client):
        """Test d'inscription avec différents rôles"""
        roles = ["Pauvre", "Premium", "Admin"]
        
        for i, role in enumerate(roles):
            user_data = {
                "name": f"User{i}",
                "surname": "Test",
                "email": f"user{i}@test.com",
                "mdp": f"TestPass{i}123!",
                "villes": "Paris",
                "age": 25,
                "role": role
            }
            
            response = client.post("/auth/register", json=user_data)
            assert response.status_code == status.HTTP_201_CREATED
            assert response.json()["role"] == role

    def test_login_returns_valid_token(self, client, test_user_data, created_user):
        """Test que le token retourné est valide"""
        login_data = {
            "email": test_user_data["email"],
            "mdp": test_user_data["mdp"]
        }
        
        response = client.post("/auth/login", json=login_data)
        token = response.json()["access_token"]
        
        # Utiliser le token pour accéder à une route protégée
        headers = {"Authorization": f"Bearer {token}"}
        me_response = client.get("/users/me", headers=headers)
        
        assert me_response.status_code == status.HTTP_200_OK
        assert me_response.json()["email"] == test_user_data["email"]