import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/UIContext';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Share2, Check, Award, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface ResultData {
  userId: string;
  quizId: string;
  score: number;
  answers: any[];
  timeSpent?: number;
  createdAt: any;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer?: number;
  correctAnswers?: number[];
  isMultiple?: boolean;
}

interface QuizData {
  title: string;
  questions: Question[];
}

export default function Result() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [result, setResult] = useState<ResultData | null>(null);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!resultId || !user) return;
      try {
        const resultRef = doc(db, "results", resultId);
        const resultSnap = await getDoc(resultRef);
        
        if (!resultSnap.exists()) throw new Error("Natija topilmadi");
        
        const rData = resultSnap.data() as ResultData;
        if (rData.userId !== user.uid) throw new Error("Sizda ushbu natijani ko'rish huquqi yo'q");
        setResult(rData);

        const quizRef = doc(db, "quizzes", rData.quizId);
        const quizSnap = await getDoc(quizRef);
        
        if (quizSnap.exists()) {
           setQuiz(quizSnap.data() as QuizData);
        } else {
           throw new Error("Test ma'lumotlari topilmadi");
        }
      } catch (err: any) {
        setError(err.message);
        showToast(err.message, "error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [resultId, user]);

  const handleShare = () => {
    const url = `${window.location.origin}/shared/${resultId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast("Link nusxalandi!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (loading) return <div className="flex flex-col items-center justify-center h-screen gap-4 bg-card"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /><p className="text-[10px] font-black text-muted uppercase tracking-widest">Natijangiz hisoblanmoqda...</p></div>;

  if (error || !result || !quiz) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center bg-card p-12 rounded-[2.5rem] border border-subtle">
        <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-main mb-4 tracking-tight">{error || "Xatolik yuz berdi"}</h2>
        <button onClick={() => navigate('/')} className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Bosh sahifaga qaytish</button>
      </div>
    );
  }

  const isPassing = result.score >= 50;

  return (
    <div className="max-w-4xl mx-auto w-full pb-24 px-4 md:px-6 pt-10">
      <Link to="/" className="inline-flex items-center gap-2 text-muted hover:text-blue-600 mb-8 transition-all font-black text-[10px] uppercase tracking-widest bg-card border border-subtle px-5 py-2.5 rounded-full shadow-sm">
        <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
      </Link>

      <div className="bg-card rounded-[3rem] p-8 md:p-16 shadow-2xl border border-subtle mb-10 text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/10 transition-all duration-700"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-600/10 transition-all duration-700"></div>
        
        <div className="inline-flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2 rounded-full border border-subtle mb-8">
           <Award className="w-4 h-4 text-amber-500" />
           <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Sizning natijangiz</span>
        </div>
        
        <h1 className="text-2xl md:text-4xl font-black text-main mb-12 tracking-tight leading-tight">{quiz.title}</h1>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 relative z-10">
           <div className="relative w-40 h-40 md:w-56 md:h-56 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-zinc-100 dark:text-zinc-900"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={cn("transition-all duration-1000 ease-out", isPassing ? "text-emerald-500" : "text-rose-500")}
                  strokeWidth="3.5"
                  strokeDasharray={`${result.score}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl md:text-6xl font-black text-main tracking-tighter">{result.score}%</span>
              </div>
           </div>
           
           <div className="text-center sm:text-left">
             <p className={cn("text-2xl md:text-3xl font-black tracking-tight mb-4", isPassing ? "text-emerald-600" : "text-rose-600")}>
               {isPassing ? 'Barakalla! 🎉' : "Ko'proq o'qing! 📚"}
             </p>
             <p className="text-sm md:text-base text-muted font-bold leading-relaxed max-w-xs mb-8">
               Siz jami {quiz.questions.length} ta savoldan {Math.round((result.score / 100) * quiz.questions.length)} tasiga to'g'ri javob berdingiz.
             </p>
             <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => navigate(`/quiz/${result.quizId}`)}
                  className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 w-full sm:w-auto tracking-widest uppercase active:scale-95"
                >
                  QAYTADAN ISHLASH
                </button>
                <button 
                   onClick={handleShare}
                   className={cn(
                     "px-8 py-3.5 rounded-2xl font-black text-xs transition-all w-full sm:w-auto tracking-widest uppercase flex items-center justify-center gap-2 active:scale-95 border",
                     copied ? "bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-600/20" : "bg-card text-main border-subtle hover:bg-zinc-50 dark:hover:bg-zinc-900"
                   )}
                 >
                   {copied ? <><Check className="w-4 h-4" /> NUSXALANDI</> : <><Share2 className="w-4 h-4" /> ULASHISH</>}
                 </button>
             </div>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 border-t border-subtle pt-12">
           <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[1.5rem] border border-subtle group hover:border-emerald-500 transition-colors">
             <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">To'g'ri</p>
             <p className="text-2xl font-black text-emerald-600">
               {quiz.questions.filter((q, i) => {
                 const userAns = Array.isArray(result.answers[i]) ? result.answers[i] : [result.answers[i]];
                 const correctAns = q.correctAnswers || (q.correctAnswer !== undefined ? [q.correctAnswer] : []);
                 return userAns.length === correctAns.length && userAns.every(v => correctAns.includes(v));
               }).length}
             </p>
           </div>
           <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[1.5rem] border border-subtle group hover:border-rose-500 transition-colors">
             <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">Xato</p>
             <p className="text-2xl font-black text-rose-600">
               {quiz.questions.filter((q, i) => {
                 const userAns = Array.isArray(result.answers[i]) ? result.answers[i] : [result.answers[i]];
                 const correctAns = q.correctAnswers || (q.correctAnswer !== undefined ? [q.correctAnswer] : []);
                 const isCorrect = userAns.length === correctAns.length && userAns.every(v => correctAns.includes(v));
                 return userAns.length > 0 && !isCorrect;
               }).length}
             </p>
           </div>
           <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[1.5rem] border border-subtle group hover:border-zinc-400 transition-colors">
             <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">O'tkazilgan</p>
             <p className="text-2xl font-black text-main">
               {result.answers.filter(a => Array.isArray(a) ? a.length === 0 : a === -1).length}
             </p>
           </div>
           <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[1.5rem] border border-subtle group hover:border-blue-500 transition-colors">
             <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">Vaqt</p>
             <p className="text-2xl font-black text-blue-600">
               {result.timeSpent ? formatTime(result.timeSpent) : '--'}
             </p>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-black text-main border-b border-subtle pb-4 mb-8 uppercase tracking-[0.2em] flex items-center gap-3">
           <ListChecks className="w-5 h-5 text-blue-600" /> Savollar tahlili
        </h3>
        {quiz.questions.map((q, idx) => {
          const userAnswerRaw = result.answers[idx];
          const userAnswers = Array.isArray(userAnswerRaw) ? userAnswerRaw : (userAnswerRaw !== -1 ? [userAnswerRaw] : []);
          const correctAnswersArr = q.correctAnswers || (q.correctAnswer !== undefined ? [q.correctAnswer] : []);
          
          const isCorrect = userAnswers.length === correctAnswersArr.length && 
                           userAnswers.every(v => correctAnswersArr.includes(v));

          return (
            <div key={idx} className="bg-card p-6 md:p-8 rounded-[2rem] border border-subtle shadow-sm hover:shadow-xl hover:shadow-slate-200/5 dark:hover:shadow-none transition-all duration-500">
              <div className="flex gap-5 mb-8">
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-[10px] font-black mt-1 shadow-lg",
                  isCorrect ? "bg-emerald-500 shadow-emerald-500/20" : "bg-rose-500 shadow-rose-500/20"
                )}>
                  {idx + 1}
                </div>
                <h4 className="text-base md:text-lg font-black text-main leading-snug">
                  {q.question}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                {q.options.map((opt, optIdx) => {
                  const isUserSelected = userAnswers.includes(optIdx);
                  const isActuallyCorrect = correctAnswersArr.includes(optIdx);
                  
                  let optStyle = "bg-zinc-50 dark:bg-zinc-900/50 border-subtle text-muted";
                  if (isActuallyCorrect) optStyle = "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm";
                  else if (isUserSelected && !isActuallyCorrect) optStyle = "bg-rose-50 dark:bg-rose-900/10 border-rose-500 text-rose-700 dark:text-rose-400 font-bold shadow-sm";

                  return (
                    <div key={optIdx} className={cn("p-4 rounded-2xl border text-xs md:text-sm flex items-center justify-between transition-all duration-300", optStyle)}>
                      <span className="leading-snug">{opt}</span>
                      {isActuallyCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {isUserSelected && !isActuallyCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
           );
        })}
      </div>
    </div>
  );
}
