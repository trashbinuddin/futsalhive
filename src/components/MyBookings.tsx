import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBooking, Booking } from '../context/BookingContext';
import { Calendar as CalendarIcon, Clock, CreditCard, ChevronRight, X, AlertCircle, CheckCircle2, History, FileText, CalendarPlus } from 'lucide-react';
import { format, isBefore, isAfter, parseISO, startOfDay } from 'date-fns';
import { cn, formatTime12h } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Link, Navigate } from 'react-router-dom';
import { FUTSAL_HIVE_LOGO } from '../lib/constants';

const addToGoogleCalendar = (booking: Booking) => {
  const formatDateTime = (dateStr: string, timeStr: string) => {
    return `${dateStr.replace(/-/g, '')}T${timeStr.replace(':', '')}00`;
  };

  const start = formatDateTime(booking.date, booking.startTime);
  const end = formatDateTime(booking.date, booking.endTime);
  const title = "Futsal Hive Booking";
  const details = `Futsal match at Futsal Hive.\nBooking ID: #${booking.id.slice(-6).toUpperCase()}\nAmount Paid: BDT ${booking.advanceAmount || 0}`;
  const location = "Futsal Hive";

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
  window.open(url, '_blank');
};

export default function MyBookings() {
  const { user, loading: authLoading } = useAuth();
  const { bookings, updateBookingStatus, loading: bookingsLoading } = useBooking();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const myBookings = useMemo(() => {
    if (!user) return [];
    return bookings
      .filter(b => b.userId === user.uid)
      .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
  }, [bookings, user]);

  const filteredBookings = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);

    return myBookings.filter(b => {
      const bookingDate = parseISO(b.date);
      if (filter === 'upcoming') return isAfter(bookingDate, today) || b.date === format(today, 'yyyy-MM-dd');
      if (filter === 'past') return isBefore(bookingDate, today) && b.date !== format(today, 'yyyy-MM-dd');
      return true;
    });
  }, [myBookings, filter]);

  if (!authLoading && !user) return <Navigate to="/" replace />;

  const handleCancelClick = (id: string) => {
    setConfirmCancelId(id);
    setCancelError(null);
  }

  const confirmCancel = async (id: string) => {
    setIsCancelling(true);
    setCancelError(null);
    try {
      await updateBookingStatus(id, 'cancelled');
      setConfirmCancelId(null);
      setSelectedBooking(null);
    } catch (err: any) {
      setCancelError(err.message || String(err));
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 pt-32 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          <div className="w-16 h-16 relative hidden sm:block">
            <div className="absolute inset-0 bg-hive-yellow/10 rounded-2xl blur-xl" />
            <img 
              src={FUTSAL_HIVE_LOGO} 
              alt="Logo" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover relative z-10 rounded-2xl"
            />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tighter uppercase mb-2 md:mb-4">
              MY <span className="text-hive-yellow">BATTLES</span>
            </h2>
            <p className="text-white/60 max-w-md uppercase text-[10px] font-bold tracking-[0.2em]">Track your bookings, history, and arena schedules in real-time.</p>
          </div>
        </motion.div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md overflow-x-auto w-full md:w-auto snap-x">
          <button 
            onClick={() => setFilter('all')}
            className={cn(
              "whitespace-nowrap shrink-0 snap-start px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              filter === 'all' ? "bg-hive-yellow text-hive-black shadow-lg shadow-hive-yellow/20" : "text-white/40 hover:text-white"
            )}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('upcoming')}
            className={cn(
              "whitespace-nowrap shrink-0 snap-start px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              filter === 'upcoming' ? "bg-hive-yellow text-hive-black shadow-lg shadow-hive-yellow/20" : "text-white/40 hover:text-white"
            )}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setFilter('past')}
            className={cn(
              "whitespace-nowrap shrink-0 snap-start px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              filter === 'past' ? "bg-hive-yellow text-hive-black shadow-lg shadow-hive-yellow/20" : "text-white/40 hover:text-white"
            )}
          >
            History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {authLoading || bookingsLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-24"
            >
              <div className="w-12 h-12 border-4 border-hive-yellow border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">Loading battles...</p>
            </motion.div>
          ) : filteredBookings.length > 0 ? (
            filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <div 
                  onClick={() => setSelectedBooking(booking)}
                  className={cn(
                    "p-6 cursor-pointer border transition-all group-hover:translate-y-[-4px] relative z-10 rounded-2xl backdrop-blur-md",
                    (isBefore(parseISO(booking.date), startOfDay(new Date())) && booking.date !== format(startOfDay(new Date()), 'yyyy-MM-dd'))
                      ? "bg-white/5 border-white/5 hover:border-white/20 grayscale-[0.8] opacity-80"
                      : "bg-hive-yellow/5 border-hive-yellow/10 hover:border-hive-yellow/40 shadow-lg shadow-hive-yellow/5"
                  )}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                      booking.status === 'confirmed' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                      booking.status === 'cancelled' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                      booking.status === 'paid' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                      "bg-hive-yellow/10 text-hive-yellow border border-hive-yellow/20"
                    )}>
                      {booking.status}
                    </div>
                    <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">#{booking.id.slice(-6).toUpperCase()}</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-hive-yellow">
                        <CalendarIcon size={20} />
                      </div>
                      <div>
                        <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Play Date</p>
                        <p className="text-white font-black uppercase tracking-tighter">
                          {format(parseISO(booking.date), 'EEEE, MMM dd')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-hive-yellow">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Time Slot</p>
                        <p className="text-white font-black uppercase tracking-tighter">
                          {formatTime12h(booking.startTime)} - {formatTime12h(booking.endTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Total Price</p>
                      <p className="text-xl font-display font-black text-white">৳{booking.price}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {(isAfter(parseISO(booking.date), startOfDay(new Date())) || booking.date === format(startOfDay(new Date()), 'yyyy-MM-dd')) && booking.status !== 'cancelled' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); addToGoogleCalendar(booking); }}
                          className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-hive-yellow/10 text-hive-yellow hover:bg-hive-yellow hover:text-hive-black transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                          title="Add to Calendar"
                        >
                          <CalendarPlus size={16} /> <span className="hidden sm:inline">Calendar</span>
                        </button>
                      )}
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:text-hive-yellow group-hover:border-hive-yellow/50 transition-all shrink-0">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Hive Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-hive-yellow/5 rounded-full blur-3xl -z-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-white/20">
                <History size={40} />
              </div>
              <h3 className="text-xl font-display font-black text-white/40 uppercase tracking-widest">No bookings found</h3>
              <p className="text-white/20 text-xs mt-2 uppercase tracking-widest font-bold">Ready to take the field?</p>
              <Link to="/booking" className="inline-block mt-8 text-hive-yellow font-black text-[10px] uppercase tracking-[0.3em] border-b border-hive-yellow/30 pb-1 hover:border-hive-yellow transition-all">
                Book a slot Now →
              </Link>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-hive-black/90 backdrop-blur-md"
            />
            <motion.div
              layoutId={selectedBooking.id}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-hive-black border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-5 sm:p-8 md:p-12 overflow-y-auto w-full">
                <div className="flex justify-between items-start mb-6 md:mb-10">
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tighter mb-1">Booking Details</h2>
                    <p className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-1 sm:gap-2">
                       Arena Access Verified <CheckCircle2 size={12} className="text-hive-yellow" />
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedBooking(null)}
                    className="p-2 sm:p-3 bg-white/5 rounded-xl sm:rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5 shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8 mb-8 md:mb-12">
                  <div className="space-y-5 sm:space-y-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-hive-yellow/10 flex items-center justify-center text-hive-yellow shrink-0">
                        <CalendarIcon size={20} />
                      </div>
                      <div>
                        <p className="text-[9px] sm:text-[10px] text-white/30 uppercase font-black tracking-widest">Play Date</p>
                        <p className="text-sm sm:text-base text-white font-bold">{format(parseISO(selectedBooking.date), 'EEEE, MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-hive-yellow/10 flex items-center justify-center text-hive-yellow shrink-0">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-[9px] sm:text-[10px] text-white/30 uppercase font-black tracking-widest">Time Slot</p>
                        <p className="text-sm sm:text-base text-white font-bold">{formatTime12h(selectedBooking.startTime)} - {formatTime12h(selectedBooking.endTime)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 sm:space-y-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-hive-yellow/10 flex items-center justify-center text-hive-yellow shrink-0">
                        <CreditCard size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] text-white/30 uppercase font-black tracking-widest">Transaction Status</p>
                        <p className="text-white font-bold uppercase text-xs sm:text-sm">{selectedBooking.status}</p>
                        {selectedBooking.transactionId && <p className="text-[8px] text-white/20 font-mono mt-1 break-all">{selectedBooking.transactionId}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-hive-yellow/10 flex items-center justify-center text-hive-yellow shrink-0">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <p className="text-[9px] sm:text-[10px] text-white/30 uppercase font-black tracking-widest">Payment Info</p>
                        <p className="text-sm sm:text-base text-white font-bold">৳{selectedBooking.advanceAmount} Paid</p>
                        <p className="text-hive-yellow text-[9px] sm:text-[10px] font-black uppercase mt-1">Due: ৳{selectedBooking.price - (selectedBooking.advanceAmount || 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {cancelError && (
                  <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl text-xs flex items-center justify-center text-center">
                    {cancelError}
                  </div>
                )}
                
                {confirmCancelId === selectedBooking.id ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-center text-red-500 font-bold text-sm mb-2">Are you sure? This cannot be undone.</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={() => confirmCancel(selectedBooking.id)}
                        disabled={isCancelling}
                        className="flex-1 bg-red-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                      </button>
                      <button 
                        onClick={() => setConfirmCancelId(null)}
                        disabled={isCancelling}
                        className="flex-1 bg-white/5 border border-white/10 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        Nevermind
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    {!(isBefore(parseISO(selectedBooking.date), startOfDay(new Date())) && selectedBooking.date !== format(startOfDay(new Date()), 'yyyy-MM-dd')) && selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'paid' && (
                      <button 
                        onClick={() => handleCancelClick(selectedBooking.id)}
                        className="flex-1 bg-red-500/10 border border-red-500/20 text-red-500 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <X size={18} /> Cancel Booking
                      </button>
                    )}
                    <Link 

                      to={`/invoice/${selectedBooking.id}`}
                      className="flex-1 bg-hive-yellow/10 border border-hive-yellow/20 text-hive-yellow py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-hive-yellow hover:text-hive-black transition-all flex items-center justify-center gap-2"
                    >
                      <FileText size={18} /> View Invoice
                    </Link>
                    <button 
                      onClick={() => {
                        setSelectedBooking(null);
                        setConfirmCancelId(null);
                        setCancelError(null);
                      }}
                      className="flex-1 bg-white/5 border border-white/10 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl shadow-black/40"
                    >
                      Close
                    </button>
                  </div>
                )}
                
                <p className="text-center mt-8 text-[9px] text-white/20 font-bold uppercase tracking-[0.2em]">
                  Please arrive 15 minutes early for your session.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
