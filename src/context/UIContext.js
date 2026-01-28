import React, { createContext, useContext, useState } from 'react';

// Context oluştur
const UIContext = createContext(null);

// Custom hook
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};

// Tema sabitleri
export const tema = {
  bg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100',
  bgSecondary: 'bg-white/60',
  bgCard: 'bg-white',
  bgHover: 'hover:bg-orange-50',
  text: 'text-gray-800',
  textSecondary: 'text-gray-600',
  textMuted: 'text-gray-500',
  border: 'border-orange-100',
  inputBg: 'bg-gray-50',
  inputText: 'text-gray-800 placeholder-gray-400',
  gradient: 'from-orange-500 via-amber-500 to-orange-400',
  cardShadow: 'shadow-lg shadow-orange-100/50'
};

// Provider component
export const UIProvider = ({ children }) => {
  // Modal State
  const [modalAcik, setModalAcik] = useState(null);
  const [seciliZaman, setSeciliZaman] = useState(null);
  const [seciliEtkinlik, setSeciliEtkinlik] = useState(null);
  const [seciliGrup, setSeciliGrup] = useState(null);
  
  // Bildirim State
  const [bildirim, setBildirim] = useState(null);
  const [bildirimler, setBildirimler] = useState([]);
  
  // UI State
  const [canSikildiModu, setCanSikildiModu] = useState(false);
  const [katilimIstekleri, setKatilimIstekleri] = useState([]);

  // Bildirim göster (toast)
  const bildirimGoster = (mesaj, tip = 'basari') => {
    setBildirim({ mesaj, tip });
    setTimeout(() => setBildirim(null), 3000);
  };

  // Modal aç
  const modalAc = (modalTipi, data = null) => {
    setModalAcik(modalTipi);
    
    if (data?.zaman) setSeciliZaman(data.zaman);
    if (data?.etkinlik) setSeciliEtkinlik(data.etkinlik);
    if (data?.grup) setSeciliGrup(data.grup);
  };

  // Modal kapat
  const modalKapat = () => {
    setModalAcik(null);
    setSeciliZaman(null);
    setSeciliEtkinlik(null);
  };

  // Bildirim ekle (kalıcı bildirimler için)
  const bildirimEkle = (mesaj) => {
    setBildirimler(prev => [...prev, {
      id: Date.now(),
      mesaj,
      okundu: false,
      zaman: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  // Bildirimi okundu işaretle
  const bildirimOkundu = (id) => {
    setBildirimler(prev => prev.map(b => 
      b.id === id ? { ...b, okundu: true } : b
    ));
  };

  // Katılım isteği ekle
  const katilimIstegiEkle = (plan) => {
    setKatilimIstekleri(prev => [...prev, {
      id: Date.now(),
      plan,
      durum: 'bekliyor',
      tarih: new Date()
    }]);
  };

  // Context value
  const value = {
    // Theme
    tema,
    
    // Modals
    modalAcik,
    setModalAcik,
    seciliZaman,
    setSeciliZaman,
    seciliEtkinlik,
    setSeciliEtkinlik,
    seciliGrup,
    setSeciliGrup,
    modalAc,
    modalKapat,
    
    // Bildirimler (toast)
    bildirim,
    bildirimGoster,
    
    // Bildirimler (kalıcı)
    bildirimler,
    setBildirimler,
    bildirimEkle,
    bildirimOkundu,
    
    // UI State
    canSikildiModu,
    setCanSikildiModu,
    katilimIstekleri,
    setKatilimIstekleri,
    katilimIstegiEkle
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export default UIContext;
