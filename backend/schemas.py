from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

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
    age: int
    role: Optional[str] = "Pauvre"

class UserCreate(UserBase):
    mdp: str

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

class User(UserBase):
    id: int
    signalement: int = 0
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
