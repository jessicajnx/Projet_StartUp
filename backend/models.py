from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

user_livre = Table('user_livre', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('livre_id', Integer, ForeignKey('livres.id'))
)

class Livre(Base):
    __tablename__ = "livres"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(255), nullable=False)
    auteur = Column(String(255), nullable=False)
    genre = Column(String(255))
    
    users = relationship("User", secondary=user_livre, back_populates="livres")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    surname = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="Pauvre")
    villes = Column(String(255), nullable=False)
    mdp = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    age = Column(Integer, nullable=False)
    
    livres = relationship("Livre", secondary=user_livre, back_populates="users")
    emprunts_emprunter = relationship("Emprunt", foreign_keys="[Emprunt.id_user2]", back_populates="emprunter")
    emprunts_emprunteur = relationship("Emprunt", foreign_keys="[Emprunt.id_user1]", back_populates="emprunteur")

class Emprunt(Base):
    __tablename__ = "emprunts"

    id = Column(Integer, primary_key=True, index=True)
    id_user1 = Column(Integer, ForeignKey("users.id"), nullable=False)
    id_user2 = Column(Integer, ForeignKey("users.id"), nullable=False)
    datetime = Column(DateTime, default=datetime.utcnow)
    
    emprunteur = relationship("User", foreign_keys=[id_user1], back_populates="emprunts_emprunteur")
    emprunter = relationship("User", foreign_keys=[id_user2], back_populates="emprunts_emprunter")
