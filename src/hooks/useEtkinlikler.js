// ============================================
// BULUŞAK - useEtkinlikler Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { etkinlikleriDinle, etkinlikDinle, etkinlikOlustur, etkinlikGuncelle, katilimDurumuGuncelle as katilimGuncelle, mesajEkle, etkinlikIptalEt } from '../services/etkinlikService';

export const useEtkinlikler = (grupIdleri = []) => {
  const { kullanici } = useAuth();
  const { bildirimGoster, setIslemYukleniyor } = useUI();
  const [etkinlikler, setEtkinlikler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (!grupIdleri || grupIdleri.length === 0) { setEtkinlikler([]); setYukleniyor(false); return; }
    setYukleniyor(true);
    const unsubscribe = etkinlikleriDinle(grupIdleri, (yeniEtkinlikler) => {
      const sirali = yeniEtkinlikler.sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
      setEtkinlikler(sirali);
      setYukleniyor(false);
    });
    return () => unsubscribe();
  }, [grupIdleri.join(',')]);

  const yeniEtkinlikOlustur = useCallback(async (data) => {
    if (!kullanici?.odUserId) { bildirimGoster('Önce giriş yapmalısın!', 'hata'); return false; }
    if (!data.grup || !data.grup.id) { bildirimGoster('Lütfen bir grup seç!', 'hata'); return false; }
    setIslemYukleniyor(true);
    try {
      const result = await etkinlikOlustur({ baslik: data.baslik, ikon: data.ikon, grupId: data.grup.id, grup: data.grup, tarih: data.tarih, saat: data.saat, mekan: data.mekan, tip: data.tip || 'ozel' }, kullanici.odUserId);
      if (result.success) { bildirimGoster('Plan oluşturuldu! 🎉'); return result.id; }
      else { bildirimGoster(result.error || 'Plan oluşturulamadı!', 'hata'); return false; }
    } catch (error) { bildirimGoster('Bir hata oluştu!', 'hata'); return false; }
    finally { setIslemYukleniyor(false); }
  }, [kullanici?.odUserId, bildirimGoster, setIslemYukleniyor]);

  const katilimDurumuDegistir = useCallback(async (etkinlikId, durum) => {
    if (!kullanici?.odUserId) { bildirimGoster('Önce giriş yapmalısın!', 'hata'); return false; }
    try {
      const result = await katilimGuncelle(etkinlikId, kullanici.odUserId, durum);
      if (result.success) {
        const mesajlar = { varim: 'Katılım onaylandı! ✓', bakariz: 'Belki katılacaksın 🤔', yokum: 'Katılmıyorsun ✗' };
        bildirimGoster(mesajlar[durum] || 'Güncellendi!');
        return true;
      } else { bildirimGoster(result.error || 'Güncelleme başarısız!', 'hata'); return false; }
    } catch (error) { bildirimGoster('Bir hata oluştu!', 'hata'); return false; }
  }, [kullanici?.odUserId, bildirimGoster]);

  // ÖNEMLİ: Bu fonksiyon mesajları Firebase'e kaydediyor!
  const mesajGonder = useCallback(async (etkinlikId, mesaj) => {
    if (!kullanici?.odUserId) { bildirimGoster('Önce giriş yapmalısın!', 'hata'); return false; }
    if (!mesaj.trim()) return false;
    try {
      const result = await mesajEkle(etkinlikId, { odUserId: kullanici.odUserId, isim: kullanici.isim, avatar: kullanici.avatar, mesaj: mesaj.trim() });
      if (result.success) return true;
      else { bildirimGoster(result.error || 'Mesaj gönderilemedi!', 'hata'); return false; }
    } catch (error) { bildirimGoster('Bir hata oluştu!', 'hata'); return false; }
  }, [kullanici, bildirimGoster]);

  const etkinlikBilgisiGuncelle = useCallback(async (etkinlikId, data) => {
    setIslemYukleniyor(true);
    try {
      const result = await etkinlikGuncelle(etkinlikId, data);
      if (result.success) { bildirimGoster('Etkinlik güncellendi!'); return true; }
      else { bildirimGoster(result.error || 'Güncelleme başarısız!', 'hata'); return false; }
    } catch (error) { bildirimGoster('Bir hata oluştu!', 'hata'); return false; }
    finally { setIslemYukleniyor(false); }
  }, [bildirimGoster, setIslemYukleniyor]);

  const etkinlikIptal = useCallback(async (etkinlikId) => {
    setIslemYukleniyor(true);
    try {
      const result = await etkinlikIptalEt(etkinlikId);
      if (result.success) { bildirimGoster('Etkinlik iptal edildi!'); return true; }
      else { bildirimGoster(result.error || 'İptal başarısız!', 'hata'); return false; }
    } catch (error) { bildirimGoster('Bir hata oluştu!', 'hata'); return false; }
    finally { setIslemYukleniyor(false); }
  }, [bildirimGoster, setIslemYukleniyor]);

  const etkinlikBul = useCallback((tarih, saat) => {
    return etkinlikler.filter(e => { const eTarih = new Date(e.tarih); const hedefTarih = new Date(tarih); return eTarih.toDateString() === hedefTarih.toDateString() && e.saat === saat; });
  }, [etkinlikler]);

  const yaklasanEtkinlikler = etkinlikler.filter(e => { const et = new Date(e.tarih); const b = new Date(); b.setHours(0,0,0,0); return et >= b && e.durum === 'aktif'; });
  const gecmisEtkinlikler = etkinlikler.filter(e => { const et = new Date(e.tarih); const b = new Date(); b.setHours(0,0,0,0); return et < b; });

  return { etkinlikler, yaklasanEtkinlikler, gecmisEtkinlikler, yukleniyor, yeniEtkinlikOlustur, katilimDurumuDegistir, mesajGonder, etkinlikBilgisiGuncelle, etkinlikIptal, etkinlikBul, etkinlikDinle };
};

export default useEtkinlikler;
