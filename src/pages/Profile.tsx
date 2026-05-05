import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
