import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/UIContext';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, Clock, ListChecks } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

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
  timer: number | null;
}

export default function Quiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[][]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    async function fetchQuiz() {
      if (!quizId) return;
      try {
        const docRef = doc(db, "quizzes", quizId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as QuizData;
          setQuiz(data);
          
          // Check for saved progress
          const savedProgress = localStorage.getItem(`quiz_progress_${quizId}`);
          if (savedProgress) {
            const { answers: savedAnswers, currentIndex: savedIndex, timeLeft: savedTime } = JSON.parse(savedProgress);
            if (savedAnswers.length === data.questions.length) {
              setAnswers(savedAnswers);
              setCurrentIndex(savedIndex);
              if (savedTime !== undefined) setTimeLeft(savedTime);
              showToast("Progress tiklandi", "info");
            } else {
              setAnswers(new Array(data.questions.length).fill([]).map(() => []));
            }
          } else {
            setAnswers(new Array(data.questions.length).fill([]).map(() => []));
            if (data.timer) {
              setTimeLeft(data.timer * 60);
            }
          }
        }
      } catch (err) {
        console.error(err);
        showToast("Testni yuklashda xatolik", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitting) {
      if (timeLeft === 0 && !submitting) {
        handleAutoSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitting]);

  const handleAutoSubmit = async () => {
    if (!quiz || !user || !quizId) return;
    setSubmitting(true);
    showToast("Vaqt tugadi! Test avtomatik topshirilmoqda...", "info");
    const timeSpent = quiz.timer ? (quiz.timer * 60 - (timeLeft || 0)) : 0;
    try {
      const score = calculateScore();
      const newResult = {
        userId: user.uid,
        quizId: quizId,
        score: score,
        answers: answers,
        timeSpent: timeSpent,
        createdAt: new Date().toISOString(),
        autoSubmitted: true
      };
      const docRef = await addDoc(collection(db, "results"), newResult);
      localStorage.removeItem(`quiz_progress_${quizId}`);
      navigate(`/result/${docRef.id}`);
    } catch (err) {
      console.error(err);
      showToast("Natijani saqlashda xatolik", "error");
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!quiz) return;
    const currentQuestion = quiz.questions[currentIndex];
    const newAnswers = [...answers];
    const currentSelected = newAnswers[currentIndex] || [];

    if (currentQuestion.isMultiple) {
      if (currentSelected.includes(optionIndex)) {
        newAnswers[currentIndex] = currentSelected.filter(i => i !== optionIndex);
      } else {
        newAnswers[currentIndex] = [...currentSelected, optionIndex];
      }
    } else {
      newAnswers[currentIndex] = [optionIndex];
    }
    
    setAnswers(newAnswers);
    
    localStorage.setItem(`quiz_progress_${quizId}`, JSON.stringify({
      answers: newAnswers,
      currentIndex: currentIndex,
      timeLeft: timeLeft
    }));
  };

  const handleNext = () => {
    if (quiz && currentIndex < quiz.questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      localStorage.setItem(`quiz_progress_${quizId}`, JSON.stringify({
        answers: answers,
        currentIndex: nextIdx,
        timeLeft: timeLeft
      }));
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      localStorage.setItem(`quiz_progress_${quizId}`, JSON.stringify({
        answers: answers,
        currentIndex: prevIdx,
        timeLeft: timeLeft
      }));
    }
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correctCount = 0;
    quiz.questions.forEach((q, i) => {
      const userAnswers = answers[i] || [];
      const correctAnsArr = q.correctAnswers || (q.correctAnswer !== undefined ? [q.correctAnswer] : []);
      
      const isCorrect = 
        userAnswers.length === correctAnsArr.length && 
        userAnswers.every(val => correctAnsArr.includes(val));
        
      if (isCorrect) {
        correctCount++;
      }
    });
    return Math.round((correctCount / quiz.questions.length) * 100);
  };

  const submitQuiz = async () => {
    if (answers.some(a => a.length === 0)) {
      showToast("Iltimos, barcha savollarga javob bering", "error");
      return;
    }

    if (!window.confirm("Testni yakunlashni tasdiqlaysizmi?")) return;

    setSubmitting(true);
    const timeSpent = quiz?.timer ? (quiz.timer * 60 - (timeLeft || 0)) : 0;
    try {
      const score = calculateScore();
      const newResult = {
        userId: user?.uid,
        quizId: quizId,
        score: score,
        answers: answers,
        timeSpent: timeSpent,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "results"), newResult);
      localStorage.removeItem(`quiz_progress_${quizId}`);
      showToast("Test yakunlandi!", "success");
      navigate(`/result/${docRef.id}`);
    } catch (err) {
      console.error(err);
      showToast("Xatolik yuz berdi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) return <div className="flex flex-col items-center justify-center h-screen gap-4 bg-card"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /><p className="text-sm font-black text-muted tracking-widest uppercase">Savollar tayyorlanmoqda...</p></div>;
  if (!quiz) return <div className="p-8 text-center bg-card">Test topilmadi</div>;

  const currentQuestion = quiz.questions[currentIndex];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col transition-colors duration-300">
      {/* Header Area */}
      <div className="glass-panel border-b border-subtle px-6 py-4 flex items-center justify-between sticky top-0 z-40">
         <div className="flex flex-col">
            <h1 className="text-sm md:text-base font-black text-main truncate max-w-[200px] md:max-w-md">{quiz.title}</h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest">
               <ListChecks className="w-3 h-3" /> {currentIndex + 1} / {quiz.questions.length} savol
            </div>
         </div>
         {timeLeft !== null && (
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs border transition-all duration-500",
              timeLeft < 60 ? "bg-rose-50 dark:bg-rose-900/10 text-rose-600 border-rose-200 animate-pulse" : "bg-zinc-50 dark:bg-zinc-900 text-main border-subtle"
            )}>
              <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
            </div>
         )}
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col p-4 md:p-8">
        {/* Question Map */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-3xl border border-subtle">
           {quiz.questions.map((_, idx) => {
              const isAnswered = answers[idx]?.length > 0;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "w-8 h-8 rounded-xl text-[10px] font-black transition-all border",
                    isCurrent ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20 scale-110" :
                    isAnswered ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" :
                    "bg-white dark:bg-zinc-800 border-subtle text-muted hover:border-blue-400"
                  )}
                >
                  {idx + 1}
                </button>
              );
           })}
        </div>

        <div className="bg-card rounded-[2.5rem] border border-subtle shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 md:p-12">
            <div className="flex items-center justify-between mb-8">
               <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Savol {currentIndex + 1}</span>
               {currentQuestion.isMultiple && (
                 <span className="text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/10 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/30 tracking-widest uppercase">Bir nechta javob</span>
               )}
            </div>
            
            <h2 className="text-xl md:text-2xl font-black text-main leading-tight mb-12">
              {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option, idx) => {
                const currentSelected = answers[currentIndex] || [];
                const isSelected = currentSelected.includes(idx);
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={cn(
                      "w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group",
                      isSelected 
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/10 shadow-lg shadow-blue-600/10" 
                        : "border-subtle bg-white dark:bg-zinc-900/50 hover:border-blue-400"
                    )}
                  >
                    <div className="flex items-center gap-4">
                       <span className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all border",
                         isSelected 
                           ? "bg-blue-600 text-white border-blue-600" 
                           : "bg-zinc-50 dark:bg-zinc-800 text-muted border-subtle group-hover:border-blue-400"
                       )}>
                         {String.fromCharCode(65 + idx)}
                       </span>
                       <span className={cn("text-sm md:text-base font-bold transition-colors", isSelected ? "text-blue-700 dark:text-blue-400" : "text-main")}>
                         {option}
                       </span>
                    </div>
                    {isSelected && (
                       <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                       </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 border-t border-subtle flex flex-col sm:flex-row gap-4 justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={cn(
                "w-full sm:w-auto px-8 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2",
                currentIndex === 0 
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed" 
                  : "bg-white dark:bg-zinc-800 text-main border border-subtle hover:bg-zinc-50"
              )}
            >
              <ArrowLeft className="w-4 h-4" /> OLDINGISI
            </button>
            
            {currentIndex === quiz.questions.length - 1 ? (
              <button
                onClick={submitQuiz}
                disabled={submitting}
                className="w-full sm:w-auto px-10 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "TESTNI YAKUNLASH"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-10 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                KEYINGISI <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
