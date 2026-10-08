import React from 'react';
import { FileText, History, Key, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onReset: () => void;
  hasActiveResult: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  onOpenHistory,
  onOpenSettings,
  onReset,
  hasActiveResult,
}) => {
  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <FileText className="w-5.5 h-5.5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                PDF Insight
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold tracking-wider">
                AI Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Inteligentna analiza i ekstrakcja danych JSON z dokumentów PDF
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {hasActiveResult && (
            <button
              onClick={onReset}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition"
            >
              + Nowy dokument
            </button>
          )}

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition relative"
            title="Historia analiz"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Historia</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-mono bg-emerald-500 text-black font-bold rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition"
            title="Konfiguracja API / Klucz"
          >
            <Key className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Klucz API / Proxy</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-emerald-400/90 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bezpieczny odczyt AI</span>
          </div>
        </div>

      </div>
    </header>
  );
};
