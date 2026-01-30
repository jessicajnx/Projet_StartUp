from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Emprunt, User, Message, Livre
from schemas import Emprunt as EmpruntSchema, EmpruntCreate
from datetime import datetime
from routes.user_routes import get_current_user
from pydantic import BaseModel
from sqlalchemy import or_, and_, Integer, func

router = APIRouter(prefix="/emprunts", tags=["Emprunts"])


def check_conversation_limit(user: User, db: Session) -> None:
    if user.role.lower() in ["premium", "riche"]:
        return

    if user.role.lower() == "pauvre":
        assistant = db.query(User).filter(User.email == "assistant@livre2main.com").first()
        assistant_id = assistant.id if assistant else None

        query = db.query(Emprunt).filter(
            or_(
                Emprunt.id_user1 == user.id,
                Emprunt.id_user2 == user.id
            )
        )

        if assistant_id:
            query = query.filter(
                and_(
                    Emprunt.id_user1 != assistant_id,
                    Emprunt.id_user2 != assistant_id
                )
            )

        active_exchanges = query.count()

        if active_exchanges >= 1:
            raise HTTPException(
                status_code=403,
                detail="Limite d'échanges atteinte. Les utilisateurs gratuits sont limités à 1 échange actif à la fois. Passez à Premium pour des échanges illimités."
            )

    return

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

    assistant = db.query(User).filter(User.email == "assistant@livre2main.com").first()
    is_real_exchange = not assistant or (user1.id != assistant.id and user2.id != assistant.id)

    if is_real_exchange:
        check_conversation_limit(user1, db)
        check_conversation_limit(user2, db)

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


class ProposeExchangeRequest(BaseModel):
    target_user_id: int
    book_id: int
    book_title: str

class ProposeBookExchangeRequest(BaseModel):
    target_user_id: int
    book_id: int
    book_title: str


@router.post("/propose-exchange", status_code=status.HTTP_201_CREATED)
def propose_exchange(
    request: ProposeExchangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user = db.query(User).filter(User.id == request.target_user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur cible non trouvé")

    if request.target_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas proposer un échange à vous-même")

    assistant_email = "assistant@livre2main.com"
    assistant = db.query(User).filter(User.email == assistant_email).first()

    if not assistant:
        assistant = User(
            name="Assistant",
            surname="Livre2Main",
            email=assistant_email,
            mdp="$2b$12$placeholder_hashed_password",
            role="System",
            villes="Paris",
            age=0,
            signalement=0
        )
        db.add(assistant)
        db.flush()

    generic_book_name = "Proposition d'échange"
    generic_book = db.query(Livre).filter(Livre.nom == generic_book_name).first()

    if not generic_book:
        generic_book = Livre(
            nom=generic_book_name,
            auteur="Système",
            genre="Notification"
        )
        db.add(generic_book)
        db.flush()

    existing_emprunt = db.query(Emprunt).filter(
        (
            (Emprunt.id_user1 == assistant.id) & (Emprunt.id_user2 == request.target_user_id)
        ) | (
            (Emprunt.id_user1 == request.target_user_id) & (Emprunt.id_user2 == assistant.id)
        )
    ).filter(Emprunt.id_livre == generic_book.id).first()

    if existing_emprunt:
        emprunt = existing_emprunt
    else:
        emprunt = Emprunt(
            id_user1=assistant.id,
            id_user2=request.target_user_id,
            id_livre=generic_book.id,
            datetime=datetime.utcnow()
        )
        db.add(emprunt)
        db.flush()

    message_text = (
        f"📚 {current_user.name} {current_user.surname} veut échanger \"{request.book_title}\" avec toi"
    )

    metadata = {
        "type": "proposal",
        "proposer_id": current_user.id,
        "proposer_name": f"{current_user.name} {current_user.surname}",
        "proposer_email": current_user.email,
        "book_id": request.book_id,
        "book_title": request.book_title,
        "actions": [
            {"label": "Voir quel livre échanger", "value": "view_library", "style": "primary"},
            {"label": "Refuser", "value": "reject", "style": "danger"}
        ],
        "status": "pending"
    }

    message = Message(
        id_emprunt=emprunt.id,
        id_sender=assistant.id,
        message_text=message_text,
        is_read=0,
        message_metadata=metadata
    )
    db.add(message)

    db.commit()
    db.refresh(emprunt)

    return {
        "success": True,
        "message": "Proposition d'échange envoyée avec succès",
        "emprunt_id": emprunt.id,
        "target_user": {
            "id": target_user.id,
            "name": target_user.name,
            "surname": target_user.surname
        }
    }


@router.post("/propose-book-exchange", status_code=status.HTTP_201_CREATED)
def propose_book_exchange(
    request: ProposeBookExchangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user = db.query(User).filter(User.id == request.target_user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur cible non trouvé")

    if request.target_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas proposer un échange à vous-même")

    assistant_email = "assistant@livre2main.com"
    assistant = db.query(User).filter(User.email == assistant_email).first()

    if not assistant:
        raise HTTPException(status_code=404, detail="Assistant système non trouvé")

    generic_book_name = "Proposition d'échange"
    generic_book = db.query(Livre).filter(Livre.nom == generic_book_name).first()

    if not generic_book:
        raise HTTPException(status_code=404, detail="Livre générique non trouvé")

    existing_emprunt = db.query(Emprunt).filter(
        (
            (Emprunt.id_user1 == assistant.id) & (Emprunt.id_user2 == request.target_user_id)
        ) | (
            (Emprunt.id_user1 == request.target_user_id) & (Emprunt.id_user2 == assistant.id)
        )
    ).filter(Emprunt.id_livre == generic_book.id).first()

    if existing_emprunt:
        emprunt = existing_emprunt
    else:
        emprunt = Emprunt(
            id_user1=assistant.id,
            id_user2=request.target_user_id,
            id_livre=generic_book.id,
            datetime=datetime.utcnow()
        )
        db.add(emprunt)
        db.flush()

    message_text = (
        f"📚 {current_user.name} {current_user.surname} souhaite échanger le livre \"{request.book_title}\" avec vous !"
    )

    metadata = {
        "type": "book_proposal",
        "proposer_id": current_user.id,
        "proposer_name": f"{current_user.name} {current_user.surname}",
        "proposer_email": current_user.email,
        "book_id": request.book_id,
        "book_title": request.book_title,
        "actions": [
            {"label": "Accepter", "value": "accept", "style": "success"},
            {"label": "Refuser", "value": "reject", "style": "danger"}
        ],
        "status": "pending"
    }

    message = Message(
        id_emprunt=emprunt.id,
        id_sender=assistant.id,
        message_text=message_text,
        is_read=0,
        message_metadata=metadata
    )
    db.add(message)

    db.commit()
    db.refresh(emprunt)

    return {
        "success": True,
        "message": "Proposition d'échange de livre envoyée avec succès",
        "emprunt_id": emprunt.id,
        "book_title": request.book_title
    }
