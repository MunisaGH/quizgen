import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Calendar, ChevronRight, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuizMeta {
  id: string;
  title: string;
  createdAt: any;
  questionCount: number;
}

export default function History() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<QuizMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      try {
        const fetchedData: QuizMeta[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
           const key = localStorage.key(i);
           if (key && key.startsWith('quiz_')) {
              const quizStr = localStorage.getItem(key);
              if (quizStr) {
                 const quizData = JSON.parse(quizStr);
                 if (quizData.userId === user.uid) {
                    fetchedData.push({
                      id: quizData.id,
                      title: quizData.title,
                      createdAt: quizData.createdAt,
                      questionCount: quizData.questions ? quizData.questions.length : 0
                    });
                 }
              }
           }
        }
        
        fetchedData.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setQuizzes(fetchedData);
      } catch (err) {
        console.error(err);
      } finally {
         setLoading(false);
      }
    }
    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      <h1 className="text-xl font-bold text-slate-800 mb-6 mt-6 md:mt-8">Sizning testlaringiz</h1>
      
      {quizzes.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
           <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
             <Calendar className="w-6 h-6" />
           </div>
           <h3 className="text-sm font-bold text-slate-800 mb-1">Hali testlar yo'q</h3>
           <p className="text-xs text-slate-500 mb-6">Siz hali hech qanday test yaratmadingiz. Boshlash uchun hujjat yuklang.</p>
           <Link to="/" className="bg-blue-600 text-white px-5 py-2 rounded font-bold text-xs hover:bg-blue-700 transition">
             TEST YARATISH
           </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all group">
               <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{quiz.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                     <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'Unknown date'}
                     </span>
                     <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                     <span>{quiz.questionCount} ta savol</span>
                  </div>
               </div>
               <div className="flex gap-2">
                 <Link 
                   to={`/quiz/${quiz.id}`}
                   className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded transition-colors"
                 >
                   <PlayCircle className="w-4 h-4" />
                   ISHLASH
                 </Link>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
