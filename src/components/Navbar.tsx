import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/UIContext';
import { LogOut, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  return (
    <header className="h-[72px] flex items-center justify-between px-6 z-50 sticky top-0 glass-panel border-b border-subtle transition-all duration-300">
      <div className="flex items-center gap-3">
         {user.photoURL ? (
           <img src={user.photoURL} alt="Avatar" className="w-9 h-9 rounded-xl border border-subtle shadow-sm object-cover" />
         ) : (
           <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-black text-blue-600 border border-blue-200 dark:border-blue-800 shadow-sm">
             {user.email ? user.email[0].toUpperCase() : 'M'}
           </div>
         )}
         <div className="hidden sm:block">
            <span className="font-black text-sm text-main tracking-tight block">{user.displayName || user.email?.split('@')[0] || 'Mehmon'}</span>
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest leading-none">FAOL FOYDALANUVCHI</span>
         </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="hidden md:flex p-2 rounded-xl bg-card border border-subtle text-muted hover:text-blue-600 transition-all shadow-sm hover:shadow"
          title="Rejimni o'zgartirish"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
        </button>

        <div className="bg-amber-50 dark:bg-amber-900/10 flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800/30 shadow-sm shrink-0">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse"></div>
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">PRO PLAN</span>
        </div>
        
        <button 
          onClick={logout}
          className="text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors bg-card p-2 rounded-xl border border-subtle shadow-sm hover:shadow"
          title="Tizimdan chiqish"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
