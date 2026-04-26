import React, { useState, useMemo } from 'react';
import { format, addDays, startOfDay, isSameDay, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useBooking, Booking } from '../context/BookingContext';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatTime12h } from '../lib/utils';
import { FUTSAL_HIVE_LOGO } from '../lib/constants';

const TIME_SLOTS = [
  '06:00', '07:30', '09:00', '10:30', '12:00',
  '13:30', '15:00', '16:30', '18:00', '19:30',
  '21:00', '22:30', '00:00'
];

export default function BookingCalendar() {
  const { user, login } = useAuth();
  const { bookings, pricing, createBooking, validateCoupon } = useBooking();
  
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'confirm' | 'otp' | 'payment' | 'success'>('select');
  const [phone, setPhone] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [otp, setOtp] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState<number>(500);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [paymentPhoneLast4, setPaymentPhoneLast4] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [bookedId, setBookedId] = useState<string | null>(null);


  const next7Days = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => addDays(startOfDay(new Date()), i));
  }, []);

  const isSlotBooked = (slot: string) => {
    return bookings.some(b => 
      b.date === format(selectedDate, 'yyyy-MM-dd') && 
      b.startTime === slot && 
      b.status !== 'cancelled'
    );
  };

  const getPriceForSlot = (slot: string) => {
    const isWeekend = selectedDate.getDay() === 5 || selectedDate.getDay() === 6; // Fri, Sat
    const dayOfWeek = selectedDate.getDay(); // 0 is Sunday
    const [hours, minutes] = slot.split(':').map(Number);
    const timeValue = hours + minutes / 60;

    // 1. Check dynamic pricing rules first
    if (pricing && pricing.length > 0) {
      // Find matching rule. We prioritize exact day over weekend/weekday, over everyday
      let matchedRule = null;
      let matchedPriority = -1; // Higher is better

      for (const rule of pricing) {
        // Parse rule times
        const [startH, startM] = rule.startTime.split(':').map(Number);
        const [endH, endM] = rule.endTime.split(':').map(Number);
        let ruleStart = startH + startM / 60;
        let ruleEnd = endH + endM / 60;
        if (ruleEnd < ruleStart) ruleEnd += 24; // Handle overnight rules, e.g. 23:00 to 02:00

        let adjustedSlotTime = timeValue;
        if (timeValue < 6 && ruleEnd > 24) adjustedSlotTime += 24; // If the slot is 00:00 - 05:00, map to 24:00+ for comparison

        const inTimeRange = adjustedSlotTime >= ruleStart && adjustedSlotTime < ruleEnd;

        if (inTimeRange) {
          if (rule.dayType === dayOfWeek.toString()) {
            if (matchedPriority < 3) { matchedRule = rule; matchedPriority = 3; }
          } else if (isWeekend && rule.dayType === 'weekend') {
            if (matchedPriority < 2) { matchedRule = rule; matchedPriority = 2; }
          } else if (!isWeekend && rule.dayType === 'weekday') {
            if (matchedPriority < 2) { matchedRule = rule; matchedPriority = 2; }
          } else if (rule.dayType === 'everyday') {
            if (matchedPriority < 1) { matchedRule = rule; matchedPriority = 1; }
          }
        }
      }
      if (matchedRule) {
        return matchedRule.price;
      }
    }

    // 2. Fallback to hardcoded values
    // Student Special (Sun-Thu, 06:00 - 16:30)
    const isStudentDay = dayOfWeek >= 0 && dayOfWeek <= 4; // Sun-Thu
    
    if (timeValue >= 6 && timeValue < 16.5) {
      // Early Strike Hour
      if (isStudentDay) return 2100; // Assuming special student price for these days
      return isWeekend ? 3000 : 2400;
    } else if (timeValue >= 16.5 && timeValue < 18) {
      // Golden Boot
      return isWeekend ? 3600 : 3000;
    } else if (timeValue >= 18 || timeValue < 2) {
      // 12 Man Deal
      return isWeekend ? 4000 : 3600;
    }
    
    return 1500; // Default fallback
  };

  const calculateFinalPrice = () => {
    const basePrice = selectedSlot ? getPriceForSlot(selectedSlot) : 0;
    const discount = appliedCoupon ? appliedCoupon.discount : 0;
    return Math.max(0, basePrice - discount);
  };

  const handleApplyCoupon = async () => {
    const coupon = await validateCoupon(couponCode);
    if (coupon) {
      setAppliedCoupon(coupon);
      setCouponError('');
    } else {
      setCouponError('Invalid or inactive coupon code');
      setAppliedCoupon(null);
    }
  };

  const handleBooking = async () => {
    if (!user || !selectedSlot) return;

    try {
      setIsSubmitting(true);
      setBookingError(null);
      
      const endTimeSlot = TIME_SLOTS[TIME_SLOTS.indexOf(selectedSlot) + 1] || '01:30';
      
      const newId = await createBooking({
        userId: user.uid,
        userName: playerName || user.displayName || 'Guest',
        userEmail: user.email || '',
        userPhone: phone,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedSlot,
        endTime: endTimeSlot,
        status: 'pending',
        price: calculateFinalPrice(),
        advanceAmount: advanceAmount,
        couponCode: appliedCoupon?.code,
        discountAmount: appliedCoupon?.discount,
        paymentMethod,
        transactionId,
        paymentPhoneLast4
      });
      setBookedId(newId);
      setStep('success');
    } catch (error: any) {
      console.error('Booking failed:', error);
      let errorMsg = "Something went wrong. Please check your transaction ID and try again.";
      if (error.message?.includes("permissions")) {
        errorMsg = "Booking access denied. Please contact support.";
      }
      setBookingError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const PAYMENT_LOGOS = {
    bkash: 'https://logos-download.com/wp-content/uploads/2022/01/BKash_Logo.png',
    nagad: 'https://logos-download.com/wp-content/uploads/2022/01/Nagad_Logo.png',
    rocket: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMTAwIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzhDMTU5NSIgcng9IjIwIi8+PHRleHQgeD0iMTUwIiB5PSI0NSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyOCIgZm9udC1zdHlsZT0iaXRhbGljIiBmb250LXdlaWdodD0iOTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Sb2NrZXQ8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSI3NSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkR1dGNoLUJhbmdsYSBCYW5rPC90ZXh0Pjwvc3ZnPg=='
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6 md:py-12">
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 mx-auto mb-6 relative"
        >
          <div className="absolute inset-0 bg-hive-yellow/20 rounded-full blur-xl animate-pulse" />
          <img 
            src={FUTSAL_HIVE_LOGO} 
            alt="Futsal Hive" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover relative z-10 rounded-2xl"
          />
        </motion.div>
        <h2 className="text-4xl font-display font-black text-white mb-4 tracking-tighter">RESERVE YOUR ARENA</h2>
        <p className="text-white/60">Select your preferred date and time to start the game.</p>
      </div>

      <div className="glass-card p-4 md:p-8">
        <div className="card-title-hive text-white uppercase tracking-wider">Booking Portal ⚡</div>
        
        {step === 'select' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Date Selection */}
            <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-4 mb-6 sm:mb-8 scrollbar-hide snap-x snap-mandatory">
              {next7Days.map((date) => (
                <button
                  key={date.toISOString()}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedSlot(null);
                  }}
                  className={cn(
                    "flex-shrink-0 w-20 sm:w-24 py-3 sm:py-4 rounded-2xl border transition-all flex flex-col items-center gap-1 snap-center",
                    isSameDay(date, selectedDate)
                      ? "bg-hive-yellow border-transparent text-hive-black font-bold shadow-lg shadow-hive-yellow/20"
                      : "bg-black/30 border-white/10 text-gray-400 hover:border-hive-yellow/50"
                  )}
                >
                  <span className="text-[10px] uppercase font-bold opacity-70">{format(date, 'EEE')}</span>
                  <span className="text-2xl font-display font-black">{format(date, 'dd')}</span>
                </button>
              ))}
            </div>

            {/* Slot Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {TIME_SLOTS.map((slot) => {
                const booked = isSlotBooked(slot);
                const selected = selectedSlot === slot;
                const price = getPriceForSlot(slot);

                return (
                  <button
                    key={slot}
                    disabled={booked}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      "p-2 sm:p-3 rounded-xl border transition-all text-center relative overflow-hidden group",
                      booked 
                        ? "bg-red-500/10 border-red-500/20 text-red-500/50 cursor-not-allowed"
                        : selected
                          ? "bg-hive-yellow text-hive-black border-transparent font-bold"
                          : "bg-black/30 border-white/10 text-gray-300 hover:border-hive-yellow/50"
                    )}
                  >
                    <div className="text-base font-display font-bold">{formatTime12h(slot)}</div>
                    <div className={cn("text-[8px] uppercase tracking-wider", selected ? "text-hive-black/80 font-bold" : "text-white/40")}>
                      - {formatTime12h(TIME_SLOTS[TIME_SLOTS.indexOf(slot) + 1] || '01:30')}
                    </div>
                    <div className={cn("text-[9px] uppercase tracking-wider mt-1", selected ? "text-hive-black/70" : "text-gray-500")}>
                      {booked ? 'Booked' : `৳${price}`}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 flex justify-end">
              <button
                disabled={!selectedSlot}
                onClick={() => {
                  if (!user) {
                    login();
                  } else {
                    setStep('confirm');
                  }
                }}
                className="w-full bg-hive-yellow text-hive-black py-4 rounded-xl font-black text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                {user ? 'Confirm Slot' : 'Login to Book'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Selected Slot</span>
                  <div className="text-xl font-display font-bold text-white mt-1">
                    {format(selectedDate, 'MMMM dd, yyyy')} | {formatTime12h(selectedSlot!)} - {formatTime12h(TIME_SLOTS[TIME_SLOTS.indexOf(selectedSlot!) + 1] || '01:30')}
                  </div>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Total Price</span>
                  <div className="text-3xl font-display font-black text-hive-yellow mt-1">
                    ৳{calculateFinalPrice()}
                    {appliedCoupon && <span className="text-xs text-white/40 line-through ml-2">৳{selectedSlot ? getPriceForSlot(selectedSlot) : 0}</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Player Name</label>
                  <input 
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-hive-yellow transition-colors mb-4"
                  />
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Phone Number</label>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-hive-yellow transition-colors"
                  />
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 pt-4">
                  <button onClick={() => setStep('select')} className="w-full sm:flex-1 text-gray-400 font-bold hover:text-white transition-colors py-4 sm:py-0 text-sm uppercase tracking-wider bg-white/5 sm:bg-transparent rounded-xl sm:rounded-none">Back</button>
                  <button 
                    disabled={!phone || phone.length < 11 || !playerName.trim()}
                    onClick={() => setStep('otp')} 
                    className="w-full sm:flex-[2] bg-hive-yellow text-hive-black py-4 rounded-xl font-black uppercase tracking-wider disabled:opacity-50 transition-transform active:scale-95"
                  >
                    Verify Details
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'otp' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center">
            <div className="w-16 h-16 bg-hive-yellow/10 text-hive-yellow rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} />
            </div>
            <h3 className="text-2xl font-display font-bold text-white">Verification Code</h3>
            <p className="text-white/60 text-sm">We've sent a 6-digit code to {phone}. <br/> (Simulated: Enter 123456)</p>
            
            <input 
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              className="w-48 mx-auto block bg-black/30 border border-white/10 rounded-xl px-4 py-4 text-center text-2xl font-display font-bold text-hive-yellow tracking-[0.5em] focus:outline-none focus:border-hive-yellow transition-colors"
            />

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 pt-4 max-w-sm mx-auto">
              <button onClick={() => setStep('confirm')} className="w-full sm:flex-1 text-gray-400 font-bold hover:text-white transition-colors py-4 sm:py-0 text-sm uppercase tracking-wider bg-white/5 sm:bg-transparent rounded-xl sm:rounded-none">Back</button>
              <button 
                disabled={otp !== '123456'}
                onClick={() => setStep('payment')} 
                className="w-full sm:flex-[2] bg-hive-yellow text-hive-black py-4 rounded-xl font-black uppercase tracking-wider disabled:opacity-50 transition-transform active:scale-95"
              >
                Verify & Pay
              </button>
            </div>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            {bookingError && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-xs font-bold flex items-center gap-3">
                <AlertCircle size={16} />
                {bookingError}
              </div>
            )}

            <div className="bg-black/30 p-6 rounded-2xl border border-white/10 mb-8">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Total Amount</span>
                  <div className="text-3xl font-display font-black text-hive-yellow mt-1">
                    ৳{calculateFinalPrice()}
                    {appliedCoupon && <span className="text-xs text-white/40 line-through ml-2">৳{selectedSlot ? getPriceForSlot(selectedSlot) : 0}</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Have a Coupon?</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="ENTER CODE"
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-hive-yellow transition-colors uppercase font-black tracking-widest text-xs"
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    className="bg-white/10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/20 transition-all border border-white/5"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-bold uppercase">{couponError}</p>}
                {appliedCoupon && <p className="text-[10px] text-green-500 font-bold uppercase">Applied: ৳{appliedCoupon.discount} OFF</p>}
              </div>
            </div>
            
            <div className="bg-hive-yellow/10 border border-hive-yellow/20 p-6 rounded-2xl mb-8">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="text-hive-yellow" />
                <h3 className="text-lg font-bold text-white">Advance Payment</h3>
              </div>
              <p className="text-sm text-hive-yellow leading-relaxed mb-6">
                Minimum advance: <strong>৳500</strong>. You can pay up to the full amount.
              </p>
              
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Advance Amount (৳)</label>
                <div className="relative">
                  <input 
                    type="number"
                    min={500}
                    max={calculateFinalPrice()}
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(Math.max(500, Math.min(calculateFinalPrice(), parseInt(e.target.value) || 500)))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-2xl font-display font-bold text-white focus:outline-none focus:border-hive-yellow transition-colors"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">BDT</div>
                </div>
                <input 
                  type="range"
                  min={500}
                  max={calculateFinalPrice()}
                  step={100}
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(parseInt(e.target.value))}
                  className="w-full accent-hive-yellow"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {(['bkash', 'nagad', 'rocket'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={cn(
                    "h-20 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 p-2",
                    paymentMethod === method ? "bg-white/10 border-hive-yellow" : "bg-black/30 border-white/10 opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
                  )}
                >
                  <img src={PAYMENT_LOGOS[method]} alt={method} referrerPolicy="no-referrer" className="h-8 object-contain" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white">{method}</span>
                </button>
              ))}
            </div>

            <div className="bg-black/30 p-6 rounded-2xl border border-white/10 space-y-4">
              <p className="text-sm text-white/60">
                Send <strong>৳{advanceAmount}</strong> to: <br/>
                <a 
                  href="tel:+8801894433325"
                  className="text-xl font-black text-white mt-1 block hover:text-hive-yellow transition-colors"
                >
                  +880 1894 43 3325 (Personal)
                </a>
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Sender's Last 4 Digits</label>
                  <input 
                    type="text"
                    maxLength={4}
                    value={paymentPhoneLast4}
                    onChange={(e) => setPaymentPhoneLast4(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9876"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-hive-yellow transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Transaction ID</label>
                  <input 
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter TrxID"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-hive-yellow transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 pt-4">
              <button 
                disabled={isSubmitting}
                onClick={() => setStep('otp')} 
                className="w-full sm:flex-1 text-gray-400 font-bold hover:text-white transition-colors py-4 sm:py-0 text-sm uppercase tracking-wider disabled:opacity-50 bg-white/5 sm:bg-transparent rounded-xl sm:rounded-none"
              >
                Back
              </button>
              <button 
                disabled={!transactionId || paymentPhoneLast4.length !== 4 || isSubmitting}
                onClick={handleBooking} 
                className="w-full sm:flex-[2] bg-hive-yellow text-hive-black py-4 rounded-xl font-black uppercase tracking-wider disabled:opacity-50 transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-hive-black/20 border-t-hive-black rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Booking
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-3xl font-display font-black text-white mb-2">BOOKING REQUEST SENT!</h3>
            
            <div className="bg-black/30 border border-white/10 rounded-xl p-6 max-w-sm mx-auto mb-8 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Player Name</span>
                <span className="text-sm font-bold text-white">{playerName || 'Guest'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Booking ID</span>
                <span className="text-xs font-mono font-bold text-hive-yellow">{bookedId ? bookedId.slice(0, 8).toUpperCase() : 'PENDING'}</span>
              </div>
            </div>

            <p className="text-gray-400 mb-8">We've received your booking request. Our team will verify the payment and confirm your slot shortly.</p>
            <button 
              onClick={() => {
                setStep('select');
                setSelectedSlot(null);
                setBookedId(null);
              }}
              className="hive-gradient text-hive-black px-8 py-3 rounded-full font-black uppercase tracking-wider"
            >
              Book Another Slot
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
