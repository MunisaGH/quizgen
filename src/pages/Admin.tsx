import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import {
  Check, X, Clock, ShieldCheck, Mail, Crown,
  RefreshCw, AlertTriangle, Users, TrendingUp, DollarSign
} from 'lucide-react';
import { useToast } from '../contexts/UIContext';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  plan: string;
  price: string;
  receiptUrl: string;
  status: string;
  createdAt: Timestamp | null;
}

interface UserStat {
  totalUsers: number;
  premiumUsers: number;
  pendingRequests: number;
}

const planDays: Record<string, number> = { weekly: 7, monthly: 30, yearly: 365 };

const Admin: React.FC = () => {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { showToast } = useToast();
  const { userData } = useAuth();
  const navigate = useNavigate();

  // Admin guard
  useEffect(() => {
    if (userData && !userData.isAdmin) {
      navigate('/');
    }
  }, [userData]);

  useEffect(() => {
    const statusFilter = tab === 'pending' ? 'pending' : tab === 'approved' ? 'approved' : 'rejected';
    const q = query(collection(db, 'payment_requests'), where('status', '==', statusFilter));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentRequest));
      data.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setRequests(data);
      setLoading(false);
    });
    return () => unsub();
  }, [tab]);

  const handleApprove = async (req: PaymentRequest) => {
    setProcessingId(req.id);
    try {
      const now = new Date();
      const premiumUntil = new Date();
      const days = planDays[req.plan] || 30;
      premiumUntil.setDate(now.getDate() + days);

      await updateDoc(doc(db, 'users', req.userId), {
        isPremium: true,
        premiumUntil: premiumUntil.toISOString(),
        premiumPlan: req.plan,
      });

      await updateDoc(doc(db, 'payment_requests', req.id), {
        status: 'approved',
        approvedAt: new Date().toISOString(),
      });

      showToast(`✅ ${req.userEmail} — Premium faollashtirildi!`, 'success');
    } catch (err) {
      showToast('Xatolik yuz berdi', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (req: PaymentRequest) => {
    if (!window.confirm(`${req.userEmail} arizasini rad etmoqchimisiz?`)) return;
    setProcessingId(req.id);
    try {
      await updateDoc(doc(db, 'payment_requests', req.id), {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
      });
      showToast('Ariza rad etildi', 'info');
    } catch {
      showToast('Xatolik', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (ts: Timestamp | null) => {
    if (!ts) return '—';
    return new Date(ts.seconds * 1000).toLocaleString('uz-UZ');
  };

  const planLabel = (p: string) =>
    p === 'weekly' ? 'Haftalik' : p === 'monthly' ? 'Oylik' : 'Yillik';

  const tabs: { key: typeof tab; label: string; color: string }[] = [
    { key: 'pending',  label: 'Kutilmoqda', color: 'amber' },
    { key: 'approved', label: 'Tasdiqlangan', color: 'emerald' },
    { key: 'rejected', label: 'Rad etilgan', color: 'rose' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-main tracking-tight">Admin Panel</h1>
          </div>
          <p className="text-muted text-sm font-medium pl-13">To'lov arizalarini ko'rib chiqing va Premium bering</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-zinc-50 dark:bg-zinc-900/50 p-1.5 rounded-2xl border border-subtle w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setLoading(true); }}
            className={cn(
              "px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
              tab === t.key
                ? t.color === 'amber' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                  : t.color === 'emerald' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                : "text-muted hover:text-main"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-72 bg-zinc-100 dark:bg-zinc-800/50 rounded-[2rem] animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-card border border-subtle rounded-[2.5rem] p-16 text-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-muted" />
          </div>
          <p className="text-muted font-black text-sm uppercase tracking-widest">Bu bo'limda arizalar yo'q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {requests.map(req => (
            <div
              key={req.id}
              className={cn(
                "bg-card border rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300",
                tab === 'pending' ? "border-amber-200 dark:border-amber-900/30 border-l-4 border-l-amber-500"
                  : tab === 'approved' ? "border-emerald-200 dark:border-emerald-900/30 border-l-4 border-l-emerald-500"
                    : "border-rose-200 dark:border-rose-900/30 border-l-4 border-l-rose-500"
              )}
            >
              {/* Receipt preview */}
              <a href={req.receiptUrl} target="_blank" rel="noreferrer" className="block relative h-40 group overflow-hidden">
                <img
                  src={req.receiptUrl}
                  alt="Chek"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-xs font-bold">Kattaroq ko'rish →</span>
                </div>
              </a>

              <div className="p-5">
                {/* User info */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-muted" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest">Foydalanuvchi</p>
                    <p className="text-sm font-black text-main truncate">{req.userEmail}</p>
                  </div>
                </div>

                {/* Plan & Price */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 rounded-xl">
                    <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-0.5">Tarif</p>
                    <p className="text-xs font-black text-blue-600">{planLabel(req.plan)}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 rounded-xl">
                    <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-0.5">Narxi</p>
                    <p className="text-xs font-black text-main">{req.price} UZS</p>
                  </div>
                </div>

                {/* Date */}
                <p className="text-[10px] text-muted font-bold mb-4">{formatDate(req.createdAt)}</p>

                {/* Actions */}
                {tab === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(req)}
                      disabled={!!processingId}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20"
                    >
                      {processingId === req.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Tasdiqlash
                    </button>
                    <button
                      onClick={() => handleReject(req)}
                      disabled={!!processingId}
                      className="w-10 h-10 bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 border border-rose-100 dark:border-rose-900/30 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {tab === 'approved' && (
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                    <Crown className="w-4 h-4" /> Premium faollashtirildi
                  </div>
                )}
                {tab === 'rejected' && (
                  <div className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-widest">
                    <AlertTriangle className="w-4 h-4" /> Rad etildi
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;
