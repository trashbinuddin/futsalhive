import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBooking, Booking, Pricing } from '../context/BookingContext';
import { useGallery } from '../context/GalleryContext';
import { Check, X, Clock, DollarSign, Calendar as CalendarIcon, Filter, Users, CreditCard, Edit2, Image as ImageIcon, Upload, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatTime12h } from '../lib/utils';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Navigate, Link } from 'react-router-dom';

export default function AdminPanel() {
  const { user: currentUser, role, superAdminEmail, updateSuperAdmin, loading: authLoading } = useAuth();
  const { bookings, pricing, coupons, updateBookingStatus, deleteBooking, loading: bookingsLoading } = useBooking();
  const { images, addImage, deleteImage, loading: galleryLoading } = useGallery();
  const [activeTab, setActiveTab] = useState<'bookings' | 'pricing' | 'team' | 'coupons' | 'gallery'>('bookings');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamWhitelist, setTeamWhitelist] = useState<string[]>([]);
  const [newTeamEmail, setNewTeamEmail] = useState('');
  const [newSuperAdmin, setNewSuperAdmin] = useState('');
  const [isUpdatingSuper, setIsUpdatingSuper] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'team' && role === 'admin') {
      setLoadingUsers(true);
      
      const configUnsubscribe = onSnapshot(doc(db, 'config', 'main'), (snap) => {
        if (snap.exists()) {
          setTeamWhitelist(snap.data().teamEmails || []);
        }
      });

      const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoadingUsers(false);
      });
      return () => {
        configUnsubscribe();
        usersUnsubscribe();
      };
    }
  }, [activeTab, role]);

  if (authLoading || bookingsLoading) return null;

  if (role !== 'admin' && role !== 'moderator') {
    return <Navigate to="/hive-admin" replace />;
  }

  const filteredBookings = bookings
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .filter(b => statusFilter === 'all' || b.status === statusFilter)
    .filter(b => {
      if (!startDateFilter && !endDateFilter) return true;
      const bookingDate = new Date(b.date);
      bookingDate.setHours(0, 0, 0, 0);

      let isAfterStart = true;
      if (startDateFilter) {
        const start = new Date(startDateFilter);
        start.setHours(0, 0, 0, 0);
        isAfterStart = bookingDate >= start;
      }

      let isBeforeEnd = true;
      if (endDateFilter) {
        const end = new Date(endDateFilter);
        end.setHours(0, 0, 0, 0);
        isBeforeEnd = bookingDate <= end;
      }

      return isAfterStart && isBeforeEnd;
    });

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to clear this user\'s login data? This will not affect their booking information records.')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleAddToTeam = async () => {
    if (!newTeamEmail || !newTeamEmail.includes('@')) return;
    const email = newTeamEmail.toLowerCase().trim();
    if (teamWhitelist.includes(email)) return;
    
    try {
      const updatedList = [...teamWhitelist, email];
      await updateDoc(doc(db, 'config', 'main'), { teamEmails: updatedList });
      setNewTeamEmail('');
    } catch (error) {
      console.error('Error adding team email:', error);
    }
  };

  const handleRemoveFromTeam = async (email: string) => {
    if (!window.confirm(`Remove ${email} from authorized team list?`)) return;
    try {
      const updatedList = teamWhitelist.filter(e => e !== email);
      await updateDoc(doc(db, 'config', 'main'), { teamEmails: updatedList });
    } catch (error) {
      console.error('Error removing team email:', error);
    }
  };

  const handleChangeSuperAdmin = async () => {
    if (!newSuperAdmin || !newSuperAdmin.includes('@')) return;
    if (!window.confirm(`Are you sure you want to transfer Super Admin rights to ${newSuperAdmin}? You will lose the ability to change this setting unless you regain access.`)) return;
    
    setIsUpdatingSuper(true);
    try {
      await updateSuperAdmin(newSuperAdmin);
      alert('Super Admin updated successfully!');
      setNewSuperAdmin('');
    } catch (error) {
      console.error('Error updating super admin:', error);
      alert('Failed to update Super Admin. Ensure you have permissions.');
    } finally {
      setIsUpdatingSuper(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 pt-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h2 className="text-4xl font-display font-black text-white tracking-tighter uppercase shrink-0">
          ADMIN <span className="text-hive-yellow">HUB</span>
        </h2>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex max-w-[calc(100vw-2rem)] overflow-x-auto bg-black/30 p-1 rounded-xl border border-white/10 scrollbar-hide">
            <button 
              onClick={() => setActiveTab('bookings')}
              className={cn("whitespace-nowrap shrink-0 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'bookings' ? "bg-hive-yellow text-hive-black" : "text-gray-400 hover:text-white")}
            >
              Bookings
            </button>
            <button 
              onClick={() => setActiveTab('pricing')}
              className={cn("whitespace-nowrap shrink-0 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'pricing' ? "bg-hive-yellow text-hive-black" : "text-gray-400 hover:text-white")}
            >
              Pricing
            </button>
            <button 
              onClick={() => setActiveTab('coupons')}
              className={cn("whitespace-nowrap shrink-0 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'coupons' ? "bg-hive-yellow text-hive-black" : "text-gray-400 hover:text-white")}
            >
              Coupons
            </button>
            <button 
              onClick={() => setActiveTab('gallery')}
              className={cn("whitespace-nowrap shrink-0 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'gallery' ? "bg-hive-yellow text-hive-black" : "text-gray-400 hover:text-white")}
            >
              Gallery
            </button>
            {role === 'admin' && (
              <button 
                onClick={() => setActiveTab('team')}
                className={cn("whitespace-nowrap shrink-0 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'team' ? "bg-hive-yellow text-hive-black" : "text-gray-400 hover:text-white")}
              >
                Team
              </button>
            )}
          </div>

          {activeTab === 'bookings' && (
            <div className="flex flex-wrap items-center gap-2">
              <input 
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-hive-yellow [color-scheme:dark]"
              />
              <span className="text-white/40 text-[10px] font-black uppercase">To</span>
              <input 
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-hive-yellow [color-scheme:dark]"
              />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-hive-yellow"
              >
                <option value="all">All Real-time</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'bookings' ? (
        <div className="grid gap-6">
          {filteredBookings.length === 0 ? (
            <div className="glass-card p-12 text-center text-white/40 uppercase font-black tracking-widest text-sm">
              No bookings found in this category
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className={cn(
                "glass-card overflow-hidden group transition-all relative border-l-4",
                booking.status === 'pending' ? "border-l-hive-yellow bg-hive-yellow/5 hover:bg-hive-yellow/10 border-white/5 hover:border-white/10" :
                booking.status === 'confirmed' ? "border-l-green-500 bg-green-500/5 hover:bg-green-500/10 border-white/5 hover:border-white/10" :
                booking.status === 'paid' ? "border-l-blue-500 bg-blue-500/5 hover:bg-blue-500/10 border-white/5 hover:border-white/10" :
                booking.status === 'cancelled' ? "border-l-red-500 bg-red-500/5 hover:bg-red-500/10 border-white/5 hover:border-white/10" :
                "border-l-transparent border-white/5 hover:border-white/10"
              )}>
                <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8 relative z-10">
                  {/* User & Status Column */}
                  <div className="lg:w-1/4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-hive-yellow/10 flex items-center justify-center text-hive-yellow/50">
                        <Users size={24} />
                      </div>
                      <div>
                        <div className="text-white font-black uppercase tracking-tighter text-lg">{booking.userName}</div>
                        <div className="text-xs text-white/40">{booking.userPhone}</div>
                      </div>
                    </div>
                    <div className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                      booking.status === 'confirmed' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                      booking.status === 'cancelled' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                      booking.status === 'paid' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                      "bg-hive-yellow/10 text-hive-yellow border border-hive-yellow/20"
                    )}>
                      {booking.status}
                    </div>
                  </div>

                  {/* Details Column */}
                  <div className="flex-1 grid md:grid-cols-2 gap-6 p-4 md:p-6 bg-black/20 rounded-2xl border border-white/5">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <CalendarIcon size={16} className="text-hive-yellow" />
                        <div>
                          <p className="text-[10px] text-white/30 uppercase font-black">Play Date</p>
                          <p className="text-white font-bold">{format(new Date(booking.date), 'EEEE, MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-hive-yellow" />
                        <div>
                          <p className="text-[10px] text-white/30 uppercase font-black">Time Slot</p>
                          <p className="text-white font-bold">{formatTime12h(booking.startTime)} - {formatTime12h(booking.endTime)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <CreditCard size={16} className="text-hive-yellow shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-white/30 uppercase font-black">Payment ({booking.paymentMethod?.toUpperCase() || 'N/A'})</p>
                          <p className="text-white font-mono text-xs font-bold break-all">{booking.transactionId || 'No Transaction ID'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-white/30 uppercase font-black">Advance</p>
                          <p className="text-hive-yellow font-black">৳{booking.advanceAmount}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/30 uppercase font-black">Due</p>
                          <p className="text-red-400 font-black">৳{booking.price - (booking.advanceAmount || 0)}</p>
                        </div>
                      </div>
                      {booking.confirmedBy && (
                        <div className="mt-2 text-[9px] text-white/40 uppercase font-black tracking-widest border-t border-white/5 pt-2">
                          Last Updated By: <span className="text-white/80">{booking.confirmedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="lg:w-48 flex flex-wrap lg:flex-col gap-2">
                    {booking.status !== 'confirmed' && booking.status !== 'paid' && booking.status !== 'cancelled' && (
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'confirmed', currentUser?.email || 'Admin')}
                        className="flex-1 bg-green-500 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                      >
                        <Check size={14} /> Confirm
                      </button>
                    )}
                    {booking.status !== 'paid' && booking.status !== 'cancelled' && (
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'paid', currentUser?.email || 'Admin')}
                        className="flex-1 bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                      >
                        <DollarSign size={14} /> Mark Paid
                      </button>
                    )}
                    {booking.status !== 'cancelled' && (
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'cancelled', currentUser?.email || 'Admin')}
                        className="flex-1 bg-white/5 border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <X size={14} /> Cancel
                      </button>
                    )}
                    {booking.status === 'cancelled' && (
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'pending')}
                        className="flex-1 bg-white/5 border border-white/10 text-white/40 font-black text-[10px] uppercase tracking-widest py-3 rounded-xl hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
                      >
                        Restore
                      </button>
                    )}
                    <Link 
                      to={`/invoice/${booking.id}`}
                      className="flex-1 bg-hive-yellow/10 border border-hive-yellow/20 text-hive-yellow font-black text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-hive-yellow hover:text-hive-black transition-all flex items-center justify-center gap-2"
                    >
                      <FileText size={14} /> Invoice
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'pricing' ? (
        <PricingManager pricing={pricing} />
      ) : activeTab === 'coupons' ? (
        <CouponManager coupons={coupons || []} />
      ) : activeTab === 'gallery' ? (
        <GalleryManager images={images} addImage={addImage} deleteImage={deleteImage} loading={galleryLoading} />
      ) : (
        <div className="grid gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-tighter">OFFICIAL HIVE TEAM</h3>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Showing only authorized team members chosen by admins</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <input 
                type="email"
                value={newTeamEmail}
                onChange={(e) => setNewTeamEmail(e.target.value)}
                placeholder="Manager/Staff Email"
                className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 sm:py-2 text-xs text-white focus:outline-none focus:border-hive-yellow w-full md:w-64"
              />
              <button 
                onClick={handleAddToTeam}
                className="bg-hive-yellow text-hive-black px-6 py-3 sm:py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all whitespace-nowrap"
              >
                ADD TO TEAM
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {users.filter(u => teamWhitelist.includes(u.email?.toLowerCase()) || u.email === superAdminEmail).map((user) => (
              <div key={user.id} className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-hive-yellow/10 shrink-0 flex items-center justify-center border border-white/5 relative overflow-hidden">
                    <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-black uppercase tracking-tighter flex items-center gap-2 truncate">
                      <span className="truncate">{user.displayName || 'Unnamed Player'}</span>
                      {user.email === superAdminEmail && <span className="text-[8px] bg-hive-yellow text-hive-black px-1.5 py-0.5 rounded font-black shrink-0">SUPER</span>}
                    </div>
                    <div className="text-[10px] text-white/40 font-medium uppercase tracking-widest truncate">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <select 
                    value={user.role}
                    disabled={user.email === superAdminEmail || user.id === currentUser?.uid}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                    className="bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-hive-yellow disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <option value="user">Player</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>

                  {user.email !== superAdminEmail && user.id !== currentUser?.uid && (
                    <button 
                      onClick={() => handleRemoveFromTeam(user.email)}
                      className="p-2 text-red-500/50 hover:text-red-500 transition-colors bg-white/5 rounded-lg border border-white/5 hover:border-red-500/20"
                      title="Remove from Authorized Team"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {users.filter(u => teamWhitelist.includes(u.email?.toLowerCase()) || u.email === superAdminEmail).length === 0 && (
              <div className="glass-card p-12 text-center text-white/20 uppercase font-black tracking-widest text-sm border-dashed">
                No authorized team members found. <br/> Add an email above to authorize staff.
              </div>
            )}
          </div>

          <div className="mt-12 pt-12 border-t border-white/10">
            <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.3em] mb-4">Pending Authorization</h3>
            <div className="flex flex-wrap gap-2">
              {teamWhitelist.filter(email => !users.some(u => u.email?.toLowerCase() === email.toLowerCase())).map(email => (
                <div key={email} className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl flex items-center gap-3">
                  <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">{email}</span>
                  <button onClick={() => handleRemoveFromTeam(email)} className="text-red-500/50 hover:text-red-500">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {teamWhitelist.filter(email => !users.some(u => u.email?.toLowerCase() === email.toLowerCase())).length === 0 && (
                <p className="text-[10px] text-white/20 uppercase font-black tracking-widest italic">All authorized staff have logged in.</p>
              )}
            </div>
          </div>

          {currentUser?.email === superAdminEmail && (
            <div className="mt-12 pt-12 border-t border-white/10">
              <div className="glass-card p-8 border-hive-yellow/20">
                <h3 className="text-lg font-display font-black text-hive-yellow uppercase tracking-tight mb-2">SUPER ADMIN TRANSFER</h3>
                <p className="text-white/40 text-xs uppercase tracking-widest mb-6">Permanently transfer full system ownership to another email address</p>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <input 
                    type="email"
                    value={newSuperAdmin}
                    onChange={(e) => setNewSuperAdmin(e.target.value)}
                    placeholder="Enter new Super Admin email"
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-hive-yellow transition-colors"
                  />
                  <button 
                    onClick={handleChangeSuperAdmin}
                    disabled={isUpdatingSuper || !newSuperAdmin}
                    className="bg-red-500/20 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {isUpdatingSuper ? 'Transferring...' : 'Transfer Sovereignty'}
                  </button>
                </div>
                <p className="mt-4 text-[9px] text-red-500/50 uppercase font-black tracking-[0.2em] italic">
                  CAUTION: This action is irreversible. The new owner will have full control over all roles and team settings.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CouponManager({ coupons }: { coupons: any[] }) {
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: 100, isActive: true });

  const handleAddCoupon = async () => {
    if (!newCoupon.code) return;
    await addDoc(collection(db, 'coupons'), {
      ...newCoupon,
      code: newCoupon.code.toUpperCase()
    });
    setNewCoupon({ code: '', discount: 100, isActive: true });
  };

  const handleDeleteCoupon = async (id: string) => {
    await deleteDoc(doc(db, 'coupons', id));
  };

  const toggleCoupon = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'coupons', id), { isActive: !current });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {coupons.map((c) => (
          <div key={c.id} className={cn(
            "glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-white/5",
            !c.isActive && "opacity-50 grayscale"
          )}>
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-10 h-10 rounded-lg bg-white/5 shrink-0 flex items-center justify-center text-hive-yellow">
                <CreditCard size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-white font-black uppercase tracking-widest truncate">{c.code}</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold truncate">Discount: ৳{c.discount}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 self-start sm:self-auto">
              <button 
                onClick={() => toggleCoupon(c.id, c.isActive)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                  c.isActive ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-white/10 text-white/40 border border-white/10"
                )}
              >
                {c.isActive ? 'Active' : 'Disabled'}
              </button>
              <button onClick={() => handleDeleteCoupon(c.id)} className="text-red-500/50 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>
        ))}

        {coupons.length === 0 && (
          <div className="glass-card p-12 text-center text-white/20 uppercase font-black tracking-widest">
            No active coupons. Create one to get started.
          </div>
        )}
      </div>

      <div className="glass-card p-8 h-fit sticky top-32">
        <div className="card-title-hive text-white uppercase tracking-wider">Create Coupon</div>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Coupon Code</label>
            <input 
              type="text" 
              value={newCoupon.code}
              onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value})}
              placeholder="E.G. HIVE300"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-hive-yellow uppercase font-black tracking-widest" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Discount Amount (৳)</label>
            <select 
              value={newCoupon.discount}
              onChange={(e) => setNewCoupon({...newCoupon, discount: parseInt(e.target.value)})}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-hive-yellow"
            >
              <option value={100}>৳100 Flat OFF</option>
              <option value={150}>৳150 Flat OFF</option>
              <option value={200}>৳200 Flat OFF</option>
              <option value={250}>৳250 Flat OFF</option>
              <option value={300}>৳300 Flat OFF</option>
            </select>
          </div>
          <button onClick={handleAddCoupon} className="w-full bg-hive-yellow text-hive-black py-4 rounded-xl font-black text-sm uppercase tracking-wider mt-4 transition-transform active:scale-95">
            Launch Coupon
          </button>
        </div>
      </div>
    </div>
  );
}

function PricingManager({ pricing }: { pricing: Pricing[] }) {
  const [newPrice, setNewPrice] = useState({ dayType: 'weekday', startTime: '18:00', endTime: '19:00', price: 1500 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleResetToDefaultPricing = async () => {
    if (!window.confirm('This will delete all current pricing rules and restore the system defaults. Continue?')) return;
    
    try {
      // 1. Delete all current rules
      for (const p of pricing) {
        await deleteDoc(doc(db, 'pricing', p.id));
      }
      
      // 2. Add defaults
      const defaults = [
        { dayType: 'weekday', startTime: '06:00', endTime: '16:30', price: 2100 },
        { dayType: 'weekend', startTime: '06:00', endTime: '16:30', price: 3000 },
        { dayType: 'weekday', startTime: '16:30', endTime: '18:00', price: 3000 },
        { dayType: 'weekend', startTime: '16:30', endTime: '18:00', price: 3600 },
        { dayType: 'weekday', startTime: '18:00', endTime: '02:00', price: 3600 },
        { dayType: 'weekend', startTime: '18:00', endTime: '02:00', price: 4000 },
        { dayType: 'everyday', startTime: '02:00', endTime: '06:00', price: 1500 }
      ];
      
      for (const rule of defaults) {
        await addDoc(collection(db, 'pricing'), rule);
      }
      
      showNotification('Default pricing restored successfully!', 'success');
    } catch (error) {
      console.error("Error resetting pricing:", error);
      showNotification('Failed to reset pricing rules.', 'error');
    }
  };

  const handleAddPricing = async () => {
    if (editingId) {
      await updateDoc(doc(db, 'pricing', editingId), newPrice);
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'pricing'), newPrice);
    }
    setNewPrice({ dayType: 'weekday', startTime: '18:00', endTime: '19:00', price: 1500 });
  };

  const startEdit = (p: Pricing) => {
    setEditingId(p.id);
    setNewPrice({ dayType: p.dayType, startTime: p.startTime, endTime: p.endTime, price: p.price });
  };

  const handleDeletePricing = async (id: string) => {
    if (!window.confirm('Delete this pricing rule?')) return;
    await deleteDoc(doc(db, 'pricing', id));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 relative">
      {notification && (
        <div className={cn("fixed top-32 right-1/2 translate-x-1/2 p-4 rounded-xl shadow-2xl flex items-center gap-3 z-[100] animate-in fade-in slide-in-from-top-4 backdrop-blur-md", 
          notification.type === 'success' ? "bg-green-500/20 border border-green-500/30 text-green-400" : "bg-red-500/20 border border-red-500/30 text-red-400"
        )}>
          {notification.type === 'success' ? <Check size={20} /> : <X size={20} />}
          <span className="font-bold text-sm tracking-wider">{notification.message}</span>
        </div>
      )}
      <div className="lg:col-span-2 space-y-4">
        {pricing.map((p) => (
          <div key={p.id} className={cn("glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4", editingId === p.id && "border-hive-yellow")}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-white/5 shrink-0 flex items-center justify-center text-hive-yellow">
                  <Clock size={20} />
                </div>
                <div className="min-w-0">
                  <div className="text-white font-bold capitalize truncate">
                    {p.dayType === 'everyday' ? 'Everyday' 
                      : p.dayType === 'weekday' ? 'Weekday (Sun-Thu)' 
                      : p.dayType === 'weekend' ? 'Weekend (Fri-Sat)' 
                      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(p.dayType)] || p.dayType}
                  </div>
                  <div className="text-sm text-gray-500 truncate">{p.startTime} - {p.endTime}</div>
                </div>
              </div>
              <div className="text-2xl font-display font-black text-hive-yellow">৳{p.price}</div>
            </div>
            <div className="flex gap-2 self-start sm:self-auto shrink-0">
              <button onClick={() => startEdit(p)} className="p-2 text-hive-yellow/50 hover:text-hive-yellow transition-colors bg-white/5 rounded-lg border border-white/5">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDeletePricing(p.id)} className="p-2 text-red-500/50 hover:text-red-500 transition-colors bg-white/5 rounded-lg border border-white/5">
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
        {pricing.length === 0 && (
          <div className="glass-card p-12 text-center text-white/20 uppercase font-black tracking-widest">
            No dynamic pricing rules found. 
          </div>
        )}
      </div>

      <div className="glass-card p-8 h-fit sticky top-32">
        <div className="card-title-hive text-white uppercase tracking-wider">
          {editingId ? 'Edit Pricing' : 'Add New Pricing'}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Day Type</label>
            <select 
              value={newPrice.dayType}
              onChange={(e) => setNewPrice({...newPrice, dayType: e.target.value})}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-hive-yellow"
            >
              <option value="everyday">Everyday</option>
              <option value="weekday">Weekday (Sun-Thu)</option>
              <option value="weekend">Weekend (Fri-Sat)</option>
              <option value="0">Sunday</option>
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Start</label>
              <input 
                type="time" 
                value={newPrice.startTime}
                onChange={(e) => setNewPrice({...newPrice, startTime: e.target.value})}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-hive-yellow" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">End</label>
              <input 
                type="time" 
                value={newPrice.endTime}
                onChange={(e) => setNewPrice({...newPrice, endTime: e.target.value})}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-hive-yellow" 
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Price (৳)</label>
            <input 
              type="number" 
              value={newPrice.price}
              onChange={(e) => setNewPrice({...newPrice, price: parseInt(e.target.value) || 0})}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-hive-yellow" 
            />
          </div>
          <div className="flex gap-2">
            {editingId && (
              <button 
                onClick={() => {
                  setEditingId(null);
                  setNewPrice({ dayType: 'weekday', startTime: '18:00', endTime: '19:00', price: 1500 });
                }}
                className="flex-1 bg-white/5 text-white/40 py-4 rounded-xl font-black text-sm uppercase tracking-wider mt-4"
              >
                Cancel
              </button>
            )}
            <button onClick={handleAddPricing} className="flex-[2] bg-hive-yellow text-hive-black py-4 rounded-xl font-black text-sm uppercase tracking-wider mt-4 transition-transform active:scale-95">
              {editingId ? 'Save Update' : 'Add Pricing Rule'}
            </button>
          </div>
          <button onClick={handleResetToDefaultPricing} className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 py-4 rounded-xl font-black text-xs uppercase tracking-wider mt-2 transition-all">
            Reset to Default Pricing
          </button>
        </div>
      </div>
    </div>
  );
}

function GalleryManager({ images, addImage, deleteImage, loading }: any) {
  const [newImage, setNewImage] = useState({ title: '', category: '' });
  const [base64File, setBase64File] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Max dimensions
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress as JPEG at 70% quality to ensure small base64 string
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setBase64File(compressedBase64);
        } else {
          setBase64File(event.target?.result as string);
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!base64File || !newImage.title || !newImage.category) return;
    setIsUploading(true);
    try {
      await addImage(base64File, newImage.title.trim(), newImage.category.trim());
      setNewImage({ title: '', category: '' });
      setBase64File('');
    } catch (e: any) {
      console.error(e);
      alert(`Failed to upload. ${e?.message || 'Try again.'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* List */}
      <div className="lg:col-span-2 space-y-4">
        {loading ? (
           <p className="text-white/40 text-[10px] font-black uppercase tracking-widest text-center mt-12">Loading Gallery Data...</p>
        ) : images.length === 0 ? (
           <div className="glass-card p-12 text-center text-white/40 uppercase font-black tracking-widest break-words border-dashed border-white/20">
             No images uploaded. Add some to the right to feature them on the main page.
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((img: any) => (
               <div key={img.id} className="glass-card border-white/5 overflow-hidden group">
                 <div className="aspect-[4/3] bg-black relative">
                   <img src={img.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={img.title} />
                   <button 
                     onClick={() => deleteImage(img.id)}
                     className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform opacity-100 md:opacity-0 group-hover:opacity-100"
                     title="Delete Image"
                   >
                     <Trash2 size={14} />
                   </button>
                 </div>
                 <div className="p-3 bg-white/5">
                   <p className="text-[10px] font-black text-hive-yellow uppercase tracking-widest truncate">{img.category}</p>
                   <p className="text-sm font-bold text-white truncate">{img.title}</p>
                 </div>
               </div>
            ))}
          </div>
        )}
      </div>

      {/* Form */}
      <div className="lg:col-span-1">
        <div className="glass-card p-6 md:p-8 space-y-6 sticky top-24 border-hive-yellow/10">
          <div>
            <h3 className="text-xl font-display font-black text-hive-yellow uppercase tracking-tighter flex items-center gap-2">
              <Upload size={20} /> Add Image
            </h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-2">Images will be automatically resized for web</p>
          </div>

          <div className="space-y-4">
            {base64File ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                <img src={base64File} className="w-full h-full object-cover opacity-80" />
                <button 
                  onClick={() => setBase64File('')}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/80 hover:bg-red-500 rounded-lg text-white flex items-center justify-center transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="w-full aspect-video border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-hive-yellow/50 hover:bg-hive-yellow/5 transition-all text-white/40 hover:text-hive-yellow">
                <ImageIcon size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">Select Image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}

            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Title</label>
              <input 
                type="text"
                placeholder="e.g. Night Match"
                value={newImage.title}
                onChange={(e) => setNewImage({...newImage, title: e.target.value})}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-hive-yellow text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Category</label>
              <input 
                type="text"
                placeholder="e.g. Action, Facilities"
                value={newImage.category}
                onChange={(e) => setNewImage({...newImage, category: e.target.value})}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-hive-yellow text-sm"
              />
            </div>
            
            <button 
              disabled={isUploading || !base64File || !newImage.title || !newImage.category}
              onClick={handleCreate} 
              className="w-full bg-hive-yellow text-hive-black py-4 rounded-xl font-black text-sm uppercase tracking-wider mt-4 transition-transform active:scale-95 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
