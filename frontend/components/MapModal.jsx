'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MapContainerDynamic = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayerDynamic = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const MarkerDynamic = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const PopupDynamic = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

let DefaultIcon;

export default function MapModal({ isOpen, onClose }) {
  const [position] = useState([48.8566, 2.3522]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      DefaultIcon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      L.Marker.prototype.options.icon = DefaultIcon;
    }
  }, []);

  if (!isOpen || !mounted) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-11/12 h-5/6 max-w-4xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg z-10"
        >
          ✕ Fermer
        </button>

        {/* Carte Leaflet */}
        <div className="w-full h-full">
          {mounted && (
            <MapContainerDynamic
              center={position}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayerDynamic
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MarkerDynamic position={position}>
                <PopupDynamic>Localisation par défaut</PopupDynamic>
              </MarkerDynamic>
            </MapContainerDynamic>
          )}
        </div>
      </div>
    </div>
  );
}
