import { db } from './firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs
} from 'firebase/firestore';

export const etkinlikOlustur = async (kullanici, data) => {
  try {
    // Zorunlu alanları kontrol et
    if (!data || !data.baslik || !data.baslik.trim()) {
      return { success: false, error: 'Plan adı zorunludur' };
    }

    const odUserId = kullanici?.odUserId || '';

    // Tarih ve saat'i birleştirerek startAt oluştur
    let startAt;
    if (data.tarih instanceof Date) {
      startAt = data.tarih.toISOString();
    } else if (data.tarih) {
      startAt = new Date(data.tarih).toISOString();
    } else {
      startAt = new Date().toISOString();
    }

    // participantIds: plan sahibi + davetliler
    const participantIds = [odUserId];
    if (data.davetliler && Array.isArray(data.davetliler)) {
      data.davetliler.forEach(id => {
        if (!participantIds.includes(id)) {
          participantIds.push(id);
        }
      });
    }

    // Firestore'a gönderilecek obje - undefined değerler yerine boş string veya varsayılan değer kullan
    const etkinlikData = {
      baslik: data.baslik.trim(),
      aciklama: data.aciklama || '',
      ikon: data.ikon || 'diger',
      tarih: startAt,
      startAt: startAt,
      saat: data.saat || '12:00',
      mekan: data.mekan || 'Belirtilmedi',
      tip: data.tip || 'arkadas',
      olusturanId: odUserId,
      olusturanIsim: kullanici?.isim || '',
      olusturanAvatar: kullanici?.avatar || '👤',
      olusturanProfilGizlilik: kullanici?.profilGizlilik || 'public',
      olusturmaTarihi: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      katilimcilar: [{ odUserId, isim: kullanici?.isim || '', avatar: kullanici?.avatar || '👤', durum: 'varim' }],
      participantIds: participantIds,
      visibility: data.visibility || 'public',
      katilimciLimiti: data.katilimciLimiti || 0,
      status: 'active',
      mesajlar: []
    };

    // Grup bilgisi varsa ekle
    if (data.grup && data.grup.id) {
      etkinlikData.grupId = data.grup.id;
      etkinlikData.grup = {
        id: data.grup.id,
        isim: data.grup.isim || '',
        emoji: data.grup.emoji || '🎉'
      };
    }

    // Davetliler varsa ekle
    if (data.davetliler && Array.isArray(data.davetliler) && data.davetliler.length > 0) {
      etkinlikData.davetliler = data.davetliler;
      etkinlikData.davetliDetaylar = Array.isArray(data.davetliDetaylar) ? data.davetliDetaylar : [];
    }

    const docRef = await addDoc(collection(db, 'events'), etkinlikData);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Etkinlik oluşturma hatası:', error);
    return { success: false, error: error.message };
  }
};

