import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, MessageSquare, ArrowRight, X, Sparkles, BookOpen, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

const steps = [
  {
    icon: <Sparkles className="w-10 h-10 text-blue-500" />,
    bg: 'from-blue-600 to-indigo-600',
    badge: 'Xush kelibsiz!',
    title: 'QuizGen ga xush kelibsiz',
    desc: 'Sun\'iy intellekt yordamida istalgan mavzu yoki hujjat asosida soniyalar ichida professional test yarating.',
  },
  {
    icon: <UploadCloud className="w-10 h-10 text-emerald-500" />,
    bg: 'from-emerald-600 to-teal-600',
    badge: '3 ta usul',
    title: 'Test qanday yaratiladi?',
    desc: 'PDF/DOCX fayl yuklang, matn kiriting yoki shunchaki mavzu yozing — AI qolgan ishni o\'zi bajaradi.',
    sub: [
      { icon: <UploadCloud className="w-4 h-4" />, text: 'Fayl yuklash (PDF, DOCX)' },
      { icon: <FileText className="w-4 h-4" />, text: 'Matn kiritish' },
      { icon: <MessageSquare className="w-4 h-4" />, text: 'Mavzu yozish' },
    ]
  },
  {
    icon: <Trophy className="w-10 h-10 text-amber-500" />,
    bg: 'from-amber-500 to-orange-600',
    badge: 'Premium',
    title: 'Natijangizni kuzating',
    desc: 'Har bir test natijasi profilingizda saqlanadi. Rivojlanishingizni grafik orqali kuzating va do\'stlaringizga ulashing (Premium).',
    sub: [
      { icon: <BookOpen className="w-4 h-4" />, text: 'Cheksiz test tarixingiz' },
      { icon: <Trophy className="w-4 h-4" />, text: 'Progress grafigi va statistika' },
    ]
  }
];

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl max-w-md w-full relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">

        {/* Gradient Header */}
        <div className={cn('bg-gradient-to-br p-10 flex flex-col items-center text-white relative overflow-hidden', current.bg)}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,white_0%,transparent_60%)]" />
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-4 relative z-10">
            {current.icon}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] bg-white/20 px-3 py-1 rounded-full mb-3 relative z-10">
            {current.badge}
          </span>
          <h2 className="text-xl font-black text-center leading-tight relative z-10">{current.title}</h2>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-sm text-muted font-medium leading-relaxed mb-6">{current.desc}</p>

          {current.sub && (
            <div className="flex flex-col gap-2.5 mb-6">
              {current.sub.map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-bold text-main bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 rounded-xl border border-subtle">
                  <span className="text-blue-600">{s.icon}</span> {s.text}
                </div>
              ))}
            </div>
          )}

          {/* Step Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === step ? 'bg-blue-600 w-6' : 'bg-zinc-200 dark:bg-zinc-700 w-2'
                )}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3 rounded-2xl border border-subtle font-black text-xs text-muted hover:text-main hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all uppercase tracking-widest"
              >
                Orqaga
              </button>
            )}
            <button
              onClick={() => isLast ? onDone() : setStep(s => s + 1)}
              className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {isLast ? 'Boshlash!' : 'Keyingi'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Skip */}
        <button
          onClick={onDone}
          className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
