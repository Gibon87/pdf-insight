import React from 'react';
import { X, History, FileText, Trash2, ArrowRight, Clock } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onDeleteItem,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#0d121d] h-full border-l border-slate-800 flex flex-col shadow-2xl animate-slideLeft">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 glass-panel">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-base">
            <History className="w-5 h-5 text-emerald-400" />
            <h3>Historia Analiz Dokumentów</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-400 font-medium">Brak historii przetworzonych plików</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Wyniki Twoich ostatnich analiz PDF będą zapisywane lokalnie w przeglądarce.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="group glass-card p-4 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition flex items-start justify-between gap-3"
              >
                <div 
                  onClick={() => {
                    onSelectHistoryItem(item);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-sm text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {item.data.document.title || item.fileName}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span>{formatDate(item.timestamp)}</span>
                    <span>•</span>
                    <span className="capitalize">{item.data.document.type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      onSelectHistoryItem(item);
                      onClose();
                    }}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                    title="Otwórz wyniki"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition"
                    title="Usuń wpis"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-800 glass-panel flex items-center justify-between">
            <span className="text-xs text-slate-400">Łącznie zapisanych: <strong>{history.length}</strong></span>
            <button
              onClick={onClearAll}
              className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Wyczyść historię
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
