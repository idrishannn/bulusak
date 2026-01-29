import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

export const googleIleGiris = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        isim: user.displayName || 'Kullanıcı',
        email: user.email,
        avatar: '👨',
        kullaniciAdi: `@${user.email.split('@')[0]}`,
        kullaniciAdiLower: user.email.split('@')[0].toLowerCase(),
        kullaniciAdiKucuk: user.email.split('@')[0].toLowerCase(),
        online: true,
        olusturulmaTarihi: serverTimestamp(),
        profilTamamlandi: false,
        arkadaslar: [],
        arkadasIstekleri: []
      });
    } else {
      await updateDoc(doc(db, 'users', user.uid), {
        online: true
      });
    }
    
    return { success: true, user, isNewUser: !userDoc.exists() };
  } catch (error) {
    console.error('Google giriş hatası:', error);
    return { success: false, error: error.message };
  }
};

export const emailIleKayitOl = async (email, sifre, isim) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, sifre);
    const user = result.user;
    
    const kullaniciAdi = email.split('@')[0].toLowerCase();
    
    await updateProfile(user, {
      displayName: isim
    });
    
    await setDoc(doc(db, 'users', user.uid), {
      isim: isim,
      email: email,
      avatar: '👨',
      kullaniciAdi: `@${kullaniciAdi}`,
      kullaniciAdiLower: kullaniciAdi,
      kullaniciAdiKucuk: kullaniciAdi,
      online: true,
      olusturulmaTarihi: serverTimestamp(),
      profilTamamlandi: false,
      arkadaslar: [],
      arkadasIstekleri: []
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Email kayıt hatası:', error);
    let errorMessage = 'Kayıt başarısız!';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Bu kullanıcı adı zaten kullanılıyor!';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Şifre çok zayıf!';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Geçersiz email formatı!';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Email/şifre girişi şu anda kapalı.';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const emailIleGiris = async (email, sifre) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, sifre);
    const user = result.user;
    
    await updateDoc(doc(db, 'users', user.uid), {
      online: true
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Email giriş hatası:', error);
    let errorMessage = 'Giriş başarısız!';
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      errorMessage = 'Kullanıcı adı veya şifre hatalı!';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Geçersiz email formatı!';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'Bu hesap devre dışı bırakılmış!';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const sifreSifirlamaMailiGonder = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    let errorMessage = 'Şifre sıfırlama başarısız!';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Bu kullanıcı bulunamadı!';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Geçersiz email formatı!';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const cikisYap = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        online: false
      });
    }
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Çıkış hatası:', error);
    return { success: false, error: error.message };
  }
};

export const kullaniciBilgisiGetir = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Kullanıcı getirme hatası:', error);
    return null;
  }
};

export const profilGuncelle = async (userId, data) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      profilTamamlandi: true
    });
    return { success: true };
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    return { success: false, error: error.message };
  }
};

export const authDurumuDinle = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };
