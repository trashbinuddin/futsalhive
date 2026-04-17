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
        const configSnap = await getDoc(configRef);
        
        let currentSuperAdmin = 'imtiajulrivu@gmail.com';
        if (configSnap.exists()) {
          currentSuperAdmin = configSnap.data().superAdminEmail || 'imtiajulrivu@gmail.com';
        } else if (currentUser?.email === 'imtiajulrivu@gmail.com') {
          // Initialize if it's the first time
          await setDoc(configRef, { superAdminEmail: currentSuperAdmin });
        }
        setSuperAdminEmail(currentSuperAdmin);

        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          
          const isSuperAdmin = currentUser.email === currentSuperAdmin || currentUser.email === 'imtiajulrivu@gmail.com';
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
            });
            setRole(initialRole);
          }
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error('Auth sync error:', error);
        // Fail-safe for super admin if Firestore is fully blocked
        if (currentUser?.email === 'imtiajulrivu@gmail.com' || currentUser?.email === superAdminEmail) {
          setRole('admin');
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
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
