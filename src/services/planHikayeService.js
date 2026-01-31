import { db, COLLECTIONS } from './firebase';
import {
  collection, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy,
  onSnapshot, serverTimestamp, getDoc, getDocs, arrayUnion, limit
} from 'firebase/firestore';
import { bildirimOlustur } from './bildirimService';
import { PLAN_HIKAYE_SURESI, PLAN_HIKAYE_MAX_SABITLEME, NOTIFICATION_TYPES } from '../constants';

export const planHikayeEkle = async (kullanici, planId, icerik, tip = 'image', etiketlenenler = []) => {
  try {
    const hikayeRef = collection(db, COLLECTIONS.PLAN_HIKAYELERI);
    const hikaye = {
      planId,
      olusturanId: kullanici.odUserId,
      olusturanIsim: kullanici.isim,
      olusturanAvatar: kullanici.avatar,
      olusturanKullaniciAdi: kullanici.kullaniciAdi,
      olusturanProfilGizlilik: kullanici.profilGizlilik || 'public',
      icerik,
      tip,
      etiketlenenler,
      izleyenler: [],
      tepkiler: [],
      sabitleme: false,
      sabitlemeZamani: null,
      olusturulma: serverTimestamp(),
      sonlanma: new Date(Date.now() + PLAN_HIKAYE_SURESI)
    };

    const docRef = await addDoc(hikayeRef, hikaye);
    return { success: true, hikayeId: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const planHikayeleriniDinle = (planId, callback) => {
  if (!planId) {
    callback([]);
    return () => {};
  }

  const hikayeRef = collection(db, COLLECTIONS.PLAN_HIKAYELERI);
  const q = query(
    hikayeRef,
    where('planId', '==', planId),
    orderBy('olusturulma', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const hikayeler = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      olusturulma: doc.data().olusturulma?.toDate?.() || new Date(),
      sonlanma: doc.data().sonlanma?.toDate?.() || doc.data().sonlanma
    }));

    const simdi = new Date();
    const aktifHikayeler = hikayeler.filter(h => {
      if (h.sabitleme) return true;
      const sonlanma = h.sonlanma instanceof Date ? h.sonlanma : new Date(h.sonlanma);
      return sonlanma > simdi;
    });

    const gruplu = aktifHikayeler.reduce((acc, hikaye) => {
      const key = hikaye.olusturanId;
      if (!acc[key]) {
        acc[key] = {
          odUserId: hikaye.olusturanId,
          isim: hikaye.olusturanIsim,
          avatar: hikaye.olusturanAvatar,
          kullaniciAdi: hikaye.olusturanKullaniciAdi,
          profilGizlilik: hikaye.olusturanProfilGizlilik,
          hikayeler: [],
          sabitHikayeler: []
        };
      }
      if (hikaye.sabitleme) {
        acc[key].sabitHikayeler.push(hikaye);
      } else {
        acc[key].hikayeler.push(hikaye);
      }
      return acc;
    }, {});

    callback(Object.values(gruplu));
  });
};

