import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ResultData {
  userId: string;
  quizId: string;
  score: number;
  answers: number[];
  createdAt: any;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
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

  useEffect(() => {
    async function fetchData() {
      if (!resultId || !user) return;
      try {
        const resultStored = localStorage.getItem(`result_${resultId}`);
        if (!resultStored) throw new Error("Result not found");
        
        const rData = JSON.parse(resultStored) as ResultData;
        if (rData.userId !== user.uid) throw new Error("Unauthorized");
        setResult(rData);

        const quizStored = localStorage.getItem(`quiz_${rData.quizId}`);
        if (quizStored) {
           setQuiz(JSON.parse(quizStored) as QuizData);
        } else {
           throw new Error("Quiz details missing");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [resultId, user]);

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
             </div>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-3 mb-6 uppercase tracking-tight flex items-center gap-2">
           Savollar tahlili
        </h3>
        {quiz.questions.map((q, idx) => {
          const userAnswer = result.answers[idx];
          const isCorrect = userAnswer === q.correctAnswer;

          return (
            <div key={idx} className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                <div className="pt-0.5 shrink-0">
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest uppercase">SAVOL {idx + 1}</div>
                  <h4 className="text-sm font-medium text-slate-900 leading-relaxed">{q.question}</h4>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-10">
                {q.options.map((opt, oIdx) => {
                  let optStyle = "border-slate-100 bg-slate-50 text-slate-500";
                  let isSelected = oIdx === userAnswer;
                  
                  if (oIdx === q.correctAnswer) {
                     optStyle = "border-green-400 bg-green-50/50 text-green-800 font-bold ring-1 ring-green-400/20";
                  } else if (isSelected && !isCorrect) {
                     optStyle = "border-red-300 bg-red-50/50 text-red-800 font-bold ring-1 ring-red-300/20";
                  }

                  return (
                    <div key={oIdx} className={cn("px-4 py-3 border rounded-xl text-xs flex items-center gap-3 transition-colors", optStyle)}>
                       <span className="flex-1 leading-snug">{String.fromCharCode(65 + oIdx)}. {opt}</span>
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
