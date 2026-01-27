from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, BlockedEmail
from schemas import UserCreate, User as UserSchema, UserLogin, Token
from auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    blocked = db.query(BlockedEmail).filter(BlockedEmail.email == user.email).first()
    if blocked:
        raise HTTPException(status_code=403, detail="Adresse email bloquée après une précédente tentative")

    if user.age < 12:
        existing_block = blocked or db.query(BlockedEmail).filter(BlockedEmail.email == user.email).first()
        if not existing_block:
            blocked_email = BlockedEmail(email=user.email, reason="Tentative d'inscription avec moins de 12 ans")
            db.add(blocked_email)
            db.commit()
        raise HTTPException(status_code=400, detail="Compte impossible pour les moins de 12 ans (adresse bloquée)")

    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email déjà enregistré")
    
    hashed_password = get_password_hash(user.mdp)
    db_user = User(
        name=user.name,
        surname=user.surname,
        email=user.email,
        villes=user.villes,
        age=user.age,
        role=user.role,
        mdp=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == user_credentials.email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email non trouvé",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not verify_password(user_credentials.mdp, user.mdp):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Mot de passe incorrect",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur serveur: {str(e)}"
        )
