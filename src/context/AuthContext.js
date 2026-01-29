import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from '../services/firebase';
import { googleIleGiris, profilGuncelle as profilGuncelleService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [kullanici, setKullanici] = useState(null);
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [islemYukleniyor, setIslemYukleniyor] = useState(false);
  const [kayitAsamasi, setKayitAsamasi] = useState('giris');
  const [seciliAvatar, setSeciliAvatar] = useState('👨');
  const [avatarKategori, setAvatarKategori] = useState('erkek');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, COLLECTIONS.USERS, user.uid);
        const unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = { odUserId: user.uid, ...docSnap.data() };
            setKullanici(userData);
            if (userData.isim && userData.kullaniciAdi) {
              setGirisYapildi(true);
              setKayitAsamasi('tamamlandi');
            } else {
              setKayitAsamasi('avatar');
            }
          } else {
            setKayitAsamasi('avatar');
          }
          setYukleniyor(false);
        });
        return () => unsubUser();
      } else {
        setKullanici(null);
        setGirisYapildi(false);
        setKayitAsamasi('giris');
        setYukleniyor(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const googleIleGirisYap = async () => {
    setIslemYukleniyor(true);
    const result = await googleIleGiris();
    setIslemYukleniyor(false);
    return result;
  };

  const cikisYapFunc = async () => {
    try {
      await auth.signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const profilTamamla = async (isim, kullaniciAdi) => {
    if (!auth.currentUser) return { success: false, error: 'Önce giriş yapmalısın!' };
    setIslemYukleniyor(true);
    const result = await profilGuncelleService(auth.currentUser.uid, { isim, kullaniciAdi, avatar: seciliAvatar });
    setIslemYukleniyor(false);
    if (result.success) {
      setKayitAsamasi('tamamlandi');
      setGirisYapildi(true);
    }
    return result;
  };

  const avatarGuncelle = async (avatar) => {
    if (!auth.currentUser) return;
    setSeciliAvatar(avatar);
    await profilGuncelleService(auth.currentUser.uid, { avatar });
  };

  const value = {
    kullanici, girisYapildi, yukleniyor, islemYukleniyor, setIslemYukleniyor,
    kayitAsamasi, setKayitAsamasi, seciliAvatar, setSeciliAvatar, avatarKategori, setAvatarKategori,
    googleIleGirisYap, cikisYapFunc, profilTamamla, avatarGuncelle
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
