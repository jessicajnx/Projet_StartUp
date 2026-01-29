'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DefaultIcon = L.icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const DEFAULT_COORDS = [46.6, 2.4]; 

export default function MapComponent() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const searchParams = useSearchParams();

  const [loaded, setLoaded] = useState(false);
  const [usersByCity, setUsersByCity] = useState({});
  const [selectedCity, setSelectedCity] = useState(null);
  const [error, setError] = useState('');
  const [bookFilter, setBookFilter] = useState(null);
  const [bookTitle, setBookTitle] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const coordsCache = {};

  const getCityCoords = async (city) => {
    if (coordsCache[city]) return coordsCache[city];

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        city
      )}&limit=1`;

      const response = await fetch(url, {
        headers: { 'User-Agent': 'MapProject/1.0 (votre-email@exemple.com)' },
      });

      const data = await response.json();
      if (!data.length) return null;

      const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      coordsCache[city] = coords; 
      return coords;
    } catch (err) {
      console.error('Erreur Nominatim:', err);
      return null;
    }
  };

  useEffect(() => {
    // Récupérer les paramètres de la URL
    const book = searchParams.get('book');
    const title = searchParams.get('title');
    if (book) {
      setBookFilter(book);
      setBookTitle(title ? decodeURIComponent(title) : book);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (map.current) return;

    const initializeMap = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const me = await res.json();
        const userCity = me.villes;

        let centerCoords = DEFAULT_COORDS;
        if (userCity) {
          const coords = await getCityCoords(userCity);
          if (coords) centerCoords = coords;
        }

        if (mapContainer.current) {
          map.current = L.map(mapContainer.current).setView(centerCoords, 12);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 13,
            minZoom: 6,
          }).addTo(map.current);

          // Indiquer que la carte est prête
          setMapReady(true);
        }
      } catch (err) {
        console.error('Erreur carte:', err);
        setError(err.message);
      } finally {
        setLoaded(true);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Charger les utilisateurs quand la carte est prête ou quand le filtre change
  useEffect(() => {
    if (!mapReady || !map.current) return;

    const loadUsers = async () => {
      try {
        const token = localStorage.getItem('token');

        // Nettoyer les markers existants
        map.current.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            map.current.removeLayer(layer);
          }
        });

        const res = await fetch(`${API_URL}/api/users-cities`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const users = await res.json();
        let filteredUsers = users;

        // Filtrer les utilisateurs qui ont le livre si un filtre est actif
        if (bookFilter) {
          filteredUsers = users.filter((user) => {
            if (!user.bibliotheque_personnelle) return false;
            return user.bibliotheque_personnelle.some(
              (livre) => livre.source_id === bookFilter
            );
          });
        }

        const byCity = {};

        filteredUsers.forEach((user) => {
          if (!user.Villes) return;
          if (!byCity[user.Villes]) byCity[user.Villes] = [];
          byCity[user.Villes].push(user);
        });

        setUsersByCity(byCity);

        // Ajouter les nouveaux markers avec géocodage dynamique
        if (map.current) {
          for (const city of Object.keys(byCity)) {
            const coords = await getCityCoords(city);
            if (!coords) continue;

            const marker = L.marker(coords).addTo(map.current);

            marker.on('click', () => {
              setSelectedCity(city);
            });
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
      }
    };

    loadUsers();
  }, [mapReady, bookFilter]);

  const handleProposeExchange = async (user) => {
    // Si un livre est déjà sélectionné depuis /livres, proposer directement
    if (bookFilter && bookTitle) {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/emprunts/propose-exchange`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            target_user_id: parseInt(user.ID, 10),
            book_id: parseInt(bookFilter, 10),
            book_title: bookTitle,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Erreur lors de la proposition');
        }

        alert(`✅ Proposition d'échange envoyée pour le livre "${bookTitle}" !`);
        return;
      } catch (error) {
        console.error('Erreur lors de la proposition:', error);
        alert(`❌ Erreur: ${error.message}`);
        return;
      }
    }

    // Fallback si aucun livre n'a été sélectionné
    window.location.href = `/profil/${user.ID}`;
  };

  return (
    <div style={{ width: '80%', margin: '40px auto' }}>
      {/* Carte */}
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '60vh',
          border: '1px solid #ccc',
          borderRadius: '8px',
        }}
      >
        {!loaded && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Chargement de la carte...
          </div>
        )}
      </div>

      {/* ---------- Liste des utilisateurs ---------- */}
      {selectedCity && usersByCity[selectedCity] && usersByCity[selectedCity].length > 0 ? (
        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            borderRadius: '10px',
            backgroundColor: '#fafafa',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}
        >
          <h3 style={{ marginBottom: '15px', fontSize: '18px', color: '#333' }}>
            Utilisateurs à {selectedCity}
          </h3>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {usersByCity[selectedCity].map((user) => (
              <li
                key={user.ID}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  marginBottom: '8px',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #eaeaea',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = '#f0f4ff')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = '#ffffff')
                }
              >
                <span>
                  {user.Name} {user.Surname}
                </span>
                <button
                  onClick={() => handleProposeExchange(user)}
                  style={{
                    backgroundColor: '#ffc0cb',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = '#ffb6c1')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = '#ffc0cb')
                  }
                >
                  Proposer un échange
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : bookTitle && selectedCity ? (
        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            borderRadius: '10px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}
        >
          <p style={{ margin: 0, color: '#856404', fontWeight: '500' }}>
            ⚠️ Aucun utilisateur à {selectedCity} n'a "{bookTitle}" dans sa bibliothèque personnelle.
          </p>
        </div>
      ) : null}
    </div>
  );
}
