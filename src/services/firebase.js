import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDHG-f1PQzxs5de1G95AJdPtrNAvelalAg",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "bulusak-821d7.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "bulusak-821d7",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "bulusak-821d7.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "960564405077",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:960564405077:web:729361eab970c3cf7005dc",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-JJBF3JHESK"
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
  FRIEND_REQUESTS: 'friendRequests',
  KONUSMALAR: 'konusmalar',
  HIKAYELER: 'hikayeler',
  BILDIRIMLER: 'bildirimler'
};

export default app;
