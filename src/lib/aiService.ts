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
          `Błąd analizy dokumentu (próba ${attempt}/${maxAttempts}): ${lastError.message}`
        );
      }
    }
  }

  throw lastError || new Error('Błąd analizy dokumentu.');
}

async function fetchRawAiResponse(options: AnalysisOptions, isRetry: boolean): Promise<string> {
  const { fileName, pagesCount, text, userApiKey, customApiUrl } = options;
  const apiUrl = customApiUrl || import.meta.env.VITE_API_URL;
  const envApiKey = userApiKey?.trim() || import.meta.env.VITE_GEMINI_API_KEY?.trim();

  let prompt = buildAnalysisPrompt(fileName, pagesCount, text);
  if (isRetry) {
    prompt += '\n\nUWAGA: Poprzednia odpowiedź zawierała błędy formatowania. Zwróć WYŁĄCZNIE czysty, prawidłowy obiekt JSON zgodny ze schematem.';
  }

  // 1. If backend proxy URL is configured and user didn't override key, use proxy API
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

  // 2. Direct Gemini API call (if user provided key or env fallback)
  if (!envApiKey) {
    throw new Error(
      'Brak klucza API. Ustaw zmienną VITE_API_URL dla serwera proxy lub wprowadź własny klucz Google Gemini API w ustawieniach aplikacji.'
    );
  }

  // List of fallback models supported by Google AI Studio
  const models = [
    'gemini-1.5-flash-latest',
    'gemini-2.0-flash',
    'gemini-1.5-flash-002',
    'gemini-1.5-flash-001',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];
  let lastRestError = '';

  for (const modelName of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(envApiKey)}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        const errMsg = errorJson?.error?.message || `Błąd HTTP ${response.status}`;
        lastRestError = `[Google Gemini API (${modelName})]: ${errMsg}`;
        continue; // Try next model fallback
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('Otrzymano pustą odpowiedź z Gemini API.');
      }

      return rawText;
    } catch (err: unknown) {
      lastRestError = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(lastRestError || 'Nie udało się połączyć z API Google Gemini.');
}
