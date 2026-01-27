// ============================================
// BULUŞAK - Auth Servisi
// ============================================

import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider, COLLECTIONS } from "./firebase";

export const googleIleGiris = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
    
    if (!userDoc.exists()) {
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        isim: user.displayName || "Kullanıcı",
        email: user.email,
        avatar: "👨",
        kullaniciAdi: `@${user.email.split("@")[0]}`,
        kullaniciAdiLower: user.email.split("@")[0].toLowerCase(),
        online: true,
        olusturulmaTarihi: serverTimestamp(),
        profilTamamlandi: false,
        arkadaslar: [],
        arkadasSayisi: 0
      });
      return { success: true, user, isNewUser: true };
    } else {
      await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), { online: true, sonGiris: serverTimestamp() });
      return { success: true, user, isNewUser: false, userData: userDoc.data() };
    }
  } catch (error) {
    console.error("Google giriş hatası:", error);
    return { success: false, error: error.message, code: error.code };
  }
};

export const emailIleKayitOl = async (email, sifre, isim) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, sifre);
    const user = result.user;
    await updateProfile(user, { displayName: isim });
    
    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
      isim: isim,
      email: user.email,
      avatar: "👨",
      kullaniciAdi: `@${email.split("@")[0]}`,
      kullaniciAdiLower: email.split("@")[0].toLowerCase(),
      online: true,
      olusturulmaTarihi: serverTimestamp(),
      profilTamamlandi: false,
      arkadaslar: [],
      arkadasSayisi: 0
    });
    return { success: true, user, isNewUser: true };
  } catch (error) {
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') errorMessage = 'Bu e-posta adresi zaten kullanılıyor';
    else if (error.code === 'auth/weak-password') errorMessage = 'Şifre en az 6 karakter olmalı';
    else if (error.code === 'auth/invalid-email') errorMessage = 'Geçersiz e-posta adresi';
    return { success: false, error: errorMessage, code: error.code };
  }
};

export const emailIleGiris = async (email, sifre) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, sifre);
    const user = result.user;
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
    
    if (userDoc.exists()) {
      await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), { online: true, sonGiris: serverTimestamp() });
      return { success: true, user, userData: userDoc.data() };
    }
    return { success: true, user };
  } catch (error) {
    let errorMessage = error.message;
    if (error.code === 'auth/user-not-found') errorMessage = 'Bu e-posta ile kayıtlı kullanıcı bulunamadı';
    else if (error.code === 'auth/wrong-password') errorMessage = 'Hatalı şifre';
    else if (error.code === 'auth/invalid-email') errorMessage = 'Geçersiz e-posta adresi';
    else if (error.code === 'auth/too-many-requests') errorMessage = 'Çok fazla deneme yaptınız. Lütfen bekleyin.';
    return { success: false, error: errorMessage, code: error.code };
  }
};

export const sifreSifirlamaMailiGonder = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Şifre sıfırlama maili gönderildi' };
  } catch (error) {
    let errorMessage = error.code === 'auth/user-not-found' ? 'Bu e-posta ile kayıtlı kullanıcı bulunamadı' : error.message;
    return { success: false, error: errorMessage };
  }
};

export const cikisYap = async () => {
  try {
    const user = auth.currentUser;
    if (user) await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), { online: false, sonCikis: serverTimestamp() });
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const authDurumuDinle = (callback) => onAuthStateChanged(auth, callback);
export const mevcutKullanici = () => auth.currentUser;
export const mevcutKullaniciId = () => auth.currentUser?.uid || null;
