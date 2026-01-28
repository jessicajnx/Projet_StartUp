'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function MapComponent() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const [loaded, setLoaded] = useState(false);
  const [usersByCity, setUsersByCity] = useState({});
  const [selectedCity, setSelectedCity] = useState(null);

  const CITY_COORDS = {
    Paris: [48.8566, 2.3522],
    Marseille: [43.2965, 5.3698],
    Lyon: [45.764, 4.8357],
    Toulouse: [43.6047, 1.4442],
    Nice: [43.7102, 7.262],
    Nantes: [47.2184, -1.5536],
    Montpellier: [43.6108, 3.8767],
    Strasbourg: [48.5734, 7.7521],
    Bordeaux: [44.8378, -0.5792],
    Lille: [50.6292, 3.0573],
    Rennes: [48.1173, -1.6778],
    Reims: [49.2583, 4.0317],
    LeHavre: [49.4944, 0.1079],
    SaintEtienne: [45.4397, 4.3872],
    Toulon: [43.1242, 5.928],
    Grenoble: [45.1885, 5.7245],
    Dijon: [47.322, 5.0415],
    Angers: [47.4784, -0.5632],
    Nimes: [43.8367, 4.3601],
    Villeurbanne: [45.7719, 4.8902],
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('access_token');

    fetch('http://127.0.0.1:8000/api/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((me) => {
        const userCity = me.city;
        const centerCoords = CITY_COORDS[userCity] || [46.6, 2.4];

        map.current = L.map(mapContainer.current).setView(centerCoords, 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 13,
          minZoom: 6,
        }).addTo(map.current);

        fetch('http://127.0.0.1:8000/api/users-cities')
          .then((res) => res.json())
          .then((users) => {
            const byCity = {};

            users.forEach((user) => {
              if (!user.Villes) return;
              if (!byCity[user.Villes]) byCity[user.Villes] = [];
              byCity[user.Villes].push(user);
            });

            setUsersByCity(byCity);

            // Ajouter les markers
            Object.keys(byCity).forEach((city) => {
              const coords = CITY_COORDS[city];
              if (!coords) return;

              const marker = L.marker(coords).addTo(map.current);

              marker.on('click', () => {
                setSelectedCity(city);
              });
            });
          });
      })
      .catch((err) => console.error('Erreur carte:', err))
      .finally(() => setLoaded(true));

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const handleProposeExchange = (user) => {
    alert(`Proposer un échange à ${user.Name} ${user.Surname}`);
  };

  return (
    <div style={{ width: '80%', margin: '40px auto' }}>
      {/* ---------- Carte ---------- */}
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
      {selectedCity && usersByCity[selectedCity] && (
        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            borderRadius: '10px',
            backgroundColor: '#fafafa',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}
        >
          <h3
            style={{
              marginBottom: '15px',
              fontSize: '18px',
              color: '#333',
            }}
          >
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
                    backgroundColor: '#ffc0cb', // rose pale
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
      )}
    </div>
  );
}
