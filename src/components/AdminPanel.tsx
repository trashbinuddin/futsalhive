import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBooking, Booking, Pricing } from '../context/BookingContext';
import { Check, X, Clock, DollarSign, Calendar as CalendarIcon, Filter, Users, CreditCard, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Navigate } from 'react-router-dom';

export default function AdminPanel() {
  const { user: currentUser, role, superAdminEmail, updateSuperAdmin, loading: authLoading } = useAuth();
  const { bookings, pricing, coupons, updateBookingStatus, loading: bookingsLoading } = useBooking();
  const [activeTab, setActiveTab] = useState<'bookings' | 'pricing' | 'team' | 'coupons'>('bookings');
  const [statusFilter, setStatusFilter] = useState<string>('all');
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
    .filter(b => statusFilter === 'all' || b.status === statusFilter);

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
          ADMIN <span className="text-hive-yellow">HUB ⚡</span>
        </h2>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-black/30 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setActiveTab('bookings')}
              className={cn("px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'bookings' ? "bg-hive-yellow text-hive-black" : "text-gray-400 hover:text-white")}
            >
              Bookings
            </button>
            <button 
              onClick={() => setActiveTab('pricing')}
              className={cn("px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'pricing' ? "bg-hive-yellow text-hive-black" : "text-gray-400 hover:text-white")}
            >
              Pricing
            </button>
            <button 
              onClick={() => setActiveTab('coupons')}
              className={cn("px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'coupons' ? "bg-hive-yellow text-hive-black" : "text-gray-400 hover:text-white")}
            >
              Coupons
            </button>
            {role === 'admin' && (
              <button 
                onClick={() => setActiveTab('team')}
                className={cn("px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'team' ? "bg-hive-yellow text-hive-black" : "text-gray-400 hover:text-white")}
              >
                Team
              </button>
            )}
          </div>

          {activeTab === 'bookings' && (
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-hive-yellow"
            >
              <option value="all">All Real-time</option>
              <option value="pending">Pending ⏳</option>
              <option value="confirmed">Confirmed ✅</option>
              <option value="paid">Paid 💎</option>
              <option value="cancelled">Cancelled ❌</option>
            </select>
          )}
        </div>
      </div>

      {activeTab === 'bookings' ? (
        <div className="grid gap-6">
          {filteredBookings.length === 0 ? (
            <div className="glass-card p-12 text-center text-white/40 uppercase font-black tracking-widest text-sm">
              No bookings found in this category 🔍
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="glass-card overflow-hidden group border-white/5 hover:border-white/10 transition-all">
                <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8">
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
                          <p className="text-white font-bold">{booking.startTime} - {booking.endTime}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <CreditCard size={16} className="text-hive-yellow" />
                        <div>
                          <p className="text-[10px] text-white/30 uppercase font-black">Payment ({booking.paymentMethod?.toUpperCase() || 'N/A'})</p>
                          <p className="text-white font-mono text-xs font-bold">{booking.transactionId || 'No Transaction ID'}</p>
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
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="lg:w-48 flex flex-row lg:flex-col gap-2">
                    {booking.status !== 'confirmed' && booking.status !== 'paid' && booking.status !== 'cancelled' && (
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        className="flex-1 bg-green-500 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                      >
                        <Check size={14} /> Confirm
                      </button>
                    )}
                    {booking.status !== 'paid' && booking.status !== 'cancelled' && (
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'paid')}
                        className="flex-1 bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                      >
                        <DollarSign size={14} /> Mark Paid
                      </button>
                    )}
                    {booking.status !== 'cancelled' && (
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="flex-1 bg-white/5 border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <X size={14} /> Cancel
                      </button>
                    )}
                    {booking.status === 'cancelled' && (
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'pending')}
                        className="flex-1 bg-white/5 border border-white/10 text-white/40 font-black text-[10px] uppercase tracking-widest py-3 rounded-xl hover:text-white hover:border-white/20 transition-all"
                      >
                        Restore
                      </button>
                    )}
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
      ) : (
        <div className="grid gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-tighter">OFFICIAL HIVE TEAM 🎖️</h3>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Showing only authorized team members chosen by admins</p>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="email"
                value={newTeamEmail}
                onChange={(e) => setNewTeamEmail(e.target.value)}
                placeholder="Manager/Staff Email"
                className="bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-hive-yellow w-48 md:w-64"
              />
              <button 
                onClick={handleAddToTeam}
                className="bg-hive-yellow text-hive-black px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
              >
                ADD TO TEAM
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {users.filter(u => teamWhitelist.includes(u.email?.toLowerCase()) || u.email === superAdminEmail).map((user) => (
              <div key={user.id} className="glass-card p-6 flex items-center justify-between group border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-hive-yellow/10 flex items-center justify-center border border-white/5 relative overflow-hidden">
                    <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-white font-black uppercase tracking-tighter flex items-center gap-2">
                      {user.displayName || 'Unnamed Player'}
                      {user.email === superAdminEmail && <span className="text-[8px] bg-hive-yellow text-hive-black px-1.5 py-0.5 rounded font-black">SUPER</span>}
                    </div>
                    <div className="text-[10px] text-white/40 font-medium uppercase tracking-widest">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
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
                <h3 className="text-lg font-display font-black text-hive-yellow uppercase tracking-tight mb-2">SUPER ADMIN TRANSFER 🛡️</h3>
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
            "glass-card p-6 flex items-center justify-between border-white/5",
            !c.isActive && "opacity-50 grayscale"
          )}>
            <div className="flex items-center gap-6">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-hive-yellow">
                <CreditCard size={20} />
              </div>
              <div>
                <div className="text-white font-black uppercase tracking-widest">{c.code}</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold">Discount: ৳{c.discount}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
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
        <div className="card-title-hive text-white uppercase tracking-wider">Create Coupon 🎫</div>
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
            Launch Coupon 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

function PricingManager({ pricing }: { pricing: Pricing[] }) {
  const [newPrice, setNewPrice] = useState({ dayType: 'weekday', startTime: '18:00', endTime: '19:00', price: 1500 });
  const [editingId, setEditingId] = useState<string | null>(null);

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
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {pricing.map((p) => (
          <div key={p.id} className={cn("glass-card p-6 flex items-center justify-between", editingId === p.id && "border-hive-yellow")}>
            <div className="flex items-center gap-6">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-hive-yellow">
                <Clock size={20} />
              </div>
              <div>
                <div className="text-white font-bold capitalize">{p.dayType}</div>
                <div className="text-sm text-gray-500">{p.startTime} - {p.endTime}</div>
              </div>
              <div className="text-2xl font-display font-black text-hive-yellow">৳{p.price}</div>
            </div>
            <div className="flex gap-2">
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
              <option value="weekday">Weekday</option>
              <option value="weekend">Weekend</option>
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
              {editingId ? 'Save Update 💾' : 'Add Pricing Rule 🚀'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
