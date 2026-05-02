import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UploadCloud, Loader2, FileCheck2, XCircle, ArrowRight, FileText, Layers, Presentation, MessageSquare, BookOpen, ArrowLeft, Info, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

type ViewMode = 'menu' | 'upload' | 'guide';

export default function Home() {
  const [view, setView] = useState<ViewMode>('menu');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showInvalid, setShowInvalid] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

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
      setError('');
      setShowInvalid(false);
    } else {
      setFile(null);
      setShowInvalid(true);
      setTimeout(() => setShowInvalid(false), 3000);
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
       setError("Fayl hajmi juda katta (maksimal 10MB). Iltimos, kichikroq fayldan foydalaning.");
       return false;
    }
    return file.type === 'application/pdf' || 
           file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
           file.name.endsWith('.pdf') || 
           file.name.endsWith('.docx');
  };

  const generateQuiz = async () => {
    if (!file || !user) return;
    setLoading(true);
    setError('');
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        body: formData,
        // credentials: 'omit' to ensure no cross-origin weirdness on first-party context,
        // though typically it's same-origin so defaults apply.
      });

      const rawText = await response.text();
      
      // Cookie check HTML or Vite dev server proxy page checks
      if (rawText.includes('<title>Cookie check</title>') || rawText.includes('__SECURE-aistudio') || rawText.includes('<div id="root">')) {
        throw new Error("Brauzer xavfsizlik tizimi so'rovni to'xtatdi. Ilovani to'liq ishlashi uchun tepa o'ng burchakdagi 'Open in New Tab' (Yangi oynada ochish) tugmasi orqali alohida oynada oching.");
      }

      let data;
      try {
         data = JSON.parse(rawText);
      } catch(parseErr) {
         console.error("Raw response length:", rawText.length, "content:", rawText.substring(0, 50));
         // Agar Vercel dan 404 HTML qaytgan bo'lsa
         if (rawText.trim().startsWith('<') || response.status === 404) {
            throw new Error("API Server ishlamayapti. Vercel kabi statik xosting server (Express/Node.js) qismini ishga tushira olmaydi. Node.js backend uchun Vercel'dan ko'ra Render.com yoki Railway.app'dan foydalanish tavsiya etiladi.");
         }
         throw new Error("Tizim fayl formatini o'qiy olmadi yoki hujjat juda katta.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Test yaratishda xatolik yuz berdi");
      }

      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Yaroqsiz test formati olindi");
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      await new Promise(r => setTimeout(r, 400)); 

      const quizId = Math.random().toString(36).substring(7);
      const newQuiz = {
        id: quizId,
        userId: user.uid,
        title: file.name.replace(/\.[^/.]+$/, ""),
        sourceFileName: file.name,
        questions: data.questions,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem(`quiz_${quizId}`, JSON.stringify(newQuiz));
      navigate(`/quiz/${quizId}`);

    } catch (err: any) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      console.error(err);
      setError(err.message || 'Kutilmagan xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'upload') {
    return (
      <div className="max-w-2xl mx-auto w-full pt-8 pb-20 px-4 md:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setView('menu')}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 mb-8 font-medium transition-colors group"
        >
          <div className="p-2 border border-zinc-200 rounded-full group-hover:bg-zinc-100 transition-colors">
             <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Orqaga</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-[800] tracking-tight mb-3 text-zinc-900">
            Faylni yuklang
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
            Hujjatingizni tashlang, qolgan barcha ishni tizim algoritmlari o'zi bajaradi. Interaktiv test tayyorlanadi.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-zinc-200/60">
          <div 
            className={cn(
              "border-2 border-dashed rounded-[1.5rem] p-12 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer text-center relative overflow-hidden",
              dragActive ? "border-indigo-500 bg-indigo-50/50 scale-[1.01]" : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-zinc-50",
              file && !showInvalid ? "border-green-400 bg-green-50/30" : "",
              showInvalid ? "border-red-400 bg-red-50/50" : "",
              loading ? "opacity-70 pointer-events-none" : ""
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
              onChange={handleFileChange}
            />

            {!file ? (
              <>
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ease-out shadow-sm",
                  dragActive ? "bg-indigo-600 text-white scale-110 shadow-indigo-200" : "bg-white text-zinc-900 border border-zinc-200 shadow-zinc-100"
                )}>
                  {showInvalid ? (
                    <XCircle className="w-8 h-8 text-red-500" />
                  ) : (
                    <UploadCloud className="w-8 h-8" />
                  )}
                </div>
                <p className="text-lg font-bold text-zinc-800 mb-1">
                  {showInvalid ? "Kechirasiz, yaroqsiz format" : (dragActive ? "Faylni shu yerda qo'yib yuboring" : "Tanlash uchun bosing yoki tashlang")}
                </p>
                <p className="text-sm text-zinc-400 font-medium">
                  PDF yoki Word hujjatlari (Max. 10MB)
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center w-full relative z-10 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-green-500 text-white shadow-xl shadow-green-500/20 rounded-full flex items-center justify-center mb-5">
                  <FileCheck2 className="w-10 h-10" />
                </div>
                <p className="text-lg font-bold text-zinc-900 break-words w-full px-4 mb-1">{file.name}</p>
                <p className="text-sm text-zinc-400 font-medium">{(file.size / 1024).toFixed(1)} KB</p>
                
                {loading ? (
                   <div className="w-full max-w-sm mx-auto mt-8">
                     <div className="flex justify-between text-xs font-bold text-zinc-500 mb-2.5 uppercase tracking-widest">
                       <span className="text-indigo-600">
                         {uploadProgress < 30 ? "Yuklanmoqda..." : 
                          uploadProgress < 70 ? "Matn o'qilmoqda..." : "Generatsiya..."}
                       </span>
                       <span>{Math.round(uploadProgress)}%</span>
                     </div>
                     <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 transition-all duration-300 ease-out relative rounded-full" 
                          style={{ width: `${uploadProgress}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                        </div>
                     </div>
                  </div>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="mt-6 text-xs uppercase tracking-widest font-bold text-red-500 hover:text-white hover:bg-red-500 border border-red-200 transition-all px-6 py-2.5 rounded-full"
                  >
                    Boshqa fayl tanlash
                  </button>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-red-50 text-red-800 text-sm border border-red-100/50 font-medium text-center flex items-center justify-center gap-2">
              <Info className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="mt-4">
            <button
              onClick={generateQuiz}
              disabled={loading || !file}
              className={cn(
                "w-full py-4 px-6 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-3",
                loading || !file
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20 hover:-translate-y-1 active:translate-y-0"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  JARAYON BAJARILMOQDA...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  TEST YARATISHNI BOSHLASH
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'guide') {
    return (
      <div className="max-w-2xl mx-auto w-full pt-8 pb-20 px-4 md:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setView('menu')}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 mb-8 font-medium transition-colors group"
        >
          <div className="p-2 border border-zinc-200 rounded-full group-hover:bg-zinc-100 transition-colors">
             <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Orqaga</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-[800] tracking-tight mb-3 text-zinc-900">
            Fayl formati qoidalari
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
            Testlar muvaffaqiyatli import qilinishi uchun hujjatlaringiz quyidagi tartibda yozilgan bo‘lishi lozim.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-zinc-200/60 text-zinc-800">
           
           <div className="space-y-8 text-sm leading-relaxed">
             
             <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <li className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-zinc-200 flex items-center justify-center text-lg font-bold mb-3">1</div>
                  <strong className="block text-zinc-900 mb-1">Savolni ajrating</strong>
                  <span className="text-zinc-500">Har bir savol o'rtasini <code className="bg-zinc-200 px-1.5 py-0.5 rounded text-zinc-800 font-mono text-xs">++++</code> belgisi bilan bo'ling.</span>
               </li>
               <li className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-zinc-200 flex items-center justify-center text-lg font-bold mb-3">2</div>
                  <strong className="block text-zinc-900 mb-1">Javoblarni ajrating</strong>
                  <span className="text-zinc-500">Tugmalar uchun variantlarni <code className="bg-zinc-200 px-1.5 py-0.5 rounded text-zinc-800 font-mono text-xs">====</code> orqali ajrating.</span>
               </li>
               <li className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
                  <div className="w-8 h-8 rounded-full bg-green-100 shadow-sm border border-green-200 flex items-center justify-center text-green-700 font-bold mb-3">3</div>
                  <strong className="block text-zinc-900 mb-1">To'g'ri javob</strong>
                  <span className="text-zinc-500">To'g'ri variantning boshqiga <code className="bg-green-200 px-1.5 py-0.5 rounded text-green-800 font-mono text-xs">#</code> belgisini qo'ying.</span>
               </li>
             </ul>

             <div>
               <h3 className="font-bold mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-zinc-400" /> Hujjat ichidagi yozuv namunasi:</h3>
               <div className="bg-slate-900 rounded-2xl p-6 text-slate-300 font-mono text-xs overflow-x-auto shadow-2xl relative">
                 <div className="absolute top-0 left-0 w-full h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                 </div>
                 <pre className="mt-6 leading-[1.8]">
<span className="text-indigo-400 font-bold">Asakada birinchi marta qachon avtomobil ishlab chiqarilgan?</span>
<span className="text-zinc-500">====</span>
1994-yil
<span className="text-zinc-500">====</span>
<span className="text-green-400">#1996-yil iyul</span>
<span className="text-zinc-500">====</span>
1998-yil
<span className="text-zinc-500">++++</span>
<span className="text-indigo-400 font-bold">Internetning asoschisi kim?</span>
<span className="text-zinc-500">====</span>
<span className="text-green-400">#Tim Berners-Lee</span>
<span className="text-zinc-500">====</span>
Bill Gates
<span className="text-zinc-500">====</span>
Steve Jobs
                 </pre>
               </div>
             </div>

             <button
               onClick={() => setView('upload')}
               className="w-full mt-4 py-4 px-6 rounded-2xl font-bold text-base bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 group"
             >
               FAYLNI YUKLASHGA O'TISH
               <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </button>
           </div>
        </div>
      </div>
    );
  }

  // Menu View (Dashboard) Bento Layout
  return (
    <div className="max-w-4xl mx-auto w-full pt-6 md:pt-10 pb-20 px-4 md:px-6 animate-in fade-in zoom-in-[0.98] duration-500">
       
       <header className="mb-8 md:mb-10">
         <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900">Nima yaratamiz bugun?</h1>
         <p className="text-zinc-500 mt-2 text-sm md:text-base font-medium">Bitta hujjat orqali katta imkoniyatlar dunyosini kashf qiling.</p>
       </header>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
         
         {/* Main Action - Upload (Bento Large) */}
         <button 
           onClick={() => setView('upload')}
           className="md:col-span-2 group relative overflow-hidden rounded-[2rem] bg-blue-600 p-8 md:p-10 text-left text-white shadow-[0_15px_30px_rgba(37,99,235,0.2)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-end min-h-[300px]"
         >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 group-hover:-translate-y-2 group-hover:translate-x-2 transition-all duration-500">
               <UploadCloud size={140} strokeWidth={1} />
            </div>
            
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[10px] uppercase tracking-widest font-bold backdrop-blur-md mb-6 border border-white/20">
                 <Sparkles className="w-3 h-3 text-white" />
                 Eng ko'p ishlatilgan
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Hujjatdan test tuzish</h2>
              <p className="text-blue-100 max-w-sm font-medium text-sm leading-relaxed">
                PDF yoki DOCX faylingizni yuklang. Sun'iy intellekt uni darhol interaktiv savol-javob oynasiga aylantiradi.
              </p>
            </div>
         </button>

         {/* Format Guide (Bento Small Right) */}
         <button 
           onClick={() => setView('guide')}
           className="col-span-1 rounded-[2rem] bg-indigo-50 border border-indigo-100 p-8 text-left transition-all duration-300 hover:bg-indigo-100 hover:scale-[1.02] active:scale-[0.98] flex flex-col min-h-[200px] md:min-h-[300px]"
         >
            <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center mb-auto shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="mt-8">
              <h4 className="font-[800] text-xl tracking-tight text-indigo-950 mb-2">Qoidalar & Namuna</h4>
              <p className="text-sm text-indigo-700/80 font-medium leading-relaxed">
                Tizim savollaringizni to'g'ri o'qishi uchun qanday formatda matn yozish kerakligini bilib oling.
              </p>
            </div>
         </button>

         {/* Features Coming Soon */}
         <div className="col-span-1 border border-zinc-200 bg-white rounded-[2rem] p-6 text-left flex items-start gap-4 cursor-not-allowed opacity-60">
            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center shrink-0">
               <Layers className="w-5 h-5 text-zinc-500" />
            </div>
            <div>
               <h4 className="font-bold text-zinc-900 mb-1 leading-tight">Yodlash kartochkalari</h4>
               <p className="text-xs text-zinc-500 font-medium">Tez orada qo'shiladi</p>
            </div>
         </div>

         <div className="col-span-1 border border-zinc-200 bg-white rounded-[2rem] p-6 text-left flex items-start gap-4 cursor-not-allowed opacity-60">
            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center shrink-0">
               <Presentation className="w-5 h-5 text-zinc-500" />
            </div>
            <div>
               <h4 className="font-bold text-zinc-900 mb-1 leading-tight">Slaydlarga o'girish</h4>
               <p className="text-xs text-zinc-500 font-medium">Tez orada qo'shiladi</p>
            </div>
         </div>

         <div className="col-span-1 border border-zinc-200 bg-white rounded-[2rem] p-6 text-left flex items-start gap-4 cursor-not-allowed opacity-60">
            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center shrink-0">
               <MessageSquare className="w-5 h-5 text-zinc-500" />
            </div>
            <div>
               <h4 className="font-bold text-zinc-900 mb-1 leading-tight">Mavzudan test (AI)</h4>
               <p className="text-xs text-zinc-500 font-medium">Tez orada qo'shiladi</p>
            </div>
         </div>

       </div>
    </div>
  );
}
