import React from 'react';
import { useAuth, useUI } from '../context';

const Header = () => {
  const { kullanici } = useAuth();
  const { bildirimler, canSikildiModu, setCanSikildiModu, setModalAcik } = useUI();

  const okunmamisBildirimSayisi = bildirimler.filter(b => !b.okundu).length;

  return (
    <header className="sticky top-0 z-40 safe-area-top">
      <div className="glass-panel border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <p className="text-white/70 text-sm font-medium">Tekrar hoş geldin,</p>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {kullanici?.isim?.split(' ')[0] || 'Kullanıcı'} <span className="text-2xl">👋</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setModalAcik('bildirimler')}
              className="relative w-10 h-10 rounded-xl glass-panel flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all active:scale-95"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {okunmamisBildirimSayisi > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold border-2 border-[#1f1f1f]">
                  {okunmamisBildirimSayisi}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => setCanSikildiModu(!canSikildiModu)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                canSikildiModu 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-glow' 
                  : 'glass-panel border border-white/20 hover:bg-white/20'
              }`}
            >
              <span className="text-lg">{canSikildiModu ? '🔥' : '😴'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
