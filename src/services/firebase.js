// ============================================
// BULUŞAK - Firebase Yapılandırması
// ============================================

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDHG-f1PQzxs5de1G95AJdPtrNAvelalAg",
  authDomain: "bulusak-821d7.firebaseapp.com",
  projectId: "bulusak-821d7",
  storageBucket: "bulusak-821d7.firebasestorage.app",
  messagingSenderId: "960564405077",
  appId: "1:960564405077:web:729361eab970c3cf7005dc",
  measurementId: "G-JJBF3JHESK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export const COLLECTIONS = {
  USERS: 'users',
  GROUPS: 'groups',
  EVENTS: 'events',
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages',
  FRIENDSHIPS: 'friendships',
  FRIEND_REQUESTS: 'friendRequests'
};

export default app;
