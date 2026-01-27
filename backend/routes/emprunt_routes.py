from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Emprunt, User
from schemas import Emprunt as EmpruntSchema, EmpruntCreate
from models import Livre
from datetime import datetime
from routes.user_routes import get_current_user

router = APIRouter(prefix="/emprunts", tags=["Emprunts"])

@router.post("/", response_model=EmpruntSchema, status_code=status.HTTP_201_CREATED)
def create_emprunt(emprunt: EmpruntCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user1 = db.query(User).filter(User.id == emprunt.id_user1).first()
    user2 = db.query(User).filter(User.id == emprunt.id_user2).first()
    livre = db.query(Livre).filter(Livre.id == emprunt.id_livre).first()

    if not user1 or not user2:
        raise HTTPException(status_code=404, detail="Un des utilisateurs n'existe pas")
    if not livre:
        raise HTTPException(status_code=404, detail="Livre non trouvé")
    if emprunt.id_user1 == emprunt.id_user2:
        raise HTTPException(status_code=400, detail="Un utilisateur ne peut pas emprunter à lui-même")

    payload = emprunt.dict()
    if not payload.get("datetime"):
        payload["datetime"] = datetime.utcnow()

    db_emprunt = Emprunt(**payload)
    db.add(db_emprunt)
    db.commit()
    db.refresh(db_emprunt)
    return db_emprunt

@router.get("/", response_model=List[EmpruntSchema])
def get_all_emprunts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    emprunts = db.query(Emprunt).offset(skip).limit(limit).all()
    return emprunts

@router.get("/{emprunt_id}", response_model=EmpruntSchema)
def get_emprunt(emprunt_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    emprunt = db.query(Emprunt).filter(Emprunt.id == emprunt_id).first()
    if not emprunt:
        raise HTTPException(status_code=404, detail="Emprunt non trouvé")
    return emprunt

@router.get("/user/{user_id}", response_model=List[EmpruntSchema])
def get_emprunts_by_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    emprunts = db.query(Emprunt).filter(
        (Emprunt.id_user1 == user_id) | (Emprunt.id_user2 == user_id)
    ).all()
    return emprunts

@router.delete("/{emprunt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_emprunt(emprunt_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    emprunt = db.query(Emprunt).filter(Emprunt.id == emprunt_id).first()
    if not emprunt:
        raise HTTPException(status_code=404, detail="Emprunt non trouvé")
    
    db.delete(emprunt)
    db.commit()
    return None

@router.get("/emprunteur/{user_id}", response_model=List[EmpruntSchema])
def get_emprunts_emprunteur(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    emprunts = db.query(Emprunt).filter(Emprunt.id_user1 == user_id).all()
    return emprunts

@router.get("/emprunter/{user_id}", response_model=List[EmpruntSchema])
def get_emprunts_emprunter(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    emprunts = db.query(Emprunt).filter(Emprunt.id_user2 == user_id).all()
    return emprunts
