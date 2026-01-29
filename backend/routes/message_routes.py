from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Message, Emprunt, User, Livre
from schemas import (
    Message as MessageSchema,
    MessageCreate,
    MessageWithSender,
    ConversationSummary
)
from .user_routes import get_current_user
from sqlalchemy import or_, and_, desc, func
from datetime import datetime

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


def check_conversation_limit(user: User, db: Session) -> None:
    """
    Vérifie si l'utilisateur a atteint sa limite de conversations.
    Les utilisateurs avec le rôle 'Pauvre' sont limités à 1 échange/conversation réelle à la fois.
    Les utilisateurs 'Premium' n'ont pas de limite.
    Les conversations avec l'Assistant système ne comptent PAS dans la limite.
    """
    # Si l'utilisateur est premium, pas de limite
    if user.role.lower() == "premium":
        return
    
    # Pour les utilisateurs 'Pauvre', vérifier le nombre de conversations actives
    if user.role.lower() == "pauvre":
        # Récupérer l'ID de l'Assistant (ne compte pas dans la limite)
        assistant = db.query(User).filter(User.email == "assistant@livre2main.com").first()
        assistant_id = assistant.id if assistant else None
        
        # Compter le nombre de conversations actives RÉELLES (sans l'Assistant)
        query = db.query(Emprunt).filter(
            or_(
                Emprunt.id_user1 == user.id,
                Emprunt.id_user2 == user.id
            )
        )
        
        # Exclure les conversations avec l'Assistant
        if assistant_id:
            query = query.filter(
                and_(
                    Emprunt.id_user1 != assistant_id,
                    Emprunt.id_user2 != assistant_id
                )
            )
        
        active_conversations = query.count()
        
        # Limite à 1 conversation réelle pour les utilisateurs pauvres
        if active_conversations >= 1:
            raise HTTPException(
                status_code=403,
                detail="Limite de conversations atteinte. Les utilisateurs gratuits sont limités à 1 échange actif à la fois. Passez à Premium pour des échanges illimités."
            )
    
    return


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
            message_metadata=message.message_metadata,
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