export const etkinlikleriDinle = (userId, callback) => {
  try {
    if (!userId) {
      callback([]);
      return () => {};
    }

    const eventsRef = collection(db, 'events');

    return onSnapshot(eventsRef, (snapshot) => {
      const etkinlikler = [];

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        let eklenecekMi = false;

        // Benim oluşturduğum planlar
        if (data.olusturanId === userId) {
          eklenecekMi = true;
        }

        // Davet edildiğim planlar
        if (data.davetliler && data.davetliler.includes(userId)) {
          eklenecekMi = true;
        }

        // Katılımcı olduğum planlar (participantIds array'inde varsa)
        if (data.participantIds && data.participantIds.includes(userId)) {
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

const PAGE_SIZE = 10;

/**
 * KEŞFET GÖRÜNÜRLüK KURALLARI (Güncellenmiş):
 *
 * 1. Plan görünürlüğü iki katmandır:
 *    - Profil gizliliği (public/private) - artık keşfet için önemsiz
 *    - Plan görünürlüğü (public/private) - asıl belirleyici
 *
 * 2. Keşfet için nihai kural:
 *    - Plan visibility='public' ise keşfette görünebilir
 *    - Profil private olsa bile, kullanıcı planı public yaptıysa plan keşfette GÖRÜNÜR
 *    - Plan visibility='private' ise keşfette GÖRÜNMEZ
 *
 * 3. Ek kurallar (korunuyor):
 *    - Kendi planımı keşfette ben GÖRMEM, ama başkaları görsün
 *    - Geçmiş planlar keşfette görünmez
 *    - Tarih filtresi aktif
 */
export const kesfetPlanlariGetir = async (userId, arkadasIds = [], sonDoc = null) => {
  try {
    const eventsRef = collection(db, 'events');
    const bugun = new Date().toISOString();

    // Query: visibility='public' olan planları çek
    // NOT: Artık olusturanProfilGizlilik kontrolü YOK - plan public ise görünür
    let q = query(
      eventsRef,
      where('visibility', '==', 'public'),
      orderBy('startAt', 'asc'),
      limit(PAGE_SIZE * 2)
    );

    if (sonDoc) {
      q = query(
        eventsRef,
        where('visibility', '==', 'public'),
        orderBy('startAt', 'asc'),
        startAfter(sonDoc),
        limit(PAGE_SIZE * 2)
      );
    }

    const snapshot = await getDocs(q);
    const planlar = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const tarih = data.startAt || data.tarih;

      // KURAL 1: Keşfet'te kendi planlarım ASLA görünmesin (ben görmeyeyim, başkaları görsün)
      if (data.olusturanId === userId) return;

      // KURAL 2: Plan visibility='public' - zaten query'de filtreledik ama double-check
      // NOT: Profil private olsa bile plan public ise GÖRÜNÜR (eski kural kaldırıldı)
      if (data.visibility !== 'public') return;

      // KURAL 3: Geçmiş planları gösterme
      if (new Date(tarih) < new Date(bugun.split('T')[0])) return;

      planlar.push({ id: docSnap.id, ...data, _doc: docSnap });
    });

    const sonDocYeni = snapshot.docs[snapshot.docs.length - 1] || null;
    const dahaVar = snapshot.docs.length >= PAGE_SIZE;

    return { success: true, planlar: planlar.slice(0, PAGE_SIZE), sonDoc: sonDocYeni, dahaVar };
  } catch (error) {
    console.error('Keşfet planları hatası:', error);
    return { success: false, planlar: [], sonDoc: null, dahaVar: false };
  }
};

// Arkadaşlar sekmesi: Arkadaşların planları (benim planlarım hariç)
export const arkadasPlanlariFiltrele = (etkinlikler, arkadasIds = [], userId) => {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);

  return etkinlikler.filter(e => {
    const tarih = new Date(e.startAt || e.tarih);
    // Geçmiş planları gösterme
    if (tarih < bugun) return false;

    // Arkadaşların planları
    if (arkadasIds.includes(e.olusturanId)) return true;

    // Davet edildiğim planlar
    if (e.davetliler?.includes(userId)) return true;

    // participantIds içinde varsa (katıldığım planlar)
    if (e.participantIds?.includes(userId) && e.olusturanId !== userId) return true;

    return false;
  });
};

// Geçmiş planları filtrele
export const gecmisPlanlariFiltrele = (etkinlikler) => {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  return etkinlikler.filter(e => new Date(e.startAt || e.tarih) >= bugun);
};

// Katıldığım planlar: Benim oluşturmadığım ama participantIds içinde olduğum planlar
export const katildigimPlanlariFiltrele = (etkinlikler, userId) => {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);

  return etkinlikler.filter(e => {
    const tarih = new Date(e.startAt || e.tarih);
    if (tarih < bugun) return false;

    // Benim oluşturmadığım
    if (e.olusturanId === userId) return false;

    // Ama katılımcı olduğum
    if (e.participantIds?.includes(userId)) return true;
    if (e.davetliler?.includes(userId)) return true;

    return false;
  });
};
