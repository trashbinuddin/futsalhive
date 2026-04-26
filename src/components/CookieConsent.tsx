import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { X, Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('futsal_hive_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('futsal_hive_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('futsal_hive_cookie_consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[100] md:w-[380px]"
        >
          <div className="bg-hive-black/95 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-hive-yellow to-yellow-600" />
            
            <button 
              onClick={handleDecline}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-hive-yellow/10 flex items-center justify-center text-hive-yellow shrink-0">
                <Cookie size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">Cookie Consent</h3>
                <p className="text-white/60 text-xs leading-relaxed mb-4">
                  We use cookies to enhance your experience and secure bookings. Review our{' '}
                  <Link to="/legal#privacy" className="text-hive-yellow hover:underline" onClick={() => setIsVisible(false)}>
                    Privacy Policy
                  </Link>{' '}
                  for details.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAccept}
                    className="flex-1 bg-hive-yellow text-hive-black text-[10px] font-black uppercase tracking-widest py-2.5 rounded-lg hover:shadow-[0_0_15px_rgba(255,204,0,0.4)] transition-all"
                  >
                    Accept
                  </button>
                  <button
                    onClick={handleDecline}
                    className="flex-1 bg-white/5 text-white/80 border border-white/10 text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-lg hover:bg-white/10 transition-all"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
