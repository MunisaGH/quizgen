import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Loader2, User, Mail, BarChart3, LogOut, Award, BookOpen, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
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
        const qQuizzes = query(collection(db, "quizzes"), where("userId", "==", user.uid));
        const quizSnap = await getDocs(qQuizzes);
        
        // Fetch results count and avg score
        const qResults = query(collection(db, "results"), where("userId", "==", user.uid));
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
          collection(db, "results"), 
          where("userId", "==", user.uid),
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
      navigate('/login');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-zinc-200/60 overflow-hidden">
        {/* Header/Cover */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-blue-600 relative">
           <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-3xl shadow-xl">
             {user?.photoURL ? (
               <img src={user.photoURL} alt={user.displayName || 'User'} className="w-24 h-24 rounded-[1.25rem] object-cover" />
             ) : (
               <div className="w-24 h-24 rounded-[1.25rem] bg-zinc-100 flex items-center justify-center text-zinc-400">
                 <User className="w-10 h-10" />
               </div>
             )}
           </div>
        </div>

        <div className="pt-16 pb-8 px-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
               <h1 className="text-2xl font-[900] text-zinc-900 tracking-tight">{user?.displayName || 'Foydalanuvchi'}</h1>
               <p className="text-zinc-500 flex items-center gap-1.5 mt-1 text-sm font-medium">
                 <Mail className="w-4 h-4" /> {user?.email}
               </p>
             </div>
             <button 
               onClick={handleLogout}
               className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl font-bold text-sm transition-all duration-300"
             >
               <LogOut className="w-4 h-4" /> CHIQISH
             </button>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
             <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 group hover:border-indigo-200 transition-all">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <p className="text-2xl font-[900] text-zinc-900">{stats.totalQuizzes}</p>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Jami Testlar</p>
             </div>

             <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 group hover:border-emerald-200 transition-all">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <p className="text-2xl font-[900] text-zinc-900">{stats.totalResults}</p>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Ishlangan Testlar</p>
             </div>

             <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 group hover:border-amber-200 transition-all">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <p className="text-2xl font-[900] text-zinc-900">{stats.avgScore}%</p>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">O'rtacha ball</p>
             </div>
           </div>

           {/* Progress Chart Section (4.2) */}
           <div className="mt-12">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> So'nggi natijalar dinamikasi
              </h3>
              <div className="bg-zinc-50 border border-zinc-100 rounded-[2rem] p-8 h-64 flex items-end justify-between gap-2 md:gap-4 overflow-hidden relative">
                {/* Grid lines */}
                <div className="absolute inset-x-0 bottom-8 h-[1px] bg-zinc-200/50"></div>
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-zinc-200/30 border-dashed border-t"></div>
                
                {recentScores.length > 0 ? (
                  recentScores.map((score, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative z-10">
                       <div 
                         className={cn(
                           "w-full rounded-t-xl transition-all duration-700 ease-out relative group-hover:brightness-110",
                           score >= 80 ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : 
                           score >= 50 ? "bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]" : 
                           "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                         )}
                         style={{ height: `${score}%`, transitionDelay: `${i * 50}ms` }}
                       >
                         <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded transition-opacity">
                           {score}%
                         </div>
                       </div>
                       <span className="text-[10px] font-bold text-zinc-400">{i + 1}</span>
                    </div>
                  ))
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm font-medium">
                    Ma'lumotlar yetarli emas
                  </div>
                )}
              </div>
           </div>

           {/* Recent Activity placeholder or info */}
           <div className="mt-12 p-8 bg-zinc-900 rounded-[2rem] text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
             <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
               <Clock className="w-5 h-5 text-indigo-400" /> Profilingiz tayyor!
             </h3>
             <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
               Sizning barcha testlaringiz va natijalaringiz Firestore bulutli bazasida saqlanmoqda. Siz istalgan qurilmadan kirib o'z faoliyatingizni davom ettirishingiz mumkin.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
