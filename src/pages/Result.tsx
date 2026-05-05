import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Share2, Check } from 'lucide-react';
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
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !result || !quiz) {
    return (
      <div className="text-center mt-12 bg-white p-8 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">Bosh sahifaga qaytish</button>
      </div>
    );
  }

  const isPassing = result.score >= 50;

  return (
    <div className="max-w-3xl mx-auto w-full pb-24 px-4 md:px-6 pt-6">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 transition-all font-medium text-sm bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
        <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
      </Link>

      <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-200 mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-1 relative z-10">{quiz.title}</h1>
        <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mb-8 relative z-10">Test Natijalari</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 relative z-10">
           <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={isPassing ? "text-green-500" : "text-red-500"}
                  strokeWidth="3"
                  strokeDasharray={`${result.score}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tighter">{result.score}%</span>
              </div>
           </div>
           <div className="text-center sm:text-left">
             <p className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 mb-2">
               {isPassing ? 'Barakalla! 🎉' : "Ko'proq shug'ullaning! 📚"}
             </p>
             <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">
               Ushbu testdan {result.score}% natija qayd etdingiz. Umumiy savollar: {quiz.questions.length} ta.
             </p>
             <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => navigate(`/quiz/${result.quizId}`)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 w-full sm:w-auto tracking-widest uppercase"
                >
                  QAYTADAN ISHLASH
                </button>
                <button 
                   onClick={handleShare}
                   className={cn(
                     "px-6 py-3 rounded-xl font-bold text-xs transition-all w-full sm:w-auto tracking-widest uppercase flex items-center justify-center gap-2",
                     copied ? "bg-emerald-500 text-white" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm"
                   )}
                 >
                   {copied ? <><Check className="w-4 h-4" /> NUSXALANDI</> : <><Share2 className="w-4 h-4" /> ULASHISH</>}
                 </button>
             </div>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 relative z-10 border-t border-slate-100 pt-8">
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">To'g'ri</p>
             <p className="text-lg font-black text-green-600">
               {quiz.questions.filter((q, i) => {
                 const userAns = Array.isArray(result.answers[i]) ? result.answers[i] : [result.answers[i]];
                 const correctAns = q.correctAnswers || (q.correctAnswer !== undefined ? [q.correctAnswer] : []);
                 return userAns.length === correctAns.length && userAns.every(v => correctAns.includes(v));
               }).length}
             </p>
           </div>
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Xato</p>
             <p className="text-lg font-black text-red-600">
               {quiz.questions.filter((q, i) => {
                 const userAns = Array.isArray(result.answers[i]) ? result.answers[i] : [result.answers[i]];
                 const correctAns = q.correctAnswers || (q.correctAnswer !== undefined ? [q.correctAnswer] : []);
                 const isCorrect = userAns.length === correctAns.length && userAns.every(v => correctAns.includes(v));
                 return userAns.length > 0 && !isCorrect;
               }).length}
             </p>
           </div>
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">O'tkazilgan</p>
             <p className="text-lg font-black text-slate-500">
               {result.answers.filter(a => Array.isArray(a) ? a.length === 0 : a === -1).length}
             </p>
           </div>
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vaqt</p>
             <p className="text-lg font-black text-blue-600">
               {result.timeSpent ? formatTime(result.timeSpent) : '--'}
             </p>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-3 mb-6 uppercase tracking-tight flex items-center gap-2">
           Savollar tahlili
        </h3>
        {quiz.questions.map((q, idx) => {
          const userAnswerRaw = result.answers[idx];
          const userAnswers = Array.isArray(userAnswerRaw) ? userAnswerRaw : (userAnswerRaw !== -1 ? [userAnswerRaw] : []);
          const correctAnswers = q.correctAnswers || (q.correctAnswer !== undefined ? [q.correctAnswer] : []);
          
          const isCorrect = userAnswers.length === correctAnswers.length && 
                           userAnswers.every(v => correctAnswers.includes(v));

          return (
            <div key={idx} className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex gap-4 mb-4">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold mt-1",
                  isCorrect ? "bg-green-500" : "bg-red-500"
                )}>
                  {idx + 1}
                </div>
                <h4 className="text-sm md:text-base font-bold text-slate-800 leading-tight">
                  {q.question}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-10">
                {q.options.map((opt, optIdx) => {
                const isUserSelected = userAnswers.includes(optIdx);
                const isActuallyCorrect = correctAnswers.includes(optIdx);
                
                let optStyle = "bg-slate-50 border-slate-100 text-slate-500";
                if (isActuallyCorrect) optStyle = "bg-green-50 border-green-100 text-green-700 font-bold";
                else if (isUserSelected && !isActuallyCorrect) optStyle = "bg-red-50 border-red-100 text-red-700 font-bold";

                return (
                  <div key={optIdx} className={cn("p-3 rounded-xl border text-xs md:text-sm flex items-center justify-between transition-all", optStyle)}>
                    <span>{opt}</span>
                    {isActuallyCorrect && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                    {isUserSelected && !isActuallyCorrect && <XCircle className="w-4 h-4 text-red-600" />}
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
