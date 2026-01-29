import { collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// ============================================
// BİLDİRİM OLUŞTUR
// ============================================
export const bildirimOlustur = async (aliciId, tip, icerik) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      alici: aliciId,
      tip, // 'plan_daveti', 'katilim_degisiklik', 'mesaj', 'arkadas_istegi'
      icerik, // { baslik, mesaj, etkinlikId, gonderenId, gonderenIsim }
      okundu: false,
      tarih: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Bildirim oluşturma hatası:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// BİLDİRİMLERİ DİNLE (REALTIME)
// ============================================
export const bildirimleriDinle = (userId, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('alici', '==', userId),
    orderBy('tarih', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const bildirimler = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(bildirimler);
  }, (error) => {
    console.error('Bildirim dinleme hatası:', error);
    callback([]);
  });
};

// ============================================
// BİLDİRİMİ OKUNDU YAP
// ============================================
export const bildirimOkundu = async (bildirimId) => {
  try {
    await updateDoc(doc(db, 'notifications', bildirimId), {
      okundu: true
    });
    return { success: true };
  } catch (error) {
    console.error('Bildirim güncelleme hatası:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// TÜM BİLDİRİMLERİ OKUNDU YAP
// ============================================
export const tumBildirimleriOkundu = async (bildirimIds) => {
  try {
    const promises = bildirimIds.map(id => 
      updateDoc(doc(db, 'notifications', id), { okundu: true })
    );
    await Promise.all(promises);
    return { success: true };
  } catch (error) {
    console.error('Toplu bildirim güncelleme hatası:', error);
    return { success: false, error: error.message };
  }
};
