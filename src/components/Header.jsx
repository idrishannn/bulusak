import React from 'react';
import { useUI } from '../context';

const Header = () => {
  const { bildirimler, canSikildiModu, setCanSikildiModu, setModalAcik } = useUI();

  return (
    <header className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 text-white shadow-2xl sticky top-0 z-40">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight leading-none">Buluşak</h1>
          <p className="text-sm text-white/80 font-medium">planla, buluş, yaşa</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setModalAcik('bildirimler')} 
            className="relative w-11 h-11 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
          >
            🔔
            {bildirimler.filter(b => !b.okundu).length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                {bildirimler.filter(b => !b.okundu).length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setCanSikildiModu(!canSikildiModu)} 
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              canSikildiModu ? 'bg-white text-orange-500 shadow-lg' : 'bg-white/20 backdrop-blur-lg hover:bg-white/30'
            }`}
          >
            {canSikildiModu ? '🔥' : '😴'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
