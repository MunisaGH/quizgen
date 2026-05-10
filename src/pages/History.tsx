import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/UIContext';
import { Calendar, PlayCircle, Trash2, Edit2, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { HistorySkeleton } from '../components/Skeleton';

interface QuizMeta {
  id: string;
  title: string;
  createdAt: string;
  questionCount: number;
}

export default function History() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [quizzes, setQuizzes] = useState<QuizMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      try {
        const q = query(
          collection(db, "quizzes", user.uid, "items")
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
        showToast("Ma'lumotlarni yuklashda xatolik", "error");
      } finally {
         setLoading(false);
      }
    }
    fetchHistory();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Rostdan ham bu testni o'chirmoqchimisiz?")) {
      try {
        await deleteDoc(doc(db, "quizzes", user!.uid, "items", id));
        setQuizzes(prev => prev.filter(q => q.id !== id));
        showToast("Test muvaffaqiyatli o'chirildi", "success");
      } catch (err) {
        console.error("Delete error:", err);
        showToast("O'chirishda xatolik yuz berdi", "error");
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
      await updateDoc(doc(db, "quizzes", user!.uid, "items", id), { title: tempTitle });
      setQuizzes(prev => prev.map(q => q.id === id ? { ...q, title: tempTitle } : q));
      setEditingId(null);
      showToast("Nom muvaffaqiyatli yangilandi", "success");
    } catch (err) {
      console.error("Rename error:", err);
      showToast("Nomni o'zgartirishda xatolik yuz berdi", "error");
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 mt-8"><HistorySkeleton /></div>;


  return (
    <div className="max-w-3xl mx-auto px-4 pb-20">
      <h1 className="text-xl font-black text-main mb-6 mt-6 md:mt-8 tracking-tight">Sizning testlaringiz</h1>
      
      {quizzes.length === 0 ? (
        <div className="bg-card rounded-[2rem] p-12 text-center border border-subtle">
           <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-subtle">
             <Calendar className="w-8 h-8" />
           </div>
           <h3 className="text-base font-black text-main mb-1">Hali testlar yo'q</h3>
           <p className="text-sm text-muted mb-8 max-w-xs mx-auto">Siz hali hech qanday test yaratmadingiz. AI yordamida bir zumda test yarating.</p>
           <Link to="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 uppercase tracking-widest">
             TEST YARATISH
           </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-card p-5 rounded-[1.5rem] border border-subtle shadow-sm flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-900 transition-all group">
                <div className="flex-1 min-w-0 mr-4">
                  {editingId === quiz.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-blue-400 rounded-xl px-3 py-1.5 text-sm font-bold outline-none text-main"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(quiz.id)}
                      />
                      <button onClick={() => handleSaveEdit(quiz.id)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-lg">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group/title">
                      <h3 className="text-sm md:text-base font-black text-main group-hover:text-blue-600 transition-colors truncate">
                        {quiz.title}
                      </h3>
                      <button 
                        onClick={() => handleStartEdit(quiz)}
                        className="opacity-0 group-hover/title:opacity-100 p-1 text-muted hover:text-blue-600 transition-all"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[10px] md:text-xs text-muted mt-1 font-bold">
                     <span className="flex items-center gap-1 uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'Noma\'lum'}
                     </span>
                     <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                     <span className="uppercase tracking-widest">{quiz.questionCount} ta savol</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => handleDelete(quiz.id)}
                    className="p-2.5 text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all border border-transparent hover:border-red-100"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                  <Link 
                    to={`/quiz/${quiz.id}`}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 text-[10px] md:text-xs font-black rounded-xl shadow-lg shadow-blue-600/20 transition-all uppercase tracking-widest"
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
