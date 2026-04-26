import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, RotateCcw, Lock } from 'lucide-react';

export default function Legal() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-32 space-y-24">
      {/* Privacy Policy */}
      <section id="privacy" className="space-y-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-hive-yellow/10 flex items-center justify-center text-hive-yellow">
            <Lock size={24} />
          </div>
          <h2 className="text-4xl font-display font-black text-white tracking-tighter uppercase">Privacy Policy</h2>
        </div>
        
        <div className="glass-card p-8 md:p-12 space-y-6 text-white/70 leading-relaxed">
          <p className="text-sm">Effective Date: April 2026</p>
          <div className="space-y-4">
            <h3 className="text-white font-black uppercase tracking-widest text-sm">1. INFORMATION WE COLLECT</h3>
            <p>We collect information you directly provide when using our services, including: name, phone number, email address (if using Google Login), and payment transaction details. We also collect basic interaction data automatically via cookies and similar technologies.</p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-white font-black uppercase tracking-widest text-sm">2. HOW WE USE YOUR DATA</h3>
            <p>Your data is strictly used to manage your futsal bookings, send booking confirmations, respond to customer service requests, and occasionally send promotional offers related directly to Futsal Hive. We do not sell your data to third parties.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-black uppercase tracking-widest text-sm">3. COOKIE POLICY</h3>
            <p>We use minimal cookies to keep you logged in to your account, preserve your booking preferences, and analyze basic site traffic. You can choose to disable cookies through your browser settings, though this may impact core site functionality.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-black uppercase tracking-widest text-sm">4. THIRD-PARTY SERVICES</h3>
            <p>We utilize trusted third-party services like Google Authentication for seamless logins and Google Apps Script for automated sheets integration. These services process your data securely according to their respective privacy agreements.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-black uppercase tracking-widest text-sm">5. DATA SECURITY</h3>
            <p>Futsal Hive implements robust security measures to protect your personal information against unauthorized access, alteration, or disclosure. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.</p>
          </div>
        </div>
      </section>

      {/* Terms & Conditions */}
      <section id="terms" className="space-y-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-hive-yellow/10 flex items-center justify-center text-hive-yellow">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-4xl font-display font-black text-white tracking-tighter uppercase">Terms & Conditions</h2>
        </div>
        
        <div className="glass-card p-8 md:p-12 space-y-6 text-white/70 leading-relaxed">
          <div className="space-y-4">
            <h3 className="text-white font-black uppercase tracking-widest text-sm">1. RESERVATION & PAYMENTS</h3>
            <p>All bookings at Futsal Hive are confirmed only upon receipt of the minimum advance payment (৳500). Remaining balance must be cleared at the venue before the match starts.</p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-white font-black uppercase tracking-widest text-sm">2. PLAYER CONDUCT</h3>
            <p>Players must arrive at least 10 minutes before their scheduled slot. Late arrivals will not result in time extensions. Futsal Hive maintains a zero-tolerance policy for aggressive behavior, foul language, or any action that may damage the facility.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-black uppercase tracking-widest text-sm">3. GEAR REQUIREMENTS</h3>
            <p>Players are strictly required to wear appropriate futsal or turf shoes. Metal studs or spikes are strictly prohibited to prevent damage to the FIFA-grade turf.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-black uppercase tracking-widest text-sm">4. FACILITY RULES</h3>
            <p>Smoking, consumption of alcohol, or pets are strictly forbidden within the playing area. Food and drinks (except water/sports drinks) are restricted to the lounge area.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-black uppercase tracking-widest text-sm">5. LIABILITY</h3>
            <p>Futsal Hive is not responsible for any personal injuries sustained during the game or for the loss of personal belongings within the premises.</p>
          </div>
        </div>
      </section>

      {/* Refund Policy */}
      <section id="refund" className="space-y-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-hive-yellow/10 flex items-center justify-center text-hive-yellow">
            <RotateCcw size={24} />
          </div>
          <h2 className="text-4xl font-display font-black text-white tracking-tighter uppercase">Refund Policy</h2>
        </div>
        
        <div className="glass-card p-8 md:p-12 space-y-6 text-white/70 leading-relaxed">
          <div className="space-y-4">
            <h3 className="text-white font-black uppercase tracking-widest text-sm">1. CANCELLATIONS</h3>
            <p>Booking cancellations made at least 24 hours prior to the scheduled slot are eligible for a 50% refund of the advance or a one-time rescheduling (subject to availability).</p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-white font-black uppercase tracking-widest text-sm">2. SAME-DAY POLICY</h3>
            <p>Cancellations made within 24 hours of the scheduled slot are non-refundable and non-reschedulable. The advance payment will be forfeited.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-black uppercase tracking-widest text-sm">3. VENUE CANCELLATIONS</h3>
            <p>In the rare event that Futsal Hive must cancel a booking due to emergency maintenance, technical issues, or extreme weather conditions, a 100% refund of the advance will be provided, or a priority rescheduling will be offered.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-black uppercase tracking-widest text-sm">4. REFUND TIMELINE</h3>
            <p>Approved refunds will be processed via the original payment method (bKash/Nagad/Rocket) within 3-5 working days.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
