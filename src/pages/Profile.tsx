import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/UIContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { User, Mail, BarChart3, LogOut, Award, BookOpen, Clock, Copy, Crown, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { ProfileSkeleton } from '../components/Skeleton';

export default function Profile() {
  const { user, userData, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalResults: 0,
    avgScore: 0
  });
  const [recentScores, setRecentScores] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      try {
        // Fetch quizzes count
        const qQuizzes = query(collection(db, "quizzes", user.uid, "items"));
        const quizSnap = await getDocs(qQuizzes);
        
        // Fetch results count and avg score
        const qResults = query(collection(db, "results", user.uid, "items"));
        const resultSnap = await getDocs(qResults);
        
        let totalScore = 0;
        resultSnap.forEach(doc => {
          totalScore += doc.data().score || 0;
        });

        setStats({
          totalQuizzes: quizSnap.size,
          totalResults: resultSnap.size,
          avgScore: resultSnap.size > 0 ? Math.round(totalScore / resultSnap.size) : 0
        });

        // Fetch recent 10 scores for chart
        const qRecent = query(
          collection(db, "results", user.uid, "items"), 
          orderBy("createdAt", "desc"),
          limit(10)
        );
        const recentSnap = await getDocs(qRecent);
        const scores = recentSnap.docs.map(doc => doc.data().score).reverse();
        setRecentScores(scores);
      } catch (err) {
        console.error("Stats fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      showToast("Tizimdan chiqdingiz", "info");
      navigate('/login');
    } catch (err) {
      console.error("Logout error:", err);
      showToast("Chiqishda xatolik", "error");
    }
  };

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card rounded-[2.5rem] shadow-xl border border-subtle overflow-hidden">
        {/* Header/Cover */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-blue-600 relative">
           <div className="absolute -bottom-12 left-8 p-1 bg-card rounded-3xl shadow-xl border border-subtle">
             {user?.photoURL ? (
               <img src={user.photoURL} alt={user.displayName || 'User'} className="w-24 h-24 rounded-[1.25rem] object-cover" />
             ) : (
               <div className="w-24 h-24 rounded-[1.25rem] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                 <User className="w-10 h-10" />
               </div>
             )}
           </div>
        </div>

        <div className="pt-16 pb-8 px-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-main tracking-tight">{user?.displayName || 'Foydalanuvchi'}</h1>
                  {userData?.isPremium && (
                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-amber-200 dark:border-amber-800/50 flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Premium
                    </span>
                  )}
                </div>
                <p className="text-muted flex items-center gap-1.5 mt-1 text-sm font-bold">
                  <Mail className="w-4 h-4" /> {user?.email}
                </p>
                <div className="flex items-center gap-2 mt-4 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2 rounded-xl border border-subtle w-fit group">
                  <span className="text-[10px] font-black text-muted uppercase tracking-widest">ID:</span>
                  <code className="text-xs font-bold text-main">{user?.uid}</code>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(user?.uid || '');
                      showToast("ID nusxalandi", "success");
                    }}
                    className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-blue-600"
                    title="ID-dan nusxa olish"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl font-black text-xs transition-all duration-300 uppercase tracking-widest border border-red-100 dark:border-red-900/30"
              >
                <LogOut className="w-4 h-4" /> CHIQISH
              </button>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
             <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-subtle group hover:border-blue-400 transition-all">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-main">{stats.totalQuizzes}</p>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">Jami Testlar</p>
             </div>

             <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-subtle group hover:border-emerald-400 transition-all">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-main">{stats.totalResults}</p>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">Ishlangan Testlar</p>
             </div>

             <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-subtle group hover:border-amber-400 transition-all">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-main">{stats.avgScore}%</p>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">O'rtacha ball</p>
             </div>
           </div>

           {/* Progress Chart Section (4.2) */}
           <div className="mt-12">
              <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" /> So'nggi natijalar dinamikasi
              </h3>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-subtle rounded-[2rem] p-8 h-64 flex items-end justify-between gap-2 md:gap-4 overflow-hidden relative">
                <div className="absolute inset-x-0 bottom-8 h-[1px] bg-zinc-200 dark:bg-zinc-800/50"></div>
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-zinc-200 dark:bg-zinc-800/30 border-dashed border-t"></div>
                
                {recentScores.length > 0 ? (
                  recentScores.map((score, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative z-10">
                       <div 
                         className={cn(
                           "w-full rounded-t-xl transition-all duration-700 ease-out relative group-hover:brightness-110",
                           score >= 80 ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : 
                           score >= 50 ? "bg-blue-600 shadow-lg shadow-blue-600/20" : 
                           "bg-rose-500 shadow-lg shadow-rose-500/20"
                         )}
                         style={{ height: `${score}%`, transitionDelay: `${i * 50}ms` }}
                       >
                         <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-all scale-75 group-hover:scale-100 whitespace-nowrap">
                           {score}% natija
                         </div>
                       </div>
                       <span className="text-[10px] font-black text-muted">{i + 1}</span>
                    </div>
                  ))
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted text-xs font-bold uppercase tracking-widest">
                    Ma'lumotlar yetarli emas
                  </div>
                )}
              </div>
           </div>

           {/* Status Info */}
           <div className="mt-12 p-8 bg-zinc-900 rounded-[2rem] text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-blue-600/20 transition-all duration-700"></div>
             <h3 className="text-lg font-black mb-2 flex items-center gap-2">
               <Sparkles className="w-5 h-5 text-blue-400" /> Profilingiz tayyor!
             </h3>
             <p className="text-zinc-400 text-sm leading-relaxed max-w-md font-medium">
               Sizning barcha testlaringiz va natijalaringiz bulutli bazada saqlanmoqda. Dunyoning istalgan nuqtasidan bilimingizni oshirishda davom eting.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
  );
}
