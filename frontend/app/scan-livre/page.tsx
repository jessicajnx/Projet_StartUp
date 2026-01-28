'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import api from '@/lib/api';

interface BookInfo {
  nom: string;
  auteur: string;
  error?: string;
}

interface AnalyzeResponse {
  success: boolean;
  book_info: {
    livres: BookInfo[];
    error?: string;
  };
}

export default function ScanLivrePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedBooks, setDetectedBooks] = useState<BookInfo[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [editedAuthor, setEditedAuthor] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [adding, setAdding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier que c'est une image
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image');
        return;
      }

      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setDetectedBooks([]);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError('Veuillez sélectionner une image');
      return;
    }

    setAnalyzing(true);
    setError('');
    setDetectedBooks([]);

    try {
      const formData = new FormData();
      formData.append('file', fileInputRef.current.files[0]);

      const response = await api.post('/ai/analyze-book', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.book_info) {
        const livres = response.data.book_info.livres || [];
        if (livres.length === 0) {
          setError('Aucun livre détecté dans l\'image');
        } else {
          setDetectedBooks(livres);
        }
      } else {
        setError('Impossible d\'analyser l\'image');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'analyse');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddToLibrary = async (book: BookInfo, index: number) => {
    setAdding(true);
    setError('');

    try {
      await api.post('/ai/add-detected-book', null, {
        params: {
          nom: book.nom,
          auteur: book.auteur,
        },
      });

      alert('Livre ajouté à votre bibliothèque !');
      // Retirer le livre de la liste après ajout
      setDetectedBooks(detectedBooks.filter((_, i) => i !== index));
      if (editingIndex === index) {
        setEditingIndex(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'ajout');
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditedTitle(detectedBooks[index].nom);
    setEditedAuthor(detectedBooks[index].auteur);
  };

  const handleSaveEdit = (index: number) => {
    const updatedBooks = [...detectedBooks];
    updatedBooks[index] = {
      ...updatedBooks[index],
      nom: editedTitle,
      auteur: editedAuthor,
    };
    setDetectedBooks(updatedBooks);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setDetectedBooks([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      
      if (!file.type.startsWith('image/')) {
        setError('Veuillez déposer une image');
        return;
      }

      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setDetectedBooks([]);
        setError('');
      };
      reader.readAsDataURL(file);

      // Mettre à jour le input file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={styles.container}>
      <Header />
      
      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>Scanner un livre</h1>
          <p style={styles.subtitle}>
            Prenez une photo de votre livre et notre IA détectera automatiquement ses informations
          </p>

          <div style={styles.scanContainer}>
            {/* Zone d'upload */}
            <div style={styles.uploadSection}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={styles.fileInput}
                id="file-input"
              />
              
              {!selectedImage ? (
                <div 
                  style={isDragging ? {...styles.uploadArea, ...styles.uploadAreaDragging} : styles.uploadArea}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <h3 style={styles.uploadTitle}>Choisir une photo</h3>
                  <p style={styles.uploadText}>ou glisser-déposer une image</p>
                  <button 
                    type="button" 
                    onClick={handleButtonClick}
                    style={styles.selectButton}
                  >
                    Parcourir
                  </button>
                </div>
              ) : (
                <div style={styles.previewArea}>
                  <img src={selectedImage} alt="Aperçu" style={styles.previewImage} />
                  <div style={styles.previewActions}>
                    <button onClick={handleReset} style={styles.changeButton}>
                      Changer d'image
                    </button>
                    <button 
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      style={analyzing ? {...styles.analyzeButton, ...styles.buttonDisabled} : styles.analyzeButton}
                    >
                      {analyzing ? 'Analyse en cours...' : 'Analyser avec IA'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Résultats */}
            {detectedBooks.length > 0 && (
              <div style={styles.resultsSection}>
                <h2 style={styles.resultsTitle}>
                  {detectedBooks.length === 1 ? 'Livre détecté' : `${detectedBooks.length} livres détectés`}
                </h2>
                
                {detectedBooks.map((book, index) => (
                  <div key={index} style={styles.bookCard}>
                    <div style={styles.bookIcon}>📚</div>
                    <div style={styles.bookDetails}>
                      {editingIndex === index ? (
                        <>
                          <div style={styles.bookField}>
                            <label>Titre :</label>
                            <input
                              type="text"
                              value={editedTitle}
                              onChange={(e) => setEditedTitle(e.target.value)}
                              style={styles.editInput}
                            />
                          </div>
                          <div style={styles.bookField}>
                            <label>Auteur :</label>
                            <input
                              type="text"
                              value={editedAuthor}
                              onChange={(e) => setEditedAuthor(e.target.value)}
                              style={styles.editInput}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={styles.bookField}>
                            <label>Titre :</label>
                            <div style={styles.bookValue}>{book.nom}</div>
                          </div>
                          <div style={styles.bookField}>
                            <label>Auteur :</label>
                            <div style={styles.bookValue}>{book.auteur}</div>
                          </div>
                        </>
                      )}
                    </div>
                    <div style={styles.bookActions}>
                      {editingIndex === index ? (
                        <>
                          <button 
                            onClick={() => handleSaveEdit(index)}
                            style={styles.saveButton}
                          >
                            ✓ Sauvegarder
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            style={styles.cancelButton}
                          >
                            ✕ Annuler
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEdit(index)}
                            style={styles.editButton}
                          >
                            ✎ Modifier
                          </button>
                          <button 
                            onClick={() => handleAddToLibrary(book, index)}
                            disabled={adding}
                            style={adding ? {...styles.addButton, ...styles.buttonDisabled} : styles.addButton}
                          >
                            {adding ? 'Ajout...' : '+ Ajouter'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                <div style={styles.actionsSection}>
                  <button onClick={handleAnalyze} style={styles.retryButton}>
                    Réanalyser
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div style={styles.errorBox}>
                {error}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div style={styles.instructions}>
            <h3>Conseils pour une meilleure détection</h3>
            <ul style={styles.instructionsList}>
              <li>Assurez-vous que la couverture du livre est bien visible</li>
              <li>Évitez les reflets et les ombres</li>
              <li>Prenez la photo dans un endroit bien éclairé</li>
              <li>Le titre et l'auteur doivent être lisibles</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
  } as React.CSSProperties,
  main: {
    flex: 1,
    backgroundColor: '#F5E6D3',
    padding: '2rem',
  } as React.CSSProperties,
  content: {
    maxWidth: '1000px',
    margin: '0 auto',
  } as React.CSSProperties,
  title: {
    color: '#5D4E37',
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  subtitle: {
    color: '#8B7355',
    fontSize: '1.1rem',
    textAlign: 'center' as const,
    marginBottom: '2rem',
  } as React.CSSProperties,
  scanContainer: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  } as React.CSSProperties,
  uploadSection: {
    marginBottom: '2rem',
  } as React.CSSProperties,
  fileInput: {
    display: 'none',
  } as React.CSSProperties,
  uploadArea: {
    border: '3px dashed #D4B59E',
    borderRadius: '8px',
    padding: '3rem',
    textAlign: 'center' as const,
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#F5E6D3',
  } as React.CSSProperties,
  uploadAreaDragging: {
    borderColor: '#8B7355',
    backgroundColor: 'rgba(139, 115, 85, 0.15)',
    transform: 'scale(1.02)',
  } as React.CSSProperties,
  uploadIcon: {
    fontSize: '4rem',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  uploadTitle: {
    margin: 0,
    color: '#5D4E37',
    fontSize: '1.5rem',
    fontWeight: '600' as const,
  } as React.CSSProperties,
  uploadText: {
    margin: 0,
    color: '#8B7355',
    fontSize: '1rem',
  } as React.CSSProperties,
  selectButton: {
    backgroundColor: '#8B7355',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600' as const,
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'all 0.3s ease',
  } as React.CSSProperties,
  previewArea: {
    textAlign: 'center' as const,
  } as React.CSSProperties,
  previewImage: {
    maxWidth: '100%',
    maxHeight: '400px',
    borderRadius: '8px',
    marginBottom: '1rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  previewActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  changeButton: {
    backgroundColor: '#ccc',
    color: '#333',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
  } as React.CSSProperties,
  analyzeButton: {
    backgroundColor: '#8B7355',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  } as React.CSSProperties,
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  } as React.CSSProperties,
  resultsSection: {
    borderTop: '2px solid #D4B59E',
    paddingTop: '2rem',
  } as React.CSSProperties,
  resultsTitle: {
    color: '#5D4E37',
    fontSize: '1.5rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
  infoNote: {
    backgroundColor: '#FFF9E6',
    border: '1px solid #FFE082',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    color: '#5D4E37',
  } as React.CSSProperties,
  bookCard: {
    backgroundColor: '#F5E6D3',
    padding: '2rem',
    borderRadius: '8px',
    display: 'flex',
    gap: '2rem',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  bookIcon: {
    fontSize: '4rem',
  } as React.CSSProperties,
  bookDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  } as React.CSSProperties,
  bookActions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    alignItems: 'stretch',
  } as React.CSSProperties,
  bookField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  } as React.CSSProperties,
  bookValue: {
    fontSize: '1.2rem',
    color: '#5D4E37',
    fontWeight: 'bold',
  } as React.CSSProperties,
  actionsSection: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  addButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  } as React.CSSProperties,
  editButton: {
    backgroundColor: '#FF9800',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  } as React.CSSProperties,
  saveButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  } as React.CSSProperties,
  cancelButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    cursor: 'pointer',
  } as React.CSSProperties,
  editInput: {
    padding: '0.75rem',
    fontSize: '1.1rem',
    border: '2px solid #8B7355',
    borderRadius: '4px',
    color: '#5D4E37',
    fontWeight: 'bold',
  } as React.CSSProperties,
  retryButton: {
    backgroundColor: '#8B7355',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
  } as React.CSSProperties,
  errorBox: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '1rem',
    borderRadius: '4px',
    border: '1px solid #f5c6cb',
    marginTop: '1rem',
  } as React.CSSProperties,
  instructions: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  instructionsList: {
    color: '#5D4E37',
    lineHeight: '2',
  } as React.CSSProperties,
};