@router.get("/conversation-limit")
def get_conversation_limit_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupère le statut de limite de conversations de l'utilisateur.
    Retourne le nombre d'échanges réels actifs (sans l'Assistant), la limite et si l'utilisateur peut créer un nouvel échange.
    """
    # Récupérer l'ID de l'Assistant (ne compte pas dans la limite)
    assistant = db.query(User).filter(User.email == "assistant@livre2main.com").first()
    assistant_id = assistant.id if assistant else None
    
    # Compter le nombre de conversations actives RÉELLES (sans l'Assistant)
    query = db.query(Emprunt).filter(
        or_(
            Emprunt.id_user1 == current_user.id,
            Emprunt.id_user2 == current_user.id
        )
    )
    
    # Exclure les conversations avec l'Assistant
    if assistant_id:
        query = query.filter(
            and_(
                Emprunt.id_user1 != assistant_id,
                Emprunt.id_user2 != assistant_id
            )
        )
    
    active_conversations = query.count()
    
    # Déterminer la limite selon le rôle
    is_premium = current_user.role.lower() == "premium"
    limit = None if is_premium else 1
    can_create_new = is_premium or active_conversations < 1
    
    return {
        "role": current_user.role,
        "is_premium": is_premium,
        "active_conversations": active_conversations,
        "limit": limit,
        "can_create_new_conversation": can_create_new,
        "message": "Illimité" if is_premium else f"{active_conversations}/{limit} échange(s) utilisé(s)"
    }


@router.post("/proposal/{message_id}/respond")
def respond_to_proposal(
    message_id: int,
    response: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Répond à une proposition d'échange (accepter ou refuser)
    response: "accept" ou "reject"
    """
    # Vérifier que la réponse est valide
    if response not in ["accept", "reject"]:
        raise HTTPException(status_code=400, detail="Réponse invalide. Utilisez 'accept' ou 'reject'")

    # Récupérer le message de proposition
    proposal_message = db.query(Message).filter(Message.id == message_id).first()

    if not proposal_message:
        raise HTTPException(status_code=404, detail="Message non trouvé")

    # Vérifier que c'est bien une proposition
    if not proposal_message.message_metadata or proposal_message.message_metadata.get("type") not in ["proposal", "book_proposal"]:
        raise HTTPException(status_code=400, detail="Ce message n'est pas une proposition")

    # Vérifier que l'utilisateur est le destinataire
    emprunt = db.query(Emprunt).filter(Emprunt.id == proposal_message.id_emprunt).first()
    if emprunt.id_user2 != current_user.id and emprunt.id_user1 != current_user.id:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à répondre à cette proposition")

    # Vérifier que la proposition n'a pas déjà été traitée
    if proposal_message.message_metadata.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Cette proposition a déjà été traitée")

    # Récupérer l'Assistant et le proposant
    assistant = db.query(User).filter(User.email == "assistant@livre2main.com").first()
    proposer_id = proposal_message.message_metadata["proposer_id"]
    proposer = db.query(User).filter(User.id == proposer_id).first()

    # Déterminer le type de proposition
    proposal_type = proposal_message.message_metadata.get("type")
    is_book_proposal = proposal_type == "book_proposal"
    
    # Si l'utilisateur accepte, créer l'emprunt réel UNIQUEMENT pour book_proposal (étape 3)
    # Pour "proposal" (étape 2), on crée juste un emprunt avec l'assistant
    real_emprunt = None
    if response == "accept":
        if is_book_proposal:
            # ÉTAPE 3 : Acceptation finale d'une proposition de livre spécifique
            # C'est ici qu'on crée l'échange RÉEL et qu'on vérifie les limites
            check_conversation_limit(current_user, db)
            check_conversation_limit(proposer, db)
            
            # Récupérer le livre pour l'échange
            book_id = proposal_message.message_metadata.get("book_id")
            livre = None
            
            if book_id:
                # Essayer de récupérer le livre spécifique
                livre = db.query(Livre).filter(Livre.id == book_id).first()
            
            if not livre:
                # Fallback : utiliser le livre générique ou le créer
                livre = db.query(Livre).filter(Livre.nom == "Proposition d'échange").first()
                
                if not livre:
                    # Créer le livre générique s'il n'existe pas
                    livre = Livre(
                        nom="Proposition d'échange",
                        auteur="Système",
                        genre="Notification"
                    )
                    db.add(livre)
                    db.flush()
            
            # Créer l'emprunt réel entre le proposant et l'accepteur
            real_emprunt = Emprunt(
                id_user1=proposer_id,
                id_user2=current_user.id,
                id_livre=livre.id,
                datetime=datetime.utcnow()
            )
            db.add(real_emprunt)
            db.flush()
            
            # Trouver et mettre à jour TOUTES les propositions liées entre les deux utilisateurs
            # Récupérer le livre générique pour identifier les emprunts de propositions
            generic_book = db.query(Livre).filter(Livre.nom == "Proposition d'échange").first()
            
            if generic_book:
                # Récupérer tous les emprunts avec l'assistant pour ces deux utilisateurs
                user_emprunts = db.query(Emprunt).filter(
                    Emprunt.id_livre == generic_book.id,
                    or_(
                        and_(Emprunt.id_user1 == assistant.id, or_(Emprunt.id_user2 == current_user.id, Emprunt.id_user2 == proposer_id)),
                        and_(Emprunt.id_user2 == assistant.id, or_(Emprunt.id_user1 == current_user.id, Emprunt.id_user1 == proposer_id))
                    )
                ).all()
                
                emprunt_ids = [e.id for e in user_emprunts]
                
                if emprunt_ids:
                    # Trouver tous les messages de propositions en attente dans ces emprunts
                    related_proposals = db.query(Message).filter(
                        Message.id_emprunt.in_(emprunt_ids),
                        Message.id_sender == assistant.id,
                        func.json_extract(Message.message_metadata, '$.status') == '"pending"',
                        or_(
                            func.json_extract(Message.message_metadata, '$.type') == '"proposal"',
                            func.json_extract(Message.message_metadata, '$.type') == '"book_proposal"'
                        )
                    ).all()
                    
                    # Marquer toutes les propositions liées comme acceptées
                    for related in related_proposals:
                        related_metadata = related.message_metadata.copy()
                        related_metadata["status"] = "accepted"
                        related_metadata["final_acceptance_time"] = datetime.utcnow().isoformat()
                        related.message_metadata = related_metadata
            
        # Si c'est juste "proposal" (étape 2), on ne crée rien ici, c'est géré ailleurs

    # Mettre à jour le statut de la proposition
    metadata = proposal_message.message_metadata.copy()
    metadata["status"] = "accepted" if response == "accept" else "rejected"
    metadata["responder_id"] = current_user.id
    metadata["response_time"] = datetime.utcnow().isoformat()
    if real_emprunt:
        metadata["real_emprunt_id"] = real_emprunt.id
    proposal_message.message_metadata = metadata

    # Créer ou récupérer la conversation entre l'Assistant et le proposant
    generic_book = db.query(Livre).filter(Livre.nom == "Proposition d'échange").first()

    proposer_emprunt = db.query(Emprunt).filter(
        (
            (Emprunt.id_user1 == assistant.id) & (Emprunt.id_user2 == proposer_id)
        ) | (
            (Emprunt.id_user1 == proposer_id) & (Emprunt.id_user2 == assistant.id)
        )
    ).filter(Emprunt.id_livre == generic_book.id).first()

    if not proposer_emprunt:
        proposer_emprunt = Emprunt(
            id_user1=assistant.id,
            id_user2=proposer_id,
            id_livre=generic_book.id,
            datetime=datetime.utcnow()
        )
        db.add(proposer_emprunt)
        db.flush()

    # Envoyer un message à l'expéditeur
    book_title = metadata.get("book_title")
    is_book_proposal = metadata.get("type") == "book_proposal"

    if response == "accept":
        if is_book_proposal and book_title:
            response_text = (
                f"{current_user.name} {current_user.surname} a accepté votre proposition d'échange pour le livre \"{book_title}\" ! "
                f"Vous pouvez le contacter à l'adresse : {current_user.email}"
            )
        else:
            response_text = (
                f"{current_user.name} {current_user.surname} a accepté votre proposition d'échange ! "
                f"Vous pouvez le contacter à l'adresse : {current_user.email}"
            )
        response_metadata = {
            "type": "proposal_accepted",
            "accepter_id": current_user.id,
            "accepter_name": f"{current_user.name} {current_user.surname}",
            "accepter_email": current_user.email
        }
    else:
        if is_book_proposal and book_title:
            response_text = (
                f"{current_user.name} {current_user.surname} a refusé votre proposition d'échange pour le livre \"{book_title}\"."
            )
        else:
            response_text = (
                f"{current_user.name} {current_user.surname} a refusé votre proposition d'échange."
            )
        response_metadata = {
            "type": "proposal_rejected",
            "rejecter_id": current_user.id
        }

    response_message = Message(
        id_emprunt=proposer_emprunt.id,
        id_sender=assistant.id,
        message_text=response_text,
        is_read=0,
        message_metadata=response_metadata
    )
    db.add(response_message)

    db.commit()
    db.refresh(proposal_message)

    result = {
        "success": True,
        "response": response,
        "message": "Réponse enregistrée avec succès",
        "redirect_to_profile": proposer.id if response == "accept" else None
    }
    
    # Ajouter l'ID de l'emprunt réel si l'échange a été accepté
    if response == "accept" and real_emprunt:
        result["emprunt_id"] = real_emprunt.id
    
    return result