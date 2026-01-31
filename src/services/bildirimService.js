import { db, COLLECTIONS } from './firebase';
import { 
  collection, doc, addDoc, updateDoc, query, where, orderBy, 
  onSnapshot, serverTimestamp, getDocs, writeBatch, limit
} from 'firebase/firestore';

export const bildirimOlustur = async (aliciId, tip, veri) => {
  try {
    const bildirimRef = collection(db, COLLECTIONS.BILDIRIMLER);
    const bildirim = {
      aliciId,
      tip,
      ...veri,
      okundu: false,
      olusturulma: serverTimestamp()
    };
    
    await addDoc(bildirimRef, bildirim);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const bildirimleriDinle = (kullaniciId, callback) => {
  const bildirimRef = collection(db, COLLECTIONS.BILDIRIMLER);
  const q = query(
    bildirimRef,
    where('aliciId', '==', kullaniciId),
    orderBy('olusturulma', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, (snapshot) => {
    const bildirimler = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      olusturulma: doc.data().olusturulma?.toDate?.() || new Date()
    }));
    callback(bildirimler);
  });
};

export const bildirimOkunduIsaretle = async (bildirimId) => {
  try {
    const bildirimRef = doc(db, COLLECTIONS.BILDIRIMLER, bildirimId);
    await updateDoc(bildirimRef, { okundu: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const tumBildirimleriOkunduIsaretle = async (kullaniciId) => {
  try {
    const bildirimRef = collection(db, COLLECTIONS.BILDIRIMLER);
    const q = query(bildirimRef, where('aliciId', '==', kullaniciId), where('okundu', '==', false));
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { okundu: true });
    });
    await batch.commit();
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const okunmamisBildirimSayisi = async (kullaniciId) => {
  try {
    const bildirimRef = collection(db, COLLECTIONS.BILDIRIMLER);
    const q = query(bildirimRef, where('aliciId', '==', kullaniciId), where('okundu', '==', false));
    const snapshot = await getDocs(q);
    return { success: true, sayi: snapshot.size };
  } catch (error) {
    return { success: false, error: error.message, sayi: 0 };
  }
};

export const BILDIRIM_TIPLERI = {
  ARKADAS_ISTEGI: 'arkadas_istegi',
  ARKADAS_KABUL: 'arkadas_kabul',
  TAKIP_ISTEGI: 'takip_istegi',
  TAKIP_KABUL: 'takip_kabul',
  YENI_TAKIPCI: 'yeni_takipci',
  YENI_MESAJ: 'yeni_mesaj',
  HIKAYE_IZLENDI: 'hikaye_izlendi',
  HIKAYE_TEPKI: 'hikaye_tepki',
  PLAN_DAVET: 'plan_davet',
  PLAN_GUNCELLEME: 'plan_guncelleme',
  PLAN_YORUM: 'plan_yorum',
  PLAN_BASLADI: 'plan_basladi',
  PLAN_KATILIM_SORGUSU: 'plan_katilim_sorgusu',
  PLAN_HIKAYE_EKLENDI: 'plan_hikaye_eklendi',
  PLAN_HIKAYE_ETIKETLENDI: 'plan_hikaye_etiketlendi',
  PLAN_HIKAYE_SURE_BITMEK_UZERE: 'plan_hikaye_sure_bitmek_uzere'
};

export const bildirimMesaji = (tip, veri) => {
  switch (tip) {
    case BILDIRIM_TIPLERI.ARKADAS_ISTEGI:
      return `${veri.kimdenIsim} sana arkadaşlık isteği gönderdi`;
    case BILDIRIM_TIPLERI.ARKADAS_KABUL:
      return `${veri.kimIsim} arkadaşlık isteğini kabul etti`;
    case BILDIRIM_TIPLERI.TAKIP_ISTEGI:
      return `${veri.gonderenIsim || veri.kimdenIsim} seni takip etmek istiyor`;
    case BILDIRIM_TIPLERI.TAKIP_KABUL:
      return `${veri.gonderenIsim || veri.kimIsim} takip isteğini kabul etti`;
    case BILDIRIM_TIPLERI.YENI_TAKIPCI:
      return `${veri.gonderenIsim || veri.kimdenIsim} seni takip etmeye başladı`;
    case BILDIRIM_TIPLERI.YENI_MESAJ:
      return `${veri.kimdenIsim}: ${veri.mesajOnizleme}`;
    case BILDIRIM_TIPLERI.HIKAYE_IZLENDI:
      return `${veri.kimIsim} hikayeni izledi`;
    case BILDIRIM_TIPLERI.HIKAYE_TEPKI:
      return `${veri.kimIsim} hikayene ${veri.emoji} tepki verdi`;
    case BILDIRIM_TIPLERI.PLAN_DAVET:
      return `${veri.kimdenIsim} seni "${veri.planBaslik}" planına davet etti`;
    case BILDIRIM_TIPLERI.PLAN_GUNCELLEME:
      return `"${veri.planBaslik}" planı güncellendi`;
    case BILDIRIM_TIPLERI.PLAN_YORUM:
      return `${veri.kimdenIsim} "${veri.planBaslik}" planına yorum yaptı`;
    case BILDIRIM_TIPLERI.PLAN_BASLADI:
      return `"${veri.planBaslik}" başladı! Hikaye yükleyebilirsin`;
    case BILDIRIM_TIPLERI.PLAN_KATILIM_SORGUSU:
      return `"${veri.planBaslik}" planının zamanı geldi! Katıldın mı?`;
    case BILDIRIM_TIPLERI.PLAN_HIKAYE_EKLENDI:
      return `${veri.kimdenIsim} "${veri.planBaslik}" planına hikaye ekledi`;
    case BILDIRIM_TIPLERI.PLAN_HIKAYE_ETIKETLENDI:
      return `${veri.kimdenIsim} seni bir plan hikayesinde etiketledi`;
    case BILDIRIM_TIPLERI.PLAN_HIKAYE_SURE_BITMEK_UZERE:
      return `"${veri.planBaslik}" için hikaye yüklemek için son 1 saat!`;
    default:
      return 'Yeni bildirim';
  }
};
