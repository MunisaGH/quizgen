import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import History from './pages/History';
import Navbar from './components/Navbar';
import { PlusCircle, Book, Settings, Crown, LayoutGrid } from 'lucide-react';
import { cn } from './lib/utils';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-full flex items-center justify-center text-zinc-500 font-medium">Yuklanmoqda...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function FloatingBottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  
  if (!user || location.pathname === '/login') return null;

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl border border-slate-200 px-8 py-3.5 rounded-full flex justify-between items-center z-50 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]">
       <Link to="/" className="flex flex-col items-center gap-1.5 relative group">
          <LayoutGrid className={cn("w-5 h-5 transition-all duration-300", location.pathname === '/' ? "text-blue-600" : "text-slate-400")} />
          {location.pathname === '/' && <div className="absolute -bottom-2 w-1 h-1 bg-blue-600 rounded-full"></div>}
       </Link>
       
       <Link to="/history" className="flex flex-col items-center gap-1.5 relative group">
          <Book className={cn("w-5 h-5 transition-all duration-300", location.pathname === '/history' ? "text-blue-600" : "text-slate-400")} />
          {location.pathname === '/history' && <div className="absolute -bottom-2 w-1 h-1 bg-blue-600 rounded-full"></div>}
       </Link>
       
       <button className="flex flex-col items-center gap-1.5 relative group">
          <Settings className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors" />
       </button>
       
       <button className="flex flex-col items-center gap-1.5 relative group">
          <Crown className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors" />
       </button>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col h-screen overflow-hidden text-slate-900 font-sans relative isolate bg-slate-50 selection:bg-blue-200 selection:text-blue-900">
          {/* Subtle noise/grid background */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-slate-50 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_60%,transparent_100%)]"></div>
          
          {/* Main Content Area */}
          <main className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto pb-safe">
             <Navbar />
             <div className="w-full pb-24 md:pb-10">
               <Routes>
                 <Route path="/login" element={<Login />} />
                 <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                 <Route path="/quiz/:quizId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
                 <Route path="/result/:resultId" element={<ProtectedRoute><Result /></ProtectedRoute>} />
                 <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
               </Routes>
             </div>
          </main>
          
          <FloatingBottomNav />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
