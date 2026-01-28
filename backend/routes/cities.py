from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from auth import SECRET_KEY, ALGORITHM
import pymysql

router = APIRouter(prefix="/api", tags=["API"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@router.get("/me/city")
def get_my_city(token: str = Depends(oauth2_scheme)):
    """
    Retourne la ville de l'utilisateur connecté (via JWT).
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    connection = pymysql.connect(
        host="127.0.0.1",
        user="root",
        password="",
        db="projet_startup",
        cursorclass=pymysql.cursors.DictCursor,
    )

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT Villes FROM `user` WHERE Email = %s",
                (email,),
            )
            user = cursor.fetchone()
    finally:
        connection.close()

    if not user or not user["Villes"]:
        raise HTTPException(status_code=404, detail="City not found")

    return {"city": user["Villes"]}

@router.get("/users-cities")
def get_users_cities():
    """
    Retourne la liste des utilisateurs avec leurs villes pour la carte.
    """
    connection = pymysql.connect(
        host="127.0.0.1",
        user="root",
        password="",
        db="projet_startup",
        cursorclass=pymysql.cursors.DictCursor,
    )
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT ID, Name, Surname, Villes FROM `user`")
            users = cursor.fetchall()
    finally:
        connection.close()

    return users
