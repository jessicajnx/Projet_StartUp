'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Map = dynamic(() => import('@/components/MapComponent'), { ssr: false });

export default function MapPage() {
  const searchParams = useSearchParams();
  const bookTitle = searchParams.get('title');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col">
        {/* Header simple */}
        <div className="bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {bookTitle ? `Emprunter: ${decodeURIComponent(bookTitle)}` : 'Carte'}
          </h1>
          <Link href={bookTitle ? '/livres' : '/bibliotheque-personnelle'}>
            <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
              ← Retour
            </button>
          </Link>
        </div>

        {/* Carte plein écran */}
        <div className="flex-1 overflow-hidden">
          <Map />
        </div>
      </main>

      <Footer />
    </div>
  );
}
