import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

export interface GalleryImage {
  id: string;
  url: string; // Base64 string or remote URL
  title: string;
  category: string;
  createdAt: any;
}

interface GalleryContextType {
  images: GalleryImage[];
  loading: boolean;
  addImage: (url: string, title: string, category: string) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export function GalleryProvider({ children }: { children: React.ReactNode }) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'gallery'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const imageData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage)).sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      setImages(imageData);
      setLoading(false);
    }, (error) => {
      // Quiet fail if index is missing or permission denied on first load without auth.
      console.error('Gallery fetch error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addImage = async (url: string, title: string, category: string) => {
    try {
      await addDoc(collection(db, 'gallery'), {
        url,
        title,
        category,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gallery');
      throw error;
    }
  };

  const deleteImage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'gallery', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `gallery/${id}`);
      throw error;
    }
  };

  return (
    <GalleryContext.Provider value={{ images, loading, addImage, deleteImage }}>
      {children}
    </GalleryContext.Provider>
  );
}

export function useGallery() {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
}
