// ============================================
// BULUŞAK - Grup Servisi
// ============================================

import { doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, collection, onSnapshot, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";
import { db, COLLECTIONS } from "./firebase";

export const grupOlustur = async (grupData, userId) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.GROUPS), {
      isim: grupData.isim,
      emoji: grupData.emoji || '🎉',
      renk: grupData.renk || '#FF6B35',
      aciklama: grupData.aciklama || '',
      olusturan: userId,
      uyeler: [userId, ...(grupData.uyeler || [])],
      adminler: [userId],
      olusturulmaTarihi: serverTimestamp(),
      guncellenmeTarihi: serverTimestamp(),
      aktif: true
    });
    return { success: true, id: docRef.id, grup: { id: docRef.id, isim: grupData.isim, emoji: grupData.emoji || '🎉', uyeler: [userId, ...(grupData.uyeler || [])] } };
  } catch (error) {
    console.error("Grup oluşturma hatası:", error);
    return { success: false, error: error.message };
  }
};

export const grupBilgisiGetir = async (grupId) => {
  try {
    const grupDoc = await getDoc(doc(db, COLLECTIONS.GROUPS, grupId));
    if (grupDoc.exists()) return { id: grupDoc.id, ...grupDoc.data() };
    return null;
  } catch (error) {
    console.error("Grup getirme hatası:", error);
    return null;
  }
};

export const kullanicininGruplariniGetir = async (userId) => {
  try {
    const q = query(collection(db, COLLECTIONS.GROUPS), where("uyeler", "array-contains", userId), where("aktif", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Gruplar getirme hatası:", error);
    return [];
  }
};

export const gruplariDinle = (userId, callback) => {
  const q = query(collection(db, COLLECTIONS.GROUPS), where("uyeler", "array-contains", userId));
  return onSnapshot(q, (snapshot) => {
    const gruplar = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(gruplar);
  }, (error) => {
    console.error("Grup dinleme hatası:", error);
    callback([]);
  });
};

export const grupGuncelle = async (grupId, data) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.GROUPS, grupId), { ...data, guncellenmeTarihi: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error("Grup güncelleme hatası:", error);
    return { success: false, error: error.message };
  }
};

export const grubaUyeEkle = async (grupId, userId) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.GROUPS, grupId), { uyeler: arrayUnion(userId), guncellenmeTarihi: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error("Üye ekleme hatası:", error);
    return { success: false, error: error.message };
  }
};

export const gruptanUyeCikar = async (grupId, userId) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.GROUPS, grupId), { uyeler: arrayRemove(userId), guncellenmeTarihi: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error("Üye çıkarma hatası:", error);
    return { success: false, error: error.message };
  }
};

export const grubaTopluUyeEkle = async (grupId, userIds) => {
  try {
    const grupRef = doc(db, COLLECTIONS.GROUPS, grupId);
    for (const userId of userIds) { await updateDoc(grupRef, { uyeler: arrayUnion(userId) }); }
    await updateDoc(grupRef, { guncellenmeTarihi: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error("Toplu üye ekleme hatası:", error);
    return { success: false, error: error.message };
  }
};

export const grupSil = async (grupId) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.GROUPS, grupId), { aktif: false, silinmeTarihi: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error("Grup silme hatası:", error);
    return { success: false, error: error.message };
  }
};

export const grupKaliciSil = async (grupId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.GROUPS, grupId));
    return { success: true };
  } catch (error) {
    console.error("Grup kalıcı silme hatası:", error);
    return { success: false, error: error.message };
  }
};

export const grupAdminiMi = async (grupId, userId) => {
  try {
    const grup = await grupBilgisiGetir(grupId);
    if (!grup) return false;
    return grup.adminler?.includes(userId) || grup.olusturan === userId;
  } catch (error) {
    return false;
  }
};

export const grupUyesiMi = async (grupId, userId) => {
  try {
    const grup = await grupBilgisiGetir(grupId);
    if (!grup) return false;
    return grup.uyeler?.includes(userId);
  } catch (error) {
    return false;
  }
};
