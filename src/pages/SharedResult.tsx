import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, Award, ListChecks, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function SharedResult() {
  const { resultId } = useParams();
  const [result, setResult] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!resultId) return;
      try {
        const resultRef = doc(db, "results", resultId);
        const resultSnap = await getDoc(resultRef);
        
        if (!resultSnap.exists()) throw new Error("Natija topilmadi yoki o'chirib tashlangan");
        const rData = resultSnap.data();
        setResult(rData);

        const quizRef = doc(db, "quizzes", rData.quizId);
        const quizSnap = await getDoc(quizRef);
        
        if (quizSnap.exists()) {
           setQuiz(quizSnap.data());
        } else {
           throw new Error("Test ma'lumotlari topilmadi");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [resultId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (loading) return <div className="flex flex-col items-center justify-center h-screen gap-4 bg-white dark:bg-zinc-950"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /><p className="text-[10px] font-black text-muted uppercase tracking-widest">Natija yuklanmoqda...</p></div>;
  if (error || !result || !quiz) return <div className="text-center mt-20 bg-card p-12 rounded-[2.5rem] border border-subtle max-w-md mx-auto shadow-xl"><XCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" /><h2 className="text-xl font-black text-main mb-6 tracking-tight">{error}</h2><Link to="/login" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest">Tizimga kirish</Link></div>;

  const isPassing = result.score >= 50;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300 pb-24 pt-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
           <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 px-5 py-2 rounded-full shadow-sm mb-8">
             <Award className="w-4 h-4 text-amber-500" />
             <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">Ommaviy Natija</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-black text-main tracking-tighter mb-4 leading-tight">{quiz.title}</h1>
           <p className="text-muted font-bold">Ushbu natija foydalanuvchi tomonidan ulashilgan</p>
        </div>

        <div className="bg-card rounded-[3rem] p-10 md:p-16 shadow-2xl border border-subtle mb-12 text-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 -mr-24 -mt-24 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/10 transition-all duration-700"></div>
           <div className="text-6xl md:text-8xl font-black text-blue-600 tracking-tighter mb-6">{result.score}%</div>
           <p className={cn("text-xl md:text-2xl font-black mb-12 tracking-tight", isPassing ? "text-emerald-600" : "text-rose-600")}>
             {isPassing ? 'Muvaffaqiyatli topshirildi! 🎉' : 'Natija yaxshi emas 📚'}
           </p>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-subtle pt-12">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-subtle">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">To'g'ri</p>
                <p className="text-2xl font-black text-emerald-600">
                   {quiz.questions.filter((q: any, i: number) => {
                     const userAns = Array.isArray(result.answers[i]) ? result.answers[i] : [result.answers[i]];
                     const correctAns = q.correctAnswers || [q.correctAnswer];
                     return userAns.length === correctAns.length && userAns.every((v: any) => correctAns.includes(v));
                   }).length}
                </p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-subtle">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Xato</p>
                <p className="text-2xl font-black text-rose-600">
                   {quiz.questions.filter((q: any, i: number) => {
                     const userAns = Array.isArray(result.answers[i]) ? result.answers[i] : [result.answers[i]];
                     const correctAns = q.correctAnswers || [q.correctAnswer];
                     const isCorrect = userAns.length === correctAns.length && userAns.every((v: any) => correctAns.includes(v));
                     return userAns.length > 0 && !isCorrect;
                   }).length}
                </p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-subtle">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Sana</p>
                <p className="text-sm font-black text-main mt-1">{new Date(result.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-subtle">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Vaqt</p>
                <p className="text-sm font-black text-blue-600 mt-1">{result.timeSpent ? formatTime(result.timeSpent) : '--'}</p>
              </div>
           </div>
        </div>

        <div className="bg-zinc-900 dark:bg-zinc-900/80 rounded-[3rem] p-10 md:p-14 text-white text-center shadow-2xl shadow-blue-500/10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-blue-600/30 transition-all duration-700"></div>
           <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 px-4 py-2 rounded-full mb-6">
                 <Sparkles className="w-4 h-4 text-blue-400" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Sizning navbatingiz</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-black mb-4 tracking-tighter leading-tight">Siz ham o'z testingizni yarating!</h3>
              <p className="text-zinc-400 mb-10 text-base md:text-lg max-w-xl mx-auto font-medium">Hujjat yuklang yoki shunchaki mavzu bering, bizning aqlli AI sizga soniyalar ichida mukammal testlar tuzib beradi.</p>
              <Link to="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95">
                 BEPUL BOSHLASH
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
