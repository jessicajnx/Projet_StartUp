from fastapi import APIRouter, Depends, HTTPException, status, Body, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Message, Emprunt, User, Livre, BibliothequePersonnelle
from schemas import (
    Message as MessageSchema,
    MessageCreate,
    MessageWithSender,
    ConversationSummary
)
from .user_routes import get_current_user
from sqlalchemy import or_, and_, desc, func
from datetime import datetime
from pydantic import BaseModel

router = APIRouter(prefix="/messages", tags=["Messages"])


class ProposalResponseData(BaseModel):
    selected_book_id: Optional[int] = None
    selected_book_title: Optional[str] = None

class ProposalResponse(BaseModel):
    response: str
    selected_book_id: Optional[int] = None
    selected_book_title: Optional[str] = None


def check_user_in_emprunt(emprunt_id: int, user_id: int, db: Session) -> Emprunt:
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
    if user.role.lower() == "premium":
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

        active_conversations = query.count()

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
    emprunts = db.query(Emprunt).filter(
        or_(
            Emprunt.id_user1 == current_user.id,
            Emprunt.id_user2 == current_user.id
        )
    ).all()

    conversations = []

    for emprunt in emprunts:
        other_user_id = emprunt.id_user2 if emprunt.id_user1 == current_user.id else emprunt.id_user1
        other_user = db.query(User).filter(User.id == other_user_id).first()

        last_message = db.query(Message).filter(
            Message.id_emprunt == emprunt.id
        ).order_by(desc(Message.datetime)).first()

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
    emprunt = check_user_in_emprunt(emprunt_id, current_user.id, db)

    messages = db.query(Message).filter(
        Message.id_emprunt == emprunt_id
    ).order_by(Message.datetime).all()

    db.query(Message).filter(
        and_(
            Message.id_emprunt == emprunt_id,
            Message.id_sender != current_user.id,
            Message.is_read == 0
        )
    ).update({"is_read": 1})
    db.commit()

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
    check_user_in_emprunt(message.id_emprunt, current_user.id, db)

    if not message.message_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Le message ne peut pas être vide"
        )

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
    message = db.query(Message).filter(Message.id == message_id).first()

    if not message:
        raise HTTPException(status_code=404, detail="Message non trouvé")

    check_user_in_emprunt(message.id_emprunt, current_user.id, db)

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
    emprunts = db.query(Emprunt).filter(
        or_(
            Emprunt.id_user1 == current_user.id,
            Emprunt.id_user2 == current_user.id
        )
    ).all()

    emprunt_ids = [e.id for e in emprunts]

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
    assistant = db.query(User).filter(User.email == "assistant@livre2main.com").first()
    assistant_id = assistant.id if assistant else None

    query = db.query(Emprunt).filter(
        or_(
            Emprunt.id_user1 == current_user.id,
            Emprunt.id_user2 == current_user.id
        )
    )

    if assistant_id:
        query = query.filter(
            and_(
                Emprunt.id_user1 != assistant_id,
                Emprunt.id_user2 != assistant_id
            )
        )

    active_conversations = query.count()

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
async def respond_to_proposal(
    message_id: int,
    data: ProposalResponse,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    response = data.response
    if response not in ["accept", "reject"]:
        raise HTTPException(status_code=400, detail="Réponse invalide. Utilisez 'accept' ou 'reject'")

    proposal_message = db.query(Message).filter(Message.id == message_id).first()

    if not proposal_message:
        raise HTTPException(status_code=404, detail="Message non trouvé")

    if not proposal_message.message_metadata or proposal_message.message_metadata.get("type") not in ["proposal", "book_proposal"]:
        raise HTTPException(status_code=400, detail="Ce message n'est pas une proposition")

    emprunt = db.query(Emprunt).filter(Emprunt.id == proposal_message.id_emprunt).first()
    if emprunt.id_user2 != current_user.id and emprunt.id_user1 != current_user.id:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à répondre à cette proposition")

    if proposal_message.message_metadata.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Cette proposition a déjà été traitée")

    assistant = db.query(User).filter(User.email == "assistant@livre2main.com").first()
    proposer_id = proposal_message.message_metadata["proposer_id"]
    proposer = db.query(User).filter(User.id == proposer_id).first()

    proposal_type = proposal_message.message_metadata.get("type")
    is_book_proposal = proposal_type == "book_proposal"

    real_emprunt = None
    if response == "accept":
        if proposal_type == "proposal" and data.selected_book_id:
            check_conversation_limit(current_user, db)
            check_conversation_limit(proposer, db)

            selected_biblio_book = db.query(BibliothequePersonnelle).filter(
                BibliothequePersonnelle.id == data.selected_book_id
            ).first()

            if not selected_biblio_book:
                raise HTTPException(status_code=404, detail="Livre sélectionné non trouvé dans votre bibliothèque")

            livre = db.query(Livre).filter(
                Livre.nom == selected_biblio_book.title
            ).first()

            if not livre:
                livre = Livre(
                    nom=selected_biblio_book.title,
                    auteur=", ".join(selected_biblio_book.authors) if selected_biblio_book.authors else "Auteur inconnu",
                    genre="Non spécifié"
                )
                db.add(livre)
                db.flush()

            real_emprunt = Emprunt(
                id_user1=proposer_id,
                id_user2=current_user.id,
                id_livre=livre.id,
                datetime=datetime.utcnow()
            )
            db.add(real_emprunt)
            db.flush()

            generic_book = db.query(Livre).filter(Livre.nom == "Proposition d'échange").first()

            if generic_book:
                user_emprunts = db.query(Emprunt).filter(
                    Emprunt.id_livre == generic_book.id,
                    or_(
                        and_(Emprunt.id_user1 == assistant.id, or_(Emprunt.id_user2 == current_user.id, Emprunt.id_user2 == proposer_id)),
                        and_(Emprunt.id_user2 == assistant.id, or_(Emprunt.id_user1 == current_user.id, Emprunt.id_user1 == proposer_id))
                    )
                ).all()

                emprunt_ids = [e.id for e in user_emprunts]

                if emprunt_ids:
                    related_proposals = db.query(Message).filter(
                        Message.id_emprunt.in_(emprunt_ids),
                        Message.id_sender == assistant.id,
                        func.json_extract(Message.message_metadata, '$.status') == '"pending"',
                        or_(
                            func.json_extract(Message.message_metadata, '$.type') == '"proposal"',
                            func.json_extract(Message.message_metadata, '$.type') == '"book_proposal"'
                        )
                    ).all()

                    for related in related_proposals:
                        related_metadata = related.message_metadata.copy()
                        related_metadata["status"] = "accepted"
                        related_metadata["final_acceptance_time"] = datetime.utcnow().isoformat()
                        related_metadata["selected_book_id"] = data.selected_book_id
                        related_metadata["selected_book_title"] = data.selected_book_title
                        related.message_metadata = related_metadata

        elif is_book_proposal:
            check_conversation_limit(current_user, db)
            check_conversation_limit(proposer, db)

            book_id = proposal_message.message_metadata.get("book_id")
            livre = None

            if book_id:
                livre = db.query(Livre).filter(Livre.id == book_id).first()

            if not livre:
                livre = db.query(Livre).filter(Livre.nom == "Proposition d'échange").first()

                if not livre:
                    livre = Livre(
                        nom="Proposition d'échange",
                        auteur="Système",
                        genre="Notification"
                    )
                    db.add(livre)
                    db.flush()

            real_emprunt = Emprunt(
                id_user1=proposer_id,
                id_user2=current_user.id,
                id_livre=livre.id,
                datetime=datetime.utcnow()
            )
            db.add(real_emprunt)
            db.flush()

            generic_book = db.query(Livre).filter(Livre.nom == "Proposition d'échange").first()

            if generic_book:
                user_emprunts = db.query(Emprunt).filter(
                    Emprunt.id_livre == generic_book.id,
                    or_(
                        and_(Emprunt.id_user1 == assistant.id, or_(Emprunt.id_user2 == current_user.id, Emprunt.id_user2 == proposer_id)),
                        and_(Emprunt.id_user2 == assistant.id, or_(Emprunt.id_user1 == current_user.id, Emprunt.id_user1 == proposer_id))
                    )
                ).all()

                emprunt_ids = [e.id for e in user_emprunts]

                if emprunt_ids:
                    related_proposals = db.query(Message).filter(
                        Message.id_emprunt.in_(emprunt_ids),
                        Message.id_sender == assistant.id,
                        func.json_extract(Message.message_metadata, '$.status') == '"pending"',
                        or_(
                            func.json_extract(Message.message_metadata, '$.type') == '"proposal"',
                            func.json_extract(Message.message_metadata, '$.type') == '"book_proposal"'
                        )
                    ).all()

                    for related in related_proposals:
                        related_metadata = related.message_metadata.copy()
                        related_metadata["status"] = "accepted"
                        related_metadata["final_acceptance_time"] = datetime.utcnow().isoformat()
                        related.message_metadata = related_metadata

    metadata = proposal_message.message_metadata.copy()
    metadata["status"] = "accepted" if response == "accept" else "rejected"
    metadata["responder_id"] = current_user.id
    metadata["response_time"] = datetime.utcnow().isoformat()
    if real_emprunt:
        metadata["real_emprunt_id"] = real_emprunt.id
    proposal_message.message_metadata = metadata

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

    book_title = metadata.get("book_title")
    selected_book_title = data.selected_book_title if data.selected_book_title else None
    is_book_proposal = metadata.get("type") == "book_proposal"

    if response == "accept":
        if selected_book_title:
            response_text = (
                f"✅ Échange confirmé !\n\n"
                f"📚 Vous recevez : \"{selected_book_title}\" (de {current_user.name} {current_user.surname})\n"
                f"📖 Vous donnez : \"{book_title}\"\n\n"
                f"Contact : {current_user.email}"
            )

            accepter_emprunt = db.query(Emprunt).filter(
                (
                    (Emprunt.id_user1 == assistant.id) & (Emprunt.id_user2 == current_user.id)
                ) | (
                    (Emprunt.id_user1 == current_user.id) & (Emprunt.id_user2 == assistant.id)
                )
            ).filter(Emprunt.id_livre == generic_book.id).first()

            if not accepter_emprunt:
                accepter_emprunt = Emprunt(
                    id_user1=assistant.id,
                    id_user2=current_user.id,
                    id_livre=generic_book.id,
                    datetime=datetime.utcnow()
                )
                db.add(accepter_emprunt)
                db.flush()

            accepter_message_text = (
                f"✅ Échange confirmé !\n\n"
                f"📚 Vous recevez : \"{book_title}\" (de {proposer.name} {proposer.surname})\n"
                f"📖 Vous donnez : \"{selected_book_title}\"\n\n"
                f"Contact : {proposer.email}"
            )

            accepter_message = Message(
                id_emprunt=accepter_emprunt.id,
                id_sender=assistant.id,
                message_text=accepter_message_text,
                is_read=0,
                message_metadata={
                    "type": "exchange_confirmed",
                    "other_user_id": proposer_id,
                    "other_user_name": f"{proposer.name} {proposer.surname}",
                    "other_user_email": proposer.email,
                    "book_received": book_title,
                    "book_given": selected_book_title
                }
            )
            db.add(accepter_message)

        elif is_book_proposal and book_title:
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
        if selected_book_title:
            response_metadata["selected_book_title"] = selected_book_title
            response_metadata["book_given"] = book_title
            response_metadata["book_received"] = selected_book_title
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

    if response == "accept" and real_emprunt:
        result["emprunt_id"] = real_emprunt.id

    return result
