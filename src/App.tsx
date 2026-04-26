import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BookingCalendar from './components/BookingCalendar';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import AdminPanel from './components/AdminPanel';
import Reviews from './components/Reviews';
import AdminLogin from './components/AdminLogin';
import MyBookings from './components/MyBookings';
import Legal from './components/Legal';
import { motion, AnimatePresence } from 'motion/react';
import { FUTSAL_HIVE_LOGO } from './lib/constants';
import { Phone, MessageCircle } from 'lucide-react';

import { AIAssistant } from './components/AIAssistant';
import CookieConsent from './components/CookieConsent';

function Footer() {
  return (
    <footer className="bg-hive-black border-t border-white/10 py-16 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-hive-yellow/50 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
        <div className="flex items-center justify-center gap-3 mb-8 group">
          <div className="w-12 h-12 relative">
            <div className="absolute inset-0 bg-hive-yellow/20 rounded-lg blur-md group-hover:bg-hive-yellow/40 transition-all" />
            <img 
              src={FUTSAL_HIVE_LOGO} 
              alt="Futsal Hive" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover relative z-10 rounded-2xl"
            />
          </div>
          <span className="text-2xl font-display font-black text-white tracking-tighter uppercase">
            FUTSAL <span className="text-hive-yellow">HIVE</span>
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 mb-12 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
          <Link to="/" className="hover:text-hive-yellow transition-colors">Home</Link>
          <Link to="/booking" className="hover:text-hive-yellow transition-colors">Booking</Link>
          <Link to="/my-bookings" className="hover:text-hive-yellow transition-colors">My Bookings</Link>
          <Link to="/legal#privacy" className="hover:text-hive-yellow transition-colors">Privacy Policy</Link>
          <Link to="/legal#terms" className="hover:text-hive-yellow transition-colors">Terms</Link>
          <Link to="/legal#refund" className="hover:text-hive-yellow transition-colors">Refund</Link>
        </div>
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="tel:+8801894433325"
              className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-hive-yellow hover:text-hive-black transition-all group lg:w-fit w-full justify-center"
            >
              <Phone size={18} className="text-hive-yellow group-hover:text-hive-black" />
              <span className="text-xs font-black uppercase tracking-widest">+880 1894 43 3325</span>
            </a>
            <a 
              href="https://wa.me/8801894433325"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-green-500 hover:text-white transition-all group lg:w-fit w-full justify-center"
            >
              <MessageCircle size={18} className="text-green-500 group-hover:text-white" />
              <span className="text-xs font-black uppercase tracking-widest">WhatsApp</span>
            </a>
          </div>
          <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
            China Project, Aftabnagar, Dhaka
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <p className="text-white/20 text-[10px] font-bold tracking-widest">
            <span className="uppercase">© 2026 Futsal Hive.</span> <span className="lowercase">by r.xvu20</span>
          </p>
          <Link 
            to="/hive-admin" 
            className="text-white/5 hover:text-white/20 transition-all text-[8px] uppercase tracking-[0.5em] font-black"
          >
            Manager Area
          </Link>
        </div>
      </div>
    </footer>
  );
}

import { GalleryProvider } from './context/GalleryContext';

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <GalleryProvider>
          <Router>
            <div className="min-h-screen bg-hive-black selection:bg-hive-yellow selection:text-hive-black">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={
                    <>
                      <Hero />
                      <Reviews />
                      <Gallery />
                      <Contact />
                    </>
                  } />
                  <Route path="/booking" element={<div className="pt-20"><BookingCalendar /></div>} />
                  <Route path="/gallery" element={<div className="pt-20"><Gallery /></div>} />
                  <Route path="/contact" element={<div className="pt-20"><Contact /></div>} />
                  <Route path="/legal" element={<Legal />} />
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/hive-admin" element={<AdminLogin />} />
                </Routes>
              </main>
              <Footer />
              <CookieConsent />
              <AIAssistant />
            </div>
          </Router>
        </GalleryProvider>
      </BookingProvider>
    </AuthProvider>
  );
}
