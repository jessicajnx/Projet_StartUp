from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class Livre(Base):
    __tablename__ = "Livre"

    id = Column("ID", Integer, primary_key=True, index=True)
    nom = Column("Nom", String(255), nullable=False)
    auteur = Column("Auteur", String(255), nullable=False)
    genre = Column("Genre", String(100))

    emprunts = relationship("Emprunt", back_populates="livre")


class User(Base):
    __tablename__ = "User"

    id = Column("ID", Integer, primary_key=True, index=True)
    name = Column("Name", String(100), nullable=False)
    surname = Column("Surname", String(100), nullable=False)
    role = Column("Role", String(20), nullable=False, default="Pauvre")
    villes = Column("Villes", String(100))
    mdp = Column("MDP", String(255), nullable=False)
    # MySQL index length limit (utf8mb4): keep indexed email below 191 chars
    email = Column("Email", String(191), unique=True, nullable=False, index=True)
    age = Column("Age", Integer)
    signalement = Column("Signalement", Integer, default=0)
    liste_livres = Column("liste_livres", JSON, nullable=True)

    emprunts_emprunter = relationship("Emprunt", foreign_keys="[Emprunt.id_user2]", back_populates="emprunter")
    emprunts_emprunteur = relationship("Emprunt", foreign_keys="[Emprunt.id_user1]", back_populates="emprunteur")
    personal_books = relationship("BibliothequePersonnelle", back_populates="user", cascade="all, delete-orphan")


class Emprunt(Base):
    __tablename__ = "Emprunt"

    id = Column("ID", Integer, primary_key=True, index=True)
    id_user1 = Column("IDUser1", Integer, ForeignKey("User.ID"), nullable=False)
    id_user2 = Column("IDUser2", Integer, ForeignKey("User.ID"), nullable=False)
    id_livre = Column("IDLivre", Integer, ForeignKey("Livre.ID"), nullable=False)
    datetime = Column("DateTime", DateTime, default=datetime.utcnow, nullable=False)

    emprunteur = relationship("User", foreign_keys=[id_user1], back_populates="emprunts_emprunteur")
    emprunter = relationship("User", foreign_keys=[id_user2], back_populates="emprunts_emprunter")
    livre = relationship("Livre", back_populates="emprunts")


class BibliothequePersonnelle(Base):
    __tablename__ = "BibliothequePersonnelle"

    id = Column("ID", Integer, primary_key=True, index=True)
    user_id = Column("UserID", Integer, ForeignKey("User.ID"), nullable=False, index=True)
    title = Column("Title", String(255), nullable=False)
    authors = Column("Authors", JSON, nullable=True)
    cover_url = Column("CoverUrl", String(512), nullable=True)
    info_link = Column("InfoLink", String(512), nullable=True)
    description = Column("Description", String(2000), nullable=True)
    source = Column("Source", String(50), nullable=False, default="google_books")
    source_id = Column("SourceID", String(255), nullable=True)
    created_at = Column("CreatedAt", DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="personal_books")
