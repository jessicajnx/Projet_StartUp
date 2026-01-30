import pytest
from auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from datetime import timedelta


@pytest.mark.unit
class TestPasswordHashing:
    """Tests pour le hachage des mots de passe"""

    def test_hash_password(self):
        """Test du hachage d'un mot de passe"""
        password = "TestPassword123!"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert len(hashed) > 0
        assert hashed.startswith("$2b$")

    def test_verify_correct_password(self):
        """Test de vérification d'un mot de passe correct"""
        password = "TestPassword123!"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True

    def test_verify_incorrect_password(self):
        """Test de vérification d'un mot de passe incorrect"""
        password = "TestPassword123!"
        wrong_password = "WrongPassword123!"
        hashed = get_password_hash(password)
        
        assert verify_password(wrong_password, hashed) is False

    def test_same_password_different_hashes(self):
        """Test que le même mot de passe génère des hashes différents"""
        password = "TestPassword123!"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        assert hash1 != hash2
        assert verify_password(password, hash1)
        assert verify_password(password, hash2)


@pytest.mark.unit
class TestJWTTokens:
    """Tests pour les tokens JWT"""

    def test_create_access_token(self):
        """Test de création d'un token d'accès"""
        data = {"sub": "test@example.com", "role": "Pauvre"}
        token = create_access_token(data)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_token_with_custom_expiry(self):
        """Test de création d'un token avec expiration personnalisée"""
        data = {"sub": "test@example.com", "role": "Pauvre"}
        expires_delta = timedelta(minutes=60)
        token = create_access_token(data, expires_delta)
        
        assert token is not None
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "test@example.com"

    def test_decode_valid_token(self):
        """Test de décodage d'un token valide"""
        data = {"sub": "test@example.com", "role": "Admin"}
        token = create_access_token(data)
        
        payload = decode_token(token)
        
        assert payload is not None
        assert payload["sub"] == "test@example.com"
        assert payload["role"] == "Admin"
        assert "exp" in payload

    def test_decode_invalid_token(self):
        """Test de décodage d'un token invalide"""
        invalid_token = "invalid.token.here"
        
        payload = decode_token(invalid_token)
        
        assert payload is None

    def test_token_contains_expiry(self):
        """Test que le token contient une date d'expiration"""
        data = {"sub": "test@example.com"}
        token = create_access_token(data)
        
        payload = decode_token(token)
        
        assert payload is not None
        assert "exp" in payload
        assert isinstance(payload["exp"], int)

    def test_token_data_integrity(self):
        """Test de l'intégrité des données dans le token"""
        original_data = {
            "sub": "user@example.com",
            "role": "Premium",
            "extra": "data"
        }
        token = create_access_token(original_data)
        decoded = decode_token(token)
        
        assert decoded["sub"] == original_data["sub"]
        assert decoded["role"] == original_data["role"]
        assert decoded["extra"] == original_data["extra"]


@pytest.mark.unit
class TestAuthConstants:
    """Tests pour les constantes d'authentification"""

    def test_access_token_expire_minutes_is_set(self):
        """Test que ACCESS_TOKEN_EXPIRE_MINUTES est défini"""
        assert ACCESS_TOKEN_EXPIRE_MINUTES is not None
        assert isinstance(ACCESS_TOKEN_EXPIRE_MINUTES, int)
        assert ACCESS_TOKEN_EXPIRE_MINUTES > 0