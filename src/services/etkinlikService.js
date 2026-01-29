import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion
} from 'firebase/firestore';

export const etkinlikOlustur = async (data, odUserId) => {
  try {
    const etkinlikData = {
      baslik: data.baslik,
      ikon: data.ikon || 'diger',
      tarih: data.tarih,
      saat: data.saat,
      mekan: data.mekan || 'Belirtilmedi',
      tip: data.tip || 'arkadas',
      olusturanId: odUserId,
      olusturmaTarihi: new Date().toISOString(),
      katilimcilar: [{ odUserId, durum: 'varim' }],
      mesajlar: []
    };

    if (data.grup && data.grup.id) {
      etkinlikData.grupId = data.grup.id;
      etkinlikData.grup = data.grup;
    }

    if (data.davetliler && data.davetliler.length > 0) {
      etkinlikData.davetliler = data.davetliler;
      etkinlikData.davetliDetaylar = data.davetliDetaylar || [];
    }

    const docRef = await addDoc(collection(db, 'events'), etkinlikData);
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Etkinlik oluşturma hatası:', error);
    return { success: false, error: error.message };
  }
};

export const etkinlikleriDinle = (grupIds = [], callback, userId = null) => {
  try {
    const eventsRef = collection(db, 'events');
    
    return onSnapshot(eventsRef, (snapshot) => {
      const etkinlikler = [];
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        let eklenecekMi = false;

        if (userId && data.olusturanId === userId) {
          eklenecekMi = true;
        }

        if (grupIds.length > 0 && data.grupId && grupIds.includes(data.grupId)) {
          eklenecekMi = true;
        }

        if (userId && data.davetliler && data.davetliler.includes(userId)) {
          eklenecekMi = true;
        }

        if (eklenecekMi) {
          etkinlikler.push({
            id: docSnap.id,
            ...data
          });
        }
      });

      etkinlikler.sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
      callback(etkinlikler);
    });
  } catch (error) {
    console.error('Etkinlik dinleme hatası:', error);
    callback([]);
    return () => {};
  }
};

export const etkinlikSil = async (etkinlikId) => {
  try {
    await deleteDoc(doc(db, 'events', etkinlikId));
    return { success: true };
  } catch (error) {
    console.error('Etkinlik silme hatası:', error);
    return { success: false, error: error.message };
  }
};

export const etkinlikGuncelle = async (etkinlikId, data) => {
  try {
    await updateDoc(doc(db, 'events', etkinlikId), data);
    return { success: true };
  } catch (error) {
    console.error('Etkinlik güncelleme hatası:', error);
    return { success: false, error: error.message };
  }
};

export const mesajEkle = async (etkinlikId, mesajData) => {
  try {
    const etkinlikRef = doc(db, 'events', etkinlikId);
    
    const yeniMesaj = {
      odUserId: mesajData.odUserId,
      isim: mesajData.isim || 'Kullanıcı',
      avatar: mesajData.avatar || '👤',
      mesaj: mesajData.mesaj,
      zaman: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      tarih: new Date().toISOString()
    };

    await updateDoc(etkinlikRef, {
      mesajlar: arrayUnion(yeniMesaj)
    });

    return { success: true, mesaj: yeniMesaj };
  } catch (error) {
    console.error('Mesaj ekleme hatası:', error);
    return { success: false, error: error.message };
  }
};

export const katilimDurumuGuncelleDB = async (etkinlikId, odUserId, kullaniciData, durum) => {
  try {
    const etkinlikRef = doc(db, 'events', etkinlikId);
    
    const katilimci = {
      odUserId,
      isim: kullaniciData?.isim || 'Kullanıcı',
      avatar: kullaniciData?.avatar || '👤',
      durum,
      guncellemeTarihi: new Date().toISOString()
    };

    await updateDoc(etkinlikRef, {
      [`katilimDurumlari.${odUserId}`]: katilimci
    });
    
    return { success: true };
  } catch (error) {
    console.error('Katılım güncelleme hatası:', error);
    return { success: false, error: error.message };
  }
};
