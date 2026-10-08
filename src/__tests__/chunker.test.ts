import { describe, it, expect } from 'vitest';
import { chunkText } from '../lib/pdfExtractor';

describe('PDF Text Chunker', () => {
  it('returns single chunk when text is short', () => {
    const text = '--- STRONA 1 ---\nTo jest krótki tekst umowy.';
    const chunks = chunkText(text, 1000);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe(text);
  });

  it('splits multi-page text into multiple chunks when exceeding maxChars', () => {
    const page1 = '--- STRONA 1 ---\n' + 'A'.repeat(500);
    const page2 = '--- STRONA 2 ---\n' + 'B'.repeat(500);
    const fullText = `${page1}\n\n${page2}`;

    const chunks = chunkText(fullText, 600);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]).toContain('STRONA 1');
    expect(chunks[1]).toContain('STRONA 2');
  });
});
