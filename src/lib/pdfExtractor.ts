import * as pdfjsLib from 'pdfjs-dist';
import { ProcessedPdf } from '../types';

// Set up worker source from official CDN matching installed pdfjs-dist version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Extracts raw text from a PDF file using pdfjs-dist.
 * Detects whether text layer exists (scanned PDF detection).
 */
export async function extractTextFromPdf(file: File): Promise<ProcessedPdf> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  
  const numPages = pdfDoc.numPages;
  let fullText = '';
  let totalTextLength = 0;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');

    totalTextLength += pageText.trim().length;
    fullText += `--- STRONA ${pageNum} ---\n${pageText}\n\n`;
  }

  // If average text per page is less than 20 chars, it's likely a scanned PDF without OCR text layer
  const hasTextLayer = totalTextLength > numPages * 15;

  return {
    file,
    text: fullText.trim(),
    pagesCount: numPages,
    hasTextLayer,
  };
}

/**
 * Splits long text into chunks of approx maxChars to handle multi-page long documents (F-08 SHOULD).
 */
export function chunkText(text: string, maxCharsPerChunk: number = 12000): string[] {
  if (text.length <= maxCharsPerChunk) {
    return [text];
  }

  const pages = text.split(/(?=--- STRONA \d+ ---)/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const page of pages) {
    if ((currentChunk + page).length > maxCharsPerChunk && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = page;
    } else {
      currentChunk += page;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
