import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { gruplariDinle, grupOlustur } from '../services/grupService';
import { etkinlikleriDinle, etkinlikOlustur, katilimDurumuGuncelleDB, kesfetPlanlariGetir, arkadasPlanlariFiltrele, gecmisPlanlariFiltrele, katildigimPlanlariFiltrele, planHatirlatmalariniKontrolEt } from '../services/etkinlikService';
import { arkadaslariDinle } from '../services/arkadasService';
import { konusmalariDinle } from '../services/dmService';
import { hikayeleriDinle, benimHikayelerimi, hikayeEkle as hikayeEkleService } from '../services/hikayeService';
import { bildirimleriDinle } from '../services/bildirimService';
import { useUI } from './UIContext';
import { STORAGE_KEYS, DEFAULT_DISCOVER_SETTINGS } from '../constants';

// Haversine formülü ile iki koordinat arasındaki mesafeyi hesapla (km)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Dünya yarıçapı (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { kullanici } = useAuth();
  const { bildirimGoster, setBildirimler } = useUI();

  const [gruplar, setGruplar] = useState([]);
  const [etkinlikler, setEtkinlikler] = useState([]);
  const [arkadaslar, setArkadaslar] = useState([]);
  const [konusmalar, setKonusmalar] = useState([]);
  const [hikayeler, setHikayeler] = useState([]);
  const [benimHikayelerim, setBenimHikayelerim] = useState([]);
  const [bucketList, setBucketList] = useState([]);
  const [musaitlikler, setMusaitlikler] = useState({});
  const [yukleniyor, setYukleniyor] = useState(true);

  const [feedKaynagi, setFeedKaynagi] = useState('arkadaslar');
  const [kesfetPlanlar, setKesfetPlanlar] = useState([]);
  const [kesfetSonDoc, setKesfetSonDoc] = useState(null);
  const [kesfetDahaVar, setKesfetDahaVar] = useState(true);
  const [kesfetYukleniyor, setKesfetYukleniyor] = useState(false);

  // Konum Bazlı Keşfet - Merkez ve Yarıçap State'leri
  const [kesfetMerkezKonum, setKesfetMerkezKonum] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_LOCATION);
      return saved ? JSON.parse(saved) : DEFAULT_DISCOVER_SETTINGS.centerLocation;
    } catch {
      return DEFAULT_DISCOVER_SETTINGS.centerLocation;
    }
  });

  const [kesfetYaricap, setKesfetYaricap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOCATION_RADIUS);
      return saved ? parseInt(saved, 10) : DEFAULT_DISCOVER_SETTINGS.radius;
    } catch {
      return DEFAULT_DISCOVER_SETTINGS.radius;
    }
  });

  useEffect(() => {
    if (!kullanici?.odUserId) {
      setYukleniyor(false);
      return;
    }

    setYukleniyor(true);
    const unsubscribers = [];

    unsubscribers.push(gruplariDinle(kullanici.odUserId, setGruplar));
    unsubscribers.push(etkinlikleriDinle(kullanici.odUserId, setEtkinlikler));
    unsubscribers.push(arkadaslariDinle(kullanici.odUserId, setArkadaslar));
    unsubscribers.push(konusmalariDinle(kullanici.odUserId, setKonusmalar));
    unsubscribers.push(bildirimleriDinle(kullanici.odUserId, setBildirimler));

    setTimeout(() => setYukleniyor(false), 1000);

    return () => unsubscribers.forEach(unsub => unsub && unsub());
  }, [kullanici?.odUserId]);

  useEffect(() => {
    if (!kullanici?.odUserId || !arkadaslar?.length) return;
    const arkadasIds = arkadaslar.map(a => a.odUserId);
    const unsub = hikayeleriDinle(arkadasIds, setHikayeler);
    return () => unsub && unsub();
  }, [kullanici?.odUserId, arkadaslar]);

  useEffect(() => {
    if (!kullanici?.odUserId) return;
    const fetchHikayelerim = async () => {
      const result = await benimHikayelerimi(kullanici.odUserId);
      if (result.success) setBenimHikayelerim(result.hikayeler);
    };
    fetchHikayelerim();
  }, [kullanici?.odUserId]);

  // Plan hatırlatma bildirimleri (her dakika kontrol et)
  useEffect(() => {
    if (!kullanici?.odUserId || !etkinlikler?.length) return;

    // İlk kontrol
    planHatirlatmalariniKontrolEt(etkinlikler, kullanici);

    // Her dakika kontrol et
    const interval = setInterval(() => {
      planHatirlatmalariniKontrolEt(etkinlikler, kullanici);
    }, 60000); // 1 dakika

    return () => clearInterval(interval);
  }, [kullanici?.odUserId, etkinlikler]);

  const yeniGrupOlustur = async (isim, emoji) => {
    const result = await grupOlustur(kullanici, isim, emoji);
    if (result.success) bildirimGoster('Grup oluşturuldu!', 'success');
    else bildirimGoster(result.error, 'error');
    return result;
  };

  const yeniEtkinlikOlustur = async (data) => {
    const result = await etkinlikOlustur(kullanici, data);
    if (result.success) bildirimGoster('Plan oluşturuldu!', 'success');
    else bildirimGoster(result.error, 'error');
    return result;
  };

  const katilimDurumuGuncelle = async (etkinlikId, durum) => {
    await katilimDurumuGuncelleDB(etkinlikId, kullanici?.odUserId, kullanici, durum);
    return { success: true };
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

  // Hikaye Ekleme
  const hikayeEkle = async (hikayeData) => {
    const result = await hikayeEkleService(kullanici, hikayeData.metin || hikayeData.gorsel, hikayeData.gorsel ? 'image' : 'text');
    if (result.success) {
      // Hikayelerimi yeniden yükle
      const hikayelerimResult = await benimHikayelerimi(kullanici.odUserId);
      if (hikayelerimResult.success) {
        setBenimHikayelerim(hikayelerimResult.hikayeler);
      }
    }
    return result;
  };

  // Konum Bazlı Keşfet Fonksiyonları
  const merkezKonumGuncelle = useCallback((konum) => {
    setKesfetMerkezKonum(konum);
    if (konum) {
      localStorage.setItem(STORAGE_KEYS.USER_LOCATION, JSON.stringify(konum));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_LOCATION);
    }
    // Konum değiştiğinde keşfeti yeniden yükle
    setKesfetPlanlar([]);
    setKesfetSonDoc(null);
    setKesfetDahaVar(true);
  }, []);

  const yaricapGuncelle = useCallback((yaricap) => {
    setKesfetYaricap(yaricap);
    localStorage.setItem(STORAGE_KEYS.LOCATION_RADIUS, yaricap.toString());
    // Yarıçap değiştiğinde keşfeti yeniden yükle
    setKesfetPlanlar([]);
    setKesfetSonDoc(null);
    setKesfetDahaVar(true);
  }, []);

  // Plan konumuna göre yarıçap içinde mi kontrol et
  const planYaricaptaMi = useCallback((plan, merkez, yaricap) => {
    if (!merkez || !yaricap) return true; // Konum seçilmemişse tüm planları göster

    // Plan konumunu al (önce plan mekanı, sonra oluşturan konumu)
    const planKonum = plan.location || plan.olusturanKonum;
    if (!planKonum?.lat || !planKonum?.lng) return true; // Konum yoksa göster

    const mesafe = calculateDistance(
      merkez.lat,
      merkez.lng,
      planKonum.lat,
      planKonum.lng
    );

    return mesafe <= yaricap;
  }, []);

  const arkadasPlanlar = React.useMemo(() => {
    if (!etkinlikler?.length) return [];
    const arkadasIds = arkadaslar?.map(a => a.odUserId) || [];
    return arkadasPlanlariFiltrele(etkinlikler, arkadasIds, kullanici?.odUserId);
  }, [etkinlikler, arkadaslar, kullanici?.odUserId]);

  const kesfetYukle = async (yenidenYukle = false) => {
    if (kesfetYukleniyor) return;
    if (!yenidenYukle && !kesfetDahaVar) return;

    setKesfetYukleniyor(true);
    const arkadasIds = arkadaslar?.map(a => a.odUserId) || [];
    const sonDoc = yenidenYukle ? null : kesfetSonDoc;

    const result = await kesfetPlanlariGetir(kullanici?.odUserId, arkadasIds, sonDoc);

    if (result.success) {
      if (yenidenYukle) {
        setKesfetPlanlar(result.planlar);
      } else {
        setKesfetPlanlar(prev => [...prev, ...result.planlar]);
      }
      setKesfetSonDoc(result.sonDoc);
      setKesfetDahaVar(result.dahaVar);
    }
    setKesfetYukleniyor(false);
  };

  const feedDegistir = (kaynak) => {
    setFeedKaynagi(kaynak);
    if (kaynak === 'kesfet' && kesfetPlanlar.length === 0) {
      kesfetYukle(true);
    }
  };

  const value = {
    gruplar, etkinlikler, arkadaslar, konusmalar, hikayeler, benimHikayelerim,
    bucketList, musaitlikler, yukleniyor,
    yeniGrupOlustur, yeniEtkinlikOlustur, katilimDurumuGuncelle,
    musaitlikToggle, bucketListEkle, bucketListToggle, bucketListSil,
    hikayeEkle,
    feedKaynagi, arkadasPlanlar, kesfetPlanlar, kesfetDahaVar, kesfetYukleniyor,
    feedDegistir, kesfetYukle,
    // Konum Bazlı Keşfet
    kesfetMerkezKonum, kesfetYaricap,
    merkezKonumGuncelle, yaricapGuncelle, planYaricaptaMi
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
