import { HistoryItem, PdfInsightResult } from '../types';

const STORAGE_KEY = 'pdf_insight_history_v1';
const MAX_HISTORY_ITEMS = 15;

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveToHistory(fileName: string, fileSize: number, data: PdfInsightResult): HistoryItem {
  const history = getHistory();
  const newItem: HistoryItem = {
    id: `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    fileName,
    fileSize,
    data,
  };

  // Add to top, prevent duplicate items with same name, slice to limit
  const filtered = history.filter((item) => item.fileName !== fileName);
  const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Nie udało się zapisać historii do localStorage:', e);
  }

  return newItem;
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  const history = getHistory();
  const updated = history.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Nie udało się zaktualizować historii:', e);
  }
  return updated;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Nie udało się wyczyścić historii:', e);
  }
}
