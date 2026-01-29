import React, { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  const [modalAcik, setModalAcik] = useState(null);
  const [seciliEtkinlik, setSeciliEtkinlik] = useState(null);
  const [seciliGrup, setSeciliGrup] = useState(null);
  const [seciliZaman, setSeciliZaman] = useState(null);
  const [bildirimler, setBildirimler] = useState([]);
  const [toast, setToast] = useState(null);

  const bildirimGoster = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const value = {
    modalAcik, setModalAcik,
    seciliEtkinlik, setSeciliEtkinlik,
    seciliGrup, setSeciliGrup,
    seciliZaman, setSeciliZaman,
    bildirimler, setBildirimler,
    toast, bildirimGoster
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
