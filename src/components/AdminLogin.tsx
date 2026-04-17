import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock, Shield, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminLogin() {
  const { user, role, superAdminEmail, login, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  if (loading) return null;

  // If already logged in as admin, go to dashboard
  if (user && (role === 'admin' || role === 'moderator')) {
    return <Navigate to="/admin" replace />;
  }

  const handleAdminLogin = async () => {
    try {
      setError(null);
      await login();
    } catch (err) {
      setError("Failed to connect to Hive Security. check your connection.");
    }
  };

  const isUnauthorized = user && role !== 'admin' && role !== 'moderator';
  const managerEmail = superAdminEmail || "imtiajulrivu@gmail.com";

  return (
    <div className="min-h-screen bg-hive-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-hive-yellow/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="glass-card p-10 text-center border-white/10">
          <div className="w-20 h-20 bg-hive-yellow/10 rounded-3xl flex items-center justify-center text-hive-yellow mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-hive-yellow/20 rounded-3xl blur-md animate-pulse" />
            <Shield size={40} className="relative z-10" />
          </div>

          <h1 className="text-3xl font-display font-black text-white uppercase tracking-tighter mb-4">
            MANAGER <span className="text-hive-yellow">ACCESS</span>
          </h1>
          <p className="text-white/40 text-sm mb-10 leading-relaxed font-medium">
            Authorized personnel only. Please verify your identity via the secure Hive Portal.
          </p>

          {isUnauthorized && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-8 flex flex-col gap-2 text-left">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <p className="text-[11px] text-red-500/80 font-black uppercase tracking-wider">
                  Access Denied
                </p>
              </div>
              <p className="text-[10px] text-white/40 font-medium">
                Your account ({user?.email}) is not authorized. Access is restricted to <span className="text-hive-yellow">{managerEmail}</span>.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-8 text-red-500 text-xs font-bold uppercase tracking-widest">
              {error}
            </div>
          )}

          <button 
            onClick={handleAdminLogin}
            className="w-full bg-hive-yellow text-hive-black py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-95 shadow-xl shadow-hive-yellow/10"
          >
            <Lock size={18} />
            Secure Portal Login
          </button>

          <div className="mt-8 flex flex-col gap-4">
            <button 
              onClick={() => navigate('/')}
              className="text-[10px] font-black text-white/20 hover:text-white/60 transition-colors uppercase tracking-[0.3em] flex items-center justify-center gap-2"
            >
              Return to Arena
            </button>
            {user && (
              <button 
                onClick={logout}
                className="text-[10px] font-black text-red-500/40 hover:text-red-500/80 transition-colors uppercase tracking-[0.3em] flex items-center justify-center gap-2"
              >
                Switch Account
              </button>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-white/10 text-[9px] font-bold uppercase tracking-[0.5em]">
          End-to-End Encrypted Management Session
        </p>
      </motion.div>
    </div>
  );
}
