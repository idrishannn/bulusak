import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { gruplariDinle, grupOlustur } from '../services/grupService';
import { etkinlikleriDinle, etkinlikOlustur, katilimDurumuGuncelleDB } from '../services/etkinlikService';
import { arkadaslariDinle } from '../services/arkadasService';
import { konusmalariDinle } from '../services/dmService';
import { hikayeleriDinle, benimHikayelerimi } from '../services/hikayeService';
import { bildirimleriDinle } from '../services/bildirimService';
import { useUI } from './UIContext';

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
    await katilimDurumuGuncelleDB(etkinlikId, kullanici, durum);
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

  const value = {
    gruplar, etkinlikler, arkadaslar, konusmalar, hikayeler, benimHikayelerim,
    bucketList, musaitlikler, yukleniyor,
    yeniGrupOlustur, yeniEtkinlikOlustur, katilimDurumuGuncelle,
    musaitlikToggle, bucketListEkle, bucketListToggle, bucketListSil
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
