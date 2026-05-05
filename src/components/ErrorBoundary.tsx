import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
          <div className="max-w-md w-full bg-card p-10 rounded-[2.5rem] border border-subtle shadow-2xl text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-main mb-4 tracking-tight">Kutilmagan xatolik!</h2>
            <p className="text-sm text-muted font-medium mb-8 leading-relaxed">
              Ilova ishida texnik nosozlik yuz berdi. Iltimos, sahifani yangilab ko'ring.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
            >
              <RotateCcw className="w-4 h-4" /> SAHIFANI YANGILASH
            </button>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-rose-500">{this.state.error?.toString()}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.children;
  }
}
