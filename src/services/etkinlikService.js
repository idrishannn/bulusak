import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';

// ============================================
// ETKİNLİK OLUŞTUR (Grup VEYA Arkadaş bazlı)
// ============================================
export const etkinlikOlustur = async (data, odUserId) => {
  try {
    const etkinlikData = {
      baslik: data.baslik,
      ikon: data.ikon || 'diger',
      tarih: data.tarih,
      saat: data.saat,
      mekan: data.mekan || 'Belirtilmedi',
      tip: data.tip || 'arkadas', // 'arkadas' veya 'grup'
      olusturanId: odUserId,
      olusturmaTarihi: new Date().toISOString(),
      katilimcilar: [{ odUserId, durum: 'varim' }],
      mesajlar: []
    };

    // Grup bazlı plan
    if (data.grup && data.grup.id) {
      etkinlikData.grupId = data.grup.id;
      etkinlikData.grup = data.grup;
    }

    // Arkadaş bazlı plan (GRUPSUZ)
    if (data.davetliler && data.davetliler.length > 0) {
      etkinlikData.davetliler = data.davetliler;
      etkinlikData.davetliDetaylar = data.davetliDetaylar || [];
    }

    const docRef = await addDoc(collection(db, 'events'), etkinlikData);
    console.log('Etkinlik oluşturuldu:', docRef.id);
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Etkinlik oluşturma hatası:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// ETKİNLİKLERİ DİNLE (Grup + Davetli olduklarım + Kendi oluşturduklarım)
// ============================================
export const etkinlikleriDinle = (grupIds = [], callback, userId = null) => {
  try {
    const eventsRef = collection(db, 'events');
    
    return onSnapshot(eventsRef, (snapshot) => {
      const etkinlikler = [];
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        
        let eklenecekMi = false;

        // 1. Kullanıcının oluşturduğu planlar
        if (userId && data.olusturanId === userId) {
          eklenecekMi = true;
        }

        // 2. Kullanıcının dahil olduğu grup planları
        if (grupIds.length > 0 && data.grupId && grupIds.includes(data.grupId)) {
          eklenecekMi = true;
        }

        // 3. Kullanıcının davet edildiği arkadaş planları (GRUPSUZ)
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

      // Tarihe göre sırala (yakın olan önce)
      etkinlikler.sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
      
      console.log('Etkinlikler yüklendi:', etkinlikler.length);
      callback(etkinlikler);
    });
  } catch (error) {
    console.error('Etkinlik dinleme hatası:', error);
    callback([]);
    return () => {};
  }
};

// ============================================
// MESAJ EKLE
// ============================================
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

// ============================================
// KATILIM DURUMU GÜNCELLE
// ============================================
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
