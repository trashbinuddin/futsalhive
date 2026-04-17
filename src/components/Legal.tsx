import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Info, RotateCcw } from 'lucide-react';

export default function Legal() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-32 space-y-24">
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
