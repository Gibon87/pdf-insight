import React from 'react';
import {
  FileText,
  Calendar,
  Building2,
  Users,
  DollarSign,
  Tag,
  CheckCircle2,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { PdfInsightResult } from '../types';

interface ResultDashboardProps {
  data: PdfInsightResult;
  fileName: string;
  fileSize?: number;
  hasTextLayer?: boolean;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({
  data,
  fileName,
  fileSize,
  hasTextLayer = true,
}) => {
  const { document, summary, keyPoints, entities, amounts, dates, keywords } = data;

  const getDocTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'umowa':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'faktura':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'oferta':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'raport':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* OCR Scan warning if text layer was poor */}
      {!hasTextLayer && (
        <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-300 text-xs">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-200 block">Wykryto dokument typu Skan (brak czystej warstwy tekstowej)</span>
            Ekstrakcja tekstu mogła być utrudniona ze względu na obrazowy charakter pliku.
          </div>
        </div>
      )}

      {/* Meta Header Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">{document.title || fileName}</h2>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium capitalize ${getDocTypeBadgeColor(document.type)}`}>
                  {document.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Plik: <code className="text-slate-300">{fileName}</code>
                {fileSize && ` • ${(fileSize / (1024 * 1024)).toFixed(2)} MB`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Strony: <strong className="text-slate-200">{document.pages}</strong></span>
            <span className="text-slate-600">|</span>
            <span>Język: <strong className="text-slate-200 uppercase">{document.language}</strong></span>
            {document.date && (
              <>
                <span className="text-slate-600">|</span>
                <span>Data: <strong className="text-emerald-400">{document.date}</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            <h3>Podsumowanie Wykonawcze (3–5 zdań)</h3>
          </div>
          <p className="text-sm leading-relaxed text-slate-300 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
            {summary}
          </p>
        </div>
      </div>

      {/* Grid Layout: Key Points & Entities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Key Points (2 cols on lg) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm border-b border-slate-800 pb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3>Kluczowe Ustalenia & Warunki</h3>
            <span className="ml-auto text-xs text-slate-500 font-mono">({keyPoints.length} pozycji)</span>
          </div>

          <ul className="space-y-2.5">
            {keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-slate-300 bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="leading-snug">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Entities (Organizations & People) */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm border-b border-slate-800 pb-3">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <h3>Wykryte Podmioty i Osoby</h3>
          </div>

          {/* Organizations */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" /> Organizacje / Firmy
            </span>
            {entities.organizations.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {entities.organizations.map((org, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-lg">
                    {org}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Brak wykrytych organizacji</p>
            )}
          </div>

          {/* People */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" /> Osoby / Reprezentanci
            </span>
            {entities.people.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {entities.people.map((person, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-lg">
                    {person}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Brak wykrytych osób</p>
            )}
          </div>
        </div>

      </div>

      {/* Grid Layout: Amounts & Important Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Financial Amounts Table */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm border-b border-slate-800 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3>Zestawienie Kwot i Płatności</h3>
          </div>

          {amounts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Kwota</th>
                    <th className="p-2.5">Waluta</th>
                    <th className="p-2.5">Kontekst</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {amounts.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="p-2.5 font-bold text-emerald-400 font-mono text-sm">
                        {item.value.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 font-mono text-slate-300 font-semibold">
                        {item.currency}
                      </td>
                      <td className="p-2.5 text-slate-300">{item.context}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Brak wyszczególnionych kwot finansowych w dokumentach</p>
          )}
        </div>

        {/* Dates Table */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm border-b border-slate-800 pb-3">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h3>Kluczowe Daty & Terminy</h3>
          </div>

          {dates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Data (ISO 8601)</th>
                    <th className="p-2.5">Kontekst / Opis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {dates.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="p-2.5 font-bold font-mono text-emerald-400 text-xs">
                        {item.date}
                      </td>
                      <td className="p-2.5 text-slate-300">{item.context}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Brak wykrytych specyficznych dat w treści</p>
          )}
        </div>

      </div>

      {/* Keywords Tags Footer */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mr-2">
          <Tag className="w-3.5 h-3.5 text-emerald-400" />
          <span>Słowa kluczowe:</span>
        </div>
        {keywords.map((kw, i) => (
          <span key={i} className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            #{kw}
          </span>
        ))}
      </div>

    </div>
  );
};
