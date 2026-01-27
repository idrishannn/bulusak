// ============================================
// BULUŞAK - Bildirim Componenti
// ============================================

import React from 'react';
import { useUI } from '../../context/UIContext';

const Bildirim = () => {
  const { bildirim } = useUI();

  if (!bildirim) return null;

  const tipStilleri = {
    basari: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
    hata: 'bg-red-500/90 text-white',
    uyari: 'bg-yellow-500/90 text-white',
    bilgi: 'bg-blue-500/90 text-white'
  };

  const tipIkonlari = { basari: '✨', hata: '⚠️', uyari: '⚡', bilgi: 'ℹ️' };

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl animate-bounce-in backdrop-blur-lg ${tipStilleri[bildirim.tip] || tipStilleri.basari}`}>
      <div className="flex items-center gap-2">
        <span>{tipIkonlari[bildirim.tip] || tipIkonlari.basari}</span>
        <span className="font-medium">{bildirim.mesaj}</span>
      </div>
    </div>
  );
};

export default Bildirim;
