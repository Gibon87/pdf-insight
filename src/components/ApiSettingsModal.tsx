import React, { useState } from 'react';
import { X, Key, Server, Save, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userApiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  userApiKey,
  onSaveApiKey,
}) => {
  const [inputKey, setInputKey] = useState(userApiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentApiUrl = import.meta.env.VITE_API_URL || 'https://pdf-insight-proxy.workers.dev/api/analyze';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-panel bg-[#0e1420] rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden space-y-5 animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-2.5 text-slate-100 font-bold text-base">
            <Server className="w-5 h-5 text-emerald-400" />
            <h3>Konfiguracja Backend Proxy / AI Key</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Active API Proxy info */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-emerald-400" /> Adres Serwera Proxy (Backend Endpoint):
            </span>
            <code className="block text-xs font-mono text-emerald-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 break-all">
              {currentApiUrl}
            </code>
            <p className="text-[11px] text-slate-400">
              Backend proxy przechowuje klucz API w sekretach serwera, chroniąc go przed ujawnieniem we frontendzie.
            </p>
          </div>

          {/* Standalone Key Override */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-400" /> Własny Klucz Google Gemini API (Opcjonalnie)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Pamięć tymczasowa</span>
            </label>

            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Wklej swój klucz AIzaSy..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 focus:border-emerald-500 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none transition"
            />
            
            <p className="text-[11px] text-slate-400">
              Wprowadzenie własnego klucza zastąpi serwer proxy i wywoła Gemini API bezpośrednio z przeglądarki. Klucz przechowywany jest wyłącznie w pamięci podręcznej sesji.
            </p>
          </div>

          <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
            <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Weryfikacja wymogów: Żadne klucze API nie są zapisywane w repozytorium Git.</span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            >
              Zamknij
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-black bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  Zapisano!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-black" />
                  Zapisz Ustawienia
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
