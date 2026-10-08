import { describe, it, expect } from 'vitest';
import { PdfInsightSchema } from '../lib/zodSchema';
import { cleanJsonString } from '../lib/aiService';

describe('PdfInsightSchema & AI Output Validation', () => {
  it('validates a correct PDF Insight JSON payload according to brief Section 04', () => {
    const validSample = {
      document: {
        fileName: 'Test_PDF_Insight_umowa_14-2026.pdf',
        pages: 12,
        language: 'pl',
        type: 'umowa',
        title: 'Umowa ramowa o wdrożenie i utrzymanie systemu CRM',
        date: '2026-03-12',
      },
      summary: 'Umowa ramowa zawarta pomiędzy Nordwave Logistics a Kwadrat Software. Przedmiotem jest wdrożenie oraz późniejsze utrzymanie systemu klasy CRM w modelu SaaS. Całkowity koszt wdrożenia wynosi 184 500 PLN netto.',
      keyPoints: [
        'Wdrożenie w 5 etapach do 12 października 2026 r.',
        'Wpłata zaliczki 30% w wysokości 55 350 PLN netto.',
        'Gwarantowana dostępność SLA wynosi 99,5%.',
      ],
      entities: {
        organizations: ['Nordwave Logistics sp. z o.o.', 'Kwadrat Software S.A.'],
        people: ['Anna Kowalczyk', 'Marek Zieliński', 'Paweł Dąbrowski'],
      },
      amounts: [
        { value: 184500, currency: 'PLN', context: 'Wynagrodzenie ryczałtowe netto za wdrożenie' },
        { value: 12300, currency: 'PLN', context: 'Abonament miesięczny netto za utrzymanie' },
      ],
      dates: [
        { date: '2026-04-01', context: 'Rozpoczęcie obowiązywania umowy' },
        { date: '2026-10-12', context: 'Planowany termin Go-live' },
      ],
      keywords: ['CRM', 'SaaS', 'wdrożenie', 'SLA', 'Nordwave'],
    };

    const parsed = PdfInsightSchema.parse(validSample);
    expect(parsed.document.fileName).toBe('Test_PDF_Insight_umowa_14-2026.pdf');
    expect(parsed.document.type).toBe('umowa');
    expect(parsed.amounts).toHaveLength(2);
  });

  it('rejects invalid JSON payloads missing required fields', () => {
    const invalidSample = {
      document: {
        fileName: 'test.pdf',
        pages: 2,
        // missing language and type!
      },
      summary: 'Short',
    };

    expect(() => PdfInsightSchema.parse(invalidSample)).toThrow();
  });

  it('correctly cleans markdown fenced code blocks from AI raw string responses', () => {
    const rawAiOutput = '```json\n{"test": true}\n```';
    const cleaned = cleanJsonString(rawAiOutput);
    expect(cleaned).toBe('{"test": true}');
  });
});
