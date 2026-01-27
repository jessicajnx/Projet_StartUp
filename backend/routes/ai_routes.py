from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import Optional
import base64
import requests
import os
from io import BytesIO
from PIL import Image
from database import get_db
from models import Livre, User
from schemas import Livre as LivreSchema
from routes.user_routes import get_current_user

router = APIRouter(prefix="/ai", tags=["AI"])

# Configuration pour Qwen (via API compatible OpenAI)
#QWEN_API_KEY = os.getenv("QWEN_API_KEY", "")
QWEN_API_KEY="k_343895f567de.cMJvja0uijI9y3SN5GnnOz4XSDobjfXlF-d-JL7Ugue5ahnRD3neEw"
QWEN_API_URL = os.getenv("QWEN_API_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")

def analyze_book_image(image_data: bytes) -> dict:
    """
    Analyse une image de livre avec Qwen Vision pour extraire les informations
    """
    try:
        # Convertir l'image en base64
        image = Image.open(BytesIO(image_data))
        
        # Redimensionner si nécessaire pour réduire la taille
        max_size = (1024, 1024)
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Convertir en base64
        buffered = BytesIO()
        image.save(buffered, format="JPEG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        # Utiliser Qwen via API compatible OpenAI
        headers = {
            "Authorization": f"Bearer {QWEN_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "qwen-vl-plus",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{img_base64}"
                            }
                        },
                        {
                            "type": "text",
                            "text": """Analyse cette image de livre et extrais les informations suivantes au format JSON exact :
{
  "titre": "titre du livre",
  "auteur": "nom de l'auteur",
  "genre": "genre littéraire"
}

Si tu ne peux pas identifier certaines informations, utilise null. Réponds UNIQUEMENT avec le JSON, rien d'autre."""
                        }
                    ]
                }
            ],
            "max_tokens": 500,
            "temperature": 0.1
        }
        
        if QWEN_API_KEY and len(QWEN_API_KEY) > 10:
            try:
                response = requests.post(
                    f"{QWEN_API_URL}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result.get("choices", [{}])[0].get("message", {}).get("content", "{}")
                    
                    # Parser le JSON de la réponse
                    import json
                    try:
                        # Nettoyer la réponse pour extraire uniquement le JSON
                        content = content.strip()
                        if "```json" in content:
                            content = content.split("```json")[1].split("```")[0].strip()
                        elif "```" in content:
                            content = content.split("```")[1].split("```")[0].strip()
                        
                        book_info = json.loads(content)
                        return {
                            "nom": book_info.get("titre", "Titre inconnu"),
                            "auteur": book_info.get("auteur", "Auteur inconnu"),
                            "genre": book_info.get("genre", "Non classifié")
                        }
                    except json.JSONDecodeError:
                        # Fallback au mode simulation
                        pass
                else:
                    # Erreur API - fallback au mode simulation
                    print(f"Erreur API: {response.status_code} - Passage en mode simulation")
            except Exception as api_error:
                # Erreur réseau ou autre - fallback au mode simulation
                print(f"Erreur connexion API: {api_error} - Passage en mode simulation")
        
        # Mode simulation GRATUIT - fonctionne toujours !
        import random
        livres_simulation = [
            {"nom": "Le Petit Prince", "auteur": "Antoine de Saint-Exupéry", "genre": "Conte philosophique"},
            {"nom": "1984", "auteur": "George Orwell", "genre": "Science-fiction"},
            {"nom": "Harry Potter à l'école des sorciers", "auteur": "J.K. Rowling", "genre": "Fantasy"},
            {"nom": "L'Étranger", "auteur": "Albert Camus", "genre": "Roman philosophique"},
            {"nom": "Les Misérables", "auteur": "Victor Hugo", "genre": "Roman historique"},
        ]
        livre = random.choice(livres_simulation)
        return {
            "nom": livre["nom"],
            "auteur": livre["auteur"],
            "genre": livre["genre"],
<<<<<<< HEAD
            "note": "Mode simulation GRATUIT - Modifiez les infos si nécessaire avant d'ajouter"
=======
            "note":  'Mode simulation'
            "note": "Mode simulation GRATUIT - Modifiez les infos si nécessaire avant d'ajouter"e: {e}")
        return {
            "nom": "Erreur détection",
            "auteur": "Erreur détection",
            "genre": "Non classifié",
            "error": str(e)
        }


@router.post("/analyze-book")
async def analyze_book(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyse une image de livre et retourne les informations détectées
    """
    # Vérifier que c'est bien une image
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Le fichier doit être une image")
    
    # Lire l'image
    image_data = await file.read()
    
    # Analyser avec l'IA Vision
    book_info = analyze_book_image(image_data)
    
    return {
        "success": True,
        "book_info": book_info
    }


@router.post("/add-detected-book", response_model=LivreSchema)
async def add_detected_book(
    nom: str,
    auteur: str,
    genre: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Ajoute un livre détecté par IA à la bibliothèque de l'utilisateur
    """
    # Créer le livre
    livre = Livre(nom=nom, auteur=auteur, genre=genre)
    db.add(livre)
    db.commit()
    db.refresh(livre)
    
    # Assigner le livre à l'utilisateur
    user = db.query(User).filter(User.id == current_user.id).first()
    if user:
        user.livres.append(livre)
        db.commit()
    
    return livre
