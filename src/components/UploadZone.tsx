import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  onSelectDemo?: () => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, onSelectDemo, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndPassFile = (file: File) => {
    setErrorMessage(null);

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Nieprawidłowy format pliku. Dopuszczalne są wyłącznie pliki PDF (.pdf).');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(
        `Rozmiar pliku przekracza dopuszczalny limit ${MAX_FILE_SIZE_MB} MB. Rozmiar pliku: ${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)} MB.`
      );
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndPassFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateAndPassFile(selectedFile);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer group ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
            : 'border-slate-700/80 hover:border-emerald-500/60 glass-panel hover:bg-slate-900/60'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700/80 flex items-center justify-center border border-slate-600/50 group-hover:scale-110 group-hover:border-emerald-500/50 group-hover:text-emerald-400 transition-all shadow-xl">
            <UploadCloud className="w-8 h-8 text-slate-300 group-hover:text-emerald-400 transition-colors" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
              Przeciągnij i upuść plik PDF tutaj
            </h3>
            <p className="text-sm text-slate-400">
              lub <span className="text-emerald-400 underline font-medium">wybierz plik z komputera</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Tylko pliki .PDF
            </span>
            <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Maksymalnie 10 MB
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-300 text-sm animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-200">Błąd walidacji pliku</p>
            <p className="text-xs text-red-300/90 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Demo helper quick trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 glass-card rounded-xl border border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Przetestuj z przykładowym plikiem rekrutacyjnym <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-200">Test_PDF_Insight_umowa_14-2026.pdf</code></span>
        </div>
        <div className="flex items-center gap-2">
          {onSelectDemo && (
            <button
              type="button"
              onClick={onSelectDemo}
              className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-lg border border-emerald-500/30 font-semibold transition"
            >
              Wyświetl Tryb Demo ✨
            </button>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-slate-300 hover:text-white font-medium flex items-center gap-1 px-2 py-1"
          >
            Wybierz plik <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
