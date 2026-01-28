from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import Optional, List
import base64
import requests
import os
from io import BytesIO
from PIL import Image
from database import get_db
from models import Livre, User, BibliothequePersonnelle
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
            "prompt": """Tu es un expert en reconnaissance optique de caractères (OCR). Analyse cette image avec la plus grande PRÉCISION.

TÂCHE : Identifie chaque livre visible et extrais :
1. Le TITRE EXACT - chaque mot, chaque article (le, la, l', un, une, etc.)
2. L'AUTEUR COMPLET - prénom et nom exacts

RÈGLES STRICTES :
- Lis lettre par lettre, ne devine JAMAIS
- Respecte TOUS les articles : "l'" reste "l'", "la" reste "la"
- Respecte TOUTE la ponctuation et les majuscules
- Si plusieurs livres : liste-les TOUS dans l'ordre
- Vérifie deux fois chaque mot avant de répondre

Format JSON obligatoire :
{
  "livres": [
    {"titre": "titre exact lettre par lettre", "auteur": "prénom nom exact"}
  ]
}

RÉPONDS UNIQUEMENT avec le JSON.""",
            "images": [img_base64],
            "stream": False,
            "options": {
                "temperature": 0.01,
                "num_predict": 500,
                "top_p": 0.8,
                "top_k": 20,
                "repeat_penalty": 1.1
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
            
            # Support pour plusieurs livres
            livres_detectes = book_info.get("livres", [])
            
            if not livres_detectes:
                # Fallback si l'ancien format est utilisé
                if "titre" in book_info:
                    livres_detectes = [{
                        "titre": book_info.get("titre", "Titre inconnu"),
                        "auteur": book_info.get("auteur", "Auteur inconnu")
                    }]
            
            # Formater les résultats
            result_data = {
                "livres": [
                    {
                        "nom": livre.get("titre", "Titre inconnu"),
                        "auteur": livre.get("auteur", "Auteur inconnu")
                    }
                    for livre in livres_detectes
                ]
            }
            
            print(f"✅ Analyse réussie: {len(result_data['livres'])} livre(s) détecté(s)")
            print(f"Détails: {result_data}")
            return result_data
        else:
            error_msg = f"Erreur Ollama: {response.status_code} - {response.text}"
            print(f"❌ {error_msg}")
            raise Exception(error_msg)
            
    except Exception as e:
        print(f"❌ Erreur lors de l'analyse: {e}")
        # Retourner l'erreur au lieu du mode simulation
        return {
            "livres": [{
                "nom": "Erreur d'analyse",
                "auteur": "Erreur d'analyse"
            }],
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


@router.post("/add-detected-book")
async def add_detected_book(
    nom: str,
    auteur: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Ajoute un livre détecté par IA à la bibliothèque personnelle de l'utilisateur
    """
    # Vérifier si le livre existe déjà dans la bibliothèque personnelle
    existing_book = db.query(BibliothequePersonnelle).filter(
        BibliothequePersonnelle.user_id == current_user.id,
        BibliothequePersonnelle.title == nom
    ).first()
    
    if existing_book:
        raise HTTPException(status_code=400, detail="Ce livre est déjà dans votre bibliothèque")
    
    # Ajouter à la bibliothèque personnelle
    new_book = BibliothequePersonnelle(
        user_id=current_user.id,
        title=nom,
        authors=[auteur],
        source="ai_detection",
        source_id=None
    )
    
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    
    return {
        "success": True,
        "message": "Livre ajouté à votre bibliothèque",
        "book": {
            "id": new_book.id,
            "title": new_book.title,
            "authors": new_book.authors,
            "source": new_book.source
        }
    }
