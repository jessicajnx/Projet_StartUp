"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Playfair_Display, Space_Grotesk } from "next/font/google";
import { biblioAPI } from "@/lib/api";

const display = Playfair_Display({ subsets: ["latin"], weight: ["600"] });
const sans = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const GOOGLE_BOOKS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || "";

type Book = {
  id: string;
  title: string;
  authors: string[];
  thumbnail?: string;
  description?: string;
  infoLink?: string;
};

export default function RechercheLivre() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTyped, setHasTyped] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreBooks, setHasMoreBooks] = useState(true);

  // Charger les livres populaires au démarrage
  useEffect(() => {
    loadPopularBooks(0);
  }, []);

  const loadPopularBooks = async (page: number) => {
    if (!GOOGLE_BOOKS_API_KEY) return;
    
    try {
      if (page === 0) {
        setLoadingPopular(true);
      } else {
        setLoadingMore(true);
      }
      
      const startIndex = page * 40; // Google Books limite à 40 par requête
      const params = new URLSearchParams();
      params.set("q", "subject:fiction");
      params.set("key", GOOGLE_BOOKS_API_KEY);
      params.set("maxResults", "40");
      params.set("startIndex", startIndex.toString());
      params.set("printType", "books");
      params.set("orderBy", "newest");
      params.set("langRestrict", "fr");

      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok && data.items) {
        const parsed: Book[] = data.items.map((item: any) => {
          const info = item.volumeInfo || {};
          return {
            id: item.id,
            title: info.title || "Titre indisponible",
            authors: info.authors || [],
            thumbnail: info.imageLinks?.thumbnail,
            description: info.description,
            infoLink: info.infoLink || info.previewLink,
          };
        });
        
        // Toujours remplacer les livres
        setPopularBooks(parsed);
        
        // Vérifier s'il y a plus de livres (si on reçoit moins de 40, c'est probablement la fin)
        setHasMoreBooks(parsed.length >= 40);
        setCurrentPage(page);
      } else {
        // Si pas de réponse, on arrête
        setHasMoreBooks(false);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des livres populaires", err);
    } finally {
      setLoadingPopular(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    loadPopularBooks(currentPage + 1);
  };

  const handleLoadPrevious = () => {
    if (currentPage > 0) {
      loadPopularBooks(currentPage - 1);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
    // Précharge les livres déjà ajoutés pour marquer les boutons
    (async () => {
      try {
        const res = await biblioAPI.listMe();
        const ids = new Set<string>((res.data || []).map((b: any) => b.source_id).filter(Boolean));
        setAddedIds(ids);
      } catch (e) {
        // silencieux : si non auth, on redirige déjà
      }
    })();
  }, [router]);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setHasTyped(false);
      setError(null);
      return;
    }

    if (trimmed.length < 2) {
      setResults([]);
      setHasTyped(false);
      setError("Tapez au moins 2 caractères pour lancer la recherche.");
      return;
    }
    
    if (!GOOGLE_BOOKS_API_KEY) {
      setError("Clé API Google Books manquante. Ajoutez NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY dans .env.local puis relancez.");
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setHasTyped(true);
      try {
        const params = new URLSearchParams();
        params.set("q", trimmed);
        params.set("key", GOOGLE_BOOKS_API_KEY);
        params.set("maxResults", "12");
        params.set("printType", "books");
        params.set("orderBy", "relevance");
        params.set("langRestrict", "fr");

        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?${params.toString()}`,
          { signal: controller.signal },
        );

        const data = await response.json();
        if (!response.ok) {
          const apiMessage = data?.error?.message;
          throw new Error(apiMessage || "Recherche Google Books indisponible");
        }

        const parsed: Book[] = (data.items || []).map((item: any) => {
          const info = item.volumeInfo || {};
          return {
            id: item.id,
            title: info.title || "Titre indisponible",
            authors: info.authors || [],
            thumbnail: info.imageLinks?.thumbnail,
            description: info.description,
            infoLink: info.infoLink || info.previewLink,
          };
        });
        setResults(parsed);
        setError(null);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err?.message || "Impossible de récupérer les livres pour le moment.");
      } finally {
        setLoading(false);
      }
    }, 320);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const heroText = useMemo(
    () => "Trouvez le livre que vous voulez",
    [],
  );

  const handleAddToLibrary = async (book: Book) => {
    setSaveMessage(null);
    setSavingId(book.id);
    try {
      await biblioAPI.add({
        title: book.title,
        authors: book.authors,
        cover_url: book.thumbnail,
        info_link: book.infoLink,
        description: book.description,
        source: "google_books",
        source_id: book.id,
      });
      setSaveMessage(`“${book.title}” ajouté à votre bibliothèque.`);
      setAddedIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(book.id);
        return newSet;
      });
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "Ajout impossible";
      setSaveMessage(msg);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div style={styles.pageWrapper} className={sans.className}>
      <Header />
      <main style={styles.main}>
        <div style={styles.heroCard}>
          <p style={styles.kicker}>Recherche instantanée</p>
          <h1 style={styles.title} className={display.className}>{heroText}</h1>
          <p style={styles.subtitle}>
            Tapez un titre, un auteur ou un mot-clé : nous interrogeons Google Books en temps réel et affichons les correspondances.
          </p>
          <div style={styles.searchZone}>
            <div style={styles.searchBar}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={styles.searchIcon}>
                <circle cx="11" cy="11" r="7" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Titre, auteur, ISBN..."
                style={styles.input}
              />
              {loading && <span style={styles.pill}>Recherche...</span>}
            </div>
            <p style={styles.helper}>Suggestions en direct à chaque frappe.</p>
          </div>
        </div>

        <section style={styles.resultsSection}>
          {error && <p style={styles.error}>{error}</p>}
          {!error && hasTyped && !loading && results.length === 0 && (
            <p style={styles.empty}>Aucun livre ne correspond pour l'instant.</p>
          )}
          <div style={styles.grid}>
            {results.map((book) => (
              <article key={book.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.thumbWrapper}>
                    {book.thumbnail ? (
                      <img src={book.thumbnail} alt={book.title} style={styles.thumb} />
                    ) : (
                      <div style={styles.thumbPlaceholder}>📘</div>
                    )}
                  </div>
                  <div style={styles.meta}>
                    <p style={styles.cardKicker}>Google Books</p>
                    <h3 style={styles.cardTitle}>{book.title}</h3>
                    {book.authors.length > 0 && (
                      <p style={styles.authors}>{book.authors.join(", ")}</p>
                    )}
                  </div>
                </div>
                {book.description && (
                  <p style={styles.description}>{book.description}</p>
                )}
                <button
                  type="button"
                  style={styles.linkButton}
                  onClick={() => handleAddToLibrary(book)}
                  disabled={savingId === book.id || addedIds.has(book.id)}
                >
                  {savingId === book.id ? "Ajout..." : addedIds.has(book.id) ? "Ajouté" : "Ajouter à ma bibliothèque"}
                </button>
              </article>
            ))}
          </div>
          {saveMessage && <p style={styles.info}>{saveMessage}</p>}
        </section>

        {/* Section Livres Populaires */}
        {!hasTyped && (
          <section style={styles.popularSection}>
            <h2 style={styles.popularTitle}>Livres populaires</h2>
            <p style={styles.popularSubtitle}>Découvrez une sélection de livres tendance</p>
            
            {loadingPopular ? (
              <p style={styles.loadingText}>Chargement des livres populaires...</p>
            ) : (
              <div style={styles.grid}>
                {popularBooks.map((book) => (
                  <article key={book.id} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <div style={styles.thumbWrapper}>
                        {book.thumbnail ? (
                          <img src={book.thumbnail} alt={book.title} style={styles.thumb} />
                        ) : (
                          <div style={styles.thumbPlaceholder}>📘</div>
                        )}
                      </div>
                      <div style={styles.meta}>
                        <p style={styles.cardKicker}>Google Books</p>
                        <h3 style={styles.cardTitle}>{book.title}</h3>
                        {book.authors.length > 0 && (
                          <p style={styles.authors}>{book.authors.join(", ")}</p>
                        )}
                      </div>
                    </div>
                    {book.description && (
                      <p style={styles.description}>{book.description}</p>
                    )}
                    <button
                      type="button"
                      style={styles.linkButton}
                      onClick={() => handleAddToLibrary(book)}
                      disabled={savingId === book.id || addedIds.has(book.id)}
                    >
                      {savingId === book.id ? "Ajout..." : addedIds.has(book.id) ? "Ajouté" : "Ajouter à ma bibliothèque"}
                    </button>
                  </article>
                ))}
              </div>
            )}
            
            {!loadingPopular && (
              <div style={styles.paginationContainer}>
                <button
                  type="button"
                  onClick={handleLoadPrevious}
                  disabled={currentPage === 0 || loadingMore}
                  style={{
                    ...styles.paginationButton,
                    ...(currentPage === 0 || loadingMore ? styles.paginationButtonDisabled : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage > 0 && !loadingMore) {
                      e.currentTarget.style.backgroundColor = '#764d32';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage > 0 && !loadingMore) {
                      e.currentTarget.style.backgroundColor = '#8b5e3c';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  ← Précédent
                </button>
                
                <p style={styles.pageInfo}>
                  Page {currentPage + 1} • {popularBooks.length} livres
                </p>
                
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    ...styles.paginationButton,
                    ...(loadingMore ? styles.paginationButtonDisabled : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingMore) {
                      e.currentTarget.style.backgroundColor = '#764d32';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loadingMore) {
                      e.currentTarget.style.backgroundColor = '#8b5e3c';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {loadingMore ? "Chargement..." : "Suivant →"}
                </button>
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  pageWrapper: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f7f2ea 0%, #f1e5d5 45%, #e6d4c0 100%)",
  },
  main: {
    flex: 1,
    padding: "32px 18px 48px",
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto",
  },
  heroCard: {
    background: "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.82) 40%, rgba(255,255,255,0.70) 100%)",
    border: "1px solid #d6c3a5",
    borderRadius: "18px",
    padding: "28px 24px",
    boxShadow: "0 18px 45px rgba(47,36,29,0.12)",
    backdropFilter: "blur(8px)",
    marginBottom: "18px",
  },
  kicker: {
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    fontSize: "12px",
    color: "#8b5e3c",
    margin: 0,
  },
  title: {
    fontSize: "30px",
    margin: "8px 0 6px",
    color: "#2f241d",
    lineHeight: 1.1,
  },
  subtitle: {
    margin: "0 0 16px",
    color: "#5c4b3a",
    maxWidth: "780px",
    fontSize: "15px",
  },
  searchZone: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    background: "rgba(255,255,255,0.95)",
    borderRadius: "14px",
    border: "1px solid #d6c3a5",
    boxShadow: "0 10px 24px rgba(47,36,29,0.12)",
  },
  searchIcon: {
    color: "#8b5e3c",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "16px",
    color: "#2f241d",
    fontWeight: 600,
  },
  pill: {
    background: "#f1e5d5",
    color: "#8b5e3c",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  helper: {
    margin: 0,
    color: "#5c4b3a",
    fontSize: "13px",
  },
  resultsSection: {
    marginTop: "18px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
  },
  card: {
    background: "rgba(255,255,255,0.9)",
    border: "1px solid #d6c3a5",
    borderRadius: "14px",
    padding: "16px",
    boxShadow: "0 10px 28px rgba(47,36,29,0.12)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  cardHeader: {
    display: "flex",
    gap: "12px",
  },
  thumbWrapper: {
    width: "72px",
    height: "104px",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#f1e5d5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid #d6c3a5",
  },
  thumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  thumbPlaceholder: {
    fontSize: "20px",
  },
  meta: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  cardKicker: {
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontSize: "11px",
    color: "#8b5e3c",
  },
  cardTitle: {
    margin: 0,
    fontSize: "17px",
    color: "#2f241d",
    lineHeight: 1.2,
  },
  authors: {
    margin: 0,
    color: "#5c4b3a",
    fontSize: "13px",
    fontWeight: 600,
  },
  description: {
    margin: 0,
    color: "#4a3a2d",
    fontSize: "13px",
    lineHeight: 1.5,
    maxHeight: "108px",
    overflow: "hidden",
  },
  link: {
    alignSelf: "flex-start",
    background: "#8b5e3c",
    color: "white",
    padding: "8px 12px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: 600,
    boxShadow: "0 6px 12px rgba(139,94,60,0.2)",
  },
  linkButton: {
    alignSelf: "flex-start",
    background: "#8b5e3c",
    color: "white",
    padding: "8px 12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    boxShadow: "0 6px 12px rgba(139,94,60,0.2)",
  },
  error: {
    color: "#b42318",
    fontSize: "14px",
    marginBottom: "10px",
  },
  empty: {
    color: "#5c4b3a",
    fontSize: "14px",
    marginBottom: "10px",
  },
  info: {
    color: "#2f241d",
    fontSize: "14px",
    marginTop: "12px",
    fontWeight: 600,
  },
  popularSection: {
    marginTop: "48px",
  },
  popularTitle: {
    fontSize: "28px",
    fontWeight: 600,
    color: "#2f241d",
    marginBottom: "8px",
    textAlign: "center",
  },
  popularSubtitle: {
    fontSize: "15px",
    color: "#5c4b3a",
    marginBottom: "28px",
    textAlign: "center",
  },
  loadingText: {
    textAlign: "center",
    color: "#5c4b3a",
    fontSize: "15px",
    padding: "20px",
  },
  paginationContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    marginTop: "32px",
    flexWrap: "wrap",
  },
  paginationButton: {
    backgroundColor: "#8b5e3c",
    color: "white",
    border: "none",
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: 600,
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 10px 18px rgba(139,94,60,0.22)",
    transition: "all 120ms ease",
  },
  paginationButtonDisabled: {
    backgroundColor: "#d6c3a5",
    cursor: "not-allowed",
    opacity: 0.6,
  },
  pageInfo: {
    fontSize: "15px",
    color: "#2f241d",
    fontWeight: 600,
    margin: 0,
  },
};
