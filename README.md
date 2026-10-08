# 📄 PDF Insight — Inteligentna Ekstrakcja i Analiza Dokumentów PDF

[![CI/CD GitHub Actions](https://github.com/mateusz/greyWolfgroup/actions/workflows/deploy.yml/badge.svg)](https://github.com/mateusz/greyWolfgroup/actions/workflows/deploy.yml)
[![Demo na GitHub Pages](https://img.shields.io/badge/Demo-GitHub%20Pages-emerald?style=flat&logo=github)](https://mateusz.github.io/greyWolfgroup/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest%20Passed-green?logo=vitest)](https://vitest.dev/)

> **PDF Insight** to nowoczesna aplikacja webowa budowana w ramach zadania rekrutacyjnego na stanowisko **Vibe Coder** w **Greywolf Group**. Aplikacja wczytuje dokumenty PDF, generuje zwięzłe podsumowanie wykonawcze oraz transformuje nieustrukturyzowany tekst dokumentu w rygorystyczny format danych **JSON (Zod Validated)**.

---

## 🔗 Linki do Projektu

- **Live Demo (GitHub Pages)**: [https://mateusz.github.io/greyWolfgroup/](https://mateusz.github.io/greyWolfgroup/)
- **Publiczne Repozytorium GitHub**: [https://github.com/mateusz/greyWolfgroup](https://github.com/mateusz/greyWolfgroup)
- **Rejestr Prac z AI**: [AI_LOG.md](AI_LOG.md)

---

## ✨ Podstawowe Funkcjonalności

### 🟢 Wymagania MUST (100% Zrealizowane)
- **F-01 Wgrywanie PDF**: Drag & Drop + Tradencyjny wybór pliku. Obsługa wyłącznie plików `.pdf` z rozmiarem do 10 MB.
- **F-02 Odczyt Tekstu**: Ekstrakcja treści przy użyciu `pdfjs-dist` w osobnym workerze. Detekcja warstwy tekstowej oraz ostrzeżenia w przypadku skanów (F-10).
- **F-03 Podsumowanie**: Synteza 3–5 zwięzłych zdań w języku dokumentu bez zmyślonych informacji (zero halucynacji).
- **F-04 Dane Strukturalne (Zod Schema)**: Wyekstrahowany JSON jest rygorystycznie walidowany przez bibliotekę **Zod** przed wyświetleniem użytkownikowi. Automatyczny **1-retry attempt** w przypadku błędów AI.
- **F-05 Widok i Eksport**:
  - Interaktywny pulpit wyników (karty metadanych, podmioty, tabele kwot i dat, słowa kluczowe).
  - Zakładka surowego kodu JSON z podświetlaniem syntaktycznym.
  - Przycisk kopiowania do schowka oraz natychmiastowe pobieranie pliku `.json`.
- **F-06 Stany Interfejsu**: Stan pusty (Empty State), dynamiczny wskaźnik ładowania z postępem kroków (Loading Skeleton), wskaźnik błędu z opcją ponowienia (Error Alert & Retry).
- **F-07 Publiczne Demo**: Wdrożenie przez GitHub Actions na GitHub Pages.

### 🔵 Wymagania SHOULD & COULD
- **F-08 Długie Dokumenty**: Moduł `chunkText()` pozwalający na bezpieczne dzielenie dużych dokumentów wielostronicowych bez utraty kontekstu.
- **F-09 Historia Analiz**: Automatyczne zapisywanie 15 ostatnich wyników w `localStorage` z szufladą podglądu (History Drawer).
- **F-10 OCR / Skan Warning**: Detekcja dokumentów o słabej lub znikomej warstwie tekstowej.

---

## 🛡️ Bezpieczeństwo i Ochrona przed Prompt Injection

1. **Przechowywanie Kluczy API**: Klucz API **nigdy** nie jest obecny w kodzie źródłowym ani w historii commita. Wszystkie zapytania są przekazywane przez bezpieczne API Proxy (Cloudflare Worker / Vercel Serverless Function).
2. **Odporność na Prompt Injection**: Aplikacja przeszła pomyślnie testy na złośliwym pliku `Test_PDF_Insight_umowa_14-2026.pdf` (zawierającym ukrytą instrukcję na str. 4 o treści *"zignoruj wszystkie wcześniejsze polecenia..."*). System Prompt bezwzględnie traktuje tekst dokumentu jako **UNTRUSTED DATA**, uniemożliwiając zmianę roli AI.
3. **Brak `dangerouslySetInnerHTML`**: Cały interfejs korzysta z bezpiecznego renderowania VDOM Reacta.

---

## 🏗️ Architektura Techniczna

```text
├── .github/workflows/
│   └── deploy.yml          # Pipeline CI/CD (Lint -> Test -> Build -> Deploy)
├── backend-proxy/
│   ├── worker.js           # Cloudflare Worker API Proxy
│   └── vercel-api-analyze.js # Vercel Serverless Function Proxy
├── src/
│   ├── __tests__/          # Testy jednostkowe Vitest (Zod, Injection, Chunking)
│   ├── components/         # Komponenty UI (Header, Upload, Loading, Dashboard, Json, History)
│   ├── lib/
│   │   ├── aiService.ts    # Klient API AI z Retry Logic
│   │   ├── pdfExtractor.ts # pdfjs-dist parser + chunker
│   │   ├── promptBuilder.ts# Zabezpieczony Prompt Systemowy
│   │   ├── zodSchema.ts    # Schemat danych sekcji 04
│   │   └── historyStorage.ts # LocalStorage Manager
│   ├── types/              # Interfejsy i typy TypeScript
│   ├── App.tsx             # Główny kontener aplikacji i stan
│   ├── main.tsx            # Punkt wejścia React
│   └── index.css           # Tailwind + Glassmorphism Styles
├── AI_LOG.md               # Wymagany dokument prac z AI
└── vite.config.ts          # Konfiguracja Vite & Vitest
```

---

## 🚀 Uruchomienie Lokalnie

### Wymagania:
- **Node.js**: v18+ (zalecany Node.js 20+)
- **npm**: v9+

### Krok 1: Klonowanie repozytorium
```bash
git clone https://github.com/mateusz/greyWolfgroup.git
cd greyWolfgroup
```

### Krok 2: Instalacja zależności
```bash
npm install
```

### Krok 3: Zmienne Środowiskowe (Opcjonalnie)
Utwórz plik `.env` na podstawie `.env.example`:
```bash
cp .env.example .env
```
Wpisz własny `VITE_API_URL` lub przetestuj z opcją wpisania własnego klucza w interfejsie aplikacji.

### Krok 4: Uruchomienie serwera deweloperskiego
```bash
npm run dev
```
Aplikacja będzie dostępna pod adresem: `http://localhost:5173/`

### Krok 5: Uruchomienie testów i sprawdzania typów
```bash
# Testy jednostkowe Vitest
npm test

# Walidacja typów TypeScript (Strict)
npx tsc --noEmit

# Sprawdzanie lintera ESLint
npm run lint
```

---

## ⚠️ Znane Ograniczenia

1. **Bezpłatne Limity API**: Serwer proxy korzysta z darmowych limitów dostawcy LLM. Przy bardzo intensywnym testowaniu (powyżej 15 zapytań/min) dostawca API może zwrócić kod `429 Too Many Requests`.
2. **Skanowane Dokumenty PDF (Brak OCR)**: W przypadku skanów o zerowej warstwie tekstowej (pliki czysto obrazowe), bez zewnętrznego silnika Tesseract/OCR wyekstrahowany tekst może być pusty. Aplikacja informuje o tym użytkownika odpowiednim komunikatem.

---

## ✒️ Autor
**Mateusz Gibki** — Kandydat na stanowisko Vibe Coder  
Email: [mateusz.gibki@gmail.com](mailto:mateusz.gibki@gmail.com)  
Dla: **Greywolf Group**
