from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import User
from schemas import User as UserSchema, UserUpdate
from auth import decode_token, create_access_token
from pydantic import BaseModel
from datetime import timedelta
import secrets

router = APIRouter(prefix="/users", tags=["Users"])

# Stockage temporaire des tokens de paiement (en production, utiliser Redis)
payment_tokens = {}

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
    
    return user

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Accès refusé: Admin requis")
    return current_user

@router.get("/me", response_model=UserSchema)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/me/livres", response_model=List)
def get_current_user_livres(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from schemas import Livre as LivreSchema
    user = db.query(User).filter(User.id == current_user.id).first()
    return user.livres

@router.put("/me", response_model=UserSchema)
def update_current_user(user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Permet à un utilisateur de modifier son propre profil"""
    update_data = user_update.dict(exclude_unset=True)
    
    # Hash du mot de passe si fourni
    if "mdp" in update_data and update_data["mdp"]:
        from auth import get_password_hash
        update_data["mdp"] = get_password_hash(update_data["mdp"])
    
    # Empêcher la modification du rôle par un utilisateur normal
    if "role" in update_data and current_user.role != "Admin":
        del update_data["role"]
    
    for key, value in update_data.items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/", response_model=List[UserSchema])
def get_all_users(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    users = db.query(User).all()
    return users

@router.get("/profile/{user_id}", response_model=UserSchema)
def get_user_profile(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Récupère les informations publiques d'un utilisateur par son ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user

@router.get("/{user_id}", response_model=UserSchema)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    """Route admin pour récupérer un utilisateur par son ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user

@router.put("/{user_id}", response_model=UserSchema)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    update_data = user_update.dict(exclude_unset=True)

    if "mdp" in update_data:
        from auth import get_password_hash
        update_data["mdp"] = get_password_hash(update_data["mdp"])

    for key, value in update_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    db.delete(user)
    db.commit()
    return None

@router.get("/ville/{ville}", response_model=List[UserSchema])
def get_users_by_ville(ville: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = db.query(User).filter(User.villes.like(f"%{ville}%")).all()
    return users

@router.get("/admin/users-report", response_model=List[UserSchema])
def get_users_by_report(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    """Récupère tous les users triés par nombre de signalements (décroissant)"""
    users = db.query(User).order_by(User.signalement.desc()).all()
    return users


# Modèles pour le paiement
class PaymentTokenRequest(BaseModel):
    pass

class PaymentTokenResponse(BaseModel):
    payment_token: str
    expires_in: int

class UpgradePremiumRequest(BaseModel):
    payment_token: str


@router.post("/request-payment-token", response_model=PaymentTokenResponse)
def request_payment_token(current_user: User = Depends(get_current_user)):
    """
    Génère un token de paiement temporaire valide pendant 5 minutes.
    Ce token doit être utilisé pour valider le paiement premium.
    """
    # Vérifier si l'utilisateur n'est pas déjà premium
    if current_user.role.lower() in ["riche", "premium"]:
        raise HTTPException(status_code=400, detail="Vous avez déjà l'abonnement Premium")

    # Générer un token unique
    payment_token = secrets.token_urlsafe(32)

    # Stocker le token avec l'ID utilisateur et une expiration (5 minutes)
    from datetime import datetime, timedelta
    payment_tokens[payment_token] = {
        "user_id": current_user.id,
        "expires_at": datetime.utcnow() + timedelta(minutes=5)
    }

    return {
        "payment_token": payment_token,
        "expires_in": 300  # 5 minutes en secondes
    }


@router.post("/upgrade-premium", response_model=UserSchema)
def upgrade_to_premium(
    request: UpgradePremiumRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upgrade l'utilisateur vers le rôle Premium/Riche après validation du token de paiement.
    Cette route est appelée après le traitement du paiement.
    """
    # Vérifier si le token existe
    if request.payment_token not in payment_tokens:
        raise HTTPException(status_code=400, detail="Token de paiement invalide")

    token_data = payment_tokens[request.payment_token]

    # Vérifier si le token a expiré
    from datetime import datetime
    if datetime.utcnow() > token_data["expires_at"]:
        del payment_tokens[request.payment_token]
        raise HTTPException(status_code=400, detail="Token de paiement expiré")

    # Vérifier que le token appartient bien à l'utilisateur actuel
    if token_data["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Token de paiement invalide pour cet utilisateur")

    # Vérifier si l'utilisateur n'est pas déjà premium
    if current_user.role.lower() in ["riche", "premium"]:
        del payment_tokens[request.payment_token]
        raise HTTPException(status_code=400, detail="Vous avez déjà l'abonnement Premium")

    # Upgrade le rôle à Riche
    current_user.role = "Riche"
    db.commit()
    db.refresh(current_user)

    # Supprimer le token après utilisation
    del payment_tokens[request.payment_token]

    return current_user
