import React, { useState } from 'react';
import { Download, Copy, Check, Code, FileJson } from 'lucide-react';
import { PdfInsightResult } from '../types';

interface JsonViewerProps {
  data: PdfInsightResult;
  fileName: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, fileName }) => {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const exportName = `${baseName}_insight.json`;
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 glass-card rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <FileJson className="w-4.5 h-4.5 text-emerald-400" />
          <span>Dane Strukturalne JSON (Zod Validated)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Skopiowano!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                Kopiuj JSON
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-semibold rounded-lg text-xs transition shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            Pobierz .json
          </button>
        </div>
      </div>

      {/* Code Block Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#090d16] font-mono text-xs shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-emerald-400" />
            <span>schema_validated_output.json</span>
          </span>
          <span>{jsonString.length} bajtów</span>
        </div>

        <pre className="p-5 overflow-x-auto text-emerald-400/90 leading-relaxed max-h-[600px] overflow-y-auto">
          <code>{jsonString}</code>
        </pre>
      </div>
    </div>
  );
};
