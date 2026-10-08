import React from 'react';
import { AlertOctagon, RotateCcw, Key, Sparkles } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onRetry: () => void;
  onOpenSettings?: () => void;
  onLoadDemoMode?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  onRetry,
  onOpenSettings,
  onLoadDemoMode,
}) => {
  const isKeyError =
    message.toLowerCase().includes('klucz') ||
    message.toLowerCase().includes('api') ||
    message.toLowerCase().includes('404') ||
    message.toLowerCase().includes('400') ||
    message.toLowerCase().includes('403');

  return (
    <div className="w-full max-w-2xl mx-auto glass-panel p-8 rounded-2xl border border-red-500/30 shadow-2xl space-y-6 text-center animate-fadeIn">
      <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
        <AlertOctagon className="w-8 h-8 text-red-400" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-red-200">Wystąpił błąd komunikacji z AI</h3>
        <p className="text-xs text-red-300/90 bg-red-950/40 p-4 rounded-xl border border-red-500/20 font-mono text-left break-words">
          {message}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {onLoadDemoMode && (
          <button
            onClick={onLoadDemoMode}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold rounded-xl transition shadow-lg shadow-emerald-500/20 text-sm hover:scale-105"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            Otwórz Tryb Demo (Wyświetl Wyniki Testowe)
          </button>
        )}

        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition text-sm"
        >
          <RotateCcw className="w-4 h-4 text-emerald-400" />
          Spróbuj ponownie
        </button>

        {isKeyError && onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-700 transition text-sm"
          >
            <Key className="w-4 h-4 text-emerald-400" />
            Zmień Klucz API
          </button>
        )}
      </div>
    </div>
  );
};
