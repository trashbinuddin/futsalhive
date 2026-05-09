import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'moderator' | 'user' | null;
  superAdminEmail: string | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateSuperAdmin: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'moderator' | 'user' | null>(null);
  const [superAdminEmail, setSuperAdminEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      try {
        // Fetch/Init config
        const configRef = doc(db, 'config', 'main');
        const configSnap = await getDoc(configRef).catch(e => {
          console.error("Failed to get config/main", e);
          throw e;
        });
        
        let currentSuperAdmin = import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'futsalhivebd@gmail.com';
        if (configSnap.exists()) {
          currentSuperAdmin = configSnap.data().superAdminEmail || import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'futsalhivebd@gmail.com';
        } else if (currentUser?.email === (import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'futsalhivebd@gmail.com')) {
          // Initialize if it's the first time
          await setDoc(configRef, { superAdminEmail: currentSuperAdmin }).catch(e => {
            console.error("Failed to write to config/main", e);
            throw e;
          });
        }
        setSuperAdminEmail(currentSuperAdmin);

        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef).catch(e => {
            console.error("Failed to read users/uid", e);
            throw e;
          });
          
          const isSuperAdmin = currentUser.email === currentSuperAdmin || currentUser.email === (import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'futsalhivebd@gmail.com');
          const teamWhitelist = configSnap.data()?.teamEmails || [];
          const isTeamMember = teamWhitelist.includes(currentUser.email?.toLowerCase());
          
          if (userSnap.exists()) {
            const existingData = userSnap.data();
            if (isSuperAdmin && existingData.role !== 'admin') {
              // Forced upgrade in Firestore
              await updateDoc(userDocRef, { role: 'admin' }).catch(e => console.error('Silent role upgrade fail:', e));
              setRole('admin');
            } else if (isTeamMember && existingData.role === 'user') {
              // Auto-promote to moderator if whitelisted but still 'user'
              await updateDoc(userDocRef, { role: 'moderator' }).catch(e => console.error('Silent role upgrade fail:', e));
              setRole('moderator');
            } else {
              setRole(existingData.role);
            }
          } else {
            const initialRole = isSuperAdmin ? 'admin' : (isTeamMember ? 'moderator' : 'user');
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: initialRole,
              createdAt: serverTimestamp(),
            }).catch(e => {
              console.error("Failed to write users/uid doc initially", e, "Role:", initialRole);
              throw e;
            });
            setRole(initialRole);
          }
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error('Auth sync error:', error);
        // Fail-safe for super admin if Firestore is fully blocked
        if (currentUser?.email === (import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'futsalhivebd@gmail.com') || currentUser?.email === superAdminEmail) {
          setRole('admin');
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const login = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      // Configure provider to always select an account to prevent auto-login issues on some devices
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.warn('Login popup closed by user or cancelled.');
      } else {
        console.error('Login error:', error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateSuperAdmin = async (email: string) => {
    if (!user || user.email !== superAdminEmail) return;
    await setDoc(doc(db, 'config', 'main'), { superAdminEmail: email }, { merge: true });
    setSuperAdminEmail(email);
  };

  return (
    <AuthContext.Provider value={{ user, role, superAdminEmail, loading, login, logout, updateSuperAdmin }}>
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
