import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, XCircle, X, Shuffle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';

interface Question {
  question: string;
  options: string[];
  correctAnswer?: number;
  correctAnswers?: number[];
  isMultiple?: boolean;
}

interface QuizData {
  userId: string;
  title: string;
  questions: Question[];
  timer: number | null;
  createdAt: any;
}

export default function Quiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[][]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    async function fetchQuiz() {
      if (!quizId || !user) return;
      try {
        const docRef = doc(db, "quizzes", quizId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as QuizData;
          if (data.userId !== user.uid) {
            setError("Sizda bu testga kirish huquqi yo'q");
          } else {
            setQuiz(data);
            
            // Check for saved progress in localStorage
            const savedProgress = localStorage.getItem(`quiz_progress_${quizId}`);
            if (savedProgress) {
              const { answers: savedAnswers, currentIndex: savedIndex, timeLeft: savedTime } = JSON.parse(savedProgress);
              setAnswers(savedAnswers);
              setCurrentIndex(savedIndex);
              if (savedTime !== undefined) setTimeLeft(savedTime);
            } else {
              setAnswers(new Array(data.questions.length).fill([]).map(() => []));
            }
          }
        } else {
          setError("Test topilmadi");
        }
      } catch (err: any) {
        console.error(err);
        setError("Testni yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [quizId, user]);

  useEffect(() => {
    if (quiz?.timer && timeLeft === null) {
      setTimeLeft(quiz.timer * 60);
    }
  }, [quiz, timeLeft]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitting) {
      if (timeLeft === 0 && !submitting) {
        handleAutoSubmit();
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = (prev !== null ? prev - 1 : null);
        // Sync time to localstorage periodically
        if (newTime !== null && newTime % 5 === 0) {
           const progress = JSON.parse(localStorage.getItem(`quiz_progress_${quizId}`) || '{}');
           localStorage.setItem(`quiz_progress_${quizId}`, JSON.stringify({ ...progress, timeLeft: newTime }));
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, submitting, quizId]);

  const handleAutoSubmit = async () => {
    if (!quiz || !user || !quizId) return;
    setSubmitting(true);
    try {
      const score = calculateScore();
      const newResult = {
        userId: user.uid,
        quizId: quizId,
        score: score,
        answers: answers,
        createdAt: new Date().toISOString(),
        autoSubmitted: true
      };
      const docRef = await addDoc(collection(db, "results"), newResult);
      // Clear progress on successful submit
      localStorage.removeItem(`quiz_progress_${quizId}`);
      navigate(`/result/${docRef.id}`);
    } catch (err) {
      console.error(err);
      navigate('/');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!quiz) return;
    const currentQuestion = quiz.questions[currentIndex];
    const newAnswers = [...answers];
    const currentSelected = newAnswers[currentIndex] || [];

    if (currentQuestion.isMultiple) {
      // Toggle selection for multiple choice
      if (currentSelected.includes(optionIndex)) {
        newAnswers[currentIndex] = currentSelected.filter(i => i !== optionIndex);
      } else {
        newAnswers[currentIndex] = [...currentSelected, optionIndex];
      }
    } else {
      // Single choice behavior
      newAnswers[currentIndex] = [optionIndex];
    }
    
    setAnswers(newAnswers);
    
    // Autosave progress
    localStorage.setItem(`quiz_progress_${quizId}`, JSON.stringify({
      answers: newAnswers,
      currentIndex: currentIndex,
      timeLeft: timeLeft
    }));
  };

  const handleNext = () => {
    if (quiz && currentIndex < quiz.questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      
      // Update index in autosave
      const progress = JSON.parse(localStorage.getItem(`quiz_progress_${quizId}`) || '{}');
      localStorage.setItem(`quiz_progress_${quizId}`, JSON.stringify({ ...progress, currentIndex: nextIndex }));
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);

      // Update index in autosave
      const progress = JSON.parse(localStorage.getItem(`quiz_progress_${quizId}`) || '{}');
      localStorage.setItem(`quiz_progress_${quizId}`, JSON.stringify({ ...progress, currentIndex: prevIndex }));
    }
  };

  const handleShuffle = () => {
    if (!quiz) return;
    const confirmShuffle = window.confirm("Aralashtirilsa, hozirgi ishlagan javoblaringiz o'chadi. Davom etamizmi?");
    if (!confirmShuffle) return;

    const shuffledQuestions = [...quiz.questions];
    
    // Fisher-Yates shuffle for questions
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }
    
    // Shuffle options for each question
    shuffledQuestions.forEach(q => {
      const optionsWithRef = q.options.map((opt, index) => ({ text: opt, isCorrect: index === q.correctAnswer }));
      for (let i = optionsWithRef.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsWithRef[i], optionsWithRef[j]] = [optionsWithRef[j], optionsWithRef[i]];
      }
      q.options = optionsWithRef.map(o => o.text);
      q.correctAnswer = optionsWithRef.findIndex(o => o.isCorrect);
    });

    const newData = { ...quiz, questions: shuffledQuestions };
    setQuiz(newData);
    setAnswers(new Array(shuffledQuestions.length).fill(-1));
    setCurrentIndex(0);
    
    // Update in Firestore
    try {
      await updateDoc(doc(db, "quizzes", quizId!), {
        questions: shuffledQuestions
      });
    } catch (err) {
      console.error("Shuffle save error:", err);
    }
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correctCount = 0;
    quiz.questions.forEach((q, i) => {
      const userAnswers = answers[i] || [];
      const correctAnswers = q.correctAnswers || (q.correctAnswer !== undefined ? [q.correctAnswer] : []);
      
      // Check if user's answers exactly match correct answers (order independent)
      const isCorrect = 
        userAnswers.length === correctAnswers.length && 
        userAnswers.every(val => correctAnswers.includes(val));
        
      if (isCorrect) {
        correctCount++;
      }
    });
    return Math.round((correctCount / quiz.questions.length) * 100);
  };

  const submitQuiz = async () => {
    if (!quiz || !user || !quizId) return;
    
    // Check if all answered (at least one choice for each)
    if (answers.some(a => a.length === 0)) {
      alert("Iltimos, testni yakunlashdan oldin barcha savollarga javob bering.");
      return;
    }

    setSubmitting(true);
    try {
      const score = calculateScore();
      const newResult = {
        userId: user.uid,
        quizId: quizId,
        score: score,
        answers: answers,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "results"), newResult);
      navigate(`/result/${docRef.id}`);
    } catch (err) {
      console.error(err);
      alert("Natijani saqlashda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="text-center mt-12 bg-white p-8 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
        <button onClick={() => navigate('/')} className="text-indigo-600 hover:underline">Bosh sahifaga qaytish</button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const isLastQuestion = currentIndex === quiz.questions.length - 1;
  const progressPercent = ((currentIndex) / quiz.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto w-full h-full flex flex-col pt-4 pb-[80px] md:pb-12 px-4 md:px-0">
      
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium border border-slate-200"
        >
          <X className="w-4 h-4" /> Bosh sahifa
        </button>

        <button 
          onClick={handleShuffle}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full shadow-sm text-sm font-bold tracking-tight border border-indigo-100"
        >
          <Shuffle className="w-4 h-4" /> Aralashtirish
        </button>
      </div>

      <div className="bg-white/70 backdrop-blur-3xl border border-white/60 rounded-3xl flex flex-col flex-1 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6 min-h-[500px] relative">
        {/* Soft glows inside the card */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>

        <div className="p-6 md:p-8 border-b border-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg md:text-xl font-[800] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 truncate mb-4">{quiz.title}</h3>
            
            {/* Question Map */}
            <div className="flex flex-wrap gap-2">
              {quiz.questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-center",
                    currentIndex === idx 
                      ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-100" 
                      : (answers[idx] !== -1 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-400")
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3 shrink-0">
            {timeLeft !== null && (
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border font-bold text-sm transition-all",
                timeLeft < 60 ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : "bg-slate-50 text-slate-600 border-slate-100"
              )}>
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
            )}
            <span className="text-[10px] md:text-xs text-blue-600 font-[800] tracking-widest uppercase flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 w-fit shrink-0">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> {answers.filter(a => a.length > 0).length} / {quiz.questions.length} JAVOB BERILDI
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
          <p className="text-[10px] md:text-[11px] font-[800] text-slate-400 mb-3 uppercase tracking-widest flex items-center justify-between">
            <span>SAVOL {currentIndex + 1} / {quiz.questions.length}</span>
            {currentQuestion.isMultiple && (
              <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">KO'P JAVOBLI</span>
            )}
          </p>
          <h2 className="text-base md:text-xl font-[600] mb-8 text-slate-900 leading-snug">
            {currentQuestion.question}
          </h2>
          
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option, idx) => {
              const currentSelected = answers[currentIndex] || [];
              const isSelected = currentSelected.includes(idx);
              const correctAnswers = currentQuestion.correctAnswers || (currentQuestion.correctAnswer !== undefined ? [currentQuestion.correctAnswer] : []);
              const isCorrect = correctAnswers.includes(idx);

              let buttonStyle = isSelected 
                ? "border-blue-500 bg-blue-50/50 shadow-sm shadow-blue-100/50" 
                : "border-slate-200 bg-white/50 hover:border-blue-300 hover:bg-white";
              let letterStyle = isSelected
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                : "bg-slate-50 text-slate-400 border-slate-200 group-hover:border-blue-300 group-hover:text-blue-600";
              let textStyle = isSelected 
                ? "text-blue-900 font-[800]" 
                : "text-slate-700 group-hover:text-slate-900";

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={cn(
                    "w-full text-left p-4 text-xs md:text-sm rounded-xl border-2 transition-all duration-300 flex items-center justify-between group",
                    buttonStyle,
                    "cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                     <span className={cn(
                       "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-[800] transition-colors border shrink-0",
                       letterStyle
                     )}>
                       {String.fromCharCode(65 + idx)}
                     </span>
                     <span className={cn("font-medium leading-snug", textStyle)}>
                       {option}
                     </span>
                  </div>
                  
                  {isSelected && (
                     <CheckCircle2 className={cn("w-5 h-5 shrink-0 ml-2 animate-in zoom-in duration-300", "text-blue-500")} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 md:relative md:p-0 bg-white md:bg-transparent border-t md:border-t-0 border-slate-200 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300",
              currentIndex === 0 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            <ArrowLeft className="w-4 h-4" /> OLDINGISI
          </button>

          {isLastQuestion ? (
            <button
              onClick={submitQuiz}
              disabled={submitting}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> SAQLANMOQDA...
                </>
              ) : (
                <>
                  YAKUNLASH <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-900 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-zinc-900/10 hover:bg-zinc-800 hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
            >
              KEYINGISI <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
