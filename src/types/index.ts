import { z } from 'zod';
import { PdfInsightSchema, DocumentTypeEnum } from '../lib/zodSchema';

export type DocumentType = z.infer<typeof DocumentTypeEnum>;
export type PdfInsightResult = z.infer<typeof PdfInsightSchema>;

export interface ProcessedPdf {
  file: File;
  text: string;
  pagesCount: number;
  hasTextLayer: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  fileName: string;
  fileSize: number;
  data: PdfInsightResult;
}

export type AnalysisStatus = 'idle' | 'extracting' | 'analyzing' | 'validating' | 'success' | 'error';
