import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  getDoc,
  onSnapshot
} from 'firebase/firestore';

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

export const arkadasIstegiGonder = async (gonderen, aliciId) => {
  if (!gonderen?.odUserId || !aliciId) {
    return { success: false, error: 'Geçersiz kullanıcı' };
  }
  if (gonderen.odUserId === aliciId) {
    return { success: false, error: 'Kendine istek gönderemezsin!' };
  }

  try {
    const aliciRef = doc(db, 'users', aliciId);
    const aliciDoc = await getDoc(aliciRef);
    
    if (!aliciDoc.exists()) {
      return { success: false, error: 'Kullanıcı bulunamadı' };
    }

    const aliciData = aliciDoc.data();
    
    if (aliciData.arkadaslar?.includes(gonderen.odUserId)) {
      return { success: false, error: 'Zaten arkadaşsınız!' };
    }

    const mevcutIstek = aliciData.arkadasIstekleri?.find(
      i => i.kimden === gonderen.odUserId && i.durum === 'bekliyor'
    );
    
    if (mevcutIstek) {
      return { success: false, error: 'Zaten istek gönderilmiş!' };
    }

    const yeniIstek = {
      kimden: gonderen.odUserId,
      kimdenIsim: gonderen.isim || 'Kullanıcı',
      kimdenAvatar: gonderen.avatar || '👤',
      kimdenKullaniciAdi: gonderen.kullaniciAdi || '@kullanici',
      tarih: new Date().toISOString(),
      durum: 'bekliyor'
    };

    await updateDoc(aliciRef, {
      arkadasIstekleri: arrayUnion(yeniIstek)
    });

    return { success: true, message: 'İstek gönderildi! 🎉' };
  } catch (error) {
    console.error('İstek gönderme hatası:', error);
    return { success: false, error: 'İstek gönderilemedi' };
  }
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
