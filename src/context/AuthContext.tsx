import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginDemo: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  switchRole: (newRole: 'admin' | 'kasir') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_DEMO_KEY = 'catusaha_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize Auth state
  useEffect(() => {
    // Check saved demo user from localStorage first
    const savedDemo = localStorage.getItem(LOCAL_STORAGE_DEMO_KEY);
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo) as UserProfile;
        setUserProfile(parsed);
      } catch (e) {
        console.error('Error parsing stored demo user', e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentUser(fbUser);
      if (fbUser) {
        // If logged in via Google or Firebase Auth
        if (!fbUser.isAnonymous) {
          const userDocRef = doc(db, 'users', fbUser.uid);
          try {
            const snap = await getDoc(userDocRef);
            let role: 'admin' | 'kasir' = 'kasir';
            // User email from prompt defaults to admin
            if (fbUser.email?.toLowerCase() === 'andrygunawan1000@gmail.com' || fbUser.email?.includes('admin')) {
              role = 'admin';
            } else if (snap.exists() && snap.data().role) {
              role = snap.data().role;
            }

            const profile: UserProfile = {
              uid: fbUser.uid,
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Pengguna',
              email: fbUser.email || '',
              role,
              photoURL: fbUser.photoURL || undefined,
              isDemo: false
            };

            await setDoc(userDocRef, {
              email: profile.email,
              displayName: profile.displayName,
              role: profile.role,
              updatedAt: new Date().toISOString(),
            }, { merge: true });

            setUserProfile(profile);
            localStorage.removeItem(LOCAL_STORAGE_DEMO_KEY);
          } catch (err) {
            console.error('Error fetching user profile:', err);
            // Fallback profile if Firestore rule permits
            setUserProfile({
              uid: fbUser.uid,
              displayName: fbUser.displayName || 'Pengguna',
              email: fbUser.email || '',
              role: fbUser.email?.toLowerCase() === 'andrygunawan1000@gmail.com' ? 'admin' : 'kasir',
              isDemo: false
            });
          }
        }
      } else {
        // If no firebase user and no stored demo user, default to admin demo for seamless initial experience
        const stored = localStorage.getItem(LOCAL_STORAGE_DEMO_KEY);
        if (!stored) {
          const defaultDemo: UserProfile = {
            uid: 'demo-admin-uid',
            displayName: 'Admin Utama',
            email: 'admin@catatusaha.local',
            role: 'admin',
            isDemo: true
          };
          setUserProfile(defaultDemo);
          localStorage.setItem(LOCAL_STORAGE_DEMO_KEY, JSON.stringify(defaultDemo));
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      localStorage.removeItem(LOCAL_STORAGE_DEMO_KEY);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPw = password.trim();

    // Akun admin: user admin, pw admin
    if (trimmedUser === 'admin' && trimmedPw === 'admin') {
      try {
        // Sign in anonymously to satisfy Firebase rules if available
        await signInAnonymously(auth).catch(() => null);
      } catch (e) {
        // ignore
      }
      const adminProfile: UserProfile = {
        uid: auth.currentUser?.uid || 'demo-admin-uid',
        displayName: 'Administrator (Admin)',
        email: 'admin@catatusaha.local',
        role: 'admin',
        isDemo: true,
      };
      setUserProfile(adminProfile);
      localStorage.setItem(LOCAL_STORAGE_DEMO_KEY, JSON.stringify(adminProfile));
      return { success: true };
    }

    // Akun kasir: user kasir, pw kasir
    if (trimmedUser === 'kasir' && trimmedPw === 'kasir') {
      try {
        await signInAnonymously(auth).catch(() => null);
      } catch (e) {
        // ignore
      }
      const kasirProfile: UserProfile = {
        uid: auth.currentUser?.uid || 'demo-kasir-uid',
        displayName: 'Kasir Toko (Kasir)',
        email: 'kasir@catatusaha.local',
        role: 'kasir',
        isDemo: true,
      };
      setUserProfile(kasirProfile);
      localStorage.setItem(LOCAL_STORAGE_DEMO_KEY, JSON.stringify(kasirProfile));
      return { success: true };
    }

    return {
      success: false,
      message: 'Username atau password salah! Gunakan "admin" / "admin" atau "kasir" / "kasir".',
    };
  };

  const logout = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      localStorage.removeItem(LOCAL_STORAGE_DEMO_KEY);
      // Reset to guest / prompt login
      setUserProfile(null);
    } catch (e) {
      console.error('Error signing out', e);
    }
  };

  const switchRole = (newRole: 'admin' | 'kasir') => {
    if (userProfile) {
      const updated = { ...userProfile, role: newRole };
      setUserProfile(updated);
      if (userProfile.isDemo) {
        localStorage.setItem(LOCAL_STORAGE_DEMO_KEY, JSON.stringify(updated));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        loginWithGoogle,
        loginDemo,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
