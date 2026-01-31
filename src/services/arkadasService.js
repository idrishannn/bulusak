import { db } from './firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { bildirimOlustur, BILDIRIM_TIPLERI } from './bildirimService';

export const kullaniciAra = async (aramaMetni) => {
  if (!aramaMetni || aramaMetni.length < 1) {
    return { success: false, kullanicilar: [] };
  }

  try {
    const kucukHarf = aramaMetni.toLowerCase().replace('@', '');
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    const kullanicilar = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const lower = data.kullaniciAdiLower || data.kullaniciAdiKucuk || '';
      const kullaniciAdi = (data.kullaniciAdi || '').toLowerCase().replace('@', '');
      const isim = (data.isim || '').toLowerCase();

      if (lower.includes(kucukHarf) || kullaniciAdi.includes(kucukHarf) || isim.includes(kucukHarf)) {
        kullanicilar.push({
          id: docSnap.id,
          odUserId: docSnap.id,
          ...data
        });
      }
    });

    return { success: true, kullanicilar };
  } catch (error) {
    console.error('Arama hatası:', error);
    return { success: false, kullanicilar: [] };
  }
};

export const takipDurumuGetir = async (kullaniciId, hedefId) => {
  if (!kullaniciId || !hedefId) return { takipEdiyor: false, istekGonderildi: false };

  try {
    const hedefRef = doc(db, 'users', hedefId);
    const hedefDoc = await getDoc(hedefRef);

    if (!hedefDoc.exists()) return { takipEdiyor: false, istekGonderildi: false };

    const hedefData = hedefDoc.data();
    const takipEdiyor = hedefData.takipciler?.includes(kullaniciId) || hedefData.arkadaslar?.includes(kullaniciId);
    const istekGonderildi = hedefData.takipIstekleri?.some(i => i.kimden === kullaniciId && i.durum === 'bekliyor') ||
                           hedefData.arkadasIstekleri?.some(i => i.kimden === kullaniciId && i.durum === 'bekliyor');

    return { takipEdiyor, istekGonderildi };
  } catch (error) {
    return { takipEdiyor: false, istekGonderildi: false };
  }
};

export const takipEt = async (gonderen, aliciId) => {
  if (!gonderen?.odUserId || !aliciId) {
    return { success: false, error: 'Geçersiz kullanıcı' };
  }
  if (gonderen.odUserId === aliciId) {
    return { success: false, error: 'Kendini takip edemezsin!' };
  }

  try {
    const aliciRef = doc(db, 'users', aliciId);
    const aliciDoc = await getDoc(aliciRef);

    if (!aliciDoc.exists()) {
      return { success: false, error: 'Kullanıcı bulunamadı' };
    }

    const aliciData = aliciDoc.data();

    const zadenTakipEdiyor = aliciData.takipciler?.includes(gonderen.odUserId) || aliciData.arkadaslar?.includes(gonderen.odUserId);
    if (zadenTakipEdiyor) {
      return { success: false, error: 'Zaten takip ediyorsun!' };
    }

    const mevcutIstek = aliciData.takipIstekleri?.find(i => i.kimden === gonderen.odUserId && i.durum === 'bekliyor') ||
                        aliciData.arkadasIstekleri?.find(i => i.kimden === gonderen.odUserId && i.durum === 'bekliyor');
    if (mevcutIstek) {
      return { success: false, error: 'Zaten istek gönderilmiş!' };
    }

    const gizliHesap = aliciData.profilGizlilik === 'private';

    if (gizliHesap) {
      const yeniIstek = {
        kimden: gonderen.odUserId,
        kimdenIsim: gonderen.isim || 'Kullanıcı',
        kimdenAvatar: gonderen.avatar || '👤',
        kimdenKullaniciAdi: gonderen.kullaniciAdi || '@kullanici',
        tarih: new Date().toISOString(),
        durum: 'bekliyor',
        tip: 'takip'
      };

      await updateDoc(aliciRef, {
        takipIstekleri: arrayUnion(yeniIstek)
      });

      const bildirimAyarlari = aliciData.bildirimAyarlari || {};
      if (bildirimAyarlari.takipIstekleri !== false) {
        try {
          await bildirimOlustur(
            aliciId,
            BILDIRIM_TIPLERI.TAKIP_ISTEGI,
            {
              mesaj: `${gonderen.isim || 'Bir kullanıcı'} seni takip etmek istiyor`,
              gonderenId: gonderen.odUserId,
              gonderenIsim: gonderen.isim,
              gonderenAvatar: gonderen.avatar
            }
          );
        } catch (e) {}
      }

      return { success: true, message: 'Takip isteği gönderildi!', istekGonderildi: true };
    } else {
      const gonderenRef = doc(db, 'users', gonderen.odUserId);

      await updateDoc(aliciRef, {
        takipciler: arrayUnion(gonderen.odUserId)
      });

      await updateDoc(gonderenRef, {
        takipEdilenler: arrayUnion(aliciId)
      });

      try {
        await bildirimOlustur(
          aliciId,
          BILDIRIM_TIPLERI.YENI_TAKIPCI,
          {
            mesaj: `${gonderen.isim || 'Bir kullanıcı'} seni takip etmeye başladı`,
            gonderenId: gonderen.odUserId,
            gonderenIsim: gonderen.isim,
            gonderenAvatar: gonderen.avatar
          }
        );
      } catch (e) {}

      return { success: true, message: 'Takip edildi!', takipEdildi: true };
    }
  } catch (error) {
    console.error('Takip hatası:', error);
    return { success: false, error: 'Takip edilemedi' };
  }
};

