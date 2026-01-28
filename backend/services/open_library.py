import requests
from sqlalchemy.orm import Session
from models import Livre
import time

def import_popular_books(db: Session, limit: int = 1000):
    """
    Importe les livres populaires depuis Open Library API.
    Limite à 1000 livres par défaut.
    """
    print(f"🔄 Début de l'import de {limit} livres depuis Open Library...")
    
    # Vérifier si des livres existent déjà
    existing_count = db.query(Livre).count()
    if existing_count > 0:
        print(f"✅ {existing_count} livres déjà présents dans la base de données. Import annulé.")
        return
    
    imported_count = 0
    books_per_page = 100
    
    # API Open Library pour rechercher des livres populaires
    # On utilise des sujets populaires pour obtenir des livres variés
    subjects = ["fiction", "science", "history", "biography", "fantasy", "romance", "thriller", "mystery", "adventure", "classics", 
                "philosophy", "art", "poetry", "drama", "horror", "humor", "religion", "science_fiction", "crime", "psychology"]
    
    try:
        subject_index = 0
        offset = 0
        max_retries = 3
        
        while imported_count < limit:
            subject = subjects[subject_index % len(subjects)]
            
            # Utiliser offset pour paginer à travers plus de résultats
            url = f"https://openlibrary.org/subjects/{subject}.json?limit={books_per_page}&offset={offset}"
            
            retry_count = 0
            while retry_count < max_retries:
                try:
                    response = requests.get(url, timeout=15)
                    response.raise_for_status()
                    data = response.json()
                    
                    works = data.get("works", [])
                    
                    if not works:
                        # Pas plus de livres pour ce sujet/offset, passer au suivant
                        break
                    
                    for work in works:
                        if imported_count >= limit:
                            break
                        
                        # Extraire les informations du livre
                        title = work.get("title", "Titre inconnu")
                        authors = work.get("authors", [])
                        author_name = authors[0].get("name", "Auteur inconnu") if authors else "Auteur inconnu"
                        
                        # Vérifier si le livre existe déjà (par titre et auteur)
                        existing = db.query(Livre).filter(
                            Livre.nom == title,
                            Livre.auteur == author_name
                        ).first()
                        
                        if not existing:
                            # Créer le nouveau livre
                            new_book = Livre(
                                nom=title,
                                auteur=author_name,
                                genre=subject.capitalize().replace("_", " ")
                            )
                            db.add(new_book)
                            imported_count += 1
                            
                            # Commit par batch de 50 pour optimiser
                            if imported_count % 50 == 0:
                                db.commit()
                                print(f"📚 {imported_count}/{limit} livres importés...")
                    
                    # Petit délai pour ne pas surcharger l'API
                    time.sleep(0.5)
                    break  # Succès, sortir de la boucle de retry
                    
                except requests.RequestException as e:
                    retry_count += 1
                    if retry_count >= max_retries:
                        print(f"⚠️ Erreur après {max_retries} tentatives pour {subject} (offset {offset}): {e}")
                    else:
                        print(f"⚠️ Erreur, nouvelle tentative ({retry_count}/{max_retries})...")
                        time.sleep(2)
            
            # Passer au sujet/offset suivant
            subject_index += 1
            if subject_index % len(subjects) == 0:
                offset += books_per_page
        
        # Commit final
        db.commit()
        print(f"✅ Import terminé ! {imported_count} livres ajoutés à la base de données.")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur lors de l'import : {e}")
        raise
