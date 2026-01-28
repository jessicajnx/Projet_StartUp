from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Message, Emprunt, User
from schemas import (
    Message as MessageSchema, 
    MessageCreate, 
    MessageWithSender,
    ConversationSummary
)
from .user_routes import get_current_user
from sqlalchemy import or_, and_, desc

router = APIRouter(prefix="/messages", tags=["Messages"])


def check_user_in_emprunt(emprunt_id: int, user_id: int, db: Session) -> Emprunt:
    """Vérifie que l'utilisateur fait partie de l'emprunt"""
    emprunt = db.query(Emprunt).filter(Emprunt.id == emprunt_id).first()
    
    if not emprunt:
        raise HTTPException(status_code=404, detail="Emprunt non trouvé")
    
    if emprunt.id_user1 != user_id and emprunt.id_user2 != user_id:
        raise HTTPException(
            status_code=403, 
            detail="Vous n'êtes pas autorisé à accéder à cette conversation"
        )
    
    return emprunt


@router.get("/conversations", response_model=List[ConversationSummary])
def get_user_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère toutes les conversations de l'utilisateur connecté"""
    
    # Récupérer tous les emprunts où l'utilisateur est impliqué
    emprunts = db.query(Emprunt).filter(
        or_(
            Emprunt.id_user1 == current_user.id,
            Emprunt.id_user2 == current_user.id
        )
    ).all()
    
    conversations = []
    
    for emprunt in emprunts:
        # Déterminer l'autre utilisateur
        other_user_id = emprunt.id_user2 if emprunt.id_user1 == current_user.id else emprunt.id_user1
        other_user = db.query(User).filter(User.id == other_user_id).first()
        
        # Récupérer le dernier message
        last_message = db.query(Message).filter(
            Message.id_emprunt == emprunt.id
        ).order_by(desc(Message.datetime)).first()
        
        # Compter les messages non lus
        unread_count = db.query(Message).filter(
            and_(
                Message.id_emprunt == emprunt.id,
                Message.id_sender != current_user.id,
                Message.is_read == 0
            )
        ).count()
        
        conversations.append(ConversationSummary(
            id_emprunt=emprunt.id,
            other_user_id=other_user.id,
            other_user_name=other_user.name,
            other_user_surname=other_user.surname,
            livre_nom=emprunt.livre.nom,
            last_message=last_message.message_text if last_message else None,
            last_message_time=last_message.datetime if last_message else None,
            unread_count=unread_count
        ))
    
    # Trier par date du dernier message (les plus récents en premier)
    conversations.sort(
        key=lambda x: x.last_message_time if x.last_message_time else emprunt.datetime,
        reverse=True
    )
    
    return conversations


@router.get("/emprunt/{emprunt_id}", response_model=List[MessageWithSender])
def get_messages_for_emprunt(
    emprunt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère tous les messages d'un emprunt spécifique"""
    
    # Vérifier que l'utilisateur fait partie de l'emprunt
    emprunt = check_user_in_emprunt(emprunt_id, current_user.id, db)
    
    # Récupérer les messages
    messages = db.query(Message).filter(
        Message.id_emprunt == emprunt_id
    ).order_by(Message.datetime).all()
    
    # Marquer les messages reçus comme lus
    db.query(Message).filter(
        and_(
            Message.id_emprunt == emprunt_id,
            Message.id_sender != current_user.id,
            Message.is_read == 0
        )
    ).update({"is_read": 1})
    db.commit()
    
    # Construire la réponse avec les informations de l'expéditeur
    messages_with_sender = []
    for message in messages:
        sender = db.query(User).filter(User.id == message.id_sender).first()
        messages_with_sender.append(MessageWithSender(
            id=message.id,
            id_emprunt=message.id_emprunt,
            id_sender=message.id_sender,
            message_text=message.message_text,
            datetime=message.datetime,
            is_read=message.is_read,
            sender_name=sender.name,
            sender_surname=sender.surname
        ))
    
    return messages_with_sender


@router.post("/", response_model=MessageSchema, status_code=status.HTTP_201_CREATED)
def send_message(
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Envoie un nouveau message dans une conversation d'emprunt"""
    
    # Vérifier que l'utilisateur fait partie de l'emprunt
    check_user_in_emprunt(message.id_emprunt, current_user.id, db)
    
    # Vérifier que le message n'est pas vide
    if not message.message_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Le message ne peut pas être vide"
        )
    
    # Créer le message
    db_message = Message(
        id_emprunt=message.id_emprunt,
        id_sender=current_user.id,
        message_text=message.message_text.strip(),
        is_read=0
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    return db_message


@router.put("/{message_id}/read", response_model=MessageSchema)
def mark_message_as_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marque un message comme lu"""
    
    message = db.query(Message).filter(Message.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    
    # Vérifier que l'utilisateur fait partie de l'emprunt
    check_user_in_emprunt(message.id_emprunt, current_user.id, db)
    
    # Vérifier que l'utilisateur n'est pas l'expéditeur
    if message.id_sender == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Vous ne pouvez pas marquer votre propre message comme lu"
        )
    
    message.is_read = 1
    db.commit()
    db.refresh(message)
    
    return message


@router.get("/unread/count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère le nombre total de messages non lus pour l'utilisateur"""
    
    # Récupérer tous les emprunts où l'utilisateur est impliqué
    emprunts = db.query(Emprunt).filter(
        or_(
            Emprunt.id_user1 == current_user.id,
            Emprunt.id_user2 == current_user.id
        )
    ).all()
    
    emprunt_ids = [e.id for e in emprunts]
    
    # Compter les messages non lus
    unread_count = db.query(Message).filter(
        and_(
            Message.id_emprunt.in_(emprunt_ids),
            Message.id_sender != current_user.id,
            Message.is_read == 0
        )
    ).count()
    
    return {"unread_count": unread_count}