export const takipIstegiKabulEt = async (kullanici, istekGonderenId) => {
  if (!kullanici?.odUserId || !istekGonderenId) {
    return { success: false, error: 'Geçersiz kullanıcı' };
  }

  try {
    const kullaniciRef = doc(db, 'users', kullanici.odUserId);
    const gonderenRef = doc(db, 'users', istekGonderenId);
    const kullaniciDoc = await getDoc(kullaniciRef);
    const kullaniciData = kullaniciDoc.data();

    const mevcutTakipciler = kullaniciData.takipciler || [];
    if (mevcutTakipciler.includes(istekGonderenId)) {
      const guncellenmisIstekler = (kullaniciData.takipIstekleri || []).filter(
        i => !(i.kimden === istekGonderenId && i.durum === 'bekliyor')
      );
      await updateDoc(kullaniciRef, { takipIstekleri: guncellenmisIstekler });
      return { success: true, message: 'Zaten takipçin!' };
    }

    const guncellenmisIstekler = (kullaniciData.takipIstekleri || []).filter(
      i => !(i.kimden === istekGonderenId && i.durum === 'bekliyor')
    );

    await updateDoc(kullaniciRef, {
      takipIstekleri: guncellenmisIstekler,
      takipciler: arrayUnion(istekGonderenId)
    });

    await updateDoc(gonderenRef, {
      takipEdilenler: arrayUnion(kullanici.odUserId)
    });

    try {
      await bildirimOlustur(
        istekGonderenId,
        BILDIRIM_TIPLERI.TAKIP_KABUL,
        {
          mesaj: `${kullanici.isim || 'Bir kullanıcı'} takip isteğini kabul etti`,
          gonderenId: kullanici.odUserId,
          gonderenIsim: kullanici.isim,
          gonderenAvatar: kullanici.avatar
        }
      );
    } catch (e) {}

    return { success: true, message: 'Takip isteği kabul edildi!', kabulEdenIsim: kullanici.isim };
  } catch (error) {
    console.error('Kabul hatası:', error);
    return { success: false, error: 'Kabul edilemedi' };
  }
};

export const takipIstegiReddet = async (kullanici, istekGonderenId) => {
  if (!kullanici?.odUserId || !istekGonderenId) {
    return { success: false, error: 'Geçersiz kullanıcı' };
  }

  try {
    const kullaniciRef = doc(db, 'users', kullanici.odUserId);
    const kullaniciDoc = await getDoc(kullaniciRef);
    const kullaniciData = kullaniciDoc.data();

    const guncellenmisIstekler = (kullaniciData.takipIstekleri || []).filter(
      i => !(i.kimden === istekGonderenId && i.durum === 'bekliyor')
    );

    await updateDoc(kullaniciRef, {
      takipIstekleri: guncellenmisIstekler
    });

    return { success: true, message: 'Takip isteği reddedildi' };
  } catch (error) {
    console.error('Reddetme hatası:', error);
    return { success: false, error: 'Reddedilemedi' };
  }
};

export const takiptenCik = async (kullanici, hedefId) => {
  if (!kullanici?.odUserId || !hedefId) {
    return { success: false, error: 'Geçersiz kullanıcı' };
  }

  try {
    const kullaniciRef = doc(db, 'users', kullanici.odUserId);
    const hedefRef = doc(db, 'users', hedefId);

    await updateDoc(kullaniciRef, {
      takipEdilenler: arrayRemove(hedefId)
    });

    await updateDoc(hedefRef, {
      takipciler: arrayRemove(kullanici.odUserId)
    });

    return { success: true, message: 'Takipten çıkıldı' };
  } catch (error) {
    console.error('Takipten çıkma hatası:', error);
    return { success: false, error: 'Takipten çıkılamadı' };
  }
};

export const takipIstekleriniDinle = (userId, callback) => {
  if (!userId) return () => {};
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const bekleyenIstekler = (data.takipIstekleri || []).filter(i => i.durum === 'bekliyor');
      callback(bekleyenIstekler);
    }
  });
};

