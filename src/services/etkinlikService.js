// ============================================
// BULUŞAK - Etkinlik Servisi
// ============================================

import { doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, collection, onSnapshot, orderBy, arrayUnion, serverTimestamp, Timestamp } from "firebase/firestore";
import { db, COLLECTIONS } from "./firebase";

export const etkinlikOlustur = async (etkinlikData, userId) => {
  try {
    let tarih = etkinlikData.tarih;
    if (typeof tarih === 'string') tarih = new Date(tarih);
    
    const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), {
      baslik: etkinlikData.baslik,
      ikon: etkinlikData.ikon || 'diger',
      grupId: etkinlikData.grupId,
      grup: etkinlikData.grup || null,
      tarih: Timestamp.fromDate(tarih),
      saat: etkinlikData.saat,
      mekan: etkinlikData.mekan || 'Belirtilmedi',
      aciklama: etkinlikData.aciklama || '',
      olusturan: userId,
      katilimcilar: [{ odUserId: userId, durum: 'varim', katilmaTarihi: new Date() }],
      durum: 'aktif',
      mesajlar: [],
      olusturulmaTarihi: serverTimestamp(),
      guncellenmeTarihi: serverTimestamp(),
      tip: etkinlikData.tip || 'ozel',
      maksKatilimci: etkinlikData.maksKatilimci || null
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Etkinlik oluşturma hatası:", error);
    return { success: false, error: error.message };
  }
};

export const etkinlikBilgisiGetir = async (etkinlikId) => {
  try {
    const etkinlikDoc = await getDoc(doc(db, COLLECTIONS.EVENTS, etkinlikId));
    if (etkinlikDoc.exists()) {
      const data = etkinlikDoc.data();
      return { id: etkinlikDoc.id, ...data, tarih: data.tarih?.toDate?.() || new Date(data.tarih) };
    }
    return null;
  } catch (error) {
    console.error("Etkinlik getirme hatası:", error);
    return null;
  }
};

export const kullanicininEtkinlikleriniGetir = async (grupIds) => {
  try {
    if (!grupIds || grupIds.length === 0) return [];
    const grupIdsSlice = grupIds.slice(0, 10);
    const q = query(collection(db, COLLECTIONS.EVENTS), where("grupId", "in", grupIdsSlice), where("durum", "==", "aktif"), orderBy("tarih", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => { const data = doc.data(); return { id: doc.id, ...data, tarih: data.tarih?.toDate?.() || new Date(data.tarih) }; });
  } catch (error) {
    console.error("Etkinlikler getirme hatası:", error);
    return [];
  }
};

export const etkinlikleriDinle = (grupIds, callback) => {
  if (!grupIds || grupIds.length === 0) { callback([]); return () => {}; }
  const grupIdsSlice = grupIds.slice(0, 10);
  const q = query(collection(db, COLLECTIONS.EVENTS), where("grupId", "in", grupIdsSlice));
  return onSnapshot(q, (snapshot) => {
    const etkinlikler = snapshot.docs.map(doc => { const data = doc.data(); return { id: doc.id, ...data, tarih: data.tarih?.toDate?.() || new Date(data.tarih) }; });
    callback(etkinlikler);
  }, (error) => { console.error("Etkinlik dinleme hatası:", error); callback([]); });
};

export const etkinlikDinle = (etkinlikId, callback) => {
  return onSnapshot(doc(db, COLLECTIONS.EVENTS, etkinlikId), (docSnap) => {
    if (docSnap.exists()) { const data = docSnap.data(); callback({ id: docSnap.id, ...data, tarih: data.tarih?.toDate?.() || new Date(data.tarih) }); }
    else callback(null);
  }, (error) => { console.error("Etkinlik dinleme hatası:", error); callback(null); });
};

export const katilimDurumuGuncelle = async (etkinlikId, userId, durum) => {
  try {
    const etkinlikRef = doc(db, COLLECTIONS.EVENTS, etkinlikId);
    const etkinlikDoc = await getDoc(etkinlikRef);
    if (!etkinlikDoc.exists()) return { success: false, error: "Etkinlik bulunamadı" };
    
    let katilimcilar = etkinlikDoc.data().katilimcilar || [];
    const index = katilimcilar.findIndex(k => k.odUserId === userId);
    
    if (index >= 0) { katilimcilar[index] = { ...katilimcilar[index], durum, guncellemeTarihi: new Date() }; }
    else { katilimcilar.push({ odUserId: userId, durum, katilmaTarihi: new Date() }); }
    
    await updateDoc(etkinlikRef, { katilimcilar, guncellenmeTarihi: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error("Katılım güncelleme hatası:", error);
    return { success: false, error: error.message };
  }
};

// ÖNEMLİ: Bu fonksiyon mesajları Firebase'e kaydediyor!
export const mesajEkle = async (etkinlikId, mesajData) => {
  try {
    const etkinlikRef = doc(db, COLLECTIONS.EVENTS, etkinlikId);
    const etkinlikDoc = await getDoc(etkinlikRef);
    if (!etkinlikDoc.exists()) return { success: false, error: "Etkinlik bulunamadı" };
    
    const yeniMesaj = {
      id: Date.now().toString(),
      odUserId: mesajData.odUserId,
      isim: mesajData.isim,
      avatar: mesajData.avatar,
      mesaj: mesajData.mesaj,
      zaman: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      tarih: new Date().toISOString()
    };
    
    await updateDoc(etkinlikRef, { mesajlar: arrayUnion(yeniMesaj), guncellenmeTarihi: serverTimestamp() });
    return { success: true, mesaj: yeniMesaj };
  } catch (error) {
    console.error("Mesaj ekleme hatası:", error);
    return { success: false, error: error.message };
  }
};

export const mesajlariGetir = async (etkinlikId) => {
  try {
    const etkinlik = await etkinlikBilgisiGetir(etkinlikId);
    return etkinlik?.mesajlar || [];
  } catch (error) {
    console.error("Mesajlar getirme hatası:", error);
    return [];
  }
};

export const etkinlikGuncelle = async (etkinlikId, data) => {
  try {
    const updateData = { ...data };
    if (data.tarih) updateData.tarih = Timestamp.fromDate(new Date(data.tarih));
    updateData.guncellenmeTarihi = serverTimestamp();
    await updateDoc(doc(db, COLLECTIONS.EVENTS, etkinlikId), updateData);
    return { success: true };
  } catch (error) {
    console.error("Etkinlik güncelleme hatası:", error);
    return { success: false, error: error.message };
  }
};

export const etkinlikIptalEt = async (etkinlikId) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.EVENTS, etkinlikId), { durum: 'iptal', iptalTarihi: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error("Etkinlik iptal hatası:", error);
    return { success: false, error: error.message };
  }
};

export const etkinlikKaliciSil = async (etkinlikId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.EVENTS, etkinlikId));
    return { success: true };
  } catch (error) {
    console.error("Etkinlik silme hatası:", error);
    return { success: false, error: error.message };
  }
};
