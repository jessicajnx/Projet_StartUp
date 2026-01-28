'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const Map = dynamic(() => import('@/components/MapComponent'), { ssr: false });

export default function MapPage() {
  return (
    <div className="w-screen h-screen flex flex-col">
      {/* Header simple */}
      <div className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Carte</h1>
        <Link href="/bibliotheque-personnelle">
          <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
            ← Retour
          </button>
        </Link>
      </div>

      {/* Carte plein écran */}
      <div className="flex-1 overflow-hidden">
        <Map />
      </div>
    </div>
  );
}
