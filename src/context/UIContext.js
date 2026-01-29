import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext(null);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};

export const UIProvider = ({ children }) => {
  const [modalAcik, setModalAcik] = useState(null);
  const [seciliZaman, setSeciliZaman] = useState(null);
  const [seciliEtkinlik, setSeciliEtkinlik] = useState(null);
  const [seciliGrup, setSeciliGrup] = useState(null);
  const [bildirim, setBildirim] = useState(null);
  const [bildirimler, setBildirimler] = useState([]);
  const [canSikildiModu, setCanSikildiModu] = useState(false);
  const [katilimIstekleri, setKatilimIstekleri] = useState([]);

  const bildirimGoster = (mesaj, tip = 'basari') => {
    setBildirim({ mesaj, tip });
    setTimeout(() => setBildirim(null), 3000);
  };

  const modalAc = (modalTipi, data = null) => {
    setModalAcik(modalTipi);
    if (data?.zaman) setSeciliZaman(data.zaman);
    if (data?.etkinlik) setSeciliEtkinlik(data.etkinlik);
    if (data?.grup) setSeciliGrup(data.grup);
  };

  const modalKapat = () => {
    setModalAcik(null);
    setSeciliZaman(null);
    setSeciliEtkinlik(null);
  };

  const bildirimEkle = (mesaj) => {
    setBildirimler(prev => [...prev, {
      id: Date.now(),
      mesaj,
      okundu: false,
      zaman: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const bildirimOkundu = (id) => {
    setBildirimler(prev => prev.map(b => 
      b.id === id ? { ...b, okundu: true } : b
    ));
  };

  const katilimIstegiEkle = (plan) => {
    setKatilimIstekleri(prev => [...prev, {
      id: Date.now(),
      plan,
      durum: 'bekliyor',
      tarih: new Date()
    }]);
  };

  const value = {
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
    bildirim,
    bildirimGoster,
    bildirimler,
    setBildirimler,
    bildirimEkle,
    bildirimOkundu,
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
