from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Livre, User
from schemas import Livre as LivreSchema, LivreCreate, LivreUpdate, LivresPaginated
from routes.user_routes import get_current_user
import math

router = APIRouter(prefix="/livres", tags=["Livres"])

@router.post("/", response_model=LivreSchema, status_code=status.HTTP_201_CREATED)
def create_livre(livre: LivreCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_livre = Livre(**livre.dict())
    db.add(db_livre)
    db.commit()
    db.refresh(db_livre)
    return db_livre

@router.get("/", response_model=LivresPaginated)
def get_all_livres(
    page: int = Query(1, ge=1, description="Numéro de page (commence à 1)"),
    page_size: int = Query(10, ge=1, le=100, description="Nombre d'éléments par page"),
    db: Session = Depends(get_db)
):
    total = db.query(Livre).count()
    skip = (page - 1) * page_size
    livres = db.query(Livre).offset(skip).limit(page_size).all()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return LivresPaginated(
        items=livres,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/{livre_id}", response_model=LivreSchema)
def get_livre(livre_id: int, db: Session = Depends(get_db)):
    livre = db.query(Livre).filter(Livre.id == livre_id).first()
    if not livre:
        raise HTTPException(status_code=404, detail="Livre non trouvé")
    return livre

@router.put("/{livre_id}", response_model=LivreSchema)
def update_livre(livre_id: int, livre_update: LivreUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    livre = db.query(Livre).filter(Livre.id == livre_id).first()
    if not livre:
        raise HTTPException(status_code=404, detail="Livre non trouvé")
    
    update_data = livre_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(livre, key, value)
    
    db.commit()
    db.refresh(livre)
    return livre

@router.delete("/{livre_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_livre(livre_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    livre = db.query(Livre).filter(Livre.id == livre_id).first()
    if not livre:
        raise HTTPException(status_code=404, detail="Livre non trouvé")
    
    db.delete(livre)
    db.commit()
    return None

@router.get("/search/{query}", response_model=List[LivreSchema])
def search_livres(query: str, db: Session = Depends(get_db)):
    livres = db.query(Livre).filter(
        (Livre.nom.like(f"%{query}%")) | 
        (Livre.auteur.like(f"%{query}%")) | 
        (Livre.genre.like(f"%{query}%"))
    ).all()
    return livres

@router.post("/{livre_id}/assign/{user_id}", response_model=LivreSchema)
def assign_livre_to_user(livre_id: int, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    livre = db.query(Livre).filter(Livre.id == livre_id).first()
    user = db.query(User).filter(User.id == user_id).first()
    
    if not livre:
        raise HTTPException(status_code=404, detail="Livre non trouvé")
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    if livre not in user.livres:
        user.livres.append(livre)
        db.commit()
        db.refresh(livre)
    
    return livre

@router.delete("/{livre_id}/unassign/{user_id}", response_model=LivreSchema)
def unassign_livre_from_user(livre_id: int, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    livre = db.query(Livre).filter(Livre.id == livre_id).first()
    user = db.query(User).filter(User.id == user_id).first()
    
    if not livre:
        raise HTTPException(status_code=404, detail="Livre non trouvé")
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    if livre in user.livres:
        user.livres.remove(livre)
        db.commit()
        db.refresh(livre)
    
    return livre