export const planHikayeIzle = async (hikayeId, izleyenBilgi) => {
  try {
    const hikayeRef = doc(db, COLLECTIONS.PLAN_HIKAYELERI, hikayeId);
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

export const planHikayeyeTepkiVer = async (hikayeId, tepkiBilgi) => {
  try {
    const hikayeRef = doc(db, COLLECTIONS.PLAN_HIKAYELERI, hikayeId);
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

export const planHikayeSabitle = async (hikayeId, kullaniciId) => {
  try {
    const hikayeRef = doc(db, COLLECTIONS.PLAN_HIKAYELERI, hikayeId);
    const hikayeDoc = await getDoc(hikayeRef);

    if (!hikayeDoc.exists()) {
      return { success: false, error: 'Hikaye bulunamadı' };
    }

    const hikaye = hikayeDoc.data();

    if (hikaye.olusturanId !== kullaniciId) {
      return { success: false, error: 'Sadece kendi hikayeni sabitleyebilirsin' };
    }

    const sabitHikayelerRef = collection(db, COLLECTIONS.PLAN_HIKAYELERI);
    const q = query(
      sabitHikayelerRef,
      where('planId', '==', hikaye.planId),
      where('olusturanId', '==', kullaniciId),
      where('sabitleme', '==', true)
    );
    const sabitSnapshot = await getDocs(q);

    if (sabitSnapshot.size >= PLAN_HIKAYE_MAX_SABITLEME) {
      return { success: false, error: `En fazla ${PLAN_HIKAYE_MAX_SABITLEME} hikaye sabitleyebilirsin` };
    }

    await updateDoc(hikayeRef, {
      sabitleme: true,
      sabitlemeZamani: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const planHikayeSabitKaldir = async (hikayeId, kullaniciId) => {
  try {
    const hikayeRef = doc(db, COLLECTIONS.PLAN_HIKAYELERI, hikayeId);
    const hikayeDoc = await getDoc(hikayeRef);

    if (!hikayeDoc.exists()) {
      return { success: false, error: 'Hikaye bulunamadı' };
    }

    const hikaye = hikayeDoc.data();

    if (hikaye.olusturanId !== kullaniciId) {
      return { success: false, error: 'Sadece kendi hikayeni düzenleyebilirsin' };
    }

    const sonlanma = hikaye.sonlanma instanceof Date ? hikaye.sonlanma : new Date(hikaye.sonlanma);
    const simdi = new Date();

    if (sonlanma < simdi) {
      await deleteDoc(hikayeRef);
      return { success: true, silindi: true };
    }

    await updateDoc(hikayeRef, {
      sabitleme: false,
      sabitlemeZamani: null
    });

    return { success: true, silindi: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const planHikayeSil = async (hikayeId, kullaniciId) => {
  try {
    const hikayeRef = doc(db, COLLECTIONS.PLAN_HIKAYELERI, hikayeId);
    const hikayeDoc = await getDoc(hikayeRef);

    if (!hikayeDoc.exists()) {
      return { success: false, error: 'Hikaye bulunamadı' };
    }

    const hikaye = hikayeDoc.data();

    if (hikaye.olusturanId !== kullaniciId) {
      return { success: false, error: 'Sadece kendi hikayeni silebilirsin' };
    }

    await deleteDoc(hikayeRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const kullanicininPlanHikayeleriniGetir = async (kullaniciId) => {
  try {
    const hikayeRef = collection(db, COLLECTIONS.PLAN_HIKAYELERI);
    const q = query(
      hikayeRef,
      where('olusturanId', '==', kullaniciId),
      where('sabitleme', '==', true),
      orderBy('sabitlemeZamani', 'desc')
    );

    const snapshot = await getDocs(q);
    const hikayeler = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      olusturulma: doc.data().olusturulma?.toDate?.() || new Date()
    }));

    const planlaraGore = hikayeler.reduce((acc, hikaye) => {
      if (!acc[hikaye.planId]) {
        acc[hikaye.planId] = [];
      }
      acc[hikaye.planId].push(hikaye);
      return acc;
    }, {});

    return { success: true, hikayeler: planlaraGore };
  } catch (error) {
    return { success: false, error: error.message, hikayeler: {} };
  }
};

export const planHikayeYuklemeAktifMi = (plan) => {
  if (!plan) return false;

  const simdi = new Date();

  if (plan.hikayelerBaslangic) {
    const baslangic = new Date(plan.hikayelerBaslangic);
    const bitis = new Date(baslangic.getTime() + PLAN_HIKAYE_SURESI);
    return simdi >= baslangic && simdi <= bitis;
  }

  const planTarihi = new Date(plan.startAt || plan.tarih);
  const planSaati = plan.saat ? plan.saat.split(':') : ['12', '00'];
  planTarihi.setHours(parseInt(planSaati[0]), parseInt(planSaati[1]), 0, 0);

  if (simdi < planTarihi) return false;

  const bitis = new Date(planTarihi.getTime() + PLAN_HIKAYE_SURESI);
  return simdi <= bitis;
};

export const planHikayeKalanSure = (plan) => {
  if (!plan) return 0;

  const simdi = new Date();
  let bitis;

  if (plan.hikayelerBaslangic) {
    const baslangic = new Date(plan.hikayelerBaslangic);
    bitis = new Date(baslangic.getTime() + PLAN_HIKAYE_SURESI);
  } else {
    const planTarihi = new Date(plan.startAt || plan.tarih);
    const planSaati = plan.saat ? plan.saat.split(':') : ['12', '00'];
    planTarihi.setHours(parseInt(planSaati[0]), parseInt(planSaati[1]), 0, 0);
    bitis = new Date(planTarihi.getTime() + PLAN_HIKAYE_SURESI);
  }

  const kalan = bitis - simdi;
  return kalan > 0 ? kalan : 0;
};

export const hikayeGorunurMu = (hikaye, izleyenKullanici, takipEdilenler = []) => {
  if (!hikaye || !izleyenKullanici) return false;

  if (hikaye.olusturanId === izleyenKullanici.odUserId) return true;

  if (hikaye.olusturanProfilGizlilik !== 'private') return true;

  return takipEdilenler.includes(hikaye.olusturanId);
};
