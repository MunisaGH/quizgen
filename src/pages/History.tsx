import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Calendar, ChevronRight, PlayCircle, Trash2, Edit2, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      try {
        const q = query(
          collection(db, "quizzes"), 
          where("userId", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedData: QuizMeta[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedData.push({
            id: doc.id,
            title: data.title,
            createdAt: data.createdAt,
            questionCount: data.questions ? data.questions.length : 0
          });
        });
        
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

  const handleDelete = async (id: string) => {
    if (window.confirm("Rostdan ham bu testni o'chirmoqchimisiz?")) {
      try {
        await deleteDoc(doc(db, "quizzes", id));
        setQuizzes(prev => prev.filter(q => q.id !== id));
      } catch (err) {
        console.error("Delete error:", err);
        alert("O'chirishda xatolik yuz berdi");
      }
    }
  };

  const handleStartEdit = (quiz: QuizMeta) => {
    setEditingId(quiz.id);
    setTempTitle(quiz.title);
  };

  const handleSaveEdit = async (id: string) => {
    if (!tempTitle.trim()) return;
    try {
      await updateDoc(doc(db, "quizzes", id), { title: tempTitle });
      setQuizzes(prev => prev.map(q => q.id === id ? { ...q, title: tempTitle } : q));
      setEditingId(null);
    } catch (err) {
      console.error("Rename error:", err);
      alert("Nomini o'zgartirishda xatolik yuz berdi");
    }
  };

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
                <div className="flex-1 min-w-0 mr-4">
                  {editingId === quiz.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        className="flex-1 bg-zinc-50 border border-blue-400 rounded px-2 py-1 text-sm font-bold outline-none"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(quiz.id)}
                      />
                      <button onClick={() => handleSaveEdit(quiz.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group/title">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {quiz.title}
                      </h3>
                      <button 
                        onClick={() => handleStartEdit(quiz)}
                        className="opacity-0 group-hover/title:opacity-100 p-1 text-slate-400 hover:text-slate-600 transition-all"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                     <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'Noma\'lum sana'}
                     </span>
                     <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                     <span>{quiz.questionCount} ta savol</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => handleDelete(quiz.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link 
                    to={`/quiz/${quiz.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 text-xs font-[800] rounded-lg shadow-sm transition-all"
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
