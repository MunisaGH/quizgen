import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, XCircle, X, Shuffle } from 'lucide-react';
import { cn } from '../lib/utils';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizData {
  userId: string;
  title: string;
  questions: Question[];
  createdAt: any;
}

export default function Quiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchQuiz() {
      if (!quizId || !user) return;
      try {
        const stored = localStorage.getItem(`quiz_${quizId}`);
        if (stored) {
          const data = JSON.parse(stored) as QuizData;
          if (data.userId !== user.uid) {
            setError("Sizda bu testga kirish huquqi yo'q");
          } else {
            setQuiz(data);
            setAnswers(new Array(data.questions.length).fill(-1));
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

  const handleSelectOption = (optionIndex: number) => {
    // Only allow selection if an answer hasn't been chosen yet for this question
    if (answers[currentIndex] !== -1) return;

    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (quiz && currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(curr => curr + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(curr => curr - 1);
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
    localStorage.setItem(`quiz_${quizId}`, JSON.stringify(newData));
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const submitQuiz = async () => {
    if (!quiz || !user || !quizId) return;
    
    // Check if all answered
    if (answers.includes(-1)) {
      alert("Iltimos, testni yakunlashdan oldin barcha savollarga javob bering.");
      return;
    }

    setSubmitting(true);
    try {
      const score = calculateScore();
      const resultId = Math.random().toString(36).substring(7);
      const newResult = {
        id: resultId,
        userId: user.uid,
        quizId: quizId,
        score: score,
        answers: answers,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem(`result_${resultId}`, JSON.stringify(newResult));
      navigate(`/result/${resultId}`);
    } catch (err) {
      console.error(err);
      alert("Testni saqlash bekor qilindi");
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
          <h3 className="text-lg md:text-xl font-[800] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 truncate">{quiz.title}</h3>
          <span className="text-[10px] md:text-xs text-blue-600 font-[800] tracking-widest uppercase flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 w-fit shrink-0">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> {answers.filter(a => a !== -1).length} / {quiz.questions.length} JAVOB BERILDI
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
          <p className="text-[10px] md:text-[11px] font-[800] text-slate-400 mb-3 uppercase tracking-widest">SAVOL {currentIndex + 1} / {quiz.questions.length}</p>
          <h2 className="text-base md:text-xl font-[600] mb-8 text-slate-900 leading-snug">
            {currentQuestion.question}
          </h2>
          
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option, idx) => {
              const hasAnswered = answers[currentIndex] !== -1;
              const isSelected = answers[currentIndex] === idx;
              const isCorrect = currentQuestion.correctAnswer === idx;

              let buttonStyle = "border-slate-200 bg-white/50 hover:border-blue-300 hover:bg-white";
              let letterStyle = "bg-slate-50 text-slate-400 border-slate-200 group-hover:border-blue-300 group-hover:text-blue-600";
              let textStyle = "text-slate-700 group-hover:text-slate-900";

              if (hasAnswered) {
                 if (isCorrect) {
                    buttonStyle = "border-green-500 bg-green-50/80 shadow-sm shadow-green-100";
                    letterStyle = "bg-green-500 text-white border-green-500";
                    textStyle = "text-green-900 font-bold";
                 } else if (isSelected) {
                    buttonStyle = "border-red-400 bg-red-50/80 shadow-sm shadow-red-100";
                    letterStyle = "bg-red-500 text-white border-red-500";
                    textStyle = "text-red-900 font-bold";
                 } else {
                    buttonStyle = "border-slate-100 bg-slate-50/50 opacity-60";
                    letterStyle = "bg-slate-100 text-slate-300 border-slate-100 cursor-default";
                    textStyle = "text-slate-400";
                 }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasAnswered}
                  className={cn(
                    "w-full text-left p-4 text-xs md:text-sm rounded-xl border-2 transition-all duration-300 flex items-center justify-between group",
                    buttonStyle,
                    hasAnswered ? "cursor-default" : "cursor-pointer"
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
                  
                  {hasAnswered && isCorrect && (
                     <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 ml-2" />
                  )}
                  {hasAnswered && isSelected && !isCorrect && (
                     <XCircle className="w-5 h-5 text-red-500 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-slate-200/50 bg-slate-50/50 backdrop-blur-md flex justify-between items-center mt-auto relative z-10 gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center justify-center gap-1.5 md:gap-2 px-4 md:px-5 py-3 border border-slate-200 rounded-xl text-[10px] md:text-xs font-[800] text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-30 disabled:pointer-events-none tracking-widest uppercase flex-1 sm:flex-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">OLDINGISI</span>
            <span className="sm:hidden">ORTGA</span>
          </button>
          
          {!isLastQuestion ? (
            <button
              onClick={handleNext}
              className="flex items-center justify-center gap-1.5 md:gap-2 px-6 md:px-8 py-3 bg-slate-900 text-white rounded-xl font-[800] text-[10px] md:text-xs hover:bg-slate-800 transition-all tracking-widest uppercase shadow-lg shadow-slate-900/10 flex-1 sm:flex-none"
            >
              KEYINGISI
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submitQuiz}
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-[800] text-[10px] md:text-xs hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 tracking-widest uppercase shadow-lg shadow-blue-500/20 flex-1 sm:flex-none"
            >
              {submitting ? 'YAKUNLANMOQDA...' : 'YAKUNLASH'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
