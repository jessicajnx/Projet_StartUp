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


# Configuration pour LLaVA via Ollama local
OLLAMA_API_URL = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
LLAVA_MODEL = os.getenv("LLAVA_MODEL", "llava:13b")

def analyze_book_image(image_data: bytes) -> dict:
    """
    Analyse une image de livre avec LLaVA Vision via Ollama pour extraire les informations
    """
    import json
    
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
        
        print(f"\n=== Analyse d'image avec {LLAVA_MODEL} ===")
        
        # Utiliser LLaVA via Ollama local avec un prompt optimisé
        payload = {
            "model": LLAVA_MODEL,
            "prompt": """Regarde attentivement cette image de couverture de livre. Je veux que tu identifies :
1. Le titre exact du livre (tel qu'écrit sur la couverture)
2. Le nom de l'auteur (tel qu'écrit sur la couverture)
3. Le genre littéraire du livre

Réponds UNIQUEMENT avec un objet JSON dans ce format exact :
{
  "titre": "le titre exact du livre",
  "auteur": "le nom exact de l'auteur",
  "genre": "le genre"
}

Ne réponds qu'avec le JSON, rien d'autre.""",
            "images": [img_base64],
            "stream": False,
            "options": {
                "temperature": 0.1,
                "num_predict": 200
            }
        }
        
        # Appel à Ollama
        print(f"Envoi de la requête à {OLLAMA_API_URL}/api/generate...")
        response = requests.post(
            f"{OLLAMA_API_URL}/api/generate",
            json=payload,
            timeout=120
        )
        
        print(f"Statut de la réponse: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            content = result.get("response", "")
            
            print(f"Réponse brute de LLaVA:\n{content}\n")
            
            # Nettoyer la réponse pour extraire uniquement le JSON
            content = content.strip()
            
            # Essayer de trouver le JSON dans la réponse
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            # Trouver les accolades
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            if start_idx != -1 and end_idx > start_idx:
                content = content[start_idx:end_idx]
            
            print(f"JSON extrait: {content}")
            
            book_info = json.loads(content)
            result_data = {
                "nom": book_info.get("titre", "Titre inconnu"),
                "auteur": book_info.get("auteur", "Auteur inconnu"),
                "genre": book_info.get("genre", "Non classifié")
            }
            print(f"✅ Analyse réussie: {result_data}")
            return result_data
        else:
            error_msg = f"Erreur Ollama: {response.status_code} - {response.text}"
            print(f"❌ {error_msg}")
            raise Exception(error_msg)
            
    except Exception as e:
        print(f"❌ Erreur lors de l'analyse: {e}")
        # Retourner l'erreur au lieu du mode simulation
        return {
            "nom": "Erreur d'analyse",
            "auteur": "Erreur d'analyse",
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
