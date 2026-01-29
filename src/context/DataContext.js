import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  gruplariDinle,
  grupOlustur,
  etkinlikleriDinle,
  etkinlikOlustur
} from '../services';
import { arkadaslariDinle } from '../services/arkadasService';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { kullanici, setKullanici } = useAuth();
  
  const [gruplar, setGruplar] = useState([]);
  const [etkinlikler, setEtkinlikler] = useState([]);
  const [aktiviteler, setAktiviteler] = useState([]);
  const [arkadaslar, setArkadaslar] = useState([]);
  const [bucketList, setBucketList] = useState([]);
  const [galeri, setGaleri] = useState([]);
  const [musaitlikler, setMusaitlikler] = useState({});

  useEffect(() => {
    if (kullanici?.odUserId) {
      const unsubscribe = gruplariDinle(kullanici.odUserId, setGruplar);
      return () => unsubscribe();
    }
  }, [kullanici?.odUserId]);

  useEffect(() => {
    if (kullanici?.odUserId) {
      const grupIds = gruplar.map(g => g.id);
      const unsubscribe = etkinlikleriDinle(grupIds, setEtkinlikler, kullanici.odUserId);
      return () => unsubscribe();
    } else {
      setEtkinlikler([]);
    }
  }, [gruplar, kullanici?.odUserId]);

  useEffect(() => {
    if (kullanici?.odUserId) {
      const unsubscribe = arkadaslariDinle(kullanici.odUserId, (arkadaslarDetay) => {
        setArkadaslar(arkadaslarDetay);
        setKullanici(prev => prev ? { ...prev, arkadaslarDetay } : prev);
      });
      return () => unsubscribe();
    }
  }, [kullanici?.odUserId, setKullanici]);

  const yeniGrupOlustur = async (isim, emoji) => {
    if (!kullanici?.odUserId) {
      return { success: false, error: 'Önce giriş yapmalısın!' };
    }
    
    const result = await grupOlustur({ isim, emoji, renk: '#FF6B35' }, kullanici.odUserId);
    
    if (result.success) {
      return { 
        success: true, 
        grup: { id: result.id, isim, emoji, uyeler: [kullanici.odUserId], renk: '#FF6B35' },
        message: `${emoji} ${isim} oluşturuldu!`
      };
    } else {
      return { success: false, error: 'Grup oluşturulamadı!' };
    }
  };

  const yeniEtkinlikOlustur = async (data) => {
    if (!kullanici?.odUserId) {
      return { success: false, error: 'Önce giriş yapmalısın!' };
    }
    
    const grupVar = data.grup && data.grup.id;
    const arkadasVar = data.davetliler && data.davetliler.length > 0;
    
    if (!grupVar && !arkadasVar) {
      return { success: false, error: 'Lütfen bir grup veya arkadaş seç!' };
    }
    
    const etkinlikData = {
      baslik: data.baslik,
      ikon: data.ikon,
      tarih: data.tarih.toISOString(),
      saat: data.saat,
      mekan: data.mekan || 'Belirtilmedi',
      tip: data.tip || (grupVar ? 'grup' : 'arkadas')
    };

    if (grupVar) {
      etkinlikData.grupId = data.grup.id;
      etkinlikData.grup = data.grup;
    }

    if (arkadasVar) {
      etkinlikData.davetliler = data.davetliler;
      etkinlikData.davetliDetaylar = data.davetliDetaylar || [];
    }
    
    const result = await etkinlikOlustur(etkinlikData, kullanici.odUserId);
    
    if (result.success) {
      return { success: true, message: 'Plan oluşturuldu! 🎉' };
    } else {
      return { success: false, error: 'Plan oluşturulamadı!' };
    }
  };

  const katilimDurumuGuncelle = (etkinlikId, durum) => {
    setEtkinlikler(prev => prev.map(e => {
      if (e.id === etkinlikId) {
        const mevcutKatilimci = e.katilimcilar?.find(k => k.odUserId === kullanici?.odUserId);
        if (mevcutKatilimci) {
          return { 
            ...e, 
            katilimcilar: e.katilimcilar.map(k => 
              k.odUserId === kullanici?.odUserId ? { ...k, durum } : k
            ) 
          };
        } else {
          return { 
            ...e, 
            katilimcilar: [...(e.katilimcilar || []), { odUserId: kullanici?.odUserId, durum }] 
          };
        }
      }
      return e;
    }));
    
    const mesajlar = {
      'varim': 'Katılım onaylandı! ✔',
      'bakariz': 'Belki katılacaksın 🤔',
      'yokum': 'Katılmıyorsun ✗'
    };
    
    return { success: true, message: mesajlar[durum] };
  };

  const musaitlikToggle = (tarih, saat) => {
    const key = `${tarih.toDateString()}-${saat}`;
    setMusaitlikler(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const bucketListEkle = (item) => {
    setBucketList(prev => [...prev, { id: Date.now(), ...item, tamamlandi: false }]);
  };

  const bucketListToggle = (id) => {
    setBucketList(prev => prev.map(i => i.id === id ? { ...i, tamamlandi: !i.tamamlandi } : i));
  };

  const bucketListSil = (id) => {
    setBucketList(prev => prev.filter(i => i.id !== id));
  };

  const galeriyeEkle = () => {
    setGaleri(prev => [...prev, { id: Date.now(), tarih: new Date().toLocaleDateString('tr-TR') }]);
  };

  const value = {
    gruplar,
    etkinlikler,
    aktiviteler,
    arkadaslar,
    bucketList,
    galeri,
    musaitlikler,
    setGruplar,
    setEtkinlikler,
    setAktiviteler,
    setArkadaslar,
    setBucketList,
    setGaleri,
    yeniGrupOlustur,
    yeniEtkinlikOlustur,
    katilimDurumuGuncelle,
    musaitlikToggle,
    bucketListEkle,
    bucketListToggle,
    bucketListSil,
    galeriyeEkle
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
