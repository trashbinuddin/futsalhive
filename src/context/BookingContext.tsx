import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, addDoc, serverTimestamp, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

export interface Pricing {
  id: string;
  dayType: 'weekday' | 'weekend';
  startTime: string;
  endTime: string;
  price: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  isActive: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'paid';
  price: number;
  advanceAmount: number;
  couponCode?: string;
  discountAmount?: number;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: any;
}

interface BookingContextType {
  pricing: Pricing[];
  bookings: Booking[];
  coupons: Coupon[];
  loading: boolean;
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<void>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
  validateCoupon: (code: string) => Promise<Coupon | null>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

import { sendTelegramNotification, formatBookingMessage } from '../services/telegramService';
import { sendToGoogleSheets } from '../services/googleSheetsService';

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pricingUnsubscribe = onSnapshot(collection(db, 'pricing'), (snapshot) => {
      const pricingData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pricing));
      setPricing(pricingData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'pricing');
    });

    const bookingsUnsubscribe = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'bookings');
    });

    const couponsUnsubscribe = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      const couponsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
      setCoupons(couponsData);
    }, (error) => {
      // Quiet fail for guests - they don't need the full coupon list
      if (error.message.includes('permission')) {
        console.log('Restricted coupon list view (Admin only)');
      } else {
        console.error('Coupon fetch error:', error);
      }
    });

    return () => {
      pricingUnsubscribe();
      bookingsUnsubscribe();
      couponsUnsubscribe();
    };
  }, []);

  const createBooking = async (booking: Omit<Booking, 'id' | 'createdAt'>) => {
    try {
      // Remove any undefined fields to prevent Firestore errors
      const cleanData = Object.fromEntries(
        Object.entries(booking).filter(([_, v]) => v !== undefined)
      );

      const docRef = await addDoc(collection(db, 'bookings'), {
        ...cleanData,
        createdAt: serverTimestamp(),
      });
      
      // Notify via Telegram
      const newMessage = formatBookingMessage({ ...booking, id: docRef.id }, 'new');
      await sendTelegramNotification(newMessage);

      // Sync to Google Sheets
      await sendToGoogleSheets({ ...booking, id: docRef.id });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  };

  const updateBookingStatus = async (id: string, status: Booking['status']) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
      
      // Find the booking to send accurate notification
      const booking = bookings.find(b => b.id === id);
      if (booking) {
        const updateMessage = formatBookingMessage({ ...booking, status }, 'update');
        await sendTelegramNotification(updateMessage);
        
        // Sync to Google Sheets with new status
        await sendToGoogleSheets({ ...booking, status });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const validateCoupon = async (code: string) => {
    try {
      // We check our local state first if populated (staff view)
      const existing = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
      if (existing) return existing;

      // If not in state (guest view), check Firestore directly
      const q = query(collection(db, 'coupons'), where('code', '==', code.toUpperCase()), where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Coupon;
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
    }
    return null;
  };

  return (
    <BookingContext.Provider value={{ pricing, bookings, coupons, loading, createBooking, updateBookingStatus, validateCoupon }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
