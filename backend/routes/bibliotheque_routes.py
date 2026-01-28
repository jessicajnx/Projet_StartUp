from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
import math

from database import get_db
from models import BibliothequePersonnelle, User
from schemas import PersonalBook, PersonalBookBase, PersonalBookCreate, PersonalBooksPaginated
from routes.user_routes import get_current_user

router = APIRouter(prefix="/bibliotheque-personnelle", tags=["Bibliotheque personnelle"])


@router.post("/", response_model=PersonalBook, status_code=status.HTTP_201_CREATED)
def add_book_to_personal_library(
    book: PersonalBookBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payload = PersonalBookCreate(**book.dict(), user_id=current_user.id)
    db_book = BibliothequePersonnelle(**payload.dict())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


@router.get("/me", response_model=PersonalBooksPaginated)
def list_my_personal_library(
    page: int = Query(1, ge=1, description="Numéro de page (commence à 1)"),
    page_size: int = Query(10, ge=1, le=100, description="Nombre d'éléments par page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = (
        db.query(BibliothequePersonnelle)
        .filter(BibliothequePersonnelle.user_id == current_user.id)
        .count()
    )
    skip = (page - 1) * page_size
    books = (
        db.query(BibliothequePersonnelle)
        .filter(BibliothequePersonnelle.user_id == current_user.id)
        .order_by(BibliothequePersonnelle.created_at.desc())
        .offset(skip)
        .limit(page_size)
        .all()
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return PersonalBooksPaginated(
        items=books,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_personal_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    book = (
        db.query(BibliothequePersonnelle)
        .filter(
            BibliothequePersonnelle.id == book_id,
            BibliothequePersonnelle.user_id == current_user.id,
        )
        .first()
    )
    if not book:
        raise HTTPException(status_code=404, detail="Livre non trouvé dans votre bibliothèque")
    db.delete(book)
    db.commit()
    return None
