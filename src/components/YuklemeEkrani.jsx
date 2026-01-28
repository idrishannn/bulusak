import React from 'react';
import { tema } from '../context';

const YuklemeEkrani = () => {
  return (
    <div className={`min-h-screen ${tema.bg} flex items-center justify-center`}>
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
          Buluşak
        </h1>
        <p className={`${tema.textSecondary} mt-2`}>Yükleniyor...</p>
      </div>
    </div>
  );
};

export default YuklemeEkrani;
