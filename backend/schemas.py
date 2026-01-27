from pydantic import BaseModel, EmailStr, conint, constr, validator
from typing import Optional, List, Any
from datetime import datetime
import re

PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$")

class LivreBase(BaseModel):
    nom: str
    auteur: str
    genre: Optional[str] = None

class LivreCreate(LivreBase):
    pass

class LivreUpdate(BaseModel):
    nom: Optional[str] = None
    auteur: Optional[str] = None
    genre: Optional[str] = None

class Livre(LivreBase):
    id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    name: str
    surname: str
    email: EmailStr
    villes: str
    age: conint(ge=16)
    role: Optional[str] = "Pauvre"

class UserCreate(UserBase):
    mdp: constr(min_length=8)

    @validator("mdp")
    def validate_password(cls, v: str) -> str:
        if not PASSWORD_REGEX.match(v):
            raise ValueError("Mot de passe: 8+ caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 spécial")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    mdp: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    email: Optional[EmailStr] = None
    villes: Optional[str] = None
    age: Optional[int] = None
    role: Optional[str] = None
    mdp: Optional[str] = None
    liste_livres: Optional[List[Any]] = None

    @validator("mdp")
    def validate_password_update(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not PASSWORD_REGEX.match(v):
            raise ValueError("Mot de passe: 8+ caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 spécial")
        return v

    @validator("age")
    def validate_age_update(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 16:
            raise ValueError("L'âge minimum est 16 ans")
        return v

class User(UserBase):
    id: int
    signalement: int = 0
    liste_livres: Optional[List[Any]] = None
    livres: List[Livre] = []

    class Config:
        from_attributes = True

class EmpruntBase(BaseModel):
    id_user1: int
    id_user2: int
    id_livre: int

class EmpruntCreate(EmpruntBase):
    pass

class Emprunt(EmpruntBase):
    id: int
    datetime: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
