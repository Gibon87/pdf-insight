import React from 'react';
import { Loader2, FileText, Cpu, CheckCircle2 } from 'lucide-react';
import { AnalysisStatus } from '../types';

interface LoadingStateProps {
  status: AnalysisStatus;
  fileName: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ status, fileName }) => {
  const steps = [
    {
      id: 'extracting',
      label: 'Ekstrakcja tekstru z pliku PDF',
      subtext: 'Odczytywanie warstwy tekstowej oraz podział na strony',
      icon: FileText,
      active: status === 'extracting',
      done: status === 'analyzing' || status === 'validating' || status === 'success',
    },
    {
      id: 'analyzing',
      label: 'Analiza sztucznej inteligencji (LLM)',
      subtext: 'Przetwarzanie intencji, kwot, dat, stron oraz podsumowania',
      icon: Cpu,
      active: status === 'analyzing',
      done: status === 'validating' || status === 'success',
    },
    {
      id: 'validating',
      label: 'Walidacja struktury JSON (Zod)',
      subtext: 'Weryfikacja typów danych, walut ISO 4217 i formatów dat ISO 8601',
      icon: CheckCircle2,
      active: status === 'validating',
      done: status === 'success',
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto glass-panel p-8 rounded-2xl border border-emerald-500/20 shadow-2xl text-center space-y-8 animate-fadeIn">
      {/* Header Spinner */}
      <div className="relative flex justify-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-100">Przetwarzanie dokumentu</h3>
        <p className="text-sm font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-500/20 inline-block">
          {fileName}
        </p>
      </div>

      {/* Steps progress */}
      <div className="space-y-3 text-left max-w-md mx-auto">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                step.active
                  ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                  : step.done
                  ? 'bg-slate-900/60 border-slate-800 opacity-90'
                  : 'bg-slate-900/30 border-slate-800/50 opacity-40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  step.active
                    ? 'bg-emerald-500 text-black font-bold animate-pulse'
                    : step.done
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : step.active ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${
                    step.active
                      ? 'text-emerald-300'
                      : step.done
                      ? 'text-slate-200'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-slate-400">{step.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 italic">
        Analiza zajmuje przeważnie poniżej 10 sekund...
      </p>
    </div>
  );
};
