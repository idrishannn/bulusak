import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { gruplariDinle, grupOlustur } from '../services/grupService';
import { etkinlikleriDinle, etkinlikOlustur, katilimDurumuGuncelleDB, kesfetPlanlariGetir, arkadasPlanlariFiltrele, gecmisPlanlariFiltrele, katildigimPlanlariFiltrele } from '../services/etkinlikService';
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

  const [feedKaynagi, setFeedKaynagi] = useState('arkadaslar');
  const [kesfetPlanlar, setKesfetPlanlar] = useState([]);
  const [kesfetSonDoc, setKesfetSonDoc] = useState(null);
  const [kesfetDahaVar, setKesfetDahaVar] = useState(true);
  const [kesfetYukleniyor, setKesfetYukleniyor] = useState(false);

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
    feedKaynagi, arkadasPlanlar, kesfetPlanlar, kesfetDahaVar, kesfetYukleniyor,
    feedDegistir, kesfetYukle
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
