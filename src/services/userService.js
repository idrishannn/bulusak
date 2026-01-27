// ============================================
// BULUŞAK - Kullanıcı Servisi
// ============================================

import { doc, getDoc, getDocs, updateDoc, query, where, collection, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { db, COLLECTIONS } from "./firebase";

export const kullaniciBilgisiGetir = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (userDoc.exists()) return { id: userDoc.id, ...userDoc.data() };
    return null;
  } catch (error) {
    console.error("Kullanıcı getirme hatası:", error);
    return null;
  }
};

export const kullanicilariGetir = async (userIds) => {
  try {
    if (!userIds || userIds.length === 0) return [];
    const users = await Promise.all(userIds.map(id => kullaniciBilgisiGetir(id)));
    return users.filter(user => user !== null);
  } catch (error) {
    console.error("Kullanıcılar getirme hatası:", error);
    return [];
  }
};

export const profilGuncelle = async (userId, data) => {
  try {
    const updateData = { ...data, guncellenmeTarihi: serverTimestamp() };
    if (data.kullaniciAdi) updateData.kullaniciAdiLower = data.kullaniciAdi.replace('@', '').toLowerCase();
    if (data.isim && data.kullaniciAdi && data.avatar) updateData.profilTamamlandi = true;
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), updateData);
    return { success: true };
  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    return { success: false, error: error.message };
  }
};

export const avatarGuncelle = async (userId, avatar) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), { avatar, guncellenmeTarihi: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error("Avatar güncelleme hatası:", error);
    return { success: false, error: error.message };
  }
};

export const kullaniciAdiKontrol = async (kullaniciAdi, mevcutUserId = null) => {
  try {
    const temizKullaniciAdi = kullaniciAdi.replace('@', '').toLowerCase().trim();
    if (temizKullaniciAdi.length < 3) return { available: false, error: 'Kullanıcı adı en az 3 karakter olmalı' };
    if (temizKullaniciAdi.length > 20) return { available: false, error: 'Kullanıcı adı en fazla 20 karakter olabilir' };
    if (!/^[a-z0-9_]+$/.test(temizKullaniciAdi)) return { available: false, error: 'Sadece harf, rakam ve alt çizgi kullanılabilir' };
    
    const q = query(collection(db, COLLECTIONS.USERS), where("kullaniciAdiLower", "==", temizKullaniciAdi));
    const snapshot = await getDocs(q);
    
    if (snapshot.docs.length === 1 && snapshot.docs[0].id === mevcutUserId) return { available: true };
    if (!snapshot.empty) return { available: false, error: 'Bu kullanıcı adı zaten alınmış' };
    return { available: true };
  } catch (error) {
    console.error("Kullanıcı adı kontrol hatası:", error);
    return { available: false, error: error.message };
  }
};

export const kullaniciAdiOnerileriUret = async (temelIsim) => {
  const temiz = temelIsim.toLowerCase().replace(/[^a-z0-9]/g, '');
  const oneriler = [];
  const kombinasyonlar = [temiz, `${temiz}_`, `${temiz}${Math.floor(Math.random() * 100)}`, `${temiz}_${Math.floor(Math.random() * 1000)}`, `${temiz}${new Date().getFullYear() % 100}`, `the_${temiz}`, `${temiz}_tr`];
  
  for (const kombinasyon of kombinasyonlar) {
    if (kombinasyon.length >= 3 && kombinasyon.length <= 20) {
      const kontrol = await kullaniciAdiKontrol(kombinasyon);
      if (kontrol.available) { oneriler.push(kombinasyon); if (oneriler.length >= 5) break; }
    }
  }
  return oneriler;
};

export const kullaniciAra = async (aramaMetni, limitSayisi = 10) => {
  try {
    const temizArama = aramaMetni.toLowerCase().replace('@', '').trim();
    if (temizArama.length < 2) return [];
    const q = query(collection(db, COLLECTIONS.USERS), where("kullaniciAdiLower", ">=", temizArama), where("kullaniciAdiLower", "<=", temizArama + '\uf8ff'), limit(limitSayisi));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Kullanıcı arama hatası:", error);
    return [];
  }
};

export const tumKullanicilariGetir = async (limitSayisi = 50) => {
  try {
    const q = query(collection(db, COLLECTIONS.USERS), orderBy("olusturulmaTarihi", "desc"), limit(limitSayisi));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Kullanıcılar getirme hatası:", error);
    return [];
  }
};

export const onlineDurumuGuncelle = async (userId, online) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), { online, [online ? 'sonGiris' : 'sonCikis']: serverTimestamp() });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
