import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { SecurityNotice } from './components/SecurityNotice';
import { LoadingState } from './components/LoadingState';
import { ErrorAlert } from './components/ErrorAlert';
import { ResultDashboard } from './components/ResultDashboard';
import { JsonViewer } from './components/JsonViewer';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ApiSettingsModal } from './components/ApiSettingsModal';

import { extractTextFromPdf } from './lib/pdfExtractor';
import { analyzeDocumentText } from './lib/aiService';
import { getHistory, saveToHistory, deleteHistoryItem, clearHistory } from './lib/historyStorage';
import { AnalysisStatus, HistoryItem, PdfInsightResult, ProcessedPdf } from './types';
import { LayoutDashboard, FileJson, Sparkles } from 'lucide-react';

export function App() {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [processedPdf, setProcessedPdf] = useState<ProcessedPdf | null>(null);
  const [result, setResult] = useState<PdfInsightResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tabs: 'dashboard' | 'json'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'json'>('dashboard');

  // History & Modals State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    return sessionStorage.getItem('pdf_insight_user_api_key') || '';
  });

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleSaveUserApiKey = (key: string) => {
    setUserApiKey(key);
    if (key) {
      sessionStorage.setItem('pdf_insight_user_api_key', key);
    } else {
      sessionStorage.removeItem('pdf_insight_user_api_key');
    }
  };

  const processFilePipeline = async (file: File) => {
    setCurrentFile(file);
    setResult(null);
    setErrorMessage(null);

    try {
      // Step 1: Text extraction via pdfjs-dist
      setStatus('extracting');
      const pdfData = await extractTextFromPdf(file);
      setProcessedPdf(pdfData);

      if (!pdfData.text || pdfData.text.trim().length === 0) {
        throw new Error(
          'Nie znaleziono warstwy tekstowej w pliku PDF. Plik może być skanem lub być zabezpieczony hasłem.'
        );
      }

      // Step 2: AI Analysis
      setStatus('analyzing');
      const aiData = await analyzeDocumentText({
        fileName: file.name,
        pagesCount: pdfData.pagesCount,
        text: pdfData.text,
        userApiKey: userApiKey || sessionStorage.getItem('pdf_insight_user_api_key') || undefined,
      });

      // Step 3: Validation complete
      setStatus('validating');
      await new Promise((resolve) => setTimeout(resolve, 400)); // Smooth UX transition

      // Step 4: Success & Save to history
      setResult(aiData);
      setStatus('success');
      saveToHistory(file.name, file.size, aiData);
      setHistory(getHistory());
    } catch (err: unknown) {
      console.error('Błąd procesowania pliku:', err);
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd podczas przetwarzania.'
      );
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setResult(item.data);
    setCurrentFile(new File([], item.fileName));
    setStatus('success');
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleReset = () => {
    setStatus('idle');
    setCurrentFile(null);
    setProcessedPdf(null);
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReset={handleReset}
        hasActiveResult={status === 'success'}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* State 1: IDLE / UPLOAD */}
        {status === 'idle' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Banner */}
            <div className="text-center space-y-3 py-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Automatyczna Analityka Dokumentów PDF
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Przekształć pliki PDF w <br className="hidden sm:inline" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Uporządkowane Dane JSON
                </span>
              </h1>
              <p className="text-base text-slate-400 max-w-2xl mx-auto">
                Wgraj dowolną umowę, fakturę, ofertę lub raport. System odczyta treść, sporządzi zwięzłe podsumowanie oraz wyekstrahuje kluczowe kwoty, daty i podmioty.
              </p>
            </div>

            <UploadZone onFileSelect={processFilePipeline} />
            <SecurityNotice />
          </div>
        )}

        {/* State 2: LOADING (extracting | analyzing | validating) */}
        {(status === 'extracting' || status === 'analyzing' || status === 'validating') && (
          <LoadingState status={status} fileName={currentFile?.name || 'Dokument.pdf'} />
        )}

        {/* State 3: ERROR */}
        {status === 'error' && (
          <ErrorAlert
            message={errorMessage || 'Błąd przetwarzania.'}
            onRetry={() => currentFile && processFilePipeline(currentFile)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* State 4: SUCCESS / RESULT DASHBOARD */}
        {status === 'success' && result && (
          <div className="space-y-6">
            
            {/* Tabs Switcher */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'dashboard'
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Pulpit Wyników
                </button>

                <button
                  onClick={() => setActiveTab('json')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'json'
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileJson className="w-4 h-4" />
                  Podgląd JSON (Schema Validated)
                </button>
              </div>

              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-emerald-400 underline font-medium"
              >
                Analizuj inny dokument →
              </button>
            </div>

            {/* Tab 1: Dashboard View */}
            {activeTab === 'dashboard' && (
              <ResultDashboard
                data={result}
                fileName={currentFile?.name || result.document.fileName}
                fileSize={currentFile?.size}
                hasTextLayer={processedPdf?.hasTextLayer ?? true}
              />
            )}

            {/* Tab 2: Raw JSON View */}
            {activeTab === 'json' && (
              <JsonViewer
                data={result}
                fileName={currentFile?.name || result.document.fileName}
              />
            )}

          </div>
        )}

      </main>

      {/* Drawers & Modals */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onDeleteItem={handleDeleteHistoryItem}
        onClearAll={handleClearHistory}
      />

      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userApiKey={userApiKey}
        onSaveApiKey={handleSaveUserApiKey}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-400 glass-panel mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <p>© 2026 PDF Insight — Zadanie Rekrutacyjne Vibe Coder | Greywolf Group</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>React 18 + TypeScript</span>
            <span>•</span>
            <span>Vite</span>
            <span>•</span>
            <span>Zod</span>
            <span>•</span>
            <span>Vitest</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
