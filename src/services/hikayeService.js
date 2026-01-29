import { db, COLLECTIONS } from './firebase';
import { 
  collection, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy, 
  onSnapshot, serverTimestamp, getDoc, getDocs, arrayUnion
} from 'firebase/firestore';

const HIKAYE_SURESI = 24 * 60 * 60 * 1000;

export const hikayeEkle = async (kullanici, icerik, tip = 'text') => {
  try {
    const hikayeRef = collection(db, COLLECTIONS.HIKAYELER);
    const hikaye = {
      olusturanId: kullanici.odUserId,
      olusturanIsim: kullanici.isim,
      olusturanAvatar: kullanici.avatar,
      olusturanKullaniciAdi: kullanici.kullaniciAdi,
      icerik,
      tip,
      izleyenler: [],
      tepkiler: [],
      olusturulma: serverTimestamp(),
      sonlanma: new Date(Date.now() + HIKAYE_SURESI)
    };
    
    const docRef = await addDoc(hikayeRef, hikaye);
    return { success: true, hikayeId: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const hikayeleriDinle = (arkadasIds, callback) => {
  if (!arkadasIds || arkadasIds.length === 0) {
    callback([]);
    return () => {};
  }

  const hikayeRef = collection(db, COLLECTIONS.HIKAYELER);
  const simdi = new Date();
  const q = query(
    hikayeRef,
    where('olusturanId', 'in', arkadasIds.slice(0, 10)),
    where('sonlanma', '>', simdi),
    orderBy('sonlanma', 'desc'),
    orderBy('olusturulma', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const hikayeler = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      olusturulma: doc.data().olusturulma?.toDate?.() || new Date()
    }));
    
    const gruplu = hikayeler.reduce((acc, hikaye) => {
      const key = hikaye.olusturanId;
      if (!acc[key]) {
        acc[key] = {
          kullaniciId: hikaye.olusturanId,
          kullaniciIsim: hikaye.olusturanIsim,
          kullaniciAvatar: hikaye.olusturanAvatar,
          kullaniciAdi: hikaye.olusturanKullaniciAdi,
          hikayeler: []
        };
      }
      acc[key].hikayeler.push(hikaye);
      return acc;
    }, {});
    
    callback(Object.values(gruplu));
  });
};

export const hikayeIzle = async (hikayeId, izleyenBilgi) => {
  try {
    const hikayeRef = doc(db, COLLECTIONS.HIKAYELER, hikayeId);
    await updateDoc(hikayeRef, {
      izleyenler: arrayUnion({
        odUserId: izleyenBilgi.odUserId,
        isim: izleyenBilgi.isim,
        avatar: izleyenBilgi.avatar,
        zaman: new Date().toISOString()
      })
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const hikayeyeTepkiVer = async (hikayeId, tepkiBilgi) => {
  try {
    const hikayeRef = doc(db, COLLECTIONS.HIKAYELER, hikayeId);
    await updateDoc(hikayeRef, {
      tepkiler: arrayUnion({
        odUserId: tepkiBilgi.odUserId,
        isim: tepkiBilgi.isim,
        avatar: tepkiBilgi.avatar,
        emoji: tepkiBilgi.emoji,
        zaman: new Date().toISOString()
      })
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const hikayeSil = async (hikayeId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.HIKAYELER, hikayeId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const benimHikayelerimi = async (kullaniciId) => {
  try {
    const hikayeRef = collection(db, COLLECTIONS.HIKAYELER);
    const simdi = new Date();
    const q = query(
      hikayeRef,
      where('olusturanId', '==', kullaniciId),
      where('sonlanma', '>', simdi),
      orderBy('sonlanma', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const hikayeler = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, hikayeler };
  } catch (error) {
    return { success: false, error: error.message, hikayeler: [] };
  }
};
