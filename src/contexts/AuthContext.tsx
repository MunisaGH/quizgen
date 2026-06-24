import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useToast } from './UIContext';
import { auth, db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isPremium: boolean;
  isAdmin?: boolean;
  premiumUntil: string | null;
  createdAt: Timestamp | null;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// localhost da popup, productionoda redirect ishlatamiz
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // Production (redirect)dan qaytganda natijani tekshirish
    if (!isLocalhost) {
      getRedirectResult(auth).catch(err => {
        if (err.code !== 'auth/null-user') {
          console.error('Redirect result error:', err);
        }
      });
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Sync user to Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          } else {
            // Create user document if not exists
            const initialData = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              isPremium: false,
              premiumUntil: null,
              createdAt: serverTimestamp()
            };
            setDoc(userRef, initialData);
            setUserData(initialData as UserData);
          }
          setLoading(false);
        });
        return () => unsubUser();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      if (isLocalhost) {
        // Lokal muhitda popup ishlatamiz
        await signInWithPopup(auth, provider);
      } else {
        // Productionoda redirect ishlatamiz (unauthorized-domain xatoligini oldini oladi)
        await signInWithRedirect(auth, provider);
      }
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      console.error('Error signing in with Google', firebaseError);
      
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        showToast("Kirish oynasi yopildi. Iltimos, qayta urinib ko'ring.", 'error');
      } else if (firebaseError.code === 'auth/unauthorized-domain') {
        showToast("Kirish xatoligi. Iltimos bir oz kuting va qayta urinib ko'ring.", 'error');
      } else {
        showToast("Kirishda xatolik yuz berdi: " + firebaseError.message, 'error');
      }
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
