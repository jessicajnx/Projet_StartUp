from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from auth import SECRET_KEY, ALGORITHM
from sqlalchemy.orm import Session
from database import get_db
from models import User

router = APIRouter(prefix="/api", tags=["API"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@router.get("/me/city")
def get_my_city(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()

    if not user or not user.villes:
        raise HTTPException(status_code=404, detail="City not found")

    return {"city": user.villes}

@router.get("/users-cities")
def get_users_cities(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.email != "assistant@livre2main.com").all()

    result = []
    for user in users:
        personal_books = []
        for book in user.personal_books:
            personal_books.append({
                "id": book.id,
                "title": book.title,
                "source_id": book.source_id,
                "authors": book.authors,
                "cover_url": book.cover_url,
            })

        result.append({
            "ID": user.id,
            "Name": user.name,
            "Surname": user.surname,
            "Villes": user.villes,
            "bibliotheque_personnelle": personal_books
        })

    return result
