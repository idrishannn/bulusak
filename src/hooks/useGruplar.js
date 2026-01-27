// ============================================
// BULUŞAK - useGruplar Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { gruplariDinle, grupOlustur, grupGuncelle, grubaUyeEkle, gruptanUyeCikar, grupSil } from '../services/grupService';

export const useGruplar = () => {
  const { kullanici } = useAuth();
  const { bildirimGoster, setIslemYukleniyor } = useUI();
  const [gruplar, setGruplar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (!kullanici?.odUserId) { setGruplar([]); setYukleniyor(false); return; }
    setYukleniyor(true);
    const unsubscribe = gruplariDinle(kullanici.odUserId, (yeniGruplar) => { setGruplar(yeniGruplar); setYukleniyor(false); });
    return () => unsubscribe();
  }, [kullanici?.odUserId]);

  const yeniGrupOlustur = useCallback(async (isim, emoji, uyeler = []) => {
    if (!kullanici?.odUserId) { bildirimGoster('Önce giriş yapmalısın!', 'hata'); return null; }
    setIslemYukleniyor(true);
    try {
      const result = await grupOlustur({ isim, emoji, uyeler, renk: '#FF6B35' }, kullanici.odUserId);
      if (result.success) { bildirimGoster(`${emoji} ${isim} oluşturuldu!`); return result.grup; }
      else { bildirimGoster(result.error || 'Grup oluşturulamadı!', 'hata'); return null; }
    } catch (error) { bildirimGoster('Bir hata oluştu!', 'hata'); return null; }
    finally { setIslemYukleniyor(false); }
  }, [kullanici?.odUserId, bildirimGoster, setIslemYukleniyor]);

  const grupBilgisiGuncelle = useCallback(async (grupId, data) => {
    setIslemYukleniyor(true);
    try {
      const result = await grupGuncelle(grupId, data);
      if (result.success) { bildirimGoster('Grup güncellendi!'); return true; }
      else { bildirimGoster(result.error || 'Güncelleme başarısız!', 'hata'); return false; }
    } catch (error) { bildirimGoster('Bir hata oluştu!', 'hata'); return false; }
    finally { setIslemYukleniyor(false); }
  }, [bildirimGoster, setIslemYukleniyor]);

  const uyeEkle = useCallback(async (grupId, userId) => {
    try {
      const result = await grubaUyeEkle(grupId, userId);
      if (result.success) { bildirimGoster('Üye eklendi!'); return true; }
      else { bildirimGoster(result.error || 'Üye eklenemedi!', 'hata'); return false; }
    } catch (error) { bildirimGoster('Bir hata oluştu!', 'hata'); return false; }
  }, [bildirimGoster]);

  const uyeCikar = useCallback(async (grupId, userId) => {
    try {
      const result = await gruptanUyeCikar(grupId, userId);
      if (result.success) { bildirimGoster('Üye çıkarıldı!'); return true; }
      else { bildirimGoster(result.error || 'Üye çıkarılamadı!', 'hata'); return false; }
    } catch (error) { bildirimGoster('Bir hata oluştu!', 'hata'); return false; }
  }, [bildirimGoster]);

  const grupKaldir = useCallback(async (grupId) => {
    setIslemYukleniyor(true);
    try {
      const result = await grupSil(grupId);
      if (result.success) { bildirimGoster('Grup silindi!'); return true; }
      else { bildirimGoster(result.error || 'Grup silinemedi!', 'hata'); return false; }
    } catch (error) { bildirimGoster('Bir hata oluştu!', 'hata'); return false; }
    finally { setIslemYukleniyor(false); }
  }, [bildirimGoster, setIslemYukleniyor]);

  const grupIdleri = gruplar.map(g => g.id);

  return { gruplar, grupIdleri, yukleniyor, yeniGrupOlustur, grupBilgisiGuncelle, uyeEkle, uyeCikar, grupKaldir };
};

export default useGruplar;
