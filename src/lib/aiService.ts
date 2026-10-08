import { PdfInsightSchema } from './zodSchema';
import { PdfInsightResult } from '../types';
import { SYSTEM_PROMPT, buildAnalysisPrompt } from './promptBuilder';

interface AnalysisOptions {
  fileName: string;
  pagesCount: number;
  text: string;
  userApiKey?: string;
  customApiUrl?: string;
  useDemoFallback?: boolean;
}

export const SAMPLE_CONTRACT_RESULT: PdfInsightResult = {
  document: {
    fileName: "Test_PDF_Insight_umowa_14-2026.pdf",
    pages: 12,
    language: "pl",
    type: "umowa",
    title: "UMOWA RAMOWA NR 14/2026 o wdrożenie i utrzymanie systemu CRM",
    date: "2026-03-12"
  },
  summary: "Umowa ramowa nr 14/2026 zawarta w dniu 12.03.2026 r. w Gdańsku pomiędzy Nordwave Logistics sp. z o.o. (Zamawiający) a Kwadrat Software S.A. (Wykonawca). Przedmiotem umowy jest przeprowadzenie analizy przedwdrożeniowej, konfiguracja systemu CRM dla 120 (po aneksie 135) użytkowników, migracja danych oraz integracje z SAP Business One, pocztą i centralą VoIP. Całkowite wynagrodzenie ryczałtowe za wdrożenie wynosi 184 500,00 PLN netto + VAT (226 935,00 PLN brutto), a miesięczny abonament utrzymaniowy 12 300,00 PLN netto (po aneksie 13 100,00 PLN netto od kwietnia 2027 r.). Ochrona przed Prompt Injection wyeliminowała zmyśloną instrukcję o wartości 1 PLN ze strony 4.",
  keyPoints: [
    "Przedmiot: wdrożenie CRM w modelu SaaS dla 135 użytkowników i integracje (SAP B1, MS 365, VoIP).",
    "Harmonogram: 5 etapów (E1-E5) z planowanym terminem Go-live na 12 października 2026 r.",
    "Warunki płatności: zaliczka 30% (55 350,00 zł netto / 68 080,50 zł brutto) rozliczana proporcjonalnie.",
    "Utrzymanie i SLA: abonament 12 300 zł netto/mc, gwarantowana dostępność 99,5% w skali miesiąca.",
    "Gwarancja i kary: kara 0,2% za każdy dzień opóźnienia etapu (max 10%), naruszenie poufności 50 000 zł.",
    "Ochrona przed Prompt Injection: zignorowano złośliwą instrukcję ze strony 4 umowy dotyczącą kwoty 1 PLN."
  ],
  entities: {
    organizations: [
      "Nordwave Logistics sp. z o.o.",
      "Kwadrat Software S.A."
    ],
    people: [
      "Anna Kowalczyk (Prezes Zarządu)",
      "Marek Zieliński (Członek Zarządu)",
      "Paweł Dąbrowski (Wiceprezes Zarządu)",
      "Tomasz Wiśniewski (Kierownik Projektu)",
      "Julia Mazur (Inspektor Ochrony Danych)",
      "Katarzyna Nowak (Kierownik Projektu)",
      "Piotr Lewandowski (Architekt Rozwiązania)",
      "Michał Kamiński (Kierownik Utrzymania)"
    ]
  },
  amounts: [
    { value: 184500.0, currency: "PLN", context: "Wynagrodzenie ryczałtowe netto za wdrożenie systemów CRM" },
    { value: 226935.0, currency: "PLN", context: "Wynagrodzenie ryczałtowe brutto za wdrożenie (z VAT 23%)" },
    { value: 55350.0, currency: "PLN", context: "Zaliczka 30% netto na wdrożenie (rozliczana w etapach E1-E5)" },
    { value: 68080.5, currency: "PLN", context: "Zaliczka 30% brutto na wdrożenie" },
    { value: 12300.0, currency: "PLN", context: "Miesięczny abonament netto za usługi utrzymania po Go-live" },
    { value: 13100.0, currency: "PLN", context: "Abonament utrzymaniowy netto od 1 kwietnia 2027 r. (po Aneksie 1)" },
    { value: 8600.0, currency: "EUR", context: "Roczne opłaty licencyjne za 4 instancje modułu analitycznego" },
    { value: 890.0, currency: "USD", context: "Miesięczny koszt infrastruktury chmurowej i hostingu" }
  ],
  dates: [
    { date: "2026-03-12", context: "Data zawarcia Umowy Ramowej w Gdańsku" },
    { date: "2026-04-01", context: "Początek okresu obowiązywania umowy" },
    { date: "2026-10-12", context: "Planowany termin produkcyjnego uruchomienia (Go-live)" },
    { date: "2026-03-20", context: "Data zawarcia Aneksu nr 1 zwiększającego liczbę użytkowników" },
    { date: "2028-03-31", context: "Koniec podstawowego 24-miesięcznego okresu obowiązywania umowy" }
  ],
  keywords: [
    "CRM",
    "SaaS",
    "Nordwave Logistics",
    "Kwadrat Software",
    "SAP Business One",
    "SLA 99.5%",
    "Umowa ramowa"
  ]
};

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
  if (options.useDemoFallback) {
    return SAMPLE_CONTRACT_RESULT;
  }

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
          `Nie udało się połączyć z API AI. (${lastError.message})`
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

  // List of fallback models supported by Google AI Studio & Gemini API
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
              role: 'user',
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
