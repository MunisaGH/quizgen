import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { BookOpen, Sparkles, Zap, Shield, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const { user, signInWithGoogle } = useAuth();

  if (user) return <Navigate to="/" />;

  return (
    <div className="flex flex-col min-h-screen text-slate-800 bg-slate-50 relative overflow-hidden">
      
      {/* Decorative Light Background Layer */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50 to-transparent pointer-events-none -z-10"></div>
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-blue-300/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute left-[-150px] top-[200px] w-[500px] h-[500px] bg-indigo-300/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* Landing Navbar */}
      <header className="h-[72px] flex items-center justify-between px-6 md:px-12 xl:px-24 border-b border-slate-200/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
         <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-[0_4px_14px_rgba(37,99,235,0.3)] group-hover:scale-105 transition-transform">
              Q
            </div>
            <h1 className="font-[800] text-sm tracking-widest text-slate-900">QUIZGEN</h1>
         </div>
         <button 
           onClick={signInWithGoogle}
           className="text-xs md:text-sm font-[800] bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm hover:shadow-xl hover:shadow-slate-900/10 hover:-translate-y-0.5 active:translate-y-0"
         >
           Tizimga kirish
         </button>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-28 px-6 flex flex-col items-center text-center max-w-5xl mx-auto relative z-10">
         
         <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-[800] tracking-widest uppercase mb-8 shadow-sm">
           <Sparkles className="w-4 h-4 text-blue-500" /> Yangi avlod sun'iy intellekti
         </span>
         
         <h1 className="text-4xl md:text-6xl lg:text-7xl font-[800] tracking-tight text-slate-900 mb-6 leading-[1.1] text-center max-w-4xl drop-shadow-sm">
           Hujjatlarni bir zumda <br className="hidden md:block" />
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
             Aqlli Testlarga
           </span> aylantiring
         </h1>
         
         <p className="text-base md:text-lg text-slate-500 mb-10 max-w-2xl mx-auto font-[500] leading-relaxed text-center">
           Gemini ai modeli orqali oddiy quruq PDF yoki Word hujjatlarini avtomatik interaktiv savol-javoblarga aylantiring. O'qituvchi va talabalar uchun eng zo'r vosita.
         </p>

         <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4">
           <button 
             onClick={signInWithGoogle}
             className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-full font-[800] text-base transition-all hover:bg-blue-700 hover:scale-[1.02] shadow-[0_8px_25px_rgba(37,99,235,0.25)] active:scale-95 flex items-center justify-center gap-3"
           >
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full" />
             Google bilan boshlash
           </button>
           <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-[800] text-base transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-md flex items-center justify-center shadow-sm">
             Batafsil ma'lumot
           </a>
         </div>
      </section>

      {/* Visual Demo / Graphic */}
      <section className="px-6 pb-24 md:pb-32 relative z-10">
         <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-4 md:p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] border border-white relative overflow-hidden group hover:shadow-[0_20px_60px_-15px_rgba(37,99,235,0.15)] transition-all duration-700">
            
            <div className="bg-slate-100/50 rounded-[1.5rem] border border-slate-200 p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 relative z-10 shadow-inner">
               <div className="flex-1 space-y-8 w-full">
                  <div className="flex items-center gap-4 text-slate-800 p-5 rounded-2xl border border-white bg-white shadow-sm">
                     <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                       <FileText className="w-6 h-6 text-white" />
                     </div>
                     <div>
                       <p className="font-[800] text-sm">Ona_Tili_Qoidalar.pdf</p>
                       <p className="text-[11px] text-slate-400 font-[800] mt-1 uppercase tracking-widest">PDF • 1.2 MB</p>
                     </div>
                  </div>
                  <div className="space-y-4 px-2">
                     <div className="flex justify-between text-xs font-[800] text-blue-600 tracking-widest uppercase mb-1">
                        <span className="animate-pulse">Test tuzilmoqda...</span>
                        <span>86%</span>
                     </div>
                     <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-blue-500 w-[86%] rounded-full relative shadow-[0_0_10px_rgba(37,99,235,0.5)]">
                           <div className="absolute inset-0 bg-white/30 animate-[shimmer_1.5s_infinite]"></div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="flex-1 bg-white rounded-2xl p-6 w-full shadow-xl relative border border-slate-100">
                  <div className="absolute -top-3 -right-3 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-[800] px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                    Siz uchun tayyor
                  </div>
                  <p className="text-[10px] font-[800] text-slate-400 uppercase tracking-widest mb-3">Savol 1 / 15</p>
                  <h4 className="font-[800] text-slate-800 mb-5 leading-snug">O'zbekiston Respublikasi Davlat bayrog'i qachon qabul qilingan?</h4>
                  <div className="space-y-3">
                     <div className="p-3.5 border border-slate-100 bg-slate-50 rounded-xl text-sm text-slate-600 flex items-center gap-3">
                       <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-[800] text-slate-400">A</span> 
                       1990-yil 31-avgust
                     </div>
                     <div className="p-3.5 border-2 border-blue-500 bg-blue-50 rounded-xl text-sm text-blue-900 font-bold flex justify-between items-center shadow-sm">
                       <div className="flex items-center gap-3">
                         <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-[800]">B</span> 
                         1991-yil 18-noyabr
                       </div>
                       <CheckCircle2 className="w-5 h-5 text-blue-500" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Features/Bento Section */}
      <section id="features" className="px-6 pb-24 md:pb-32 scroll-mt-24 relative z-10">
         <div className="max-w-5xl mx-auto">
           <div className="text-center mb-16 px-4">
              <h2 className="text-3xl md:text-5xl font-[800] tracking-tight text-slate-900 mb-5">Nega aynan ushbu dastur?</h2>
              <p className="text-slate-500 font-[500] max-w-xl mx-auto leading-relaxed text-base">
                Qo'lda savol tuzish va qog'oz koraytirish davri o'tdi. AI yordamida ta'lim jarayonini raqamli hayotga ko'chiramiz.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 text-left shadow-sm hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300">
                 <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-8">
                   <Zap className="w-6 h-6 text-blue-500" />
                 </div>
                 <h3 className="font-[800] text-xl text-slate-900 mb-3 tracking-tight">AI orqali analiz</h3>
                 <p className="text-sm text-slate-500 leading-relaxed font-[500]">Matningizni ichidagi g'oyalarni AI filtrlardan o'tkazadi va faqat eng foydali tushunchalarni savolga aylantiradi.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 text-left shadow-sm hover:shadow-xl hover:border-amber-100 hover:-translate-y-1 transition-all duration-300">
                 <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-8">
                   <BookOpen className="w-6 h-6 text-amber-500" />
                 </div>
                 <h3 className="font-[800] text-xl text-slate-900 mb-3 tracking-tight">O'z-o'zini baholash</h3>
                 <p className="text-sm text-slate-500 leading-relaxed font-[500]">Yaratilgan interaktiv oynada savollarni yeching va zudlik bilan bahoingizni oling. Natijalar ko'zni quvnatadi!</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 text-left shadow-sm hover:shadow-xl hover:border-emerald-100 hover:-translate-y-1 transition-all duration-300">
                 <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-8">
                   <Shield className="w-6 h-6 text-emerald-500" />
                 </div>
                 <h3 className="font-[800] text-xl text-slate-900 mb-3 tracking-tight">Beqiyos qulaylik</h3>
                 <p className="text-sm text-slate-500 leading-relaxed font-[500]">Test formati yoki yozuv o'lchovlari haqida qayg'urmang. Istalgan hujjatni tashlang, test ishga tushadi.</p>
              </div>
           </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-6 pb-20 relative z-10">
         <div className="max-w-5xl mx-auto bg-blue-600 rounded-[3rem] px-6 py-20 md:py-28 flex flex-col items-center shadow-2xl shadow-blue-500/20 relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-0 right-[-100px] w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
            
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-[800] tracking-tight mb-6 relative z-10 text-white max-w-2xl leading-[1.1]">
              Ta'limni keyingi bosqichga olib chiqing
            </h2>
            <p className="text-blue-100 mb-10 text-base md:text-lg font-[500] relative z-10 max-w-xl">
              Platformadan foydalanish, hujjatlarni testlarga o'girish tizimi umuman bepul. Atigi bir marta bosish orqali boshlashingiz mumkin.
            </p>
            <button 
             onClick={signInWithGoogle}
             className="px-10 py-5 bg-white text-slate-900 rounded-full font-[800] text-base transition-all hover:bg-slate-50 hover:scale-[1.03] shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex items-center justify-center gap-3 relative z-10 active:scale-95"
           >
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full" />
             Google orqali boshlash!
           </button>
         </div>
      </section>
    </div>
  );
}
