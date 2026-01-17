// ============================================
// BULUŞAK - Firebase Yapılandırması
// ============================================

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDHG-f1PQzxs5de1G95AJdPtrNAvelalAg",
  authDomain: "bulusak-821d7.firebaseapp.com",
  projectId: "bulusak-821d7",
  storageBucket: "bulusak-821d7.firebasestorage.app",
  messagingSenderId: "960564405077",
  appId: "1:960564405077:web:729361eab970c3cf7005dc",
  measurementId: "G-JJBF3JHESK"
};

// Firebase başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ============================================
// AUTH FONKSİYONLARI
// ============================================

// Google ile giriş
export const googleIleGiris = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Kullanıcı Firestore'da var mı kontrol et
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      // Yeni kullanıcı - temel bilgileri kaydet
      await setDoc(doc(db, "users", user.uid), {
        isim: user.displayName || "Kullanıcı",
        email: user.email,
        avatar: "👨",
        kullaniciAdi: `@${user.email.split("@")[0]}`,
        online: true,
        olusturulmaTarihi: serverTimestamp(),
        profilTamamlandi: false
      });
    } else {
      // Mevcut kullanıcı - online yap
      await updateDoc(doc(db, "users", user.uid), {
        online: true
      });
    }
    
    return { success: true, user, isNewUser: !userDoc.exists() };
  } catch (error) {
    console.error("Giriş hatası:", error);
    return { success: false, error: error.message };
  }
};

// Çıkış yap
export const cikisYap = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, "users", user.uid), {
        online: false
      });
    }
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Çıkış hatası:", error);
    return { success: false, error: error.message };
  }
};

// Auth durumunu dinle
export const authDurumuDinle = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ============================================
// KULLANICI FONKSİYONLARI
// ============================================

// Kullanıcı bilgilerini getir
export const kullaniciBilgisiGetir = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Kullanıcı getirme hatası:", error);
    return null;
  }
};

// Kullanıcı profilini güncelle
export const profilGuncelle = async (userId, data) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      ...data,
      profilTamamlandi: true
    });
    return { success: true };
  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    return { success: false, error: error.message };
  }
};

// Tüm kullanıcıları getir (arkadaş arama için)
export const tumKullanicilariGetir = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Kullanıcılar getirme hatası:", error);
    return [];
  }
};

// ============================================
// GRUP FONKSİYONLARI
// ============================================

// Yeni grup oluştur
export const grupOlustur = async (grupData, userId) => {
  try {
    const docRef = await addDoc(collection(db, "groups"), {
      ...grupData,
      olusturan: userId,
      uyeler: [userId, ...(grupData.uyeler || [])],
      olusturulmaTarihi: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Grup oluşturma hatası:", error);
    return { success: false, error: error.message };
  }
};

// Kullanıcının gruplarını getir
export const kullanicininGruplariniGetir = async (userId) => {
  try {
    const q = query(
      collection(db, "groups"),
      where("uyeler", "array-contains", userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Gruplar getirme hatası:", error);
    return [];
  }
};

// Grupları realtime dinle
export const gruplariDinle = (userId, callback) => {
  const q = query(
    collection(db, "groups"),
    where("uyeler", "array-contains", userId)
  );
  return onSnapshot(q, (snapshot) => {
    const gruplar = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(gruplar);
  });
};

// ============================================
// ETKİNLİK FONKSİYONLARI
// ============================================

// Yeni etkinlik oluştur
export const etkinlikOlustur = async (etkinlikData, userId) => {
  try {
    const docRef = await addDoc(collection(db, "events"), {
      ...etkinlikData,
      olusturan: userId,
      katilimcilar: [{ odUserId: userId, durum: "varim" }],
      durum: "aktif",
      mesajlar: [],
      reactler: [],
      olusturulmaTarihi: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Etkinlik oluşturma hatası:", error);
    return { success: false, error: error.message };
  }
};

// Kullanıcının etkinliklerini getir
export const kullanicininEtkinlikleriniGetir = async (userId) => {
  try {
    // Kullanıcının gruplarını al
    const gruplar = await kullanicininGruplariniGetir(userId);
    const grupIds = gruplar.map(g => g.id);
    
    if (grupIds.length === 0) return [];
    
    const q = query(
      collection(db, "events"),
      where("grupId", "in", grupIds),
      orderBy("tarih", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Etkinlikler getirme hatası:", error);
    return [];
  }
};

// Etkinlikleri realtime dinle
export const etkinlikleriDinle = (grupIds, callback) => {
  if (grupIds.length === 0) {
    callback([]);
    return () => {};
  }
  
  const q = query(
    collection(db, "events"),
    where("grupId", "in", grupIds.slice(0, 10)) // Firestore limit: 10
  );
  
  return onSnapshot(q, (snapshot) => {
    const etkinlikler = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(etkinlikler);
  });
};

// Katılım durumu güncelle
export const katilimDurumuGuncelle = async (etkinlikId, odUserId, durum) => {
  try {
    const etkinlikRef = doc(db, "events", etkinlikId);
    const etkinlikDoc = await getDoc(etkinlikRef);
    
    if (etkinlikDoc.exists()) {
      let katilimcilar = etkinlikDoc.data().katilimcilar || [];
      const index = katilimcilar.findIndex(k => k.odUserId === odUserId);
      
      if (index >= 0) {
        katilimcilar[index].durum = durum;
      } else {
        katilimcilar.push({ odUserId, durum });
      }
      
      await updateDoc(etkinlikRef, { katilimcilar });
      return { success: true };
    }
    return { success: false, error: "Etkinlik bulunamadı" };
  } catch (error) {
    console.error("Katılım güncelleme hatası:", error);
    return { success: false, error: error.message };
  }
};

// Etkinliğe mesaj ekle
export const mesajEkle = async (etkinlikId, mesajData) => {
  try {
    const etkinlikRef = doc(db, "events", etkinlikId);
    const etkinlikDoc = await getDoc(etkinlikRef);
    
    if (etkinlikDoc.exists()) {
      const mesajlar = etkinlikDoc.data().mesajlar || [];
      mesajlar.push({
        ...mesajData,
        zaman: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
      });
      
      await updateDoc(etkinlikRef, { mesajlar });
      return { success: true };
    }
    return { success: false, error: "Etkinlik bulunamadı" };
  } catch (error) {
    console.error("Mesaj ekleme hatası:", error);
    return { success: false, error: error.message };
  }
};

// ============================================
// BİLDİRİM FONKSİYONLARI
// ============================================

// Bildirim oluştur
export const bildirimOlustur = async (aliciId, tip, icerik) => {
  try {
    await addDoc(collection(db, "notifications"), {
      alici: aliciId,
      tip,
      icerik,
      okundu: false,
      tarih: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Bildirim oluşturma hatası:", error);
    return { success: false, error: error.message };
  }
};

// Kullanıcının bildirimlerini dinle
export const bildirimleriDinle = (userId, callback) => {
  const q = query(
    collection(db, "notifications"),
    where("alici", "==", userId),
    orderBy("tarih", "desc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const bildirimler = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(bildirimler);
  });
};

// Bildirimi okundu yap
export const bildirimOkundu = async (bildirimId) => {
  try {
    await updateDoc(doc(db, "notifications", bildirimId), {
      okundu: true
    });
    return { success: true };
  } catch (error) {
    console.error("Bildirim güncelleme hatası:", error);
    return { success: false, error: error.message };
  }
};

// Export
export { auth, db };