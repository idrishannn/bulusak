import { db, COLLECTIONS } from './firebase';
import { 
  collection, doc, addDoc, updateDoc, query, where, orderBy, 
  onSnapshot, serverTimestamp, getDoc, getDocs, limit, writeBatch
} from 'firebase/firestore';

export const konusmaOlusturVeyaGetir = async (kullanici1Id, kullanici2Id) => {
  try {
    const katilimcilar = [kullanici1Id, kullanici2Id].sort();
    const konusmaRef = collection(db, COLLECTIONS.KONUSMALAR);
    const q = query(konusmaRef, where('katilimcilar', '==', katilimcilar));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return { success: true, konusmaId: snapshot.docs[0].id };
    }
    
    const yeniKonusma = await addDoc(konusmaRef, {
      katilimcilar,
      olusturulma: serverTimestamp(),
      sonMesaj: null,
      sonMesajZamani: serverTimestamp()
    });
    
    return { success: true, konusmaId: yeniKonusma.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const mesajGonder = async (konusmaId, gondericiBilgi, mesajIcerigi, tip = 'text') => {
  try {
    const mesajlarRef = collection(db, COLLECTIONS.KONUSMALAR, konusmaId, 'mesajlar');
    const mesaj = {
      gondericId: gondericiBilgi.odUserId,
      gondericIsim: gondericiBilgi.isim,
      gondericAvatar: gondericiBilgi.avatar,
      icerik: mesajIcerigi,
      tip,
      okundu: false,
      zaman: serverTimestamp()
    };
    
    await addDoc(mesajlarRef, mesaj);
    
    const konusmaRef = doc(db, COLLECTIONS.KONUSMALAR, konusmaId);
    await updateDoc(konusmaRef, {
      sonMesaj: tip === 'text' ? mesajIcerigi : (tip === 'image' ? '📷 Fotoğraf' : '👍 Reaksiyon'),
      sonMesajZamani: serverTimestamp(),
      sonGonderic: gondericiBilgi.odUserId
    });
    
    return { success: true, mesaj: { ...mesaj, id: Date.now() } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const mesajlariDinle = (konusmaId, callback) => {
  const mesajlarRef = collection(db, COLLECTIONS.KONUSMALAR, konusmaId, 'mesajlar');
  const q = query(mesajlarRef, orderBy('zaman', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const mesajlar = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      zaman: doc.data().zaman?.toDate?.()?.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) || ''
    }));
    callback(mesajlar);
  });
};

export const konusmalariDinle = (kullaniciId, callback) => {
  const konusmaRef = collection(db, COLLECTIONS.KONUSMALAR);
  const q = query(
    konusmaRef, 
    where('katilimcilar', 'array-contains', kullaniciId),
    orderBy('sonMesajZamani', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const konusmalar = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(konusmalar);
  });
};

export const mesajlariOkunduIsaretle = async (konusmaId, kullaniciId) => {
  try {
    const mesajlarRef = collection(db, COLLECTIONS.KONUSMALAR, konusmaId, 'mesajlar');
    const q = query(mesajlarRef, where('gondericId', '!=', kullaniciId), where('okundu', '==', false));
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { okundu: true, okunmaZamani: serverTimestamp() });
    });
    await batch.commit();
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const yaziyorGuncelle = async (konusmaId, kullaniciId, yaziyor) => {
  try {
    const konusmaRef = doc(db, COLLECTIONS.KONUSMALAR, konusmaId);
    await updateDoc(konusmaRef, {
      [`yaziyor_${kullaniciId}`]: yaziyor ? serverTimestamp() : null
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
