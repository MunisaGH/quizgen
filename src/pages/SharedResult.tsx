import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, Award, Clock } from 'lucide-react';
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

  if (loading) return <div className="flex justify-center items-center h-screen bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  if (error || !result || !quiz) return <div className="text-center mt-12 bg-white p-8 rounded-2xl shadow-sm max-w-md mx-auto border border-slate-100"><h2 className="text-xl font-bold text-red-600 mb-4">{error}</h2><Link to="/login" className="text-blue-600 font-bold">Tizimga kirish</Link></div>;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-10 px-4 md:px-0">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
           <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm mb-6">
             <Award className="w-4 h-4 text-amber-500" />
             <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Ommaviy Natija</span>
           </div>
           <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">{quiz.title}</h1>
           <p className="text-slate-500 font-medium">Ushbu natija foydalanuvchi tomonidan ulashilgan</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-white mb-12 text-center">
           <div className="text-5xl md:text-7xl font-black text-blue-600 tracking-tighter mb-4">{result.score}%</div>
           <p className="text-lg font-bold text-slate-800 mb-8">{result.score >= 50 ? 'Muvaffaqiyatli topshirildi! 🎉' : 'Natija yaxshi emas 📚'}</p>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 pt-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">To'g'ri</p>
                <p className="text-lg font-bold text-green-600">
                   {quiz.questions.filter((q: any, i: number) => {
                     const userAns = Array.isArray(result.answers[i]) ? result.answers[i] : [result.answers[i]];
                     const correctAns = q.correctAnswers || [q.correctAnswer];
                     return userAns.length === correctAns.length && userAns.every((v: any) => correctAns.includes(v));
                   }).length}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Xato</p>
                <p className="text-lg font-bold text-red-600">
                   {quiz.questions.filter((q: any, i: number) => {
                     const userAns = Array.isArray(result.answers[i]) ? result.answers[i] : [result.answers[i]];
                     const correctAns = q.correctAnswers || [q.correctAnswer];
                     const isCorrect = userAns.length === correctAns.length && userAns.every((v: any) => correctAns.includes(v));
                     return userAns.length > 0 && !isCorrect;
                   }).length}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sana</p>
                <p className="text-sm font-bold text-slate-700 mt-1">{new Date(result.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vaqt</p>
                <p className="text-sm font-bold text-blue-600 mt-1">{result.timeSpent ? formatTime(result.timeSpent) : '--'}</p>
              </div>
           </div>
        </div>

        <div className="bg-blue-600 rounded-[2rem] p-8 text-white text-center shadow-xl shadow-blue-500/20">
           <h3 className="text-xl font-bold mb-3">Siz ham o'z testingizni yarating!</h3>
           <p className="text-blue-100 mb-6 text-sm">Hujjat yuklang yoki mavzu bering, AI sizga test tuzib beradi.</p>
           <Link to="/login" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-colors">
              BEPUL BOSHLASH
           </Link>
        </div>
      </div>
    </div>
  );
}
