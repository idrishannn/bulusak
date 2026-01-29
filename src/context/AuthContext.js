import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  googleIleGiris, 
  cikisYap, 
  kullaniciBilgisiGetir, 
  profilGuncelle,
  auth
} from '../services';
import { arkadasIstekleriniDinle } from '../services/arkadasService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [kullanici, setKullanici] = useState(null);
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [kayitAsamasi, setKayitAsamasi] = useState('giris');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [islemYukleniyor, setIslemYukleniyor] = useState(false);
  const [seciliAvatar, setSeciliAvatar] = useState('👨');
  const [avatarKategori, setAvatarKategori] = useState('erkek');

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userData = await kullaniciBilgisiGetir(user.uid);
        if (userData && userData.profilTamamlandi) {
          setKullanici({ ...userData, id: user.uid, odUserId: user.uid });
          setGirisYapildi(true);
          setKayitAsamasi('giris');
        } else {
          setGirisYapildi(false);
          setKayitAsamasi('avatar');
        }
      } else {
        setKullanici(null);
        setGirisYapildi(false);
        setKayitAsamasi('giris');
      }
      setYukleniyor(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (kullanici?.odUserId) {
      const unsubscribe = arkadasIstekleriniDinle(kullanici.odUserId, (istekler) => {
        setKullanici(prev => prev ? { ...prev, arkadasIstekleri: istekler } : prev);
      });
      return () => unsubscribe();
    }
  }, [kullanici?.odUserId]);

  const googleIleGirisYap = async () => {
    setIslemYukleniyor(true);
    try {
      const result = await googleIleGiris();
      if (result.success) {
        if (result.isNewUser) {
          setKayitAsamasi('avatar');
        } else {
          const userData = await kullaniciBilgisiGetir(result.user.uid);
          if (userData && userData.profilTamamlandi) {
            setKullanici({ ...userData, id: result.user.uid, odUserId: result.user.uid });
            setGirisYapildi(true);
            return { success: true, message: 'Tekrar hoş geldin! 🎉' };
          } else {
            setKayitAsamasi('avatar');
          }
        }
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Bir hata oluştu!' };
    } finally {
      setIslemYukleniyor(false);
    }
  };

  const cikisYapFunc = async () => {
    try {
      await cikisYap();
      setKullanici(null);
      setGirisYapildi(false);
      setKayitAsamasi('giris');
      return { success: true, message: 'Çıkış yapıldı!' };
    } catch (error) {
      console.error('Çıkış hatası:', error);
      return { success: false, error: 'Çıkış yapılamadı!' };
    }
  };

  const profilTamamla = async (isim, kullaniciAdi) => {
    if (!auth.currentUser) {
      return { success: false, error: 'Önce giriş yapmalısın!' };
    }
    
    setIslemYukleniyor(true);
    const userId = auth.currentUser.uid;
    const kucukHarfKullaniciAdi = kullaniciAdi ? kullaniciAdi.toLowerCase().replace('@', '') : `kullanici${Date.now()}`;
    
    const result = await profilGuncelle(userId, {
      isim: isim || 'Kullanıcı',
      kullaniciAdi: `@${kucukHarfKullaniciAdi}`,
      kullaniciAdiLower: kucukHarfKullaniciAdi,
      kullaniciAdiKucuk: kucukHarfKullaniciAdi,
      avatar: seciliAvatar,
      online: true,
      bio: '',
      arkadaslar: [],
      arkadasIstekleri: []
    });
    
    setIslemYukleniyor(false);
    
    if (result.success) {
      setKullanici({
        id: userId,
        odUserId: userId,
        isim: isim || 'Kullanıcı',
        kullaniciAdi: `@${kucukHarfKullaniciAdi}`,
        kullaniciAdiLower: kucukHarfKullaniciAdi,
        kullaniciAdiKucuk: kucukHarfKullaniciAdi,
        avatar: seciliAvatar,
        online: true,
        bio: '',
        arkadaslar: [],
        arkadasIstekleri: []
      });
      setGirisYapildi(true);
      return { success: true, message: 'Hoş geldin! 🎉' };
    } else {
      return { success: false, error: 'Kayıt hatası!' };
    }
  };

  const avatarGuncelle = (yeniAvatar) => {
    setSeciliAvatar(yeniAvatar);
    if (kullanici) {
      setKullanici(prev => ({ ...prev, avatar: yeniAvatar }));
    }
  };

  const value = {
    kullanici,
    girisYapildi,
    kayitAsamasi,
    yukleniyor,
    islemYukleniyor,
    seciliAvatar,
    avatarKategori,
    setKullanici,
    setKayitAsamasi,
    setSeciliAvatar,
    setAvatarKategori,
    setIslemYukleniyor,
    googleIleGirisYap,
    cikisYapFunc,
    profilTamamla,
    avatarGuncelle
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