export const arkadasIstegiGonder = async (gonderen, aliciId) => {
  return await takipEt(gonderen, aliciId);
};

export const arkadasIstegiKabulEt = async (kullanici, istekGonderenId) => {
  if (!kullanici?.odUserId || !istekGonderenId) {
    return { success: false, error: 'Geçersiz kullanıcı' };
  }

  try {
    const kullaniciRef = doc(db, 'users', kullanici.odUserId);
    const gonderenRef = doc(db, 'users', istekGonderenId);
    const kullaniciDoc = await getDoc(kullaniciRef);
    const kullaniciData = kullaniciDoc.data();

    const guncellenmisIstekler = kullaniciData.arkadasIstekleri?.filter(
      i => !(i.kimden === istekGonderenId && i.durum === 'bekliyor')
    ) || [];

    await updateDoc(kullaniciRef, {
      arkadasIstekleri: guncellenmisIstekler,
      arkadaslar: arrayUnion(istekGonderenId)
    });

    await updateDoc(gonderenRef, {
      arkadaslar: arrayUnion(kullanici.odUserId)
    });

    try {
      await bildirimOlustur(
        istekGonderenId,
        BILDIRIM_TIPLERI.ARKADAS_KABUL,
        {
          mesaj: `${kullanici.isim || 'Bir kullanıcı'} arkadaşlık isteğini kabul etti`,
          gonderenId: kullanici.odUserId,
          gonderenIsim: kullanici.isim,
          gonderenAvatar: kullanici.avatar
        }
      );
    } catch (e) {}

    return { success: true, message: 'Arkadaşlık kabul edildi! 🎉' };
  } catch (error) {
    console.error('Kabul hatası:', error);
    return { success: false, error: 'Kabul edilemedi' };
  }
};

export const arkadasIstegiReddet = async (kullanici, istekGonderenId) => {
  if (!kullanici?.odUserId || !istekGonderenId) {
    return { success: false, error: 'Geçersiz kullanıcı' };
  }

  try {
    const kullaniciRef = doc(db, 'users', kullanici.odUserId);
    const kullaniciDoc = await getDoc(kullaniciRef);
    const kullaniciData = kullaniciDoc.data();

    const guncellenmisIstekler = kullaniciData.arkadasIstekleri?.filter(
      i => !(i.kimden === istekGonderenId && i.durum === 'bekliyor')
    ) || [];

    await updateDoc(kullaniciRef, {
      arkadasIstekleri: guncellenmisIstekler
    });

    return { success: true, message: 'İstek reddedildi' };
  } catch (error) {
    console.error('Reddetme hatası:', error);
    return { success: false, error: 'Reddedilemedi' };
  }
};

export const arkadasSil = async (kullanici, arkadasId) => {
  if (!kullanici?.odUserId || !arkadasId) {
    return { success: false, error: 'Geçersiz kullanıcı' };
  }

  try {
    const kullaniciRef = doc(db, 'users', kullanici.odUserId);
    const arkadasRef = doc(db, 'users', arkadasId);

    await updateDoc(kullaniciRef, {
      arkadaslar: arrayRemove(arkadasId)
    });

    await updateDoc(arkadasRef, {
      arkadaslar: arrayRemove(kullanici.odUserId)
    });

    return { success: true, message: 'Arkadaşlıktan çıkarıldı' };
  } catch (error) {
    console.error('Silme hatası:', error);
    return { success: false, error: 'Silinemedi' };
  }
};

export const arkadasListesiGetir = async (arkadasIds) => {
  if (!arkadasIds || arkadasIds.length === 0) {
    return { success: true, arkadaslar: [] };
  }

  try {
    const arkadaslar = [];
    for (const id of arkadasIds) {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        arkadaslar.push({ id: docSnap.id, odUserId: docSnap.id, ...docSnap.data() });
      }
    }
    return { success: true, arkadaslar };
  } catch (error) {
    console.error('Liste hatası:', error);
    return { success: false, arkadaslar: [] };
  }
};

export const arkadasIstekleriniDinle = (userId, callback) => {
  if (!userId) return () => {};
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const bekleyenIstekler = data.arkadasIstekleri?.filter(i => i.durum === 'bekliyor') || [];
      callback(bekleyenIstekler);
    }
  });
};

export const arkadaslariDinle = (userId, callback) => {
  if (!userId) return () => {};
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, async (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const arkadasIds = data.arkadaslar || [];
      if (arkadasIds.length > 0) {
        const result = await arkadasListesiGetir(arkadasIds);
        callback(result.arkadaslar);
      } else {
        callback([]);
      }
    }
  });
};

export const kullaniciAdiKontrol = async (kullaniciAdi) => {
  return { musait: true };
};
