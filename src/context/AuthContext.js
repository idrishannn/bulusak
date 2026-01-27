import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  googleIleGiris, 
  cikisYap, 
  kullaniciBilgisiGetir, 
  profilGuncelle,
  auth
} from '../services';

// Context oluştur
const AuthContext = createContext(null);

// Custom hook - kolay erişim için
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  // Auth State
  const [kullanici, setKullanici] = useState(null);
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [kayitAsamasi, setKayitAsamasi] = useState('giris'); // 'giris', 'avatar', 'bilgi'
  const [yukleniyor, setYukleniyor] = useState(true);
  const [islemYukleniyor, setIslemYukleniyor] = useState(false);
  
  // Avatar seçimi (kayıt aşamasında kullanılıyor)
  const [seciliAvatar, setSeciliAvatar] = useState('👨');
  const [avatarKategori, setAvatarKategori] = useState('erkek');

  // Firebase Auth Listener
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

  // Google ile giriş
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

  // Çıkış yap
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

  // Profil tamamla (kayıt son adım)
  const profilTamamla = async (isim, kullaniciAdi) => {
    if (!auth.currentUser) {
      return { success: false, error: 'Önce giriş yapmalısın!' };
    }
    
    setIslemYukleniyor(true);
    const userId = auth.currentUser.uid;
    
    const result = await profilGuncelle(userId, {
      isim: isim || 'Kullanıcı',
      kullaniciAdi: kullaniciAdi ? `@${kullaniciAdi.replace('@', '')}` : `@kullanici${Date.now()}`,
      avatar: seciliAvatar,
      online: true,
      bio: ''
    });
    
    setIslemYukleniyor(false);
    
    if (result.success) {
      setKullanici({
        id: userId,
        odUserId: userId,
        isim: isim || 'Kullanıcı',
        kullaniciAdi: kullaniciAdi ? `@${kullaniciAdi.replace('@', '')}` : `@kullanici${Date.now()}`,
        avatar: seciliAvatar,
        online: true,
        bio: ''
      });
      setGirisYapildi(true);
      return { success: true, message: 'Hoş geldin! 🎉' };
    } else {
      return { success: false, error: 'Kayıt hatası!' };
    }
  };

  // Avatar güncelle
  const avatarGuncelle = (yeniAvatar) => {
    setSeciliAvatar(yeniAvatar);
    if (kullanici) {
      setKullanici(prev => ({ ...prev, avatar: yeniAvatar }));
    }
  };

  // Context value
  const value = {
    // State
    kullanici,
    girisYapildi,
    kayitAsamasi,
    yukleniyor,
    islemYukleniyor,
    seciliAvatar,
    avatarKategori,
    
    // Setters
    setKullanici,
    setKayitAsamasi,
    setSeciliAvatar,
    setAvatarKategori,
    
    // Actions
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
