import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Copy, Check, Crown, Clock, Sparkles,
  MessageCircle, CheckCircle2, ChevronRight, Info, ExternalLink
} from 'lucide-react';
import { useToast } from '../contexts/UIContext';
import { cn } from '../lib/utils';

const plans = [
  {
    key: 'weekly',
    name: 'Haftalik',
    price: '$1',
    days: 7,
    color: 'blue',
    icon: <Clock className="w-5 h-5" />,
    features: ['7 kunlik kirish', 'Cheksiz testlar', 'Reklamasiz'],
  },
  {
    key: 'monthly',
    name: 'Oylik',
    price: '$3',
    days: 30,
    popular: true,
    color: 'indigo',
    icon: <Crown className="w-5 h-5" />,
    features: ['30 kunlik kirish', 'Cheksiz testlar', 'PDF/DOCX yuklash', 'Reklamasiz'],
  },
  {
    key: 'yearly',
    name: 'Yillik',
    price: '$10',
    days: 365,
    color: 'emerald',
    icon: <Sparkles className="w-5 h-5" />,
    features: ['365 kunlik kirish', 'Cheksiz testlar', 'PDF/DOCX yuklash', 'Ustuvor yordam', 'Reklamasiz'],
  },
];

const BOT_USERNAME = 'quizgen_pay_bot'; // Telegram bot username

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [copiedId, setCopiedId] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [userCardNumber, setUserCardNumber] = useState('');

  const plan = plans.find(p => p.key === selectedPlan)!;

  const copyCard = () => {
    navigator.clipboard.writeText(CARD_NUMBER.replace(/\s/g, ''));
    setCopiedCard(true);
    showToast('Karta raqami nusxalandi!', 'success');
    setTimeout(() => setCopiedCard(false), 2000);
  };

  const copyId = () => {
    navigator.clipboard.writeText(user?.uid || '');
    setCopiedId(true);
    showToast('ID nusxalandi!', 'success');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const openBot = () => {
    const msg = encodeURIComponent(
      `To'lov cheki\n\nTarif: ${plan.name} (${plan.price} UZS)\nID: ${user?.uid}`
    );
    window.open(`https://t.me/${BOT_USERNAME}?start=${user?.uid}`, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-muted hover:text-blue-600 transition-colors font-black text-[10px] tracking-widest bg-card border border-subtle px-4 py-2 rounded-full shadow-sm w-fit uppercase"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> ORQAGA
      </button>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {[1, 2].map((s) => (
          <React.Fragment key={s}>
            <div className={cn(
              "flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all",
              step === s
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : s < step
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 border border-emerald-200"
                  : "bg-zinc-100 dark:bg-zinc-800 text-muted"
            )}>
              {s < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{s}.</span>}
              {s === 1 ? "Tarif tanlash" : "To'lov qilish"}
            </div>
            {s < 2 && <ChevronRight className="w-4 h-4 text-muted" />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 ? (
        /* ── STEP 1: Plan Selection ── */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-2xl md:text-3xl font-black text-main tracking-tight mb-2">Tarif tanlang</h1>
          <p className="text-muted text-sm font-medium mb-8">Siz uchun eng qulay tarifni tanlang.</p>

          <div className="grid gap-4 mb-8">
            {plans.map((p) => (
              <button
                key={p.key}
                onClick={() => setSelectedPlan(p.key)}
                className={cn(
                  "relative w-full text-left p-6 rounded-[2rem] border-2 transition-all duration-300 group",
                  selectedPlan === p.key
                    ? p.color === 'blue' ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                      : p.color === 'indigo' ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10"
                        : "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10"
                    : "border-subtle bg-card hover:border-zinc-300 dark:hover:border-zinc-600"
                )}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
                    Eng mashhur
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center",
                      p.color === 'blue' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                        : p.color === 'indigo' ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30"
                          : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                    )}>
                      {p.icon}
                    </div>
                    <div>
                      <p className="font-black text-main text-base">{p.name}</p>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{p.days} kun</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-main">{p.price}</p>
                    <p className="text-[10px] font-bold text-muted uppercase">UZS</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.features.map((f, i) => (
                    <span key={i} className="text-[10px] font-bold text-muted bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95"
          >
            Davom etish <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        /* ── STEP 2: Payment Instructions ── */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-2xl md:text-3xl font-black text-main tracking-tight mb-2">To'lovni amalga oshiring</h1>
          <p className="text-muted text-sm font-medium mb-8">Quyidagi qadamlarni bajarib, Telegram botga xabar yuboring.</p>

          {/* Steps */}
          <div className="space-y-4 mb-8">
            {/* Step A: Enter own card number */}
            <div className="bg-card border border-subtle rounded-[2rem] p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 font-black text-sm">1</div>
                <div className="flex-1">
                  <p className="font-black text-main mb-1 text-sm">Karta raqamingizni kiriting</p>
                  <p className="text-xs text-muted font-medium mb-3">
                    To'lov qilgan kartangiz raqamini kiriting. Admin shu raqam orqali to'lovni tekshiradi.
                  </p>
                  <p className="text-xs text-muted font-medium mb-3">
                    Tanlangan tarif: <span className="font-black text-blue-600">{plan.name} — {plan.price} USD</span>
                  </p>
                  <input
                    type="text"
                    value={userCardNumber}
                    onChange={e => setUserCardNumber(e.target.value.replace(/[^\d\s]/g, '').slice(0, 19))}
                    placeholder="0000 0000 0000 0000"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-subtle rounded-xl px-4 py-3 text-lg font-mono font-black text-main tracking-widest outline-none focus:border-blue-500 transition-colors"
                    maxLength={19}
                  />
                </div>
              </div>
            </div>


            {/* Step B: Copy User ID */}
            <div className="bg-card border border-subtle rounded-[2rem] p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 font-black text-sm">2</div>
                <div className="flex-1">
                  <p className="font-black text-main mb-1 text-sm">Shaxsiy ID raqamingizni nusxalang</p>
                  <p className="text-xs text-muted font-medium mb-3">Botga xabar yuborayotganingizda ushbu ID kerak bo'ladi.</p>
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-subtle rounded-xl px-3 py-2 mb-3">
                    <code className="text-xs font-mono text-main flex-1 truncate">{user?.uid}</code>
                    <button
                      onClick={copyId}
                      className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors shrink-0"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
                    </button>
                  </div>
                  <div className="flex items-start gap-2 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800/30 font-bold">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    Bu ID aniq bo'lishi kerak — admin shu orqali sizning hisobingizni topadi.
                  </div>
                </div>
              </div>
            </div>

            {/* Step C: Send to bot */}
            <div className="bg-card border border-subtle rounded-[2rem] p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 font-black text-sm">3</div>
                <div className="flex-1">
                  <p className="font-black text-main mb-1 text-sm">Telegram botga chek yuboring</p>
                  <p className="text-xs text-muted font-medium mb-4">
                    Botga to'lov chekini (skrinshot) va ID raqamingizni yuboring. Admin 10-30 daqiqa ichida Premium faollashtiradi.
                  </p>
                  <button
                    onClick={openBot}
                    className="w-full py-3.5 bg-[#229ED9] hover:bg-[#1a8dc2] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.01] active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Telegram Botga O'tish
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info banner */}
          <div className="bg-zinc-900 text-white rounded-[2rem] p-6 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-2xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-black text-sm mb-1">Tasdiqlashdan keyin nima bo'ladi?</p>
              <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                Admin chekni ko'rib, ID ni tekshirib, Premium statusni faollashtiradi. 
                Sahifani yangilang — Premium imkoniyatlar darhol ochiladi.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            className="mt-4 w-full py-3 rounded-2xl border border-subtle font-black text-xs text-muted hover:text-main hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all uppercase tracking-widest"
          >
            ← Tarif tanlashga qaytish
          </button>
        </div>
      )}
    </div>
  );
}
