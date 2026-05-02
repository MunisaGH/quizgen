import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCJ6Kikhr5_yZ_kNcCyKCnR3aXwNOu4NQY",
  authDomain: "quizgen-7745f.firebaseapp.com",
  projectId: "quizgen-7745f",
  storageBucket: "quizgen-7745f.firebasestorage.app",
  messagingSenderId: "331736550344",
  appId: "1:331736550344:web:c7dc1fb48f3075b1420efd",
  measurementId: "G-7L4KBX7VR7"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
