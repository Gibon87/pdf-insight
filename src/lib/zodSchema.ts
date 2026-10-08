import { z } from 'zod';

export const DocumentTypeEnum = z.enum([
  'faktura',
  'umowa',
  'oferta',
  'raport',
  'inne',
]);

export const DocumentMetaSchema = z.object({
  fileName: z.string(),
  pages: z.number().int().nonnegative(),
  language: z.string().min(2), // ISO 639-1 format (e.g. "pl", "en", "de")
  type: DocumentTypeEnum,
  title: z.string(),
  date: z.string().nullable(), // ISO 8601 YYYY-MM-DD or null
});

export const AmountSchema = z.object({
  value: z.number(),
  currency: z.string(), // ISO 4217 (e.g. "PLN", "EUR", "USD")
  context: z.string(),
});

export const DateItemSchema = z.object({
  date: z.string(), // ISO 8601 YYYY-MM-DD
  context: z.string(),
});

export const EntitiesSchema = z.object({
  organizations: z.array(z.string()),
  people: z.array(z.string()),
});

export const PdfInsightSchema = z.object({
  document: DocumentMetaSchema,
  summary: z.string().min(10),
  keyPoints: z.array(z.string()),
  entities: EntitiesSchema,
  amounts: z.array(AmountSchema),
  dates: z.array(DateItemSchema),
  keywords: z.array(z.string()),
});
