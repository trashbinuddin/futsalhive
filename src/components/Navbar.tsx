import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, User as UserIcon, Shield, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { FUTSAL_HIVE_LOGO } from '../lib/constants';

export default function Navbar() {
  const { user, role, login, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Booking', path: '/booking' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  if (user) {
    navLinks.splice(2, 0, { name: 'My Bookings', path: '/my-bookings' });
  }

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-48px)] max-w-7xl bg-white/5 backdrop-blur-[10px] border border-white/10 rounded-2xl">
      <div className="px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 relative">
                <div className="absolute inset-0 bg-hive-yellow/20 rounded-lg blur-md group-hover:bg-hive-yellow/40 transition-all" />
                <img 
                  src={FUTSAL_HIVE_LOGO} 
                  alt="Futsal Hive" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover relative z-10 rounded-lg"
                />
              </div>
              <span className="text-xl font-display font-black tracking-tighter text-hive-yellow uppercase">
                FUTSAL <span className="text-white">HIVE</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                  location.pathname === link.path ? "text-hive-yellow" : "text-white/70 hover:text-hive-yellow"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <img src={user.photoURL || ''} alt={user.displayName || ''} referrerPolicy="no-referrer" loading="lazy" className="w-8 h-8 rounded-full border border-hive-yellow/50" />
                    <button onClick={logout} className="text-sm font-medium text-gray-300 hover:text-hive-yellow transition-colors flex items-center gap-1">
                      <LogOut size={16} />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={login}
                  className="hive-gradient text-hive-black px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-hive-yellow/20"
                >
                  <LogIn size={18} />
                  Login
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={toggleMenu}
              className="md:hidden w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 overflow-hidden bg-hive-black/95 rounded-b-2xl"
          >
            <div className="px-6 py-8 space-y-6">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "text-sm font-black uppercase tracking-[0.2em] py-2 transition-colors",
                      location.pathname === link.path ? "text-hive-yellow" : "text-white/70 hover:text-hive-yellow"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="pt-6 border-t border-white/5">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <img src={user.photoURL || ''} alt={user.displayName || ''} referrerPolicy="no-referrer" loading="lazy" className="w-10 h-10 rounded-full border border-hive-yellow/50" />
                      <div>
                        <p className="text-white font-black uppercase text-xs tracking-tighter">{user.displayName}</p>
                        <p className="text-white/40 text-[10px]">{user.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white/5 text-white/70 font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <LogOut size={16} /> Logout Account
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { login(); setIsMobileMenuOpen(false); }}
                    className="w-full hive-gradient text-hive-black py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-hive-yellow/20"
                  >
                    <LogIn size={20} /> Login with Google
                  </button>
                )}
              </div>

              {/* Mobile Branding Footer */}
              <div className="pt-8 flex flex-col items-center gap-3 opacity-30">
                <img 
                  src={FUTSAL_HIVE_LOGO} 
                  alt="Futsal Hive" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-8 h-8 object-cover rounded-lg"
                />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Futsal Hive Elite</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
