import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="h-[72px] flex items-center justify-between px-6 z-50 sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
      <div className="flex items-center gap-3">
         {user.photoURL ? (
           <img src={user.photoURL} alt="Avatar" className="w-9 h-9 rounded-full border border-slate-200 shadow-sm" />
         ) : (
           <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 border border-blue-200 shadow-sm">
             {user.email ? user.email[0].toUpperCase() : 'M'}
           </div>
         )}
         <span className="font-bold text-sm text-slate-800">{user.displayName || user.email?.split('@')[0] || 'Mehmon'}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="bg-amber-50 flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse"></div>
          <span className="text-xs font-[800] text-amber-600">Cheksiz limit</span>
        </div>
        <button 
          onClick={logout}
          className="text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors bg-white p-2 rounded-full border border-slate-200 shadow-sm hover:shadow"
          title="Tizimdan chiqish"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
