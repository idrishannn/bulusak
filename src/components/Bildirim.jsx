import React from 'react';
import { useUI } from '../context';

const Bildirim = () => {
  const { bildirim } = useUI();

  if (!bildirim) return null;

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl animate-bounce-in backdrop-blur-lg ${
      bildirim.tip === 'basari' 
        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' 
        : 'bg-red-500/90 text-white'
    }`}>
      <div className="flex items-center gap-2">
        <span>{bildirim.tip === 'basari' ? '✨' : '⚠️'}</span>
        {bildirim.mesaj}
      </div>
    </div>
  );
};

export default Bildirim;
