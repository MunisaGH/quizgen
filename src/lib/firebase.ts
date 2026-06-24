import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCJ6Kikhr5_yZ_kNcCyKCnR3aXwNOu4NQY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "quizgen-7745f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "quizgen-7745f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "quizgen-7745f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "331736550344",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:331736550344:web:c7dc1fb48f3075b1420efd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7L4KBX7VR7"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
