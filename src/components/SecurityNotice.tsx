import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server } from 'lucide-react';

export const SecurityNotice: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl p-5 border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-slate-900/40 space-y-3">
      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <h4>Bezpieczeństwo i Przetwarzanie Danych (Security Standards)</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
        <div className="flex items-start gap-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200 block">Klucze API w Sekretach</span>
            Klucze API nigdy nie trafiają do kodu frontendu ani repozytorium. Zapytania przechodzą przez bezpieczne API Proxy.
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <EyeOff className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200 block">Ochrona Prompt Injection</span>
            Treść PDF jest traktowana wyłącznie jako dane, a nie instrukcje. System ignoruje nieautoryzowane polecenia z dokumentu.
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <Server className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200 block">Przetwarzanie AI</span>
            Przesyłając plik potwierdzasz, że tekst dokumentu trafia do bezpiecznego API AI w celu odczytu i syntezy danych.
          </div>
        </div>
      </div>
    </div>
  );
};
