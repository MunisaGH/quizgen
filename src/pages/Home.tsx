import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/UIContext';
import { UploadCloud, Loader2, FileCheck2, XCircle, ArrowRight, FileText, Layers, Presentation, MessageSquare, BookOpen, ArrowLeft, Info, Sparkles, Clock, HelpCircle, Globe, ListChecks, Crown, CreditCard } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';
import Onboarding from '../components/Onboarding';

type ViewMode = 'menu' | 'upload' | 'guide' | 'premium';

export default function Home() {
  const [view, setView] = useState<ViewMode>('menu');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [language, setLanguage] = useState<string>('uzbek');
  const [aiModel, setAiModel] = useState<string>('gpt-4o-mini');
  const [inputMode, setInputMode] = useState<'file' | 'text' | 'topic'>('file');
  const [inputText, setInputText] = useState('');
  const [inputTopic, setInputTopic] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('onboarding_done'));

  const handleOnboardingDone = () => {
    localStorage.setItem('onboarding_done', '1');
    setShowOnboarding(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    if (isValidFile(selectedFile)) {
      setFile(selectedFile);
      showToast("Fayl tanlandi", "info");
    } else {
      setFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const isValidFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
       showToast("Fayl hajmi juda katta (maksimal 10MB)", "error");
       return false;
    }
    const isDoc = file.type === 'application/pdf' || 
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            file.name.endsWith('.pdf') || 
            file.name.endsWith('.docx');
    if (!isDoc) showToast("Faqat PDF yoki DOCX fayllarini yuklang", "error");
    return isDoc;
  };

  const generateQuiz = async () => {
    if (!userData?.isPremium) {
      setView('premium');
      showToast("Test yaratish uchun Premium obuna kerak", "info");
      return;
    }

    if (inputMode === 'file' && !file) { showToast("Iltimos, fayl yuklang", "error"); return; }
    if (inputMode === 'text' && !inputText) { showToast("Iltimos, matn kiriting", "error"); return; }
    if (inputMode === 'topic' && !inputTopic) { showToast("Iltimos, mavzu kiriting", "error"); return; }
    
    setLoading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      const formData = new FormData();
      if (inputMode === 'file' && file) {
        formData.append('file', file);
      } else if (inputMode === 'text' && inputText) {
        formData.append('text', inputText);
      } else if (inputMode === 'topic' && inputTopic) {
        formData.append('topic', inputTopic);
      }

      formData.append('questionCount', questionCount.toString());
      formData.append('difficulty', difficulty);
      formData.append('language', language);
      formData.append('aiModel', aiModel);
      formData.append('mode', inputMode);

      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Serverda xatolik yuz berdi");
      }

      const data = await res.json();
      
      const docRef = await addDoc(collection(db, "quizzes", user!.uid, "items"), {
        userId: user?.uid,
        title: inputMode === 'topic' ? inputTopic : (file ? file.name : "Matn asosida test"),
        questions: data.questions,
        timer: timer,
        createdAt: new Date().toISOString()
      });

      setUploadProgress(100);
      showToast("Test muvaffaqiyatli yaratildi!", "success");
      setTimeout(() => navigate(`/quiz/${docRef.id}`), 500);
    } catch (err: any) {
      console.error(err);
      showToast(err.message, "error");
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  if (view === 'guide') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <button onClick={() => setView('menu')} className="mb-8 flex items-center gap-2 text-muted hover:text-blue-600 transition-colors font-bold text-sm bg-card border border-subtle px-4 py-2 rounded-full shadow-sm w-fit">
            <ArrowLeft className="w-4 h-4" /> ORQAGA
         </button>
         
         <div className="bg-card border border-subtle rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/20 dark:shadow-none">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Info className="w-6 h-6" />
               </div>
               <h2 className="text-3xl font-black text-main tracking-tight">Qanday foydalanish kerak?</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shrink-0 mt-1">1</div>
                     <div>
                        <h4 className="font-black text-main mb-1">Manbani tanlang</h4>
                        <p className="text-sm text-muted leading-relaxed font-medium">Hujjat yuklang (PDF/DOCX), matn kiriting yoki shunchaki mavzu yozing.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shrink-0 mt-1">2</div>
                     <div>
                        <h4 className="font-black text-main mb-1">Sozlamalarni o'rnating</h4>
                        <p className="text-sm text-muted leading-relaxed font-medium">Savollar soni, qiyinlik darajasi va taymerni belgilang.</p>
                     </div>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shrink-0 mt-1">3</div>
                     <div>
                        <h4 className="font-black text-main mb-1">AI Test Yaratadi</h4>
                        <p className="text-sm text-muted leading-relaxed font-medium">Bizning aqlli AI manbani tahlil qilib, yuqori sifatli testlar tuzib beradi.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shrink-0 mt-1">4</div>
                     <div>
                        <h4 className="font-black text-main mb-1">Natijani ulashing</h4>
                        <p className="text-sm text-muted leading-relaxed font-medium">Testni yechib bo'lgach, natijangizni do'stlaringizga link orqali yuboring.</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    );
  }

  if (view === 'premium') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <button onClick={() => setView('menu')} className="mb-8 flex items-center gap-2 text-muted hover:text-blue-600 transition-colors font-black text-[10px] tracking-widest bg-card border border-subtle px-4 py-2 rounded-full shadow-sm w-fit uppercase">
            <ArrowLeft className="w-3.5 h-3.5" /> ORQAGA QAYTISH
         </button>
         
         <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-main tracking-tighter mb-4">Premium tariflar</h2>
            <p className="text-muted font-medium">Cheksiz imkoniyatlarga ega bo'lish uchun tarifni tanlang</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Haftalik', price: '15,000', days: 7, icon: <Clock className="w-6 h-6" />, color: 'blue' },
              { title: 'Oylik', price: '45,000', days: 30, icon: <Crown className="w-6 h-6" />, color: 'indigo', popular: true },
              { title: 'Yillik', price: '120,000', days: 365, icon: <Sparkles className="w-6 h-6" />, color: 'emerald' }
            ].map((plan) => (
              <div key={plan.title} className={cn(
                "relative bg-card border rounded-[2.5rem] p-8 transition-all hover:scale-[1.02]",
                plan.popular ? "border-indigo-500 shadow-2xl shadow-indigo-500/10" : "border-subtle"
              )}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                    Eng mashhur
                  </div>
                )}
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                  plan.color === 'blue' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" : 
                  plan.color === 'indigo' ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30" : 
                  "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                )}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-black text-main mb-1">{plan.title}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black text-main">{plan.price}</span>
                  <span className="text-muted text-sm font-bold uppercase tracking-widest">UZS</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm font-medium text-muted">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Cheksiz testlar
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-muted">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> 100+ savol bitta testda
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-muted">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Reklamasiz foydalanish
                  </li>
                </ul>
              </div>
            ))}
         </div>

         <div className="mt-12 bg-zinc-900 text-white rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
            <div className="relative z-10">
               <h3 className="text-2xl font-black mb-4">To'lovni amalga oshirish</h3>
               <p className="text-zinc-400 mb-8 max-w-xl">
                  Premium imkoniyatlarga ega bo'lish uchun to'lovni amalga oshiring va chekni bizga yuboring. To'lov tasdiqlanishi bilan barcha cheklovlar olib tashlanadi.
               </p>
               <button 
                 onClick={() => navigate('/checkout')}
                 className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-blue-600/30"
               >
                  <CreditCard className="w-5 h-5" /> TO'LOV SAHIFASIGA O'TISH
               </button>
            </div>
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 pt-10 pb-20">
      {showOnboarding && <Onboarding onDone={handleOnboardingDone} />}
      {view === 'menu' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center mb-16 relative">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full border border-blue-100 dark:border-blue-800/30 mb-6">
               <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Sun'iy intellektga asoslangan</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-main tracking-tighter mb-4 leading-tight">
              Bilimingizni <span className="text-blue-600">AI yordamida</span> <br />tekshirib ko'ring
            </h1>
            <p className="text-muted text-lg max-w-2xl mx-auto font-medium">
              Har qanday hujjat yoki mavzu bo'yicha soniyalar ichida mukammal testlar yarating.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
             <div onClick={() => { setInputMode('file'); setView('upload'); }} className="bg-card p-8 rounded-[2.5rem] border border-subtle hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer group flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-main mb-2">Fayl orqali</h3>
                <p className="text-sm text-muted font-medium">PDF yoki Word hujjatlaridan test yaratish.</p>
             </div>
             <div onClick={() => { setInputMode('text'); setView('upload'); }} className="bg-card p-8 rounded-[2.5rem] border border-subtle hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer group flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-main mb-2">Matn orqali</h3>
                <p className="text-sm text-muted font-medium">Matn nusxasini kiritish orqali test yaratish.</p>
             </div>
             <div onClick={() => { setInputMode('topic'); setView('upload'); }} className="bg-card p-8 rounded-[2.5rem] border border-subtle hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all cursor-pointer group flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-main mb-2">Mavzu orqali</h3>
                <p className="text-sm text-muted font-medium">AI'ga shunchaki mavzu bering va u test tuzadi.</p>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 border-t border-subtle pt-12">
             <button onClick={() => setView('guide')} className="flex items-center gap-2 text-muted hover:text-main font-black text-xs uppercase tracking-widest transition-colors">
                <HelpCircle className="w-4 h-4" /> Qanday ishlaydi?
             </button>
             <div className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full hidden sm:block"></div>
             <a href="https://t.me/talabaga_yordam_pro" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted hover:text-blue-500 font-black text-xs uppercase tracking-widest transition-colors">
                <MessageSquare className="w-4 h-4" /> Telegram Kanal
             </a>
             <div className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full hidden sm:block"></div>
              <a href="https://activision.uz" target="_blank" rel="noreferrer" className="text-muted hover:text-blue-500 text-xs font-black uppercase tracking-widest transition-colors">ACTIVISION.UZ</a>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
          <button onClick={() => setView('menu')} className="mb-8 flex items-center gap-2 text-muted hover:text-blue-600 transition-colors font-black text-[10px] tracking-widest bg-card border border-subtle px-4 py-2 rounded-full shadow-sm w-fit uppercase">
            <ArrowLeft className="w-3.5 h-3.5" /> ORQAGA QAYTISH
          </button>

          <div className="bg-card border border-subtle rounded-[2.5rem] shadow-xl overflow-hidden">
            <div className="p-8 md:p-10 border-b border-subtle">
               <h2 className="text-2xl font-black text-main tracking-tight mb-2">Test sozlamalari</h2>
               <p className="text-sm text-muted font-medium">Savollar AI tomonidan mukammal tahrirlanadi.</p>
            </div>

            <div className="p-8 md:p-10 space-y-8">
               {/* Input Section */}
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
                     <Layers className="w-3.5 h-3.5" /> Tanlangan manba
                  </label>
                  
                  {inputMode === 'file' && (
                    <div 
                      onDragOver={handleDrag}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300",
                        dragActive ? "border-blue-500 bg-blue-50/50" : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-blue-400"
                      )}
                    >
                      <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.docx" />
                      {file ? (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                             <FileCheck2 className="w-8 h-8" />
                          </div>
                          <p className="text-sm font-black text-main mb-1 truncate max-w-[250px]">{file.name}</p>
                          <p className="text-[10px] text-muted font-bold">{(file.size / (1024 * 1024)).toFixed(2)} MB • Fayl tayyor</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-50 transition-colors">
                             <UploadCloud className="w-8 h-8" />
                          </div>
                          <p className="text-sm font-black text-main mb-1">Faylni yuklang</p>
                          <p className="text-[10px] text-muted font-bold uppercase tracking-widest">PDF yoki DOCX (Maks. 10MB)</p>
                        </div>
                      )}
                    </div>
                  )}

                  {inputMode === 'text' && (
                    <textarea 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Matnni shu yerga kiriting..."
                      className="w-full h-48 bg-zinc-50 dark:bg-zinc-900/50 border border-subtle rounded-[1.5rem] p-6 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none text-main"
                    />
                  )}

                  {inputMode === 'topic' && (
                    <div className="relative group">
                       <input 
                         type="text"
                         value={inputTopic}
                         onChange={(e) => setInputTopic(e.target.value)}
                         placeholder="Masalan: O'zbekiston tarixi, Astronomiya, Python asoslari..."
                         className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-subtle rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-main"
                       />
                       <Sparkles className="absolute right-4 top-4 w-4 h-4 text-blue-500/40 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                  )}
               </div>

               {/* Settings Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> Taymer (minut)
                     </label>
                     <div className="grid grid-cols-4 gap-2">
                        {[5, 10, 20, null].map((t) => (
                           <button
                             key={t === null ? 'none' : t}
                             onClick={() => setTimer(t)}
                             className={cn(
                               "py-2.5 rounded-xl text-xs font-black transition-all border shrink-0",
                               timer === t 
                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                                : "bg-zinc-50 dark:bg-zinc-900/50 border-subtle text-muted hover:border-blue-300"
                             )}
                           >
                             {t === null ? '∞' : t}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
                        <ListChecks className="w-3.5 h-3.5" /> Savollar soni
                     </label>
                     <div className="flex items-center gap-4">
                        <input 
                          type="range" min="5" max="30" step="5"
                          value={questionCount}
                          onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                          className="flex-1 accent-blue-600 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg cursor-pointer"
                        />
                        <span className="w-10 text-sm font-black text-main text-center bg-zinc-50 dark:bg-zinc-900/50 py-1 rounded-lg border border-subtle">
                          {questionCount}
                        </span>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
                        <Presentation className="w-3.5 h-3.5" /> Qiyinlik darajasi
                     </label>
                     <div className="flex gap-2">
                        {['easy', 'medium', 'hard'].map((d) => (
                           <button
                             key={d}
                             onClick={() => setDifficulty(d)}
                             className={cn(
                               "flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest",
                               difficulty === d 
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                                : "bg-zinc-50 dark:bg-zinc-900/50 border-subtle text-muted hover:border-indigo-300"
                             )}
                           >
                             {d === 'easy' ? 'Oson' : d === 'medium' ? 'O\'rta' : 'Qiyin'}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5" /> Test tili
                     </label>
                     <select 
                       value={language}
                       onChange={(e) => setLanguage(e.target.value)}
                       className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-subtle rounded-xl px-4 py-2.5 text-xs font-black outline-none focus:border-blue-500 transition-all uppercase tracking-widest text-main"
                     >
                       <option value="uzbek">O'zbekcha</option>
                       <option value="english">English</option>
                       <option value="russian">Русский</option>
                     </select>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" /> AI Modeli
                     </label>
                     <div className="flex gap-2 bg-zinc-50 dark:bg-zinc-900/50 p-1 rounded-2xl border border-subtle">
                        <button
                          onClick={() => setAiModel('gpt-4o-mini')}
                          className={cn(
                            "flex-1 py-2.5 rounded-xl text-xs font-black transition-all",
                            aiModel === 'gpt-4o-mini' 
                             ? "bg-white dark:bg-zinc-800 text-main shadow-sm" 
                             : "text-muted hover:text-main"
                          )}
                        >
                          GPT-4o mini
                        </button>
                        <button
                          onClick={() => setAiModel('gpt-4o')}
                          className={cn(
                            "flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5",
                            aiModel === 'gpt-4o' 
                             ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                             : "text-muted hover:text-main"
                          )}
                        >
                          GPT-4o <Crown className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-8 md:p-10 bg-zinc-50 dark:bg-zinc-900/30 border-t border-subtle">
               <button
                 onClick={generateQuiz}
                 disabled={loading}
                 className={cn(
                   "w-full py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-500",
                   loading 
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed" 
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95"
                 )}
               >
                 {loading ? (
                   <>
                     <Loader2 className="w-5 h-5 animate-spin" />
                     {uploadProgress < 100 ? `YUKLANMOQDA ${Math.round(uploadProgress)}%` : 'AI TAHLIL QILMOQDA...'}
                   </>
                 ) : (
                   <>
                     TESTNI YARATISH <ArrowRight className="w-5 h-5" />
                   </>
                 )}
               </button>
               {loading && (
                  <div className="mt-6 w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-blue-600 transition-all duration-300 ease-out"
                       style={{ width: `${uploadProgress}%` }}
                     ></div>
                  </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


