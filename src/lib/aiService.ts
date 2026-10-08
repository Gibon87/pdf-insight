import { GoogleGenerativeAI } from '@google/generative-ai';
import { PdfInsightSchema } from './zodSchema';
import { PdfInsightResult } from '../types';
import { SYSTEM_PROMPT, buildAnalysisPrompt } from './promptBuilder';

interface AnalysisOptions {
  fileName: string;
  pagesCount: number;
  text: string;
  userApiKey?: string;
  customApiUrl?: string;
}

/**
 * Cleans potential Markdown syntax (e.g. ```json ... ```) from AI string output.
 */
export function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

/**
 * Analyzes document text using Gemini API or backend proxy server.
 * Implements 1 retry on validation error according to specification.
 */
export async function analyzeDocumentText(options: AnalysisOptions): Promise<PdfInsightResult> {
  const maxAttempts = 2; // Initial attempt + 1 retry
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const rawJson = await fetchRawAiResponse(options, attempt > 1);
      const cleanedJson = cleanJsonString(rawJson);
      const parsedData = JSON.parse(cleanedJson);

      // Validate schema strictly with Zod
      const validatedData = PdfInsightSchema.parse(parsedData);
      return validatedData;
    } catch (err: unknown) {
      console.warn(`[AI Analysis Attempt ${attempt} failed]:`, err);
      lastError = err instanceof Error ? err : new Error(String(err));
      
      if (attempt === maxAttempts) {
        throw new Error(
          `Błąd analizy dokumentu (próba ${attempt}/${maxAttempts}): Nie udało się uzyskać poprawnych danych z AI. (${lastError.message})`
        );
      }
    }
  }

  throw lastError || new Error('Błąd analizy dokumentu.');
}

async function fetchRawAiResponse(options: AnalysisOptions, isRetry: boolean): Promise<string> {
  const { fileName, pagesCount, text, userApiKey, customApiUrl } = options;
  const apiUrl = customApiUrl || import.meta.env.VITE_API_URL;
  const envApiKey = userApiKey || import.meta.env.VITE_GEMINI_API_KEY;

  let prompt = buildAnalysisPrompt(fileName, pagesCount, text);
  if (isRetry) {
    prompt += '\n\nUWAGA: Poprzednia odpowiedź zawierała błędy formatowania. Zwróć WYŁĄCZNIE czysty, prawidłowy obiekt JSON zgodny ze schematem.';
  }

  // 1. If backend proxy URL is configured and valid, use backend proxy API
  if (apiUrl && !userApiKey) {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        pagesCount,
        text,
        isRetry,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Serwer API proxy zwrócił błąd ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (typeof data.result === 'string') {
      return data.result;
    }
    return JSON.stringify(data.result);
  }

  // 2. Direct Gemini API call (if user provided key or fallback)
  if (!envApiKey) {
    throw new Error(
      'Brak klucza API. Ustaw zmienną VITE_API_URL dla serwera proxy lub wprowadź własny klucz Google Gemini API w ustawieniach aplikacji.'
    );
  }

  const genAI = new GoogleGenerativeAI(envApiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  return responseText;
}
