import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Trophy, Users, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FUTSAL_HIVE_LOGO } from '../lib/constants';

const QUOTES = [
  "WHERE LEGENDS ARE BORN.",
  "FEEL THE HIVE SPIRIT.",
  "DOMINATE THE TURF.",
  "YOUR GAME, OUR ARENA.",
  "BEYOND JUST FOOTBALL."
];

export default function Hero() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-hive-yellow/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-hive-green/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/stadium_main/1920/1080')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-hive-black via-hive-black/80 to-hive-black" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 mx-auto mb-8 relative group"
          >
            <div className="absolute inset-0 bg-hive-yellow/20 rounded-full blur-2xl group-hover:bg-hive-yellow/40 transition-all duration-500" />
            <img 
              src={FUTSAL_HIVE_LOGO} 
              alt="Futsal Hive" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,204,0,0.5)]"
            />
          </motion.div>

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-hive-yellow/10 border border-hive-yellow/20 text-hive-yellow text-xs font-bold uppercase tracking-widest mb-8">
            <Zap size={14} className="animate-pulse" />
            Dhaka's Most Futuristic Arena 🚀
          </span>
          
          <div className="h-32 md:h-48 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={quoteIndex}
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.5 }}
                className="text-5xl md:text-8xl font-display font-extrabold text-white tracking-tighter leading-[0.95] uppercase"
              >
                {QUOTES[quoteIndex].split(' ').map((word, i) => (
                  <span key={i} className={word.includes('HIVE') || word.includes('TURF') || word.includes('ARENA') ? 'text-hive-yellow' : ''}>
                    {word}{' '}
                  </span>
                ))}
              </motion.h1>
            </AnimatePresence>
          </div>
          
          <p className="max-w-2xl mx-auto text-lg text-white/60 mb-10 leading-relaxed mt-8">
            Experience Dhaka's most premium 5-a-side football turf. Professional lightning, 
            high-grade synthetic grass, and top-tier amenities at Aftabnagar.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-left backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-hive-green text-white text-[8px] px-2 py-1 rounded-bl-lg font-black uppercase">Morning</div>
              <div className="text-[9px] text-white/50 uppercase font-black tracking-widest mb-1">Early Strike Hour</div>
              <div className="text-xl font-display font-bold text-hive-yellow">2,400 BDT</div>
              <div className="text-[8px] text-white/30 uppercase mt-1">6:00 AM - 4:30 PM</div>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-left backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-hive-yellow text-hive-black text-[8px] px-2 py-1 rounded-bl-lg font-black uppercase">Prime</div>
              <div className="text-[9px] text-white/50 uppercase font-black tracking-widest mb-1">Golden Boot</div>
              <div className="text-xl font-display font-bold text-hive-yellow">3,000 BDT</div>
              <div className="text-[8px] text-white/30 uppercase mt-1">4:30 PM - 6:00 PM</div>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-left backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] px-2 py-1 rounded-bl-lg font-black uppercase">Hot</div>
              <div className="text-[9px] text-white/50 uppercase font-black tracking-widest mb-1">12 Man Deal</div>
              <div className="text-xl font-display font-bold text-hive-yellow">3,600 BDT</div>
              <div className="text-[8px] text-white/30 uppercase mt-1">6:00 PM - 12:00 AM</div>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-left backdrop-blur-md relative overflow-hidden group border-hive-yellow/30">
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-[8px] px-2 py-1 rounded-bl-lg font-black uppercase">Special</div>
              <div className="text-[9px] text-white/50 uppercase font-black tracking-widest mb-1">Student Special</div>
              <div className="text-xl font-display font-bold text-hive-yellow">2,100 BDT</div>
              <div className="text-[8px] text-white/30 uppercase mt-1">Sun - Thu (Day)</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/booking"
              className="w-full sm:w-auto bg-hive-yellow text-hive-black px-10 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:scale-105 transition-all active:scale-95 shadow-xl shadow-hive-yellow/20 uppercase tracking-wider"
            >
              Book Your Slot ⚡
              <ArrowRight size={20} />
            </Link>
            <Link 
              to="/gallery"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white px-10 py-4 rounded-xl font-bold text-lg border border-white/10 transition-all backdrop-blur-md uppercase tracking-wider"
            >
              View Gallery 📸
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-hive-yellow backdrop-blur-md">
                <Users size={24} />
              </div>
              <span className="text-2xl font-display font-bold text-white">5v5 / 6v6</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">Perfect Match</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-hive-yellow backdrop-blur-md">
                <Clock size={24} />
              </div>
              <span className="text-2xl font-display font-bold text-white">24/7</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">Open Anytime</span>
            </div>
            <div className="hidden md:flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-hive-yellow backdrop-blur-md">
                <Trophy size={24} />
              </div>
              <span className="text-2xl font-display font-bold text-white">Pro Grade</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">FIFA Quality</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